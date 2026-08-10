"""Comprehensive edge-case verification for find_ordinal.

Verifies that find_ordinal returns identical suffixes for:
- 0
- 1-13
- 20-23
- 100-113
- multiples of ten

Also asserts no recursion is used (the implementation must be a direct lookup).
"""
import inspect

from tenacity._utils import find_ordinal


def test_zero() -> None:
    assert find_ordinal(0) == "th"


def test_one_through_thirteen() -> None:
    expected = {
        1: "st",
        2: "nd",
        3: "rd",
        4: "th",
        5: "th",
        6: "th",
        7: "th",
        8: "th",
        9: "th",
        10: "th",
        11: "th",
        12: "th",
        13: "th",
    }
    for n, suffix in expected.items():
        assert find_ordinal(n) == suffix, f"find_ordinal({n}) should be {suffix!r}"


def test_twenty_through_twenty_three() -> None:
    expected = {
        20: "th",
        21: "st",
        22: "nd",
        23: "rd",
    }
    for n, suffix in expected.items():
        assert find_ordinal(n) == suffix, f"find_ordinal({n}) should be {suffix!r}"


def test_one_hundred_through_one_hundred_thirteen() -> None:
    expected = {
        100: "th",
        101: "st",
        102: "nd",
        103: "rd",
        104: "th",
        105: "th",
        106: "th",
        107: "th",
        108: "th",
        109: "th",
        110: "th",
        111: "th",
        112: "th",
        113: "th",
    }
    for n, suffix in expected.items():
        assert find_ordinal(n) == suffix, f"find_ordinal({n}) should be {suffix!r}"


def test_multiples_of_ten() -> None:
    for multiple in range(0, 200, 10):
        result = find_ordinal(multiple)
        # Special case: 10, 110 end in 10 => 'th' (no teen exception needed,
        # but 110 % 100 == 10 which is not in 11-13, last digit 0 => 'th')
        # All multiples of ten end in digit 0 => 'th'
        assert result == "th", (
            f"find_ordinal({multiple}) should be 'th', got {result!r}"
        )


def test_teen_exceptions_in_higher_hundreds() -> None:
    """Numbers like 111, 112, 113, 211, 311 all take 'th'."""
    for base in [100, 200, 300, 1000, 1100]:
        for teen in [11, 12, 13]:
            n = base + teen
            assert find_ordinal(n) == "th", (
                f"find_ordinal({n}) should be 'th' (teen exception), got {find_ordinal(n)!r}"
            )


def test_non_teen_endings_above_hundred() -> None:
    """Numbers like 121, 122, 123 follow the last-digit rule."""
    assert find_ordinal(121) == "st"
    assert find_ordinal(122) == "nd"
    assert find_ordinal(123) == "rd"
    assert find_ordinal(201) == "st"
    assert find_ordinal(202) == "nd"
    assert find_ordinal(203) == "rd"


def test_no_recursion_in_find_ordinal() -> None:
    """Verify find_ordinal does not call itself recursively.

    Technique: inspect the source and check that 'find_ordinal' does not
    appear inside the function body after the 'def' line.
    Uses string splitting (technique 1 from SELF-MATCH RULE) so this
    checker's own source cannot trigger a false positive.
    """
    source = inspect.getsource(find_ordinal)
    # Split on the function name so the literal never appears whole in this file.
    # Technique 1: split and join.
    fn_name = "find" + "_ordinal"
    # The first occurrence is the 'def find_ordinal(...)' line itself.
    # A recursive call would add a *second* occurrence in the body.
    occurrences = source.count(fn_name)
    assert occurrences == 1, (
        f"find_ordinal appears {occurrences} times in its own source; "
        "expected exactly 1 (the def line). Recursion detected."
    )
