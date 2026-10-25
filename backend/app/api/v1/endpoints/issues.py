
from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from pydantic import BaseModel, Field

from app.core.firebase import db, firebase_app


router = APIRouter(prefix="/issues", tags=["Bug History"])
bearer_scheme = HTTPBearer()

Severity = Literal["critical", "high", "medium", "low"]
IssueStatus = Literal["open", "in_progress", "resolved"]


def get_authenticated_uid(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    if firebase_app is None:
        raise HTTPException(
            status_code=503,
            detail="Firebase authentication is not configured",
        )

    try:
        token = auth.verify_id_token(
            credentials.credentials,
            app=firebase_app,
        )
        uid = token.get("uid")
        if not uid:
            raise ValueError("Missing UID")
        return uid
    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase ID token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_issues_collection(uid: str):
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Firestore is not configured",
        )

    return db.collection("users").document(uid).collection("issues")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Assignee(BaseModel):
    id: str
    name: str
    avatar_url: str = ""


class IssueCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(default="", max_length=10000)
    severity: Severity = "medium"
    status: IssueStatus = "open"
    assignee: Assignee | None = None
    project: str = Field(default="", max_length=200)
    file_location: str = Field(default="", max_length=1000)
    line_range: str = Field(default="", max_length=100)
    risk_score: int = Field(default=0, ge=0, le=100)
    tags: list[str] = Field(default_factory=list, max_length=30)
    code_snippet: str | None = Field(default=None, max_length=20000)
    comments_count: int = Field(default=0, ge=0)


class IssueUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    description: str | None = Field(default=None, max_length=10000)
    severity: Severity | None = None
    status: IssueStatus | None = None
    assignee: Assignee | None = None
    project: str | None = Field(default=None, max_length=200)
    file_location: str | None = Field(default=None, max_length=1000)
    line_range: str | None = Field(default=None, max_length=100)
    risk_score: int | None = Field(default=None, ge=0, le=100)
    tags: list[str] | None = Field(default=None, max_length=30)
    code_snippet: str | None = Field(default=None, max_length=20000)
    comments_count: int | None = Field(default=None, ge=0)


def serialize_issue(issue_id: str, data: dict) -> dict:
    result = dict(data)
    result["id"] = issue_id
    return result


@router.get("")
def list_issues(
    severity: Severity | None = None,
    issue_status: IssueStatus | None = Query(default=None, alias="status"),
    assignee_id: str | None = None,
    search: str | None = Query(default=None, max_length=200),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    uid: str = Depends(get_authenticated_uid),
):
    collection = get_issues_collection(uid)
    query = collection

    if severity:
        query = query.where("severity", "==", severity)
    if issue_status:
        query = query.where("status", "==", issue_status)

    documents = [
        serialize_issue(doc.id, doc.to_dict() or {})
        for doc in query.stream()
    ]

    if assignee_id:
        documents = [
            issue for issue in documents
            if (issue.get("assignee") or {}).get("id") == assignee_id
        ]

    if search:
        term = search.strip().casefold()
        documents = [
            issue for issue in documents
            if term in str(issue.get("title", "")).casefold()
            or term in str(issue.get("description", "")).casefold()
            or term in str(issue.get("file_location", "")).casefold()
            or any(
                term in str(tag).casefold()
                for tag in issue.get("tags", [])
            )
        ]

    documents.sort(
        key=lambda issue: issue.get("created_at", ""),
        reverse=True,
    )
    total = len(documents)

    return {
        "issues": documents[offset:offset + limit],
        "count": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/{issue_id}")
def get_issue(
    issue_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    document = get_issues_collection(uid).document(issue_id).get()

    if not document.exists:
        raise HTTPException(status_code=404, detail="Issue not found")

    return serialize_issue(issue_id, document.to_dict() or {})


@router.post("", status_code=status.HTTP_201_CREATED)
def create_issue(
    payload: IssueCreate,
    uid: str = Depends(get_authenticated_uid),
):
    issue_id = str(uuid4())
    now = utc_now()

    data = payload.model_dump()
    data["assignee"] = (
        payload.assignee.model_dump() if payload.assignee else None
    )
    data["created_at"] = now
    data["updated_at"] = now

    get_issues_collection(uid).document(issue_id).set(data)

    return serialize_issue(issue_id, data)


@router.patch("/{issue_id}")
def update_issue(
    issue_id: str,
    payload: IssueUpdate,
    uid: str = Depends(get_authenticated_uid),
):
    document_ref = get_issues_collection(uid).document(issue_id)
    document = document_ref.get()

    if not document.exists:
        raise HTTPException(status_code=404, detail="Issue not found")

    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one field to update",
        )

    if "assignee" in updates and payload.assignee is not None:
        updates["assignee"] = payload.assignee.model_dump()

    updates["updated_at"] = utc_now()
    document_ref.update(updates)

    updated_document = document_ref.get()
    return serialize_issue(issue_id, updated_document.to_dict() or {})


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    document_ref = get_issues_collection(uid).document(issue_id)

    if not document_ref.get().exists:
        raise HTTPException(status_code=404, detail="Issue not found")

    document_ref.delete()
