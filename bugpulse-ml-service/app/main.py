from fastapi import FastAPI, HTTPException

from app.features import extract_features
from app.model_service import BugRiskModel
from app.schemas import CodeRequest, FeaturesResponse, PredictionResponse

app = FastAPI(
    title="BugPulse ML Service",
    description="File-level bug-risk prediction using a trained supervised model.",
    version="0.1.0",
)
model_service = BugRiskModel()


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "bugpulse-ml-service",
        "model_ready": model_service.ready,
        "model_version": model_service.version,
        "model_message": None if model_service.ready else model_service.load_error,
    }


@app.post("/features", response_model=FeaturesResponse)
def features(request: CodeRequest) -> FeaturesResponse:
    return FeaturesResponse(
        filename=request.filename,
        language=request.language,
        features=extract_features(request.code),
    )


@app.post("/predict", response_model=PredictionResponse)
def predict(request: CodeRequest) -> PredictionResponse:
    try:
        result = model_service.predict(request.code)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return PredictionResponse(
        filename=request.filename,
        language=request.language,
        **result,
    )
