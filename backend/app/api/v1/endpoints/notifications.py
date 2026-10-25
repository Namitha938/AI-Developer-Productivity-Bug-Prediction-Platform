
from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.api.v1.endpoints.issues import get_authenticated_uid
from app.core.firebase import db


router = APIRouter(prefix="/notifications", tags=["Notifications"])

NotificationType = Literal[
    "critical_bug",
    "scan_complete",
    "issue_assigned",
    "pr_reviewed",
    "system",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_notifications_collection(uid: str):
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Firestore is not configured",
        )

    return (
        db.collection("users")
        .document(uid)
        .collection("notifications")
    )


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=2000)
    type: NotificationType = "system"
    link_url: str | None = Field(default=None, max_length=500)


def serialize_notification(notification_id: str, data: dict) -> dict:
    return {
        "id": notification_id,
        "title": data.get("title", ""),
        "message": data.get("message", ""),
        "type": data.get("type", "system"),
        "timestamp": data.get("timestamp", ""),
        "read": bool(data.get("read", False)),
        "link_url": data.get("link_url"),
    }


@router.get("")
def list_notifications(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    unread_only: bool = False,
    uid: str = Depends(get_authenticated_uid),
):
    collection = get_notifications_collection(uid)

    try:
        notifications = [
            serialize_notification(doc.id, doc.to_dict() or {})
            for doc in collection.stream()
        ]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve notifications",
        ) from exc

    notifications.sort(
        key=lambda item: item["timestamp"],
        reverse=True,
    )

    if unread_only:
        notifications = [
            item for item in notifications if not item["read"]
        ]

    total = len(notifications)
    unread_count = sum(not item["read"] for item in notifications)

    return {
        "notifications": notifications[offset:offset + limit],
        "count": total,
        "unread_count": unread_count,
        "limit": limit,
        "offset": offset,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate,
    uid: str = Depends(get_authenticated_uid),
):
    notification_id = str(uuid4())
    data = {
        **payload.model_dump(),
        "timestamp": utc_now(),
        "read": False,
    }

    try:
        get_notifications_collection(uid).document(
            notification_id
        ).set(data)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to create notification",
        ) from exc

    return serialize_notification(notification_id, data)


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    document_ref = get_notifications_collection(uid).document(
        notification_id
    )

    try:
        document = document_ref.get()

        if not document.exists:
            raise HTTPException(
                status_code=404,
                detail="Notification not found",
            )

        document_ref.update({"read": True})
        updated = document_ref.get()

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to update notification",
        ) from exc

    return serialize_notification(
        notification_id,
        updated.to_dict() or {},
    )


@router.patch("/read-all")
def mark_all_notifications_read(
    uid: str = Depends(get_authenticated_uid),
):
    collection = get_notifications_collection(uid)

    try:
        documents = list(collection.stream())

        # Firestore batches support at most 500 writes.
        for start in range(0, len(documents), 500):
            batch = db.batch()
            for document in documents[start:start + 500]:
                if not (document.to_dict() or {}).get("read", False):
                    batch.update(document.reference, {"read": True})
            batch.commit()

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to mark notifications as read",
        ) from exc

    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: str,
    uid: str = Depends(get_authenticated_uid),
):
    document_ref = get_notifications_collection(uid).document(
        notification_id
    )

    try:
        if not document_ref.get().exists:
            raise HTTPException(
                status_code=404,
                detail="Notification not found",
            )

        document_ref.delete()

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to delete notification",
        ) from exc
