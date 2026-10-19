from fastapi import FastAPI

from app.api.v1.endpoints.auth import router as auth_router
from app.core.database import Base, engine
from app.models import User
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BugPulse AI API",
    description="Developer Productivity and Bug Prediction Platform",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "BugPulse AI API",
    }
