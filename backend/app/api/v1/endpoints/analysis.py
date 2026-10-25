
import logging
import os
import time
import ast
from datetime import datetime, timezone
from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from pydantic import BaseModel, Field, field_validator

from app.core.config import settings
from app.core.database import db
from app.core.firebase import firebase_app
from app.services.ai_analysis import analyze_with_fallback

from app.core.firebase import db as issues_db
from app.services.ai_fix_generator import generate_fix

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["AI Analysis"])
bearer_scheme = HTTPBearer()

ML_SERVICE_URL = os.getenv(
    "BUGPULSE_ML_SERVICE_URL",
    "http://127.0.0.1:8001",
).rstrip("/")



SUPPORTED_LANGUAGES = {
    "python": "python",
    "javascript": "javascript",
    "typescript": "typescript",
    "java": "java",
    "go": "go",
    "c": "c",
    "cpp": "cpp",
    "csharp": "csharp",
    "php": "php",
    "rust": "rust",
    "ruby": "ruby",
    "sql": "sql",
}


class AnalyzeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=100_000)
    language: str = Field(min_length=1, max_length=50)
    filename: str = Field(min_length=1, max_length=255)

    @field_validator("language", mode="before")
    @classmethod
    def normalize_language(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("Language must be a string.")

        normalized = value.strip().lower()
        aliases = {
            "js": "javascript",
            "ts": "typescript",
            "c++": "cpp",
            "c#": "csharp",
            "golang": "go",
            "py": "python",
        }
        normalized = aliases.get(normalized, normalized)

        if normalized not in SUPPORTED_LANGUAGES:
            supported = ", ".join(SUPPORTED_LANGUAGES)
            raise ValueError(
                f"Unsupported language '{value}'. "
                f"Supported languages: {supported}."
            )

        return SUPPORTED_LANGUAGES[normalized]


def get_authenticated_uid(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    if firebase_app is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase authentication is not configured.",
        )

    try:
        decoded = auth.verify_id_token(
            credentials.credentials,
            app=firebase_app,
        )
        uid = decoded.get("uid")
        if not uid:
            raise ValueError("Token does not contain a user ID.")
        return uid
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def predict_with_codet5(
    code: str,
    language: str,
    filename: str,
) -> dict:
    """Get a real prediction from the separate CodeT5 ML service."""
    try:
        response = httpx.post(
            f"{ML_SERVICE_URL}/predict",
            json={
                "code": code,
                "language": language,
                "filename": filename,
            },
            timeout=180.0,
        )
        response.raise_for_status()
        prediction = response.json()

    except httpx.TimeoutException as exc:
        logger.error("CodeT5 prediction timed out.")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="CodeT5 prediction timed out. Please try again.",
        ) from exc

    except httpx.HTTPStatusError as exc:
        logger.error(
            "CodeT5 returned HTTP %s.",
            exc.response.status_code,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="CodeT5 could not complete the prediction.",
        ) from exc

    except (httpx.RequestError, ValueError) as exc:
        logger.error(
            "Could not reach CodeT5 or parse its response: %s",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CodeT5 ML service is unavailable. Start the ML service and retry.",
        ) from exc

    required_fields = {
        "bug_risk_score",
        "risk_category",
        "predicted_bug_prone",
        "model_version",
    }
    if not isinstance(prediction, dict) or not required_fields.issubset(
        prediction.keys()
    ):
        logger.error("CodeT5 returned an unexpected response format.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="CodeT5 returned an invalid prediction response.",
        )

    return prediction


@router.post("/analyze")
def analyze_code(
    payload: AnalyzeRequest,
    uid: str = Depends(get_authenticated_uid),
):
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not configured. Analysis was not run.",
        )

    started_at = time.perf_counter()

    # Generate the existing AI analysis.
    try:
        result, provider, model = analyze_with_fallback(
            code=payload.code,
            language=payload.language,
            filename=payload.filename,
        )
    except RuntimeError as exc:
        logger.error("All configured AI providers failed.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="All configured AI providers failed. Please try again later.",
        ) from exc

    # Get the actual prediction from the fine-tuned CodeT5 service.
    ml_prediction = predict_with_codet5(
        code=payload.code,
        language=payload.language,
        filename=payload.filename,
    )

    analysis_id = uuid4().hex
    timestamp = datetime.now(timezone.utc).isoformat()
    execution_time_ms = round(
        (time.perf_counter() - started_at) * 1000
    )

    response = {
        "id": analysis_id,
        "filename": payload.filename,
        "language": payload.language,
        "timestamp": timestamp,
        "executionTimeMs": execution_time_ms,
        "sourceCode": payload.code,
        **result,
        "provider": provider,
        "model": model,

        # Explicit ML fields; keep separate from AI-generated findings.
        "bug_risk_score": ml_prediction["bug_risk_score"],
        "risk_category": ml_prediction["risk_category"],
        "predicted_bug_prone": ml_prediction["predicted_bug_prone"],
        "mlModelVersion": ml_prediction["model_version"],
        "mlModelStatus": ml_prediction.get("model_status", "trained"),
        "mlPredictionNote": ml_prediction.get(
            "note",
            "File-level model estimate, not a confirmed defect or line-level diagnosis.",
        ),
        "mlPrediction": ml_prediction,
    }

    try:
        (
            db.collection("users")
            .document(uid)
            .collection("analyses")
            .document(analysis_id)
            .set(response)
        )
    except Exception as exc:
        logger.error(
            "Failed to persist analysis for authenticated user: %s",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Analysis completed, but saving it failed. Please retry.",
        ) from exc

    # Return the completed analysis to the frontend.
    return response

@router.post("/issues/{issue_id}/generate-fix")
def generate_issue_fix(
    issue_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    """Generate an AI fix and persist it to the user's issue document."""

    if issues_db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not configured.",
        )

    # Access only the authenticated user's issue.
    try:
        issue_ref = (
            issues_db.collection("users")
            .document(uid)
            .collection("issues")
            .document(issue_id)
        )
        issue_document = issue_ref.get()
    except Exception as exc:
        logger.error(
            "Failed to retrieve issue for fix generation (%s).",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve the issue.",
        ) from exc

    if not issue_document.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found.",
        )

    issue = issue_document.to_dict() or {}

    if not isinstance(issue.get("code_snippet"), str) or not issue[
        "code_snippet"
    ].strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This issue has no code snippet. Add the relevant source "
                "code before generating a fix."
            ),
        )

    # Generate the fix using the existing AI service.
    try:
        result = generate_fix(issue)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        logger.error("AI fix-generation providers failed.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI fix generation failed. Please try again later.",
        ) from exc

    generated_at = datetime.now(timezone.utc).isoformat()

    # Preserve the existing issue fields and save the latest AI fix.
    fix_data = result.model_dump()
    saved_fix = {
        **fix_data,
        "generated_at": generated_at,
    }

    try:
        issue_ref.update({"ai_fix": saved_fix})
    except Exception as exc:
        logger.error(
            "Failed to save AI fix for issue (%s).",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The fix was generated, but saving it failed.",
        ) from exc

    # Keep the existing frontend response shape compatible.
    return {
        "issueId": issue_id,
        **fix_data,
        "generatedAt": generated_at,
    }


@router.get("/issues/{issue_id}/fix")
def get_saved_issue_fix(
    issue_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    """Retrieve the saved AI fix for the authenticated user's issue."""

    if issues_db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not configured.",
        )

    try:
        issue_ref = (
            issues_db.collection("users")
            .document(uid)
            .collection("issues")
            .document(issue_id)
        )
        issue_document = issue_ref.get()
    except Exception as exc:
        logger.error(
            "Failed to retrieve saved AI fix (%s).",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve the saved fix.",
        ) from exc

    if not issue_document.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found.",
        )

    issue = issue_document.to_dict() or {}
    saved_fix = issue.get("ai_fix")

    if not saved_fix:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No saved AI fix exists for this issue.",
        )

    return {
        "issueId": issue_id,
        **saved_fix,
        "generatedAt": saved_fix.get("generated_at"),
    }

@router.get("/history")
def get_analysis_history(
    uid: str = Depends(get_authenticated_uid),
    limit: int = Query(default=20, ge=1, le=100),
    cursor: str | None = Query(default=None),
):
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not configured.",
        )

    try:
        collection = (
            db.collection("users")
            .document(uid)
            .collection("analyses")
        )

        query = (
            collection
            .order_by("timestamp", direction="DESCENDING")
            .limit(limit + 1)
        )

        if cursor:
            cursor_snapshot = collection.document(cursor).get()

            if not cursor_snapshot.exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid history cursor.",
                )

            cursor_data = cursor_snapshot.to_dict() or {}

            if not cursor_data.get("timestamp"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="History cursor has no timestamp.",
                )

            query = query.start_after(cursor_data)

        documents = list(query.stream())
        has_more = len(documents) > limit
        documents = documents[:limit]

        items = [
            {**(document.to_dict() or {}), "id": document.id}
            for document in documents
        ]

        next_cursor = (
            documents[-1].id if has_more and documents else None
        )

        return {
            "items": items,
            "nextCursor": next_cursor,
            "hasMore": has_more,
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "Failed to retrieve analysis history: %s",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve analysis history.",
        ) from exc

@router.post("/issues/{issue_id}/validate-fix")
def validate_saved_issue_fix(
    issue_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    """Safely check Python syntax without executing generated code."""

    if issues_db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not configured.",
        )

    try:
        issue_ref = (
            issues_db.collection("users")
            .document(uid)
            .collection("issues")
            .document(issue_id)
        )
        issue_document = issue_ref.get()
    except Exception as exc:
        logger.error(
            "Failed to retrieve issue for validation (%s).",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve the issue.",
        ) from exc

    if not issue_document.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found.",
        )

    issue = issue_document.to_dict() or {}
    ai_fix = issue.get("ai_fix")

    if not isinstance(ai_fix, dict):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No saved AI fix exists for this issue.",
        )

    suggestion = ai_fix.get("suggestion") or {}
    fixed_code = suggestion.get("fixed_code")

    if not isinstance(fixed_code, str) or not fixed_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The saved fix contains no code to validate.",
        )

    language = str(
        issue.get("language")
        or issue.get("programming_language")
        or ""
    ).strip().lower()

    filename = str(issue.get("file_location") or "").lower()

    if language in {"py", "python"} or filename.endswith(".py"):
        try:
            ast.parse(fixed_code)
            validation_status = "passed"
            message = "Python syntax is valid. Runtime behavior has not been tested."
        except SyntaxError as exc:
            validation_status = "failed"
            message = (
                f"Python syntax error on line {exc.lineno}: "
                f"{exc.msg}"
            )
    else:
        validation_status = "unsupported"
        message = (
            "Automated syntax validation is currently available "
            "only for Python files."
        )

    validation = {
        "status": validation_status,
        "message": message,
        "validator": "python_ast",
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        issue_ref.update({
            "ai_fix.validation": validation,
        })
    except Exception as exc:
        logger.error(
            "Failed to persist fix validation (%s).",
            type(exc).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Validation completed, but saving its result failed.",
        ) from exc

    return {
        "issueId": issue_id,
        "validation": validation,
    }
