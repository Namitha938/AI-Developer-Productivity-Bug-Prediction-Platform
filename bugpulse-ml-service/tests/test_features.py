from app.features import FEATURE_NAMES, extract_features, feature_vector


def test_features_are_numeric_and_stable():
    code = """def find_user(items, target):
    for item in items:
        if item == target and item:
            return item
    return None
"""
    features = extract_features(code)
    assert list(features) == FEATURE_NAMES
    assert all(isinstance(value, float) for value in features.values())
    assert features["lines_of_code"] == 5
    assert features["loop_count"] >= 1
    assert features["branch_count"] >= 1
    assert len(feature_vector(code)) == len(FEATURE_NAMES)


def test_empty_code_has_safe_zero_metrics():
    features = extract_features("")
    assert features["lines_of_code"] == 0
    assert features["max_line_length"] == 0
    assert features["comment_ratio"] == 0


def test_risky_patterns_are_features_not_confirmed_findings():
    features = extract_features('secret = "long-secret-value"\nvalue = eval(user_input)')
    assert features["secret_like_assignment_count"] == 1
    assert features["risky_call_count"] == 1
