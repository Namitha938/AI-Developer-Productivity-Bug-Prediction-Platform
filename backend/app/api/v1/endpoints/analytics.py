
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.v1.endpoints.issues import (
    get_authenticated_uid,
    get_issues_collection,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

TimeRange = Literal["7d", "30d", "90d"]


def parse_datetime(value) -> datetime | None:
    """Parse Firestore timestamp values or ISO datetime strings."""
    if isinstance(value, datetime):
        parsed = value
    elif isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(
                value.replace("Z", "+00:00")
            )
        except ValueError:
            return None
    else:
        return None

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    return parsed.astimezone(timezone.utc)


@router.get("")
def get_analytics(
    time_range: TimeRange = Query(default="30d", alias="range"),
    uid: str = Depends(get_authenticated_uid),
):
    """
    Return analytics derived from the authenticated user's real issues.
    """
    collection = get_issues_collection(uid)

    try:
        issues = [
            {"id": doc.id, **(doc.to_dict() or {})}
            for doc in collection.stream()
        ]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve analytics data",
        ) from exc

    now = datetime.now(timezone.utc)
    days = {"7d": 7, "30d": 30, "90d": 90}[time_range]
    cutoff = now - timedelta(days=days)

    severity_counts = Counter()
    status_counts = Counter()
    daily_counts = {}

    total_risk = 0
    risk_count = 0
    recent_issues = []
    issues_in_period = 0

    for issue in issues:
        severity = issue.get("severity", "unknown")
        issue_status = issue.get("status", "unknown")

        severity_counts[severity] += 1
        status_counts[issue_status] += 1

        risk = issue.get("risk_score")
        if isinstance(risk, (int, float)) and not isinstance(risk, bool):
            total_risk += risk
            risk_count += 1

        created_at = parse_datetime(issue.get("created_at"))

        if created_at is not None and cutoff <= created_at <= now:
            issues_in_period += 1
            day = created_at.date().isoformat()
            daily_counts[day] = daily_counts.get(day, 0) + 1

        recent_issues.append({
            "id": issue["id"],
            "title": issue.get("title", "Untitled issue"),
            "severity": severity,
            "status": issue_status,
            "risk_score": issue.get("risk_score", 0),
            "created_at": issue.get("created_at"),
            "project": issue.get("project", ""),
        })

    recent_issues.sort(
        key=lambda issue: (
            parse_datetime(issue.get("created_at"))
            or datetime.min.replace(tzinfo=timezone.utc)
        ),
        reverse=True,
    )

    trend = []
    for offset in range(days - 1, -1, -1):
        day = (now.date() - timedelta(days=offset)).isoformat()
        trend.append({
            "date": day,
            "issues_created": daily_counts.get(day, 0),
        })

    return {
        "range": time_range,
        "generated_at": now.isoformat(),
        "summary": {
            "total_issues": len(issues),
            "issues_created_in_period": issues_in_period,
            "open_issues": status_counts.get("open", 0),
            "in_progress_issues": status_counts.get("in_progress", 0),
            "resolved_issues": status_counts.get("resolved", 0),
            "critical_issues": severity_counts.get("critical", 0),
            "high_issues": severity_counts.get("high", 0),
            "medium_issues": severity_counts.get("medium", 0),
            "low_issues": severity_counts.get("low", 0),
            "average_risk_score": (
                round(total_risk / risk_count, 2)
                if risk_count else None
            ),
        },
        "severity_distribution": [
            {"severity": severity, "count": severity_counts.get(severity, 0)}
            for severity in ("critical", "high", "medium", "low")
        ],
        "status_distribution": [
            {"status": issue_status, "count": status_counts.get(issue_status, 0)}
            for issue_status in ("open", "in_progress", "resolved")
        ],
        "issue_creation_trend": trend,
        "recent_issues": recent_issues[:10],
    }
