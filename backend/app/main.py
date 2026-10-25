
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints.auth import router as auth_router
from app.core.config import settings
from app.api.v1.endpoints.files import router as files_router
from app.api.v1.endpoints.analysis import router as analysis_router
from app.api.v1.endpoints.admin import router as admin_router
from app.api.v1.endpoints.teams import router as teams_router
from app.api.v1.endpoints.github import router as github_router
from app.api.v1.endpoints.projects import router as projects_router
from app.api.v1.endpoints.issues import router as issues_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.notifications import router as notifications_router
from app.api.v1.endpoints.profile import router as profile_router
from app.api.v1.endpoints.account_settings import router as account_settings_router



app = FastAPI(
    title=settings.APP_NAME,
    description="Developer Productivity and Bug Prediction Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(files_router,prefix="/api/v1")
app.include_router(analysis_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(teams_router, prefix="/api/v1")
app.include_router(github_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(issues_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(profile_router, prefix="/api/v1")
app.include_router(account_settings_router, prefix="/api/v1")
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "database": "firestore",
    }
