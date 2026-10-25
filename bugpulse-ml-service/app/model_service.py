
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer


DEFAULT_MODEL_PATH = (
    Path(__file__).resolve().parents[1]
    / "models"
    / "codet5-finetuned"
)
MODEL_PATH = Path(os.getenv("BUGPULSE_MODEL_PATH", str(DEFAULT_MODEL_PATH)))


class BugRiskModel:
    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        self.model_path = model_path
        self.tokenizer: Any | None = None
        self.model: Any | None = None
        self.load_error: str | None = None
        self.device = torch.device("cpu")
        self.load()

    def load(self) -> None:
        self.tokenizer = None
        self.model = None
        self.load_error = None

        if not (self.model_path / "config.json").is_file():
            self.load_error = (
                f"Model config not found at {self.model_path}. "
                "Check BUGPULSE_MODEL_PATH and the model folder."
            )
            return

        try:
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

            labels = {
                int(index): str(label).upper()
                for index, label in self.model.config.id2label.items()
            }

            if labels.get(0) != "SECURE" or labels.get(1) != "VULNERABLE":
                raise ValueError(
                    f"Expected labels 0=SECURE and 1=VULNERABLE; "
                    f"received {labels}"
                )

        except Exception as exc:
            self.tokenizer = None
            self.model = None
            self.load_error = f"Could not load CodeT5: {exc}"

    @property
    def ready(self) -> bool:
        return self.model is not None and self.tokenizer is not None

    @property
    def version(self) -> str:
        return "codet5-finetuned-v1" if self.ready else "not-loaded"

    @torch.inference_mode()
    def predict(self, code: str) -> dict[str, Any]:
        if not self.ready:
            raise RuntimeError(
                self.load_error or "CodeT5 model is not ready"
            )

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

        outputs = self.model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=-1)[0]

        vulnerable_probability = float(probabilities[1].item())
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
            "features": {},
        }
