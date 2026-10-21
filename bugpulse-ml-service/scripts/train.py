
import argparse
import json
from pathlib import Path

import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from app.features import FEATURE_NAMES, extract_features


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODEL_PATH = BASE_DIR / "artifacts" / "bug_risk_model.joblib"


def load_jsonl(path: Path):
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found: {path}")

    codes = []
    labels = []

    with path.open("r", encoding="utf-8") as file:
        for line_number, line in enumerate(file, start=1):
            if not line.strip():
                continue

            try:
                record = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(
                    f"Invalid JSON on line {line_number} of {path.name}"
                ) from exc

            code = record.get("func")
            label = record.get("target")

            if not isinstance(code, str) or not code.strip():
                continue

            if isinstance(label, bool):
                label = int(label)

            if label not in (0, 1):
                raise ValueError(
                    f"Invalid target on line {line_number}: {label!r}"
                )

            codes.append(code)
            labels.append(int(label))

    if not codes:
        raise ValueError(f"No valid code samples found in {path.name}")

    if set(labels) != {0, 1}:
        raise ValueError(
            f"{path.name} must contain both target classes 0 and 1"
        )

    return codes, labels


def build_features(codes):
    rows = []

    for index, code in enumerate(codes, start=1):
        features = extract_features(code)
        rows.append([features[name] for name in FEATURE_NAMES])

        if index % 2000 == 0:
            print(f"Extracted features for {index} samples...")

    return rows


def evaluate(model, X, y, dataset_name):
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)
    positive_index = list(model.classes_).index(1)

    print(f"\n{dataset_name} evaluation")
    print("-" * 40)
    print(f"Accuracy:  {accuracy_score(y, predictions):.4f}")
    print(
        f"Precision: "
        f"{precision_score(y, predictions, zero_division=0):.4f}"
    )
    print(
        f"Recall:    "
        f"{recall_score(y, predictions, zero_division=0):.4f}"
    )
    print(
        f"F1 score:  "
        f"{f1_score(y, predictions, zero_division=0):.4f}"
    )

    if len(set(y)) == 2:
        print(
            f"ROC-AUC:   "
            f"{roc_auc_score(y, probabilities[:, positive_index]):.4f}"
        )

    print("\nClassification report:")
    print(
        classification_report(
            y,
            predictions,
            labels=[0, 1],
            target_names=["non-defective (0)", "defective (1)"],
            zero_division=0,
        )
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--trees",
        type=int,
        default=200,
        help="Number of trees in the Random Forest.",
    )
    args = parser.parse_args()

    if args.trees < 1:
        raise ValueError("--trees must be at least 1")

    print("Loading training and validation data...")
    train_codes, y_train = load_jsonl(DATA_DIR / "train.jsonl")
    valid_codes, y_valid = load_jsonl(DATA_DIR / "valid.jsonl")

    print(f"Training samples: {len(train_codes)}")
    print(f"Validation samples: {len(valid_codes)}")

    print("\nExtracting training features...")
    X_train = build_features(train_codes)

    print("\nExtracting validation features...")
    X_valid = build_features(valid_codes)

    print("\nTraining Random Forest...")
    model = RandomForestClassifier(
        n_estimators=args.trees,
        max_depth=10,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    evaluate(model, X_valid, y_valid, "Validation")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": model,
            "feature_names": FEATURE_NAMES,
            "training_samples": len(train_codes),
            "validation_samples": len(valid_codes),
            "dataset": "CodeXGLUE Defect Detection",
            "seed": 42,
        },
        MODEL_PATH,
    )

    print(f"\nTrained model saved to: {MODEL_PATH}")
    print("The test split has not been used.")


if __name__ == "__main__":
    main()
