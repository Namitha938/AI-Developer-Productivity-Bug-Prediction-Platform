from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from app.features import FEATURE_NAMES, feature_vector

DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "bug_risk_model.joblib"
MODEL_PATH = Path(os.getenv("BUGPULSE_MODEL_PATH", str(DEFAULT_MODEL_PATH)))


class BugRiskModel:
    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        self.model_path = model_path
        self.bundle: dict[str, Any] | None = None
        self.load_error: str | None = None
        self.load()

    def load(self) -> None:
        self.bundle = None
        self.load_error = None
        if not self.model_path.is_file():
            self.load_error = "Trained model not found. Train one using scripts/train.py and a labeled dataset."
            return
        try:
            loaded = joblib.load(self.model_path)
            if not isinstance(loaded, dict) or "model" not in loaded:
                raise ValueError("Model artifact has an unsupported format")
            if loaded.get("feature_names") != FEATURE_NAMES:
                raise ValueError("Model feature schema does not match this service; retrain the model")
            self.bundle = loaded
        except Exception as exc:  # Surface a clear unavailable status, not a fabricated prediction.
            self.load_error = f"Could not load model artifact: {exc}"

    @property
    def ready(self) -> bool:
        return self.bundle is not None

    @property
    def version(self) -> str:
        if self.bundle:
            return str(self.bundle.get("model_version", "unknown"))
        return "not-trained"

    def predict(self, code: str) -> dict[str, Any]:
        if not self.bundle:
            raise RuntimeError(self.load_error or "Model is not ready")

        vector = np.asarray([feature_vector(code)], dtype=float)
        model = self.bundle["model"]
        classes = list(model.classes_)
        if 1 not in classes:
            raise RuntimeError("Loaded model has no positive (bug-prone) class; retrain with both labels")
        probability = float(model.predict_proba(vector)[0][classes.index(1)])
        score = round(probability * 100, 1)
        category = "Low Risk" if score < 30 else "Moderate Risk" if score < 60 else "High Risk" if score < 80 else "Critical Risk"
        return {
            "bug_risk_score": score,
            "risk_category": category,
            "predicted_bug_prone": probability >= 0.5,
            "model_version": self.version,
            "features": dict(zip(FEATURE_NAMES, vector[0].tolist())),
        }
