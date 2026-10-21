from pydantic import BaseModel, Field


class CodeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=100_000)
    filename: str = Field(default="untitled", min_length=1, max_length=255)
    language: str = Field(default="unknown", min_length=1, max_length=50)


class FeaturesResponse(BaseModel):
    filename: str
    language: str
    features: dict[str, float]
    feature_kind: str = "lexical_static_metrics"


class PredictionResponse(BaseModel):
    filename: str
    language: str
    bug_risk_score: float = Field(ge=0, le=100)
    risk_category: str
    predicted_bug_prone: bool
    model_version: str
    model_status: str = "trained"
    note: str = "File-level model estimate, not a confirmed defect or line-level diagnosis."
    features: dict[str, float]
