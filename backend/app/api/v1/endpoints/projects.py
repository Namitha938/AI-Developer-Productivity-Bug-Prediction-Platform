
from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from pydantic import BaseModel, Field

from app.core.firebase import db, firebase_app


router = APIRouter(prefix="/projects", tags=["Projects"])
bearer_scheme = HTTPBearer()

TaskStatus = Literal["backlog", "todo", "in_progress", "review", "done"]
TaskPriority = Literal["low", "medium", "high", "urgent"]


def get_authenticated_uid(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    if firebase_app is None:
        raise HTTPException(
            status_code=503,
            detail="Firebase authentication is not configured.",
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
            detail="Invalid or expired Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_database():
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Firestore is not available. Check Firebase configuration.",
        )
    return db


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def project_collection(uid: str):
    database = get_database()
    return (
        database.collection("users")
        .document(uid)
        .collection("projects")
    )


def task_collection(uid: str, project_id: str):
    project_ref = project_collection(uid).document(project_id)
    if not project_ref.get().exists:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project_ref.collection("tasks")


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)
    repo_url: str = Field(default="", max_length=500)
    default_branch: str = Field(default="main", max_length=100)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
    repo_url: str | None = Field(default=None, max_length=500)
    default_branch: str | None = Field(default=None, max_length=100)


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=3000)
    status: TaskStatus = "todo"
    priority: TaskPriority = "medium"
    tags: list[str] = Field(default_factory=list, max_length=20)
    due_date: str | None = None
    assignee_uid: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=3000)
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    tags: list[str] | None = Field(default=None, max_length=20)
    due_date: str | None = None
    assignee_uid: str | None = None


@router.get("")
def list_projects(uid: str = Depends(get_authenticated_uid)):
    projects = []
    for snapshot in project_collection(uid).stream():
        projects.append({"id": snapshot.id, **(snapshot.to_dict() or {})})

    projects.sort(key=lambda item: item.get("created_at", ""), reverse=True)
    return {"projects": projects, "count": len(projects)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    uid: str = Depends(get_authenticated_uid),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Project name is required.")

    project_id = str(uuid4())
    timestamp = now_iso()

    data = {
        "name": name,
        "description": payload.description.strip(),
        "repo_url": payload.repo_url.strip(),
        "default_branch": payload.default_branch.strip() or "main",
        "owner_uid": uid,
        "members": [
            {
                "uid": uid,
                "role": "Owner",
            }
        ],
        "created_at": timestamp,
        "updated_at": timestamp,
    }

    project_collection(uid).document(project_id).create(data)
    return {"id": project_id, **data}


@router.get("/{project_id}")
def get_project(
    project_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    snapshot = project_collection(uid).document(project_id).get()
    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Project not found.")

    return {"id": snapshot.id, **(snapshot.to_dict() or {})}


@router.patch("/{project_id}")
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    uid: str = Depends(get_authenticated_uid),
):
    ref = project_collection(uid).document(project_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Project not found.")

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided.")

    for key, value in updates.items():
        if isinstance(value, str):
            updates[key] = value.strip()

    updates["updated_at"] = now_iso()
    ref.update(updates)

    snapshot = ref.get()
    return {"id": snapshot.id, **(snapshot.to_dict() or {})}


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    ref = project_collection(uid).document(project_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Project not found.")

    # Firestore does not automatically delete subcollections.
    for task in ref.collection("tasks").stream():
        task.reference.delete()

    ref.delete()


@router.get("/{project_id}/tasks")
def list_tasks(
    project_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    tasks = []
    for snapshot in task_collection(uid, project_id).stream():
        tasks.append({"id": snapshot.id, **(snapshot.to_dict() or {})})

    tasks.sort(key=lambda item: item.get("created_at", ""), reverse=True)
    return {"tasks": tasks, "count": len(tasks)}


@router.post(
    "/{project_id}/tasks",
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    project_id: str,
    payload: TaskCreate,
    uid: str = Depends(get_authenticated_uid),
):
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Task title is required.")

    task_id = str(uuid4())
    timestamp = now_iso()

    data = {
        **payload.model_dump(),
        "title": title,
        "description": payload.description.strip(),
        "tags": [tag.strip() for tag in payload.tags if tag.strip()],
        "created_by": uid,
        "created_at": timestamp,
        "updated_at": timestamp,
    }

    task_collection(uid, project_id).document(task_id).create(data)
    return {"id": task_id, **data}


@router.patch("/{project_id}/tasks/{task_id}")
def update_task(
    project_id: str,
    task_id: str,
    payload: TaskUpdate,
    uid: str = Depends(get_authenticated_uid),
):
    collection = task_collection(uid, project_id)
    ref = collection.document(task_id)

    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Task not found.")

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided.")

    for key, value in updates.items():
        if isinstance(value, str):
            updates[key] = value.strip()
        elif key == "tags" and value is not None:
            updates[key] = [tag.strip() for tag in value if tag.strip()]

    updates["updated_at"] = now_iso()
    ref.update(updates)

    snapshot = ref.get()
    return {"id": snapshot.id, **(snapshot.to_dict() or {})}
