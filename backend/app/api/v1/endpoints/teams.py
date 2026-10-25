
import logging
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field

from app.api.v1.endpoints.admin import require_admin
from app.core.firebase import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/teams", tags=["Admin Teams"])


# ---------- Request schemas ----------

class TeamCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=80)
    description: str = Field(default="", max_length=500)


class TeamUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=500)


class TeamMemberAdd(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    uid: str = Field(min_length=1, max_length=128)


# ---------- Shared helpers ----------

def _require_db() -> None:
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not configured.",
        )


def _team_response(team_id: str, data: dict) -> dict:
    members = data.get("member_ids", [])
    if not isinstance(members, list):
        members = []

    return {
        "id": team_id,
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "member_ids": members,
        "member_count": len(members),
        "created_by": data.get("created_by"),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }


def _get_team(team_id: str):
    snapshot = db.collection("teams").document(team_id).get()

    if not snapshot.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found.",
        )

    return snapshot.to_dict() or {}


def _get_active_user(uid: str) -> dict:
    snapshot = db.collection("users").document(uid).get()

    if not snapshot.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registered user profile not found.",
        )

    profile = snapshot.to_dict() or {}

    if not profile.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot add an inactive user to a team.",
        )

    return profile


# ---------- Team CRUD ----------

@router.post("", status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    admin: dict = Depends(require_admin),
):
    _require_db()

    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Team name must contain at least two non-space characters.",
        )

    now = datetime.now(timezone.utc).isoformat()
    team_data = {
        "name": name,
        "description": payload.description.strip(),
        "member_ids": [],
        "created_by": admin["uid"],
        "created_at": now,
        "updated_at": now,
    }

    try:
        team_ref = db.collection("teams").document()
        team_ref.set(team_data)
        return _team_response(team_ref.id, team_data)

    except Exception as exc:
        logger.exception("Team creation failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not create the team.",
        ) from exc


@router.get("")
def list_teams(
    q: Annotated[str | None, Query(max_length=100)] = None,
    limit: int = Query(default=50, ge=1, le=100),
    _: dict = Depends(require_admin),
):
    _require_db()

    try:
        search = q.strip().casefold() if q else ""
        results = []

        for snapshot in db.collection("teams").stream():
            data = snapshot.to_dict() or {}
            team = _team_response(snapshot.id, data)

            if search and search not in (
                team["name"] + " " + team["description"]
            ).casefold():
                continue

            results.append(team)

        results.sort(
            key=lambda team: str(team.get("created_at") or ""),
            reverse=True,
        )

        return {
            "items": results[:limit],
            "total": len(results),
            "limit": limit,
        }

    except Exception as exc:
        logger.exception("Team listing failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve teams.",
        ) from exc


@router.get("/{team_id}")
def get_team_details(
    team_id: str,
    _: dict = Depends(require_admin),
):
    _require_db()

    try:
        team_data = _get_team(team_id)
        team = _team_response(team_id, team_data)

        members = []
        for uid in team["member_ids"]:
            snapshot = db.collection("users").document(uid).get()
            if snapshot.exists:
                profile = snapshot.to_dict() or {}
                members.append({
                    "uid": uid,
                    "username": profile.get("username", ""),
                    "email": profile.get("email", ""),
                    "full_name": profile.get("full_name"),
                    "is_active": profile.get("is_active", True),
                })

        return {**team, "members": members}

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Team details retrieval failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve team details.",
        ) from exc


@router.patch("/{team_id}")
def update_team(
    team_id: str,
    payload: TeamUpdate,
    _: dict = Depends(require_admin),
):
    _require_db()

    changes = payload.model_dump(exclude_unset=True)

    if not changes or all(value is None for value in changes.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide a team name or description to update.",
        )

    if "name" in changes:
        if changes["name"] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Team name cannot be null.",
            )

        changes["name"] = changes["name"].strip()
        if len(changes["name"]) < 2:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Team name must contain at least two non-space characters.",
            )

    if "description" in changes:
        if changes["description"] is None:
            changes["description"] = ""
        else:
            changes["description"] = changes["description"].strip()

    try:
        team_ref = db.collection("teams").document(team_id)

        if not team_ref.get().exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found.",
            )

        changes["updated_at"] = datetime.now(timezone.utc).isoformat()
        team_ref.update(changes)

        return _team_response(
            team_id,
            team_ref.get().to_dict() or {},
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Team update failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not update the team.",
        ) from exc


@router.delete("/{team_id}")
def delete_team(
    team_id: str,
    _: dict = Depends(require_admin),
):
    _require_db()

    try:
        team_ref = db.collection("teams").document(team_id)

        if not team_ref.get().exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found.",
            )

        # Members are stored as UIDs on the team document, so deleting
        # this document does not delete the users themselves.
        team_ref.delete()

        return {
            "message": "Team deleted successfully.",
            "id": team_id,
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Team deletion failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not delete the team.",
        ) from exc


# ---------- Team membership ----------

@router.post("/{team_id}/members", status_code=status.HTTP_200_OK)
def add_team_member(
    team_id: str,
    payload: TeamMemberAdd,
    _: dict = Depends(require_admin),
):
    _require_db()

    try:
        team_ref = db.collection("teams").document(team_id)
        team_data = _get_team(team_id)

        uid = payload.uid.strip()
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="User UID cannot be empty.",
            )

        _get_active_user(uid)

        member_ids = team_data.get("member_ids", [])
        if not isinstance(member_ids, list):
            member_ids = []

        if uid in member_ids:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already a member of this team.",
            )

        updated_members = [*member_ids, uid]
        team_ref.update({
            "member_ids": updated_members,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })

        updated_data = team_ref.get().to_dict() or {}
        return _team_response(team_id, updated_data)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Adding team member failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not add the team member.",
        ) from exc


@router.delete("/{team_id}/members/{uid}")
def remove_team_member(
    team_id: str,
    uid: str,
    _: dict = Depends(require_admin),
):
    _require_db()

    try:
        team_ref = db.collection("teams").document(team_id)
        team_data = _get_team(team_id)

        member_ids = team_data.get("member_ids", [])
        if not isinstance(member_ids, list):
            member_ids = []

        if uid not in member_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not a member of this team.",
            )

        updated_members = [member for member in member_ids if member != uid]

        team_ref.update({
            "member_ids": updated_members,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })

        return _team_response(
            team_id,
            team_ref.get().to_dict() or {},
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Removing team member failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not remove the team member.",
        ) from exc
