
"""Deterministic lexical features for C/C++ defect-risk prediction.

These are heuristic indicators, not confirmed defects or AST metrics.
"""
import re


FEATURE_NAMES = [
    "lines_of_code",
    "comment_lines",
    "comment_ratio",
    "avg_line_length",
    "max_line_length",
    "branch_count",
    "loop_count",
    "logical_operator_count",
    "function_count",
    "exception_handling_count",
    "risky_call_count",
    "secret_like_assignment_count",
    "todo_count",
    "return_count",
    "nested_loop_hint_count",
    "duplicate_line_ratio",
    "long_line_count",
]

COMMENT_ONLY = re.compile(
    r"^\s*(?://|#|--|/\*|\*|\*/)"
)
BRANCH = re.compile(
    r"\b(?:if|else\s+if|else|switch|case|default|"
    r"for|while|catch|try)\b"
)
LOOP = re.compile(r"\b(?:for|while|do)\b")
LOGICAL = re.compile(r"&&|\|\||!(?!=)")
EXCEPTION = re.compile(r"\b(?:try|catch|throw|finally)\b")

# Potentially risky APIs and operations. Their presence alone
# does not establish that the code contains a defect.
RISKY_CALL = re.compile(
    r"\b(?:"
    r"eval|exec|gets|strcpy|strcat|sprintf|vsprintf|"
    r"scanf|sscanf|strncpy|memcpy|memmove|"
    r"malloc|calloc|realloc|free|"
    r"atoi|atol|system|popen|"
    r"reinterpret_cast"
    r")\s*\("
)

SECRET_ASSIGNMENT = re.compile(
    r"\b(?:password|passwd|secret|api[_-]?key|"
    r"access[_-]?token|private[_-]?key)\b"
    r"\s*[:=]\s*['\"][^'\"]{4,}['\"]",
    re.IGNORECASE,
)
TODO = re.compile(r"\b(?:TODO|FIXME|HACK|XXX)\b", re.IGNORECASE)
RETURN = re.compile(r"\breturn\b")

# Approximate C/C++ function-definition detection.
# This intentionally excludes many complex declarations and lambdas.
FUNCTION_DEFINITION = re.compile(
    r"^\s*"
    r"(?:template\s*<[^;{}]*>\s*)?"
    r"(?:inline\s+|static\s+|virtual\s+|extern\s+|"
    r"constexpr\s+|friend\s+|inline\s+)*"
    r"[\w:*&<>\[\],\s]+\s+"
    r"[~\w:]+\s*"
    r"\([^;{}]*\)\s*"
    r"(?:const\s*)?"
    r"(?:noexcept\s*)?"
    r"\{"
)


def extract_features(code: str) -> dict[str, float]:
    """Extract a stable, ordered set of numeric source-code features."""
    if not isinstance(code, str):
        raise TypeError("code must be a string")

    lines = code.splitlines()
    nonblank = [line for line in lines if line.strip()]

    comment_lines = [
        line for line in nonblank
        if COMMENT_ONLY.match(line)
    ]
    source_lines = [
        line for line in nonblank
        if not COMMENT_ONLY.match(line)
    ]

    lengths = [len(line) for line in source_lines]
    normalized = [
        re.sub(r"\s+", " ", line.strip())
        for line in source_lines
    ]

    duplicate_count = len(normalized) - len(set(normalized))

    branch_count = sum(
        len(BRANCH.findall(line)) for line in source_lines
    )
    loop_count = sum(
        len(LOOP.findall(line)) for line in source_lines
    )
    logical_count = sum(
        len(LOGICAL.findall(line)) for line in source_lines
    )
    function_count = sum(
        bool(FUNCTION_DEFINITION.search(line))
        for line in source_lines
    )
    exception_count = sum(
        len(EXCEPTION.findall(line)) for line in source_lines
    )
    risky_count = sum(
        len(RISKY_CALL.findall(line)) for line in source_lines
    )
    secret_count = sum(
        len(SECRET_ASSIGNMENT.findall(line))
        for line in source_lines
    )
    todo_count = sum(
        len(TODO.findall(line)) for line in lines
    )
    return_count = sum(
        len(RETURN.findall(line)) for line in source_lines
    )

    # Approximate nested-loop indicator based on indentation.
    nested_loop_count = 0
    previous_loop_indents = []

    for line in source_lines:
        if not LOOP.search(line):
            continue

        indent = len(line) - len(line.lstrip())

        while (
            previous_loop_indents
            and indent <= previous_loop_indents[-1]
        ):
            previous_loop_indents.pop()

        if previous_loop_indents:
            nested_loop_count += 1

        previous_loop_indents.append(indent)

    features = {
        "lines_of_code": float(len(source_lines)),
        "comment_lines": float(len(comment_lines)),
        "comment_ratio": float(
            len(comment_lines) / max(len(nonblank), 1)
        ),
        "avg_line_length": float(
            sum(lengths) / max(len(lengths), 1)
        ),
        "max_line_length": float(max(lengths, default=0)),
        "branch_count": float(branch_count),
        "loop_count": float(loop_count),
        "logical_operator_count": float(logical_count),
        "function_count": float(function_count),
        "exception_handling_count": float(exception_count),
        "risky_call_count": float(risky_count),
        "secret_like_assignment_count": float(secret_count),
        "todo_count": float(todo_count),
        "return_count": float(return_count),
        "nested_loop_hint_count": float(nested_loop_count),
        "duplicate_line_ratio": float(
            duplicate_count / max(len(normalized), 1)
        ),
        "long_line_count": float(
            sum(length > 120 for length in lengths)
        ),
    }

    return {name: features[name] for name in FEATURE_NAMES}


def feature_vector(code: str) -> list[float]:
    """Return features in the order expected by the classifier."""
    features = extract_features(code)
    return [features[name] for name in FEATURE_NAMES]
