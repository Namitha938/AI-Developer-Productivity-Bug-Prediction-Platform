from __future__ import annotations

import os
import logging
from pathlib import Path
from typing import Any

import joblib
from app.features import extract_features

logger = logging.getLogger(__name__)

DEFAULT_MODEL_PATH = (
    Path(__file__).resolve().parents[1]
    / "models"
    / "codet5-finetuned"
)
MODEL_PATH = Path(os.getenv("BUGPULSE_MODEL_PATH", str(DEFAULT_MODEL_PATH)))
ARTIFACTS_MODEL_PATH = Path(__file__).resolve().parents[1] / "artifacts" / "bug_risk_model.joblib"


class BugRiskModel:
    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        self.model_path = model_path
        self.tokenizer: Any | None = None
        self.model: Any | None = None
        self.rf_model: Any | None = None
        self.feature_names: list[str] = []
        self.model_type: str = "none"
        self.load_error: str | None = None
        self.load()

    def load(self) -> None:
        self.tokenizer = None
        self.model = None
        self.rf_model = None
        self.feature_names = []
        self.load_error = None
        self.model_type = "none"

        # 1. Try loading CodeT5 if configured
        if (self.model_path / "config.json").is_file():
            try:
                import torch
                from transformers import AutoModelForSequenceClassification, AutoTokenizer

                self.device = torch.device("cpu")
                self.tokenizer = AutoTokenizer.from_pretrained(
                    str(self.model_path),
                    local_files_only=True,
                )
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    str(self.model_path),
                    local_files_only=True,
                    low_cpu_mem_usage=True,
                )
                self.model.to(self.device)
                self.model.eval()
                self.model_type = "codet5"
                logger.info("Loaded CodeT5 model from %s", self.model_path)
                return
            except Exception as exc:
                logger.warning("Could not load CodeT5: %s", exc)

        # 2. Fall back to trained Random Forest model
        if ARTIFACTS_MODEL_PATH.is_file():
            try:
                data = joblib.load(ARTIFACTS_MODEL_PATH)
                if isinstance(data, dict):
                    self.rf_model = data["model"]
                    self.feature_names = data.get("feature_names", [])
                else:
                    self.rf_model = data
                self.model_type = "random_forest"
                logger.info("Loaded Random Forest model from %s", ARTIFACTS_MODEL_PATH)
                return
            except Exception as exc:
                self.load_error = f"Could not load Random Forest model: {exc}"
                logger.error(self.load_error)
                return

        self.load_error = (
            f"No valid model found at {self.model_path} or {ARTIFACTS_MODEL_PATH}."
        )

    @property
    def ready(self) -> bool:
        return self.model_type in ("codet5", "random_forest")

    @property
    def version(self) -> str:
        if self.model_type == "codet5":
            return "codet5-finetuned-v1"
        if self.model_type == "random_forest":
            return "random-forest-v1"
        return "not-loaded"

    def predict(self, code: str) -> dict[str, Any]:
        if not self.ready:
            raise RuntimeError(
                self.load_error or "Prediction model is not ready"
            )

        features = extract_features(code)

        if self.model_type == "codet5":
            import torch

            inputs = self.tokenizer(
                code,
                return_tensors="pt",
                truncation=True,
                max_length=512,
            )
            inputs = {
                name: tensor.to(self.device)
                for name, tensor in inputs.items()
            }
            with torch.inference_mode():
                outputs = self.model(**inputs)
                probabilities = torch.softmax(outputs.logits, dim=-1)[0]
                vulnerable_probability = float(probabilities[1].item())

        else:
            # Random Forest inference
            if self.feature_names:
                row = [features.get(name, 0.0) for name in self.feature_names]
            else:
                row = list(features.values())

            probabilities = self.rf_model.predict_proba([row])[0]
            # Probability of target=1 (Vulnerable)
            positive_index = (
                list(self.rf_model.classes_).index(1)
                if 1 in self.rf_model.classes_
                else 1
            )
            vulnerable_probability = float(probabilities[positive_index])

        score = round(vulnerable_probability * 100, 1)

        if score < 30:
            category = "Low Risk"
        elif score < 60:
            category = "Moderate Risk"
        elif score < 80:
            category = "High Risk"
        else:
            category = "Critical Risk"

        return {
            "bug_risk_score": score,
            "risk_category": category,
            "predicted_bug_prone": vulnerable_probability >= 0.5,
            "model_version": self.version,
            "features": features,
        }
