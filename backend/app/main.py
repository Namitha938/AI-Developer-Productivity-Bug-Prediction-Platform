
from fastapi import FastAPI

from app.core.database import Base, engine
from app.models import User

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BugPulse AI API",
    description="Developer Productivity and Bug Prediction Platform",
    version="1.0.0",
)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "BugPulse AI API",
    }
