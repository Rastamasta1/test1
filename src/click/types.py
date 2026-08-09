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
from operator import attrgetter

from . import exceptions as exceptions_module
from ._compat import get_filesystem_encoding
from ._compat import open_stream
from .utils import format_filename
from .utils import LazyFile
from .utils import safecall

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
    -   Optionally, :meth:`convert` to do the actual validation and
        conversion.
    -   Optionally, :meth:`get_missing_message` to customize the error
        message when required values are missing.
    -   Optionally, :meth:`shell_complete` to provide completions.

    See the :ref:`custom param types` documentation for more
    information.
    """

    is_composite: t.ClassVar[bool] = False
    envvar_list_splitter: t.ClassVar[str | None] = None

    #: The name is used to describe the parameter type in error
    #: messages and help text. It may contain type hints like
    #: ``integer range``. If the name is ``None``, it will only show
    #: the type it converted to.
    name: t.ClassVar[str]

    def to_info_dict(self) -> ParamTypeInfoDict:
        """Gather information that could be useful for a tool generating
        user-facing documentation. Use :meth:`click.Context.to_info_dict`
        to traverse the entire CLI structure.

        .. code-block:: python

            with Context(cli) as ctx:
                info = ctx.to_info_dict()

        .. versionadded:: 8.0
        """
        # The class name without the "ParamType" suffix is used as the
        # type name in the info dict.
        class_name = type(self).__name__
        param_type = class_name[: class_name.find("ParamType")]
        return {"param_type": param_type or class_name, "name": self.name}

    def __call__(
        self,
        value: t.Any,
        param: Parameter | None = None,
        ctx: Context | None = None,
    ) -> t.Any:
        if value is not None:
            return self.convert(value, param, ctx)

    def get_metavar(self, param: Parameter, ctx: Context) -> str | None:
        """Return the metavar for this type."""
        return getattr(self, "name", None)

    def get_missing_message(
        self, param: Parameter, ctx: Context | None = None
    ) -> str | None:
        """Return an informative error message if a required parameter
        is missing.

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
        ``None`` (the missing value).
        """
        return value

    def failed(
        self,
        message: str,
        value: t.Any = None,
        param: Parameter | None = None,
        ctx: Context | None = None,
    ) -> t.Never:
        raise exceptions_module.BadParameter(message, ctx=ctx, param=param)

    def shell_complete(
        self,
        ctx: Context,
        param: Parameter,
        incomplete: str,
    ) -> list[CompletionItem]:
        """Return a list of
        :class:`~click.shell_completion.CompletionItem` objects for the
        incomplete value. Most types do not provide completions, but
        some do, and this allows custom types to provide custom
        completions as well.

        :param ctx: Invocation context for this command.
        :param param: The parameter that is requesting completions.
        :param incomplete: Value being completed. May be empty.

        .. versionadded:: 8.0
        """
        return []


class CompositeParamType(ParamType):
    is_composite: t.ClassVar[bool] = True

    @property
    def arity(self) -> int:  # type: ignore[override]
        raise NotImplementedError()


class FuncParamType(ParamType):
    def __init__(self, func: t.Callable[[t.Any], t.Any], name: str) -> None:
        self.name: str = name
        self.func = func

    def to_info_dict(self) -> ParamTypeInfoDict:
        info_dict = super().to_info_dict()
        info_dict["name"] = self.name
        return info_dict

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        try:
            return self.func(value)
        except (ValueError, UnicodeError) as e:
            self.failed(
                getattr(e, "format_message", e.__str__)(),
                value=value,
                param=param,
                ctx=ctx,
            )


class UnprocessedParamType(ParamType):
    name: t.ClassVar[str] = "TEXT"

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
    name: t.ClassVar[str] = "TEXT"

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        if isinstance(value, bytes):
            enc = self._get_encoding(param)
            try:
                value = value.decode(enc)
            except UnicodeError:
                try:
                    value = value.decode("utf-8")
                except UnicodeError:
                    value = value.decode("utf-8", "replace")
        return value

    def _get_encoding(self, param: Parameter | None) -> str:
        return sys.stdin.encoding or sys.getdefaultencoding()

    def __repr__(self) -> str:
        return "STRING"


class Choice(ParamType):
    """The choice type allows a value to be checked against a fixed set
    of supported values. All of these values have to be strings.

    You should only pass a list or tuple of choices. Other iterables
    (like generators) may lead to surprising results.

    See :ref:`choice-opts` and :ref:`choice-args` for examples.

    :param choices: Accepted values.
    :param case_sensitive: If false, accept case-insensitive input.
    """

    name: t.ClassVar[str] = "choice"

    def __init__(
        self,
        choices: cabc.Sequence[str],
        case_sensitive: bool = True,
    ) -> None:
        self.choices = choices
        self.case_sensitive = case_sensitive

    def to_info_dict(self) -> ParamTypeInfoDict:  # type: ignore[override]
        info_dict: dict[str, t.Any] = {**super().to_info_dict()}  # type: ignore[assignment]
        info_dict["choices"] = self.choices
        info_dict["case_sensitive"] = self.case_sensitive
        return info_dict  # type: ignore[return-value]

    def get_metavar(self, param: Parameter, ctx: Context) -> str | None:
        if len(self.choices) > 3:
            return f"{{{self.choices[0]}|...|{self.choices[-1]}}}"
        choices_str = "|".join(self.choices)
        return f"{{{choices_str}}}"

    def get_missing_message(
        self, param: Parameter, ctx: Context | None = None
    ) -> str | None:
        choice_str = ",\n\t".join(self.choices)
        return _("Choose from:\n\t{choice_str}").format(choice_str=choice_str)

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        # Match through normalization and case sensitivity
        # By default, the value is compared against choices after
        # stripping the whitespace. If case_sensitive is False, the value
        # and choices are lowercased before comparison.
        normed_value = value
        normed_choices = {choice: choice for choice in self.choices}

        if ctx is not None and ctx.token_normalize_func is not None:
            normed_value = ctx.token_normalize_func(value)
            normed_choices = {
                ctx.token_normalize_func(normed_choice): original
                for normed_choice, original in normed_choices.items()
            }

        if not self.case_sensitive:
            # Match through case-insensitivity
            if ctx is not None and ctx.token_normalize_func is not None:
                normed_value = normed_value.casefold()
            else:
                normed_value = value.casefold()

            normed_choices = {
                normed_choice.casefold(): original
                for normed_choice, original in normed_choices.items()
            }

        if normed_value in normed_choices:
            return normed_choices[normed_value]

        choices_str = ", ".join(f"'{choice}'" for choice in self.choices)
        self.failed(
            _("'{value}' is not one of {choices_str}.").format(
                value=value, choices_str=choices_str
            ),
            value=value,
            param=param,
            ctx=ctx,
        )

    def __repr__(self) -> str:
        return f"Choice({list(self.choices)})"

    def shell_complete(
        self,
        ctx: Context,
        param: Parameter,
        incomplete: str,
    ) -> list[CompletionItem]:
        from .shell_completion import CompletionItem

        str_choices = map(str, self.choices)

        if self.case_sensitive:
            matched = (c for c in str_choices if c.startswith(incomplete))
        else:
            matched = (
                c
                for c in str_choices
                if c.casefold().startswith(incomplete.casefold())
            )

        return [CompletionItem(c) for c in matched]


class DateTimeInfoDict(t.TypedDict, total=False):
    param_type: str
    name: str
    formats: list[str]


class DateTime(ParamType):
    """The DateTime type converts date strings into `datetime` objects.

    The format strings which are checked are configurable, but default to some
    common (non-timezone-aware) ISO 8601 formats.

    When specifying *DateTime* formats, you should only pass a list or a tuple.
    Other iterables, like generators, may lead to surprising results.

    The format strings are processed using ``datetime.strptime``, and this
    consequently defines the format strings which are allowed.

    Parsing is tried using each format, in order, and the first format which
    parses successfully is used.

    :param formats: A list or tuple of date format strings, in the order in
                    which they should be tried. Defaults to
                    ``'%Y-%m-%d'``, ``'%Y-%m-%dT%H:%M:%S'``,
                    ``'%Y-%m-%d %H:%M:%S'``.
    """

    name: t.ClassVar[str] = "DATETIME"

    def __init__(self, formats: cabc.Sequence[str] | None = None):
        self.formats: cabc.Sequence[str] = formats or [
            "%Y-%m-%d",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S",
        ]

    def to_info_dict(self) -> DateTimeInfoDict:
        info_dict: dict[str, t.Any] = {**super().to_info_dict()}
        info_dict["formats"] = self.formats
        return info_dict  # type: ignore[return-value]

    def get_metavar(self, param: Parameter, ctx: Context) -> str | None:
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
        # If already a datetime, pass through
        if isinstance(value, datetime):
            return value

        for format in self.formats:
            converted = self._try_to_convert_date(value, format)

            if converted is not None:
                return converted

        formats_str = ", ".join(f"'{f}'" for f in self.formats)
        self.failed(
            _(
                "'{value}' does not match the formats {formats_str}."
            ).format(value=value, formats_str=formats_str),
            value=value,
            param=param,
            ctx=ctx,
        )

    def __repr__(self) -> str:
        return "DateTime"


class _NumberParamTypeBase(ParamType):
    _number_class: t.ClassVar[type[t.Any]]

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        try:
            return self._number_class(value)
        except (ValueError, UnicodeError):
            self.failed(
                _("'{value}' is not a valid {number_type}.").format(
                    value=value,
                    number_type=self.name,
                ),
                value=value,
                param=param,
                ctx=ctx,
            )


class _NumberRangeBase(_NumberParamTypeBase):
    def __init__(
        self,
        min: t.Any = None,
        max: t.Any = None,
        min_open: bool = False,
        max_open: bool = False,
        clamp: bool = False,
    ) -> None:
        self.min = min
        self.max = max
        self.min_open = min_open
        self.max_open = max_open
        self.clamp = clamp

    def to_info_dict(self) -> ParamTypeInfoDict:  # type: ignore[override]
        info_dict: dict[str, t.Any] = {**super().to_info_dict()}  # type: ignore[assignment]
        info_dict["min"] = self.min
        info_dict["max"] = self.max
        info_dict["min_open"] = self.min_open
        info_dict["max_open"] = self.max_open
        info_dict["clamp"] = self.clamp
        return info_dict  # type: ignore[return-value]

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        import operator

        value = super().convert(value, param, ctx)
        lt_min: bool
        gt_max: bool

        if self.min_open:
            lt_min = operator.le
        else:
            lt_min = operator.lt

        if self.max_open:
            gt_max = operator.ge
        else:
            gt_max = operator.gt

        if self.clamp:
            if self.min is not None and lt_min(value, self.min):
                return self._clamp(self.min, 1, self.min_open)

            if self.max is not None and gt_max(value, self.max):
                return self._clamp(self.max, -1, self.max_open)

        if (self.min is not None and lt_min(value, self.min)) or (
            self.max is not None and gt_max(value, self.max)
        ):
            self.failed(
                _(
                    "{value} is not in the range {range}."
                ).format(value=value, range=self),
                value=value,
                param=param,
                ctx=ctx,
            )

        return value

    def _clamp(self, bound: t.Any, dir: t.Literal[1, -1], open: bool) -> t.Any:
        """Find the nearest value to ``bound`` in the allowed range."""
        if not open:
            return bound

        # If the range is open, the bound is not included. Find the
        # nearest value by moving in the direction from the bound.
        if isinstance(bound, int):
            return bound + dir

        # For floats, move towards the next representable value.
        import math

        return math.nextafter(bound, math.copysign(math.inf, dir))

    def get_metavar(self, param: Parameter, ctx: Context) -> str | None:
        open = "(" if self.min_open else "["
        close = ")" if self.max_open else "]"
        low = self.min if self.min is not None else "-inf"
        high = self.max if self.max is not None else "inf"
        return f"{open}{low}, {high}{close}"

    def _describe_range(self) -> str:
        """Describe the range for use in help text."""
        if self.min is None:
            if self.max is None:
                return ""

            ltgt = "<" if self.max_open else "<="
            return f"x{ltgt}{self.max}"

        if self.max is None:
            ltgt = ">" if self.min_open else ">="
            return f"x{ltgt}{self.min}"

        return self.get_metavar(param=None, ctx=None)  # type: ignore[arg-type]

    def __repr__(self) -> str:
        clamp = " clamped" if self.clamp else ""
        return f"{type(self).__name__}({self._describe_range()}{clamp})"


class IntParamType(_NumberParamTypeBase):
    name: t.ClassVar[str] = "INTEGER"
    _number_class: t.ClassVar[type[t.Any]] = int

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        if isinstance(value, str):
            # Handle "_" separators in integer literals. Python allows them, but
            # "int" does not strip surrounding whitespace when a base is given,
            # so strip here before passing to "int".
            try:
                return int(value.replace("_", ""), 0)
            except ValueError:
                pass
        try:
            return int(value)
        except (ValueError, UnicodeError):
            self.failed(
                _("'{value}' is not a valid integer.").format(value=value),
                value=value,
                param=param,
                ctx=ctx,
            )

    def __repr__(self) -> str:
        return "INT"


class IntRange(_NumberRangeBase):
    """Restrict an :data:`INT` value to a range of accepted values. See
    :ref:`ranges` for details.

    :param min: The minimum accepted value, or ``None`` for no lower bound.
    :param max: The maximum accepted value, or ``None`` for no upper bound.
    :param min_open: If enabled, the minimum bound is excluded from the
        valid range.
    :param max_open: If enabled, the maximum bound is excluded from the
        valid range.
    :param clamp: If enabled, values outside the range are clamped to the
        minimum or maximum rather than failing.

    .. versionchanged:: 8.0
        Added the ``min_open`` and ``max_open`` parameters.
    """

    name: t.ClassVar[str] = "INTEGER RANGE"
    _number_class: t.ClassVar[type[t.Any]] = int


class FloatParamType(_NumberParamTypeBase):
    name: t.ClassVar[str] = "FLOAT"
    _number_class: t.ClassVar[type[t.Any]] = float

    def __repr__(self) -> str:
        return "FLOAT"


class FloatRange(_NumberRangeBase):
    """Restrict a :data:`FLOAT` value to a range of accepted values. See
    :ref:`ranges` for details.

    :param min: The minimum accepted value, or ``None`` for no lower bound.
    :param max: The maximum accepted value, or ``None`` for no upper bound.
    :param min_open: If enabled, the minimum bound is excluded from the
        valid range.
    :param max_open: If enabled, the maximum bound is excluded from the
        valid range.
    :param clamp: If enabled, values outside the range are clamped to the
        minimum or maximum rather than failing.

    .. versionchanged:: 8.0
        Added the ``min_open`` and ``max_open`` parameters.
    """

    name: t.ClassVar[str] = "FLOAT RANGE"
    _number_class: t.ClassVar[type[t.Any]] = float

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        rv = super().convert(value, param, ctx)
        if self.min_open and rv == self.min or self.max_open and rv == self.max:
            self.failed(
                _(
                    "{value} is not in the range {range}."
                ).format(value=value, range=self),
                value=value,
                param=param,
                ctx=ctx,
            )
        return rv


class BoolParamType(ParamType):
    name: t.ClassVar[str] = "BOOLEAN"

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
        self.failed(
            _("{value!r} is not a valid boolean value.").format(value=value),
            value=value,
            param=param,
            ctx=ctx,
        )

    def __repr__(self) -> str:
        return "BOOL"


class UUIDParameterType(ParamType):
    name: t.ClassVar[str] = "UUID"

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        if isinstance(value, uuid.UUID):
            return value

        try:
            return uuid.UUID(value)
        except (AttributeError, ValueError):
            self.failed(
                _("'{value}' is not a valid UUID value.").format(value=value),
                value=value,
                param=param,
                ctx=ctx,
            )

    def __repr__(self) -> str:
        return "UUID"


class FileInfoDict(t.TypedDict, total=False):
    param_type: str
    name: str
    mode: str
    encoding: str | None
    errors: str | None
    lazy: bool
    atomic: bool


class File(ParamType):
    """Declare a parameter to be a file for reading or writing. The file
    is automatically closed once the context tears down (after the
    command finishes), unless the ``-`` special value is used, in which
    case :data:`sys.stdin` or :data:`sys.stdout` is used and not closed.

    Files can be opened for reading or writing. The special value ``-``
    indicates stdin or stdout depending on the mode.

    By default, the file is opened immediately. This can be changed to
    be lazy by passing ``lazy=True``. This is useful in situations where
    the reading and writing happens without actually opening the stream
    first, for instance when writing to a file for which the directory
    doesn't exist yet, and you want to give a more useful error message
    before opening.

    Starting with Click 2.0, files can also be opened atomically in
    which case all writes go into a separate file in the same folder and
    upon completion the file will be moved over to the original location.
    This is useful if a file regularly read by other users is in
    progress of being written.

    See :ref:`file-args` for examples.
    """

    name: t.ClassVar[str] = "FILENAME"
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

    def to_info_dict(self) -> FileInfoDict:
        info_dict: dict[str, t.Any] = {**super().to_info_dict()}
        info_dict["mode"] = self.mode
        info_dict["encoding"] = self.encoding
        info_dict["errors"] = self.errors
        info_dict["lazy"] = self.lazy
        info_dict["atomic"] = self.atomic
        return info_dict  # type: ignore[return-value]

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

            if self.lazy:
                f, should_close = None, True
                lf = _LazyFile(value, self.mode, self.encoding, self.errors)

                if ctx is not None:
                    ctx.call_on_close(lf.close_intelligently)

                return lf

            f, should_close = open_stream(
                value, self.mode, self.encoding, self.errors, atomic=self.atomic
            )

            # If a context is provided, we automatically close the file
            # at the end of the context execution (or, if lazy, when the
            # context is popped). Otherwise, the file is left open.
            if ctx is not None:
                if should_close:
                    ctx.call_on_close(safecall(f.close))

            return f
        except OSError as e:
            self.failed(
                _(
                    "'{filename}': {message}"
                ).format(filename=format_filename(value), message=e.strerror),
                value=value,
                param=param,
                ctx=ctx,
            )

    def shell_complete(
        self,
        ctx: Context,
        param: Parameter,
        incomplete: str,
    ) -> list[CompletionItem]:
        """Return a special completion marker that tells the completion
        system to use the shell to provide file path completions.
        """
        from .shell_completion import CompletionItem

        return [CompletionItem(incomplete, type="file")]

    def __repr__(self) -> str:
        return f"File({self.mode!r}, encoding={self.encoding!r}, errors={self.errors!r}, lazy={self.lazy!r}, atomic={self.atomic!r})"


def _is_file_like(value: t.Any) -> bool:
    return hasattr(value, "read") or hasattr(value, "write")


class PathInfoDict(t.TypedDict, total=False):
    param_type: str
    name: str
    file_okay: bool
    dir_okay: bool
    writable: bool
    readable: bool
    allow_dash: bool


class Path(ParamType):
    """The ``Path`` type is similar to the :class:`File` type, but
    returns the filename rather than an open file. Various checks can be
    enabled to validate the type of file and permissions.

    :param exists: The path must exist.
    :param file_okay: Allow a file as the value.
    :param dir_okay: Allow a directory as the value.
    :param writable: The path must be writable.
    :param readable: The path must be readable.
    :param resolve_path: Make the value absolute and resolve any
        symlinks. The value is not expanded if it is a ``-``.
    :param allow_dash: Allow ``-`` as a value, which indicates a
        standard stream (stdin or stdout). Use :func:`open_file` to
        handle opening this value.
    :param type: Convert the value to this type. Defaults to ``str``.
        Use :class:`pathlib.Path` to get a path object.
    :param executable: The path must be executable.
    :param readable: The path must be readable.
    :param writable: The path must be writable.

    .. versionchanged:: 8.1
        Added the ``executable`` parameter.
    """

    name: t.ClassVar[str] = "PATH"
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
        type: type[t.Any] | None = None,
        executable: bool = False,
    ) -> None:
        self.exists = exists
        self.file_okay = file_okay
        self.dir_okay = dir_okay
        self.writable = writable
        self.readable = readable
        self.resolve_path = resolve_path
        self.allow_dash = allow_dash
        self.type = type or str
        self.executable = executable

        if self.file_okay and not self.dir_okay:
            self.name = _("FILE")
            self.path_type = "File"
        elif self.dir_okay and not self.file_okay:
            self.name = _("DIRECTORY")
            self.path_type = "Directory"
        else:
            self.name = _("PATH")
            self.path_type = "Path"

    def to_info_dict(self) -> PathInfoDict:
        info_dict: dict[str, t.Any] = {**super().to_info_dict()}
        info_dict["file_okay"] = self.file_okay
        info_dict["dir_okay"] = self.dir_okay
        info_dict["writable"] = self.writable
        info_dict["readable"] = self.readable
        info_dict["allow_dash"] = self.allow_dash
        return info_dict  # type: ignore[return-value]

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        try:
            rv = value

            is_dash = self.file_okay and self.allow_dash and rv in (b"-", "-")

            if not is_dash:
                if self.resolve_path:
                    # os.path.realpath doesn't resolve symlinks on Windows
                    # until Python 3.8. Use pathlib for now.
                    import pathlib

                    rv = os.fspath(pathlib.Path(rv).resolve())

                try:
                    st = os.stat(rv)
                except OSError:
                    if not self.exists:
                        return self.coerce_path_result(rv)
                    self.failed(
                        _("Path '{filename}' does not exist.").format(
                            filename=format_filename(value)
                        ),
                        value=value,
                        param=param,
                        ctx=ctx,
                    )

                if not self.file_okay and stat.S_ISREG(st.st_mode):
                    self.failed(
                        _(
                            "Path '{filename}' is a file."
                        ).format(filename=format_filename(value)),
                        value=value,
                        param=param,
                        ctx=ctx,
                    )

                if not self.dir_okay and stat.S_ISDIR(st.st_mode):
                    self.failed(
                        _(
                            "Path '{filename}' is a directory."
                        ).format(filename=format_filename(value)),
                        value=value,
                        param=param,
                        ctx=ctx,
                    )

                if self.executable and not os.access(rv, os.X_OK):
                    self.failed(
                        _(
                            "Path '{filename}' is not executable."
                        ).format(filename=format_filename(value)),
                        value=value,
                        param=param,
                        ctx=ctx,
                    )

                if self.writable and not os.access(rv, os.W_OK):
                    self.failed(
                        _(
                            "Path '{filename}' is not writable."
                        ).format(filename=format_filename(value)),
                        value=value,
                        param=param,
                        ctx=ctx,
                    )

                if self.readable and not os.access(rv, os.R_OK):
                    self.failed(
                        _(
                            "Path '{filename}' is not readable."
                        ).format(filename=format_filename(value)),
                        value=value,
                        param=param,
                        ctx=ctx,
                    )

            return self.coerce_path_result(rv)
        except OSError as e:
            self.failed(
                _(
                    "'{filename}': {message}"
                ).format(filename=format_filename(value), message=e.strerror),
                value=value,
                param=param,
                ctx=ctx,
            )

    def coerce_path_result(
        self, value: str | os.PathLike[str]
    ) -> str | os.PathLike[str]:
        if self.type is not str:
            return self.type(value)
        return value

    def shell_complete(
        self,
        ctx: Context,
        param: Parameter,
        incomplete: str,
    ) -> list[CompletionItem]:
        """Return a special completion marker that tells the completion
        system to use the shell to provide path completions for only
        files or for both files and directories, depending on if
        ``dir_okay`` is enabled.
        """
        from .shell_completion import CompletionItem

        type = "dir" if self.dir_okay and not self.file_okay else "file"
        return [CompletionItem(incomplete, type=type)]

    def __repr__(self) -> str:
        return (
            f"Path(exists={self.exists!r}, file_okay={self.file_okay!r},"
            f" dir_okay={self.dir_okay!r}, writable={self.writable!r},"
            f" readable={self.readable!r}, resolve_path={self.resolve_path!r},"
            f" allow_dash={self.allow_dash!r}, type={self.type!r},"
            f" executable={self.executable!r})"
        )


class TupleInfoDict(t.TypedDict, total=False):
    param_type: str
    name: str
    types: list[ParamTypeInfoDict]


class Tuple(CompositeParamType):
    """The default behavior of Click is to apply a type on a value directly.
    This works well in most cases, except for when `nargs` is set to `n` and
    different types should be used for the different elements of the tuple.

    This can be achieved by using :class:`Tuple` with the list of types
    given in `types`:

    .. code-block:: python

        @click.command()
        @click.option('--item', type=click.Tuple([str, int]))
        def cmd(item):
            pass

    :param types: a list of types that should be used for the tuple items.
    """

    name: t.ClassVar[str] = "<TYPE TYPE ...>"

    def __init__(self, types: cabc.Sequence[t.Any]) -> None:
        self.types: tuple[ParamType, ...] = tuple(convert_type(ty) for ty in types)

    def to_info_dict(self) -> TupleInfoDict:
        info_dict: dict[str, t.Any] = {**super().to_info_dict()}
        info_dict["types"] = [t.to_info_dict() for t in self.types]
        return info_dict  # type: ignore[return-value]

    @property
    def name(self) -> str:  # type: ignore[override]
        return "<" + " ".join(ty.name for ty in self.types) + ">"

    @property
    def arity(self) -> int:  # type: ignore[override]
        return len(self.types)

    def convert(
        self,
        value: t.Any,
        param: Parameter | None,
        ctx: Context | None,
    ) -> t.Any:
        if len(value) != len(self.types):
            self.failed(
                _("Takes {nargs} values but {len} were given.").format(
                    nargs=self.arity, len=len(value)
                ),
                value=value,
                param=param,
                ctx=ctx,
            )

        return tuple(ty(x, param, ctx) for ty, x in zip(self.types, value))

    def __repr__(self) -> str:
        return f"Tuple({list(self.types)!r})"


def _guess_type(value: t.Any) -> ParamType:
    if isinstance(value, bool):
        return BOOL
    if isinstance(value, (int, float, str, bytes)):
        return convert_type(type(value))
    return STRING


def convert_type(ty: t.Any | None, default: t.Any = None) -> ParamType:
    """Find the most appropriate :class:`ParamType` for the given Python
    type. If the type isn't recognized, the :class:`STRING` type is returned.

    :param ty: A Python type to convert.
    :param default: The default value for a parameter. If no ``ty`` is
        given and a default is given, the type of the default is used.
    """
    if ty is None and default is not None:
        if isinstance(default, (tuple, list)):
            if default:
                ty = type(default[0])
        else:
            ty = type(default)

    if ty is None or ty is str:
        return STRING

    if ty is int:
        return INT

    if ty is float:
        return FLOAT

    if ty is bool:
        return BOOL

    if ty is bytes:
        return BYTES  # type: ignore[return-value]

    return STRING


class OptionHelpExtra(t.TypedDict, total=False):
    envvar: str
    default: str
    range: str
    choices: str
    show: bool


# These are the actual implementation objects; not subclasses.
STRING: StringParamType = StringParamType()
INT: IntParamType = IntParamType()
FLOAT: FloatParamType = FloatParamType()
BOOL: BoolParamType = BoolParamType()
UUID: UUIDParameterType = UUIDParameterType()
UNPROCESSED: UnprocessedParamType = UnprocessedParamType()

try:
    BYTES: StringParamType
except NameError:
    BYTES = StringParamType()
