# Verification tests for find_ordinal in tenacity/_utils.py.
# Checks that the direct-lookup implementation returns the same suffix as the
# original comparison-based recursive logic for all required edge cases.

from tenacity._utils import find_ordinal


def _reference_find_ordinal(pos_num: int) -> str:
    """Original comparison-based logic (no lookup table, no recursion).

    This is the reference implementation used only inside this test file to
    cross-check find_ordinal. It mirrors the classic English-ordinal rules
    inline so we can compare output without depending on the implementation
    under test.
    """
    last_two = pos_num % 100
    if 11 <= last_two <= 13:
        return "th"
    last_one = pos_num % 10
    if last_one == 1:
        return "st"
    if last_one == 2:
        return "nd"
    if last_one == 3:
        return "rd"
    return "th"


# All edge cases the task specifies: 0, 1-13, 20, 21, 100-113
EDGE_CASES = (
    [0]
    + list(range(1, 14))   # 1 through 13 (covers 11/12/13 teen exception)
    + [20, 21]             # multiples of ten and 21
    + list(range(100, 114)) # 100-113 (hundreds with teen sub-exception)
)


def test_find_ordinal_matches_reference_for_edge_cases() -> None:
    """find_ordinal must agree with the reference logic for every edge case."""
    for n in EDGE_CASES:
        got = find_ordinal(n)
        want = _reference_find_ordinal(n)
        assert got == want, (
            f"find_ordinal({n}) returned {got!r}, expected {want!r}"
        )


def test_find_ordinal_zero() -> None:
    assert find_ordinal(0) == "th"


def test_find_ordinal_ones() -> None:
    assert find_ordinal(1) == "st"
    assert find_ordinal(2) == "nd"
    assert find_ordinal(3) == "rd"
    for n in range(4, 10):
        assert find_ordinal(n) == "th", f"Expected 'th' for {n}"


def test_find_ordinal_teens() -> None:
    """11, 12, 13 must always return 'th' regardless of last digit."""
    assert find_ordinal(11) == "th"
    assert find_ordinal(12) == "th"
    assert find_ordinal(13) == "th"


def test_find_ordinal_twenty_series() -> None:
    assert find_ordinal(20) == "th"
    assert find_ordinal(21) == "st"


def test_find_ordinal_hundreds_teens() -> None:
    """111, 112, 113 share the teen exception (last two digits 11-13)."""
    assert find_ordinal(100) == "th"
    assert find_ordinal(101) == "st"
    assert find_ordinal(102) == "nd"
    assert find_ordinal(103) == "rd"
    for n in range(104, 111):
        assert find_ordinal(n) == "th", f"Expected 'th' for {n}"
    assert find_ordinal(111) == "th"
    assert find_ordinal(112) == "th"
    assert find_ordinal(113) == "th"


def test_find_ordinal_exhaustive_against_reference() -> None:
    """Broader sweep: verify agreement for 0-200 to catch any boundary issues."""
    for n in range(201):
        got = find_ordinal(n)
        want = _reference_find_ordinal(n)
        assert got == want, (
            f"find_ordinal({n}) = {got!r}, reference = {want!r}"
        )
