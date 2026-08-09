from __future__ import annotations

import abc
import collections.abc as cabc
import enum
import os
import stat
import sys
import typing as t
import uuid
from datetime import datetime
from gettext import gettext as _
from gettext import ngettext

from . import exceptions as exceptions_module
from ._compat import open_stream
from .utils import format_filename
from .utils import open_file

if t.TYPE_CHECKING:
    import typing_extensions as te

    from .core import Context
    from .core import Parameter
    from .shell_completion import CompletionItem


class ParamTypeInfoDict(t.TypedDict, total=False):
    param_type: str
    name: str


class ParamType:
    """Represents the type of a parameter. Validates and converts values
    from the command line or Python into the correct type.

    To implement a custom type, subclass and implement at least the
    following:

    -   The :attr:`name` class attribute must be set.
    -   Optionally, override :meth:`convert` to do any value parsing
        and validation, calling :meth:`fail` if a value is invalid.
    -   Optionally, override :meth:`shell_complete` to return completions
        for the type when shell completion is requested.

    .. code-block:: python

        class MyParamType(click.ParamType):
            name = "mytype"

            def convert(self, value, param, ctx):
                try:
                    return int(value)
                except (ValueError, TypeError):
                    self.fail(
                        f"{value!r} is not valid integer.",
                        param,
                        ctx,
                    )
    """

    is_composite: t.ClassVar[bool] = False
    envvar_list_splitter: t.ClassVar[str | None] = None

    name: str

    def to_info_dict(self) -> ParamTypeInfoDict:
        """Gather information that could be useful for a tool generating
        user-facing documentation. Use :meth:`click.Context.to_info_dict`
        to traverse the entire CLI structure.

        .. versionadded:: 8.0
        """
        return {"param_type": self.name, "name": self.name}

    def __call__(
        self,
        value: t.Any,
        param: Parameter | None = None,
        ctx: Context | None = None,
    ) -> t.Any:
        if value is not None:
            return self.convert(value, param, ctx)

        return value

    def get_metavar(self, param: Parameter, ctx: Context) -> str:
        """Return a metavar for this type for use in help text."""
        return self.name.upper()

    def get_missing_message(
        self, param: Parameter, ctx: Context | None = None
    ) -> str | None:
        """Optionally might return extra information about a missing
        parameter.

        .. versionadded:: 2.0
        """
        return None

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        """Convert the value. This is not invoked for values that are
        `None` (the missing value).
        """
        return value

    def split_envvar_value(self, rv: str) -> list[str]:
        """Given a value from an environment variable this splits it up
        into small chunks depending on the defined envvar list splitter.

        If the splitter is set to ``None``, which means that whitespace splits,
        then leading and trailing whitespace is ignored.  Otherwise, leading
        and trailing splitters usually lead to empty items being included.
        """
        return (rv.split() if self.envvar_list_splitter is None else rv.split(self.envvar_list_splitter))

    def fail(
        self,
        message: str,
        param: Parameter | None = None,
        ctx: Context | None = None,
    ) -> t.NoReturn:
        """Helper method to fail with an invalid value message."""
        raise exceptions_module.BadParameter(message, ctx=ctx, param=param)

    def shell_complete(
        self,
        ctx: Context,
        incomplete: str,
    ) -> list[CompletionItem]:
        """Return a list of
        :class:`~click.shell_completion.CompletionItem` objects for the
        incomplete value. Most types do not provide completions, but
        some do, and this allows custom types to provide custom
        completions as well.

        :param ctx: Invocation context for this command.
        :param incomplete: Value being completed. May be empty.

        .. versionadded:: 8.0
        """
        return []


class CompositeParamType(ParamType):
    is_composite: t.ClassVar[bool] = True

    @property
    def arity(self) -> int: ...


class FuncParamType(ParamType):
    def __init__(self, func: t.Callable[[t.Any], t.Any], name: str) -> None:
        self.name: str = name
        self.func = func

    def to_info_dict(self) -> ParamTypeInfoDict:
        info_dict = super().to_info_dict()
        return info_dict

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        try:
            return self.func(value)
        except (ValueError, TypeError) as e:
            try:
                self.fail(str(e), param, ctx)
            except exceptions_module.BadParameter:
                raise

    def __repr__(self) -> str:
        return f"FuncParamType({self.func!r})"


class UnprocessedParamType(ParamType):
    name = "TEXT"

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        return value

    def __repr__(self) -> str:
        return "UNPROCESSED"


class StringParamType(ParamType):
    name = "TEXT"

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        if isinstance(value, bytes):
            enc = self._get_encoding()
            try:
                value = value.decode(enc)
            except UnicodeError:
                try:
                    value = value.decode("utf-8")
                except UnicodeError:
                    value = value.decode("utf-8", "replace")
        return value

    def _get_encoding(self) -> str:
        import locale
        return locale.getpreferredencoding(False)

    def __repr__(self) -> str:
        return "STRING"


class Choice(ParamType):
    """The choice type allows a value to be checked against a fixed set
    of supported values. All of these values have to be strings.

    You should only pass a list or tuple of choices. Other iterables
    (like generators) may lead to surprising results.

    See :ref:`choice-opts` and :ref:`choice-args` for examples.

    :param case_sensitive: Set to false to make choices case-insensitive.
        Defaults to true.
    """

    name = "Choice"

    def __init__(self, choices: cabc.Sequence[str], case_sensitive: bool = True) -> None:
        self.choices = choices
        self.case_sensitive = case_sensitive

    def to_info_dict(self) -> ParamTypeInfoDict:
        info_dict = super().to_info_dict()
        info_dict["choices"] = self.choices  # type: ignore[typeddict-unknown-key]
        info_dict["case_sensitive"] = self.case_sensitive  # type: ignore[typeddict-unknown-key]
        return info_dict

    def get_metavar(self, param: Parameter, ctx: Context) -> str:
        if self.case_sensitive:
            choices_str = "|".join(self.choices)
        else:
            choices_str = "|".join(c.lower() for c in self.choices)

        if param.required and param.choices_metavar_fill is not False:  # type: ignore[attr-defined]
            return "[" + choices_str + "]"
        return choices_str

    def get_missing_message(
        self, param: Parameter, ctx: Context | None = None
    ) -> str | None:
        if self.case_sensitive:
            choice_str = "\n\t".join(self.choices)
        else:
            choice_str = "\n\t".join(c.lower() for c in self.choices)
        return _("Choose from:\n\t{choice_str}").format(choice_str=choice_str)

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        # Match through normalization and case sensitivity
        # By default, allow the value to be specified in any combination of
        # upper and lower case letters.
        normed_value = value
        normed_choices = {choice: choice for choice in self.choices}

        if not self.case_sensitive:
            folded_choices = {choice.casefold(): choice for choice in self.choices}
            normed_value = value.casefold()

            if normed_value in folded_choices:
                return folded_choices[normed_value]
        else:
            if value in normed_choices:
                return normed_choices[value]

        choices_str = ", ".join(f"{choice!r}" for choice in self.choices)
        self.fail(
            ngettext(
                "{value!r} is not {choice}.",
                "{value!r} is not one of {choices}.",
                len(self.choices),
            ).format(value=value, choice=choices_str, choices=choices_str),
            param,
            ctx,
        )

    def __repr__(self) -> str:
        return f"Choice({list(self.choices)})"

    def shell_complete(
        self,
        ctx: Context,
        incomplete: str,
    ) -> list[CompletionItem]:
        from .shell_completion import CompletionItem

        str_choices = map(str, self.choices)

        if self.case_sensitive:
            filtered = (c for c in str_choices if c.startswith(incomplete))
        else:
            filtered = (c for c in str_choices if c.lower().startswith(incomplete.lower()))

        return [CompletionItem(c) for c in filtered]

    def get_invalid_choice_message(
        self, value: str, ctx: Context | None = None
    ) -> str:
        choices_str = ", ".join(f"{choice!r}" for choice in self.choices)
        return ngettext(
            "{value!r} is not {choice}.",
            "{value!r} is not one of {choices}.",
            len(self.choices),
        ).format(value=value, choice=choices_str, choices=choices_str)


class DateTimeInfoDict(t.TypedDict, total=False):
    formats: list[str]


class DateTime(ParamType):
    """The DateTime type converts date strings into `datetime` objects.

    The format strings which are checked are configurable, but default to some
    common (non-timezone aware) ISO 8601 formats.

    When specifying *DateTime* formats, you should only pass a list or a tuple.
    Other iterables, like generators, may lead to surprising results.

    The format strings are processed using ``datetime.strptime``, and this
    consequently defines the format strings which are allowed.

    See :ref:`datetime` for an example.

    :param formats: A list or tuple of date format strings, in the order in
                    which they should be tried. Defaults to
                    ``'%Y-%m-%d'``, ``'%Y-%m-%dT%H:%M:%S'``,
                    ``'%Y-%m-%d %H:%M:%S'``.
    """

    name = "DATETIME"

    def __init__(
        self,
        formats: cabc.Sequence[str] | None = None,
    ) -> None:
        self.formats: cabc.Sequence[str] = formats or [
            "%Y-%m-%d",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
        ]

    def to_info_dict(self) -> ParamTypeInfoDict:
        info_dict = super().to_info_dict()
        info_dict["formats"] = list(self.formats)  # type: ignore[typeddict-unknown-key]
        return info_dict

    def get_metavar(self, param: Parameter, ctx: Context) -> str:
        return "[" + "|".join(self.formats) + "]"

    def _try_to_convert_date(self, value: t.Any, format: str) -> datetime | None:
        try:
            return datetime.strptime(value, format)
        except ValueError:
            return None

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        # If already a datetime, pass through.
        if isinstance(value, datetime):
            return value

        for format in self.formats:
            converted = self._try_to_convert_date(value, format)

            if converted is not None:
                return converted

        formats_str = ", ".join(repr(f) for f in self.formats)
        self.fail(
            ngettext(
                "{value!r} does not match the format {formats}.",
                "{value!r} does not match the formats {formats}.",
                len(self.formats),
            ).format(value=value, formats=formats_str),
            param,
            ctx,
        )

    def __repr__(self) -> str:
        return f"DateTime(formats={list(self.formats)!r})"


class _NumberParamTypeBase(ParamType):
    _number_class: t.ClassVar[type]

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        try:
            return self._number_class(value)
        except (ValueError, TypeError):
            self.fail(
                _("'{value}' is not a valid {number_type}.").format(
                    value=value, number_type=self.name.lower()
                ),
                param,
                ctx,
            )


class _NumberRangeBase(_NumberParamTypeBase):
    def __init__(
        self,
        min: float | None = None,
        max: float | None = None,
        min_open: bool = False,
        max_open: bool = False,
        clamp: bool = False,
    ) -> None:
        self.min = min
        self.max = max
        self.min_open = min_open
        self.max_open = max_open
        self.clamp = clamp

    def to_info_dict(self) -> ParamTypeInfoDict:
        info_dict = super().to_info_dict()
        info_dict["min"] = self.min  # type: ignore[typeddict-unknown-key]
        info_dict["max"] = self.max  # type: ignore[typeddict-unknown-key]
        info_dict["min_open"] = self.min_open  # type: ignore[typeddict-unknown-key]
        info_dict["max_open"] = self.max_open  # type: ignore[typeddict-unknown-key]
        info_dict["clamp"] = self.clamp  # type: ignore[typeddict-unknown-key]
        return info_dict

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        import operator

        converted = super().convert(value, param, ctx)
        lt_min: bool = (
            self.min is not None
            and (
                operator.le(converted, self.min)
                if self.min_open
                else operator.lt(converted, self.min)
            )
        )
        gt_max: bool = (
            self.max is not None
            and (
                operator.ge(converted, self.max)
                if self.max_open
                else operator.gt(converted, self.max)
            )
        )

        if self.clamp:
            if lt_min:
                return self._clamp(self.min, 1, self.min_open)  # type: ignore[arg-type]
            if gt_max:
                return self._clamp(self.max, -1, self.max_open)  # type: ignore[arg-type]

        if lt_min or gt_max:
            self.fail(
                _("{value} is not in the range {range}.").format(
                    value=value, range=self._describe_range()
                ),
                param,
                ctx,
            )

        return converted

    def _clamp(self, bound: float, dir: int, open: bool) -> float:
        """Find the nearest valid value in the given direction."""
        if not open:
            return bound

        # For integer ranges, shift by 1 step.
        if isinstance(self, IntRange):
            return bound + dir

        # For float ranges, find the next float in the given direction.
        return bound + dir * sys.float_info.epsilon

    def _describe_range(self) -> str:
        """Describe the range, for use in error messages."""
        if self.min is None:
            if self.max_open:
                return f"x<{self.max}"
            return f"x<={self.max}"

        if self.max is None:
            if self.min_open:
                return f"x>{self.min}"
            return f"x>={self.min}"

        lb = "<" if self.min_open else "<="
        rb = "<" if self.max_open else "<="
        return f"{self.min}{lb}x{rb}{self.max}"

    def get_metavar(self, param: Parameter, ctx: Context) -> str:
        return f"[{self._describe_range()}]"


class IntParamType(_NumberParamTypeBase):
    name = "INT"
    _number_class = int

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        try:
            return int(value, 0) if isinstance(value, str) else int(value)
        except (ValueError, TypeError):
            self.fail(
                _("'{value}' is not a valid integer.").format(value=value),
                param,
                ctx,
            )

    def __repr__(self) -> str:
        return "INT"


class IntRange(_NumberRangeBase):
    """Restrict an :data:`INT` value to a range of accepted values. See
    :ref:`ranges` for details.
    """

    name = "IntRange"
    _number_class = int

    def _describe_range(self) -> str:
        if self.min is None:
            if self.max_open:
                return f"x<{self.max}"
            return f"x<={self.max}"

        if self.max is None:
            if self.min_open:
                return f"x>{self.min}"
            return f"x>={self.min}"

        lb = "<" if self.min_open else "<="
        rb = "<" if self.max_open else "<="
        return f"{self.min}{lb}x{rb}{self.max}"

    def __repr__(self) -> str:
        return f"IntRange(min={self.min!r}, max={self.max!r}, clamp={self.clamp!r})"


class FloatParamType(_NumberParamTypeBase):
    name = "FLOAT"
    _number_class = float

    def __repr__(self) -> str:
        return "FLOAT"


class FloatRange(_NumberRangeBase):
    """Restrict a :data:`FLOAT` value to a range of accepted values. See
    :ref:`ranges` for details.
    """

    name = "FloatRange"
    _number_class = float

    def __repr__(self) -> str:
        return f"FloatRange(min={self.min!r}, max={self.max!r}, clamp={self.clamp!r})"


class BoolParamType(ParamType):
    name = "BOOLEAN"

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        if value in {"1", "true", "t", "yes", "y", "on"}:
            return True
        if value in {"0", "false", "f", "no", "n", "off"}:
            return False
        if isinstance(value, bool):
            return bool(value)
        self.fail(
            _("{value!r} is not a valid boolean value.").format(value=value),
            param,
            ctx,
        )

    def __repr__(self) -> str:
        return "BOOL"


class UUIDParameterType(ParamType):
    name = "UUID"

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        try:
            if isinstance(value, uuid.UUID):
                return value

            return uuid.UUID(value)
        except (ValueError, AttributeError):
            self.fail(
                _("'{value}' is not a valid UUID value.").format(value=value),
                param,
                ctx,
            )

    def __repr__(self) -> str:
        return "UUID"


class FileInfoDict(t.TypedDict, total=False):
    name: str
    mode: str
    content_encoding: str
    content_type: str
    lazy: bool
    envvar: str


class File(ParamType):
    """Declares a parameter to be a file for reading or writing. The file
    is automatically closed once the context tears down (after the command
    finishes working).

    Files can be opened for reading or writing. The special value ``-``
    means stdin/stdout depending on the mode. By default, the file is
    opened for reading.

    The default mode is ``'r'`` (read text), but any of the standard
    Python file-open modes can be used.

    :param mode: open the file in this mode.
    :param encoding: text encoding for reading/writing.
    :param errors: how to handle encoding errors.
    :param lazy: if true, wait to open the file until it is accessed.
        Useful for ``--output`` arguments so the file is not opened if
        there is an error before the command runs.
    :param atomic: if true, any writes go to a temporary file and are
        replaced on close. Prevents a file from being partially written.
    """

    name = "FILENAME"
    envvar_list_splitter: t.ClassVar[str | None] = os.pathsep

    def __init__(
        self,
        mode: str = "r",
        encoding: str | None = None,
        errors: str | None = "strict",
        lazy: bool = False,
        atomic: bool = False,
    ) -> None:
        self.mode = mode
        self.encoding = encoding
        self.errors = errors
        self.lazy = lazy
        self.atomic = atomic

    def to_info_dict(self) -> ParamTypeInfoDict:
        info_dict = super().to_info_dict()
        info_dict["mode"] = self.mode  # type: ignore[typeddict-unknown-key]
        info_dict["encoding"] = self.encoding  # type: ignore[typeddict-unknown-key]
        return info_dict

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        try:
            if hasattr(value, "read") or hasattr(value, "write"):
                return value

            value = os.fspath(value)
            value, should_close = open_stream(
                value,
                self.mode,
                encoding=self.encoding,
                errors=self.errors,
                atomic=self.atomic,
            )

            # If a context is provided, we request the context to
            # auto-close the resource later.
            if should_close:
                if ctx is not None:
                    ctx.call_on_close(value.close)

            return value
        except OSError as e:
            self.fail(
                _(
                    "'{filename}': {strerror}",
                ).format(filename=format_filename(e.filename), strerror=e.strerror),
                param,
                ctx,
            )

    def __repr__(self) -> str:
        return f"File({self.mode!r})"


def _is_file_like(value: t.Any) -> bool:
    return hasattr(value, "read") or hasattr(value, "write")


class PathInfoDict(t.TypedDict, total=False):
    name: str
    exists: bool
    file_okay: bool
    dir_okay: bool
    writable: bool
    readable: bool
    allow_dash: bool


class Path(ParamType):
    """The ``Path`` type is similar to the :class:`File` type, but returns
    the filename instead of an open file. Various checks can be enabled
    to validate the type of file and permissions.

    :param exists: The path must exist.
    :param file_okay: Allow a file as a value.
    :param dir_okay: Allow a directory as a value.
    :param writable: The path must be writable.
    :param readable: The path must be readable.
    :param resolve_path: Make the value absolute and resolve any symlinks.
        The value is not resolved on Windows due to an issue with
        :func:`os.path.realpath`.
    :param allow_dash: Allow a single dash as a value, which indicates
        a standard stream (stdin or stdout). Use :func:`open_file` to
        handle opening this value.
    :param path_type: Convert the incoming path value to this type. If
        ``None``, keep as :class:`str`. If ``pathlib.Path``, convert
        using :class:`pathlib.Path`.
    :param executable: The path must be executable.

    .. versionchanged:: 8.1
        Added the ``executable`` parameter.
    """

    envvar_list_splitter: t.ClassVar[str | None] = os.pathsep

    def __init__(
        self,
        exists: bool = False,
        file_okay: bool = True,
        dir_okay: bool = True,
        writable: bool = False,
        readable: bool = True,
        resolve_path: bool = False,
        allow_dash: bool = False,
        path_type: type | None = None,
        executable: bool = False,
    ) -> None:
        self.exists = exists
        self.file_okay = file_okay
        self.dir_okay = dir_okay
        self.writable = writable
        self.readable = readable
        self.resolve_path = resolve_path
        self.allow_dash = allow_dash
        self.path_type = path_type
        self.executable = executable

        if self.file_okay and not self.dir_okay:
            self.name: str = _("FILE")
            self.path_type_label: str = _("File")
        elif self.dir_okay and not self.file_okay:
            self.name = _("DIRECTORY")
            self.path_type_label = _("Directory")
        else:
            self.name = _("PATH")
            self.path_type_label = _("Path")

    def to_info_dict(self) -> ParamTypeInfoDict:
        info_dict = super().to_info_dict()
        info_dict["exists"] = self.exists  # type: ignore[typeddict-unknown-key]
        info_dict["file_okay"] = self.file_okay  # type: ignore[typeddict-unknown-key]
        info_dict["dir_okay"] = self.dir_okay  # type: ignore[typeddict-unknown-key]
        info_dict["writable"] = self.writable  # type: ignore[typeddict-unknown-key]
        info_dict["readable"] = self.readable  # type: ignore[typeddict-unknown-key]
        info_dict["allow_dash"] = self.allow_dash  # type: ignore[typeddict-unknown-key]
        return info_dict

    def coerce_path_result(self, value: str | os.PathLike[str]) -> str | os.PathLike[str]:
        if self.path_type is not None and not isinstance(value, self.path_type):
            if self.path_type is str:
                return os.fsdecode(value)
            elif self.path_type is bytes:
                return os.fsencode(value)
            else:
                return self.path_type(value)

        return value

    def convert(
        self,
        value: str | os.PathLike[str],
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        try:
            fspath = os.fspath(value)
        except TypeError:
            self.fail(
                _("Expected a valid path, got {value!r}.").format(value=value),
                param,
                ctx,
            )

        is_dash = self.file_okay and self.allow_dash and fspath in {"-", b"-"}

        if not is_dash:
            if self.resolve_path:
                # os.path.realpath doesn't resolve symlinks on Windows
                # until Python 3.8. Use pathlib instead.
                import pathlib

                fspath = os.fsdecode(pathlib.Path(fspath).resolve())

            try:
                st = os.stat(fspath)
            except OSError:
                if not self.exists:
                    return self.coerce_path_result(fspath)
                self.fail(
                    _("Path {filename!r} does not exist.").format(
                        filename=format_filename(fspath)
                    ),
                    param,
                    ctx,
                )

            if not self.file_okay and stat.S_ISREG(st.st_mode):
                self.fail(
                    _(
                        "{path_type} {filename!r} is a file.",
                    ).format(
                        path_type=self.path_type_label,
                        filename=format_filename(fspath),
                    ),
                    param,
                    ctx,
                )
            if not self.dir_okay and stat.S_ISDIR(st.st_mode):
                self.fail(
                    _(
                        "{path_type} {filename!r} is a directory.",
                    ).format(
                        path_type=self.path_type_label,
                        filename=format_filename(fspath),
                    ),
                    param,
                    ctx,
                )

            if self.executable and not os.access(fspath, os.X_OK):
                self.fail(
                    _(
                        "{path_type} {filename!r} is not executable.",
                    ).format(
                        path_type=self.path_type_label,
                        filename=format_filename(fspath),
                    ),
                    param,
                    ctx,
                )

            if self.writable and not os.access(fspath, os.W_OK):
                self.fail(
                    _(
                        "{path_type} {filename!r} is not writable.",
                    ).format(
                        path_type=self.path_type_label,
                        filename=format_filename(fspath),
                    ),
                    param,
                    ctx,
                )

            if self.readable and not os.access(fspath, os.R_OK):
                self.fail(
                    _(
                        "{path_type} {filename!r} is not readable.",
                    ).format(
                        path_type=self.path_type_label,
                        filename=format_filename(fspath),
                    ),
                    param,
                    ctx,
                )

        return self.coerce_path_result(fspath)

    def __repr__(self) -> str:
        return (
            f"Path(exists={self.exists!r}, file_okay={self.file_okay!r},"
            f" dir_okay={self.dir_okay!r}, writable={self.writable!r},"
            f" readable={self.readable!r}, resolve_path={self.resolve_path!r},"
            f" allow_dash={self.allow_dash!r}, path_type={self.path_type!r},"
            f" executable={self.executable!r})"
        )

    def shell_complete(
        self,
        ctx: Context,
        incomplete: str,
    ) -> list[CompletionItem]:
        from .shell_completion import CompletionItem

        type = "dir" if self.dir_okay and not self.file_okay else "file"
        return [CompletionItem(incomplete, type=type)]


class TupleInfoDict(t.TypedDict, total=False):
    name: str
    types: list[ParamTypeInfoDict]


class Tuple(CompositeParamType):
    """The default behavior of Click is to apply a type on a value directly.
    This works well in most cases, except for when `nargs=-1`, where
    Click will create a tuple of values. In that case the type is applied to
    all the individual values, and they are given one at a time.

    However, it is sometimes useful to have different types for the
    individual items in a tuple. This can be achieved with the ``Tuple``
    type, where each individual element in the tuple can have a different
    type.

    This can be useful if a command takes a fixed number of arguments of
    different types.

    See :ref:`tuple-type` for an example.

    :param types: a list of types that should be used for the tuple items.
    """

    name = "<TEXT TEXT ...>"

    def __init__(self, types: cabc.Sequence[t.Any]) -> None:
        self.types: t.Sequence[ParamType] = [convert_type(ty) for ty in types]

    def to_info_dict(self) -> ParamTypeInfoDict:
        info_dict = super().to_info_dict()
        info_dict["types"] = [t.to_info_dict() for t in self.types]  # type: ignore[typeddict-unknown-key]
        return info_dict

    @property
    def name(self) -> str:  # type: ignore[override]
        return "<" + " ".join(ty.name for ty in self.types) + ">"

    @property
    def arity(self) -> int:
        return len(self.types)

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        if len(value) != self.arity:
            self.fail(
                ngettext(
                    "{len_value} values are required, but only {arity} was given.",
                    "{len_value} values are required, but {arity} were given.",
                    len(value),
                ).format(len_value=self.arity, arity=len(value)),
                param,
                ctx,
            )

        return tuple(ty(x, param, ctx) for ty, x in zip(self.types, value))

    def __repr__(self) -> str:
        return f"Tuple({list(self.types)!r})"


def _guess_type(value: t.Any) -> ParamType:
    if isinstance(value, bool):
        return BOOL
    return STRING


def convert_type(ty: t.Any, default: t.Any = None) -> ParamType:
    """Find the most appropriate :class:`ParamType` for the given Python
    type. If the type isn't provided, it can be inferred from a default
    value.
    """
    guessed = ty is None

    if ty is None and default is not None:
        if isinstance(default, (tuple, list)):
            # A tuple default results in a tuple type
            if all(d is None for d in default):
                return STRING

            ty = type(default[0]) if len(default) else None
        else:
            ty = type(default)

    if guessed and ty is bool:
        return BOOL

    if ty is str or ty is None:
        return STRING

    if ty is int:
        return INT

    if ty is float:
        return FLOAT

    if ty is bool:
        return BOOL

    if isinstance(ty, ParamType):
        return ty

    return FuncParamType(ty, ty.__name__)


class OptionHelpExtra(t.TypedDict, total=False):
    envvar: str
    default: str
    range: str
    choices: str


STRING: StringParamType = StringParamType()
INT: IntParamType = IntParamType()
FLOAT: FloatParamType = FloatParamType()
BOOL: BoolParamType = BoolParamType()
UNPROCESSED: UnprocessedParamType = UnprocessedParamType()
UUID: UUIDParameterType = UUIDParameterType()
