import hashlib
import secrets
import time
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from app.core.config import settings
from app.core.firebase import db, firebase_app
from app.api.v1.endpoints.auth import verify_firebase_token
from app.services.github_service import encrypt_github_token, decrypt_github_token
from google.cloud.firestore_v1 import transactional as firestore_transactional
router = APIRouter(prefix="/github", tags=["GitHub Integration"])
bearer_scheme = HTTPBearer()

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_URL = "https://api.github.com"

OAUTH_STATES_COLLECTION = "github_oauth_states"
CONNECTIONS_COLLECTION = "github_connections"
STATE_TTL_SECONDS = 600


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    try:
        token = verify_firebase_token(credentials)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase authentication.",
        ) from exc

    uid = token.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase identity is missing.",
        )

    if db is None or firebase_app is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase is not configured.",
        )

    user_snapshot = db.collection("users").document(uid).get()
    user_data = user_snapshot.to_dict() if user_snapshot.exists else None

    if not user_data or not user_data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Active user profile not found. Create a session first.",
        )

    return {
        "uid": uid,
        "email": token.get("email"),
    }


def validate_github_configuration() -> None:
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth credentials are not configured.",
        )

    if not settings.GITHUB_CALLBACK_URL.startswith("http://localhost:8000/") and not settings.GITHUB_CALLBACK_URL.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub callback URL must use HTTPS outside localhost.",
        )


@router.get("/connect")
def connect_github(user: dict = Depends(get_current_user)):
    """Start OAuth and bind the one-time state to the authenticated Firebase user."""
    validate_github_configuration()

    state = secrets.token_urlsafe(32)
    state_hash = hashlib.sha256(state.encode("utf-8")).hexdigest()
    now = int(time.time())

    db.collection(OAUTH_STATES_COLLECTION).document(state_hash).set({
        "uid": user["uid"],
        "created_at": now,
        "expires_at": now + STATE_TTL_SECONDS,
    })

    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_CALLBACK_URL,
        "scope": "read:user user:email repo",
        "state": state,
    }

    return {
        "authorization_url": f"{GITHUB_AUTHORIZE_URL}?{urlencode(params)}"
    }


@router.get("/callback")
async def github_callback(
    code: str = Query(..., min_length=1),
    state: str = Query(..., min_length=1),
    error: str | None = Query(default=None),
):
    """Validate OAuth state, exchange code, and save an encrypted GitHub token."""
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub authorization was cancelled or denied.",
        )

    if db is None or firebase_app is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase is not configured.",
        )

    validate_github_configuration()

    state_hash = hashlib.sha256(state.encode("utf-8")).hexdigest()
    state_ref = db.collection(OAUTH_STATES_COLLECTION).document(state_hash)

    # Transactional read-and-delete prevents a state from being reused.
    transaction = db.transaction()

    @firestore_transactional
    def consume_state(txn):
        snapshot = state_ref.get(transaction=txn)
        if not snapshot.exists:
            return None

        state_data = snapshot.to_dict() or {}
        txn.delete(state_ref)
        return state_data

    state_data = consume_state(transaction)

    if not state_data or int(state_data.get("expires_at", 0)) < int(time.time()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OAuth state is invalid, expired, or already used. Please reconnect.",
        )

    uid = state_data.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OAuth state has no associated user.",
        )

    async with httpx.AsyncClient(timeout=20.0) as client:
        token_response = await client.post(
            GITHUB_TOKEN_URL,
            headers={
                "Accept": "application/json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_CALLBACK_URL,
            },
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub token exchange failed.",
            )

        token_data = token_response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub did not return an access token.",
            )

        github_response = await client.get(
            f"{GITHUB_API_URL}/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )

        if github_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to retrieve the authorized GitHub account.",
            )

        github_user = github_response.json()

    connection_data = {
        "uid": uid,
        "github_user_id": github_user.get("id"),
        "github_username": github_user.get("login"),
        "github_avatar_url": github_user.get("avatar_url", ""),
        "encrypted_access_token": encrypt_github_token(access_token),
        "token_type": token_data.get("token_type", "bearer"),
        "scopes": token_data.get("scope", ""),
        "connected_at": int(time.time()),
        "updated_at": int(time.time()),
    }

    # One connection per Firebase user for this initial implementation.
    db.collection(CONNECTIONS_COLLECTION).document(uid).set(connection_data)

    # Redirect to the frontend without including any token in the URL.
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL.rstrip('/')}/github?connected=1",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@router.get("/status")
def github_connection_status(user: dict = Depends(get_current_user)):
    snapshot = (
        db.collection(CONNECTIONS_COLLECTION)
        .document(user["uid"])
        .get()
    )

    if not snapshot.exists:
        return {"connected": False, "github_username": None}

    data = snapshot.to_dict() or {}

    return {
        "connected": True,
        "github_username": data.get("github_username"),
        "github_avatar_url": data.get("github_avatar_url", ""),
        "connected_at": data.get("connected_at"),
    }

@router.get("/repositories")
async def list_github_repositories(
    user: dict = Depends(get_current_user),
):
    """Fetch repositories accessible to the connected GitHub account."""

    connection_ref = db.collection(CONNECTIONS_COLLECTION).document(
        user["uid"]
    )
    connection_snapshot = connection_ref.get()

    if not connection_snapshot.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GitHub account is not connected. Connect GitHub first.",
        )

    connection = connection_snapshot.to_dict() or {}
    encrypted_token = connection.get("encrypted_access_token")

    if not encrypted_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stored GitHub connection has no access token.",
        )

    access_token = decrypt_github_token(encrypted_token)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                f"{GITHUB_API_URL}/user/repos",
                headers=headers,
                params={
                    "sort": "updated",
                    "per_page": 100,
                    "page": 1,
                    "affiliation": "owner,collaborator,organization_member",
                },
            )

        if response.status_code==401:
            print(
                "GitHub API returned 401 for repository listing.",
                "Github username:",
                connection.get("github_username"),
                "Token present:",
                bool(access_token),
                "Token length:",
                len(access_token),
            )
            raise HTTPException(
                status_code= status.HTTP_401_UNAUTHORIZED,
                detail="GitHub authorization expired or was revoked. Reconnect GitHub"
            )

        if response.status_code == 403:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub denied the repository request. Check account permissions or API rate limits.",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub could not return the repository list.",
            )

        repositories = response.json()

        return {
            "connected": True,
            "github_username": connection.get("github_username"),
            "count": len(repositories),
            "repositories": [
                {
                    "id": repo["id"],
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "description": repo.get("description"),
                    "html_url": repo["html_url"],
                    "private": repo["private"],
                    "language": repo.get("language"),
                    "default_branch": repo["default_branch"],
                    "stars": repo["stargazers_count"],
                    "forks": repo["forks_count"],
                    "open_issues": repo["open_issues_count"],
                    "updated_at": repo["updated_at"],
                    "pushed_at": repo.get("pushed_at"),
                }
                for repo in repositories
            ],
        }

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach the GitHub API. Please try again.",
        ) from exc

@router.get("/repositories/{owner}/{repo}/pull-requests")
async def list_github_pull_requests(
    owner: str,
    repo: str,
    state_filter: str = Query(default="open", alias="state", pattern="^(open|closed|all)$"),
    page: int = Query(default=1, ge=1, le=1000),
    per_page: int = Query(default=30, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """Fetch real pull requests for a repository accessible to the connected GitHub account."""

    # Validate path values before making an outbound request.
    if (
        not owner.strip()
        or not repo.strip()
        or "/" in owner
        or "/" in repo
        or owner in {".", ".."}
        or repo in {".", ".."}
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GitHub repository owner or name.",
        )

    connection_ref = db.collection(CONNECTIONS_COLLECTION).document(user["uid"])
    connection_snapshot = connection_ref.get()

    if not connection_snapshot.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GitHub account is not connected. Connect GitHub first.",
        )

    connection = connection_snapshot.to_dict() or {}
    encrypted_token = connection.get("encrypted_access_token")

    if not encrypted_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stored GitHub connection has no access token.",
        )

    try:
        access_token = decrypt_github_token(encrypted_token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not decrypt the stored GitHub token. Reconnect GitHub.",
        ) from exc

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                f"{GITHUB_API_URL}/repos/{owner}/{repo}/pulls",
                headers=headers,
                params={
                    "state": state_filter,
                    "sort": "updated",
                    "direction": "desc",
                    "per_page": per_page,
                    "page": page,
                },
            )

        if response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="GitHub authorization expired or was revoked. Reconnect GitHub.",
            )

        if response.status_code == 403:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub denied the pull request request. Check repository permissions or API rate limits.",
            )

        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found or the connected GitHub account does not have access.",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub could not return pull requests for this repository.",
            )

        pull_requests = response.json()

        return {
            "repository": f"{owner}/{repo}",
            "github_username": connection.get("github_username"),
            "state": state_filter,
            "page": page,
            "per_page": per_page,
            "count": len(pull_requests),
            "pull_requests": [
                {
                    "id": pr["id"],
                    "number": pr["number"],
                    "title": pr["title"],
                    "body": pr.get("body"),
                    "state": pr["state"],
                    "html_url": pr["html_url"],
                    "draft": pr.get("draft", False),
                    "author": (
                        pr.get("user", {}).get("login")
                        if pr.get("user")
                        else None
                    ),
                    "author_avatar_url": (
                        pr.get("user", {}).get("avatar_url")
                        if pr.get("user")
                        else None
                    ),
                    "head_branch": pr.get("head", {}).get("ref"),
                    "base_branch": pr.get("base", {}).get("ref"),
                    "head_sha": pr.get("head", {}).get("sha"),
                    "created_at": pr.get("created_at"),
                    "updated_at": pr.get("updated_at"),
                    "closed_at": pr.get("closed_at"),
                    "merged_at": pr.get("merged_at"),
                    "comments": pr.get("comments", 0),
                    "commits": pr.get("commits", 0),
                    "changed_files": pr.get("changed_files", 0),
                    "additions": pr.get("additions", 0),
                    "deletions": pr.get("deletions", 0),
                }
                for pr in pull_requests
            ],
        }

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach the GitHub API. Please try again.",
        ) from exc

@router.get("/repositories/{owner}/{repo}/commits")
async def list_github_commits(
    owner: str,
    repo: str,
    branch: str | None = Query(default=None, min_length=1, max_length=255),
    page: int = Query(default=1, ge=1, le=1000),
    per_page: int = Query(default=30, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """Fetch real commits for a repository accessible to the connected GitHub account."""

    if (
        not owner.strip()
        or not repo.strip()
        or "/" in owner
        or "/" in repo
        or owner in {".", ".."}
        or repo in {".", ".."}
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GitHub repository owner or name.",
        )

    connection_ref = (
        db.collection(CONNECTIONS_COLLECTION).document(user["uid"])
    )
    connection_snapshot = connection_ref.get()

    if not connection_snapshot.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GitHub account is not connected. Connect GitHub first.",
        )

    connection = connection_snapshot.to_dict() or {}
    encrypted_token = connection.get("encrypted_access_token")

    if not encrypted_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stored GitHub connection has no access token.",
        )

    try:
        access_token = decrypt_github_token(encrypted_token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not decrypt the stored GitHub token. Reconnect GitHub.",
        ) from exc

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    params = {
        "per_page": per_page,
        "page": page,
    }
    if branch:
        params["sha"] = branch

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                f"{GITHUB_API_URL}/repos/{owner}/{repo}/commits",
                headers=headers,
                params=params,
            )

        if response.status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="GitHub authorization expired or was revoked. Reconnect GitHub.",
            )

        if response.status_code == 403:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub denied the commits request. Check repository permissions or API rate limits.",
            )

        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found or the connected GitHub account does not have access.",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub could not return commits for this repository.",
            )

        commits = response.json()

        return {
            "repository": f"{owner}/{repo}",
            "github_username": connection.get("github_username"),
            "branch": branch,
            "page": page,
            "per_page": per_page,
            "count": len(commits),
            "commits": [
                {
                    "sha": commit.get("sha"),
                    "short_sha": (commit.get("sha") or "")[:7],
                    "message": (
                        commit.get("commit", {}).get("message", "").splitlines()[0]
                    ),
                    "author": (
                        (commit.get("author") or {}).get("login")
                        or (commit.get("commit", {}).get("author") or {}).get("name")
                    ),
                    "author_avatar_url": (
                        (commit.get("author") or {}).get("avatar_url")
                    ),
                    "author_email": (
                        (commit.get("commit", {}).get("author") or {}).get("email")
                    ),
                    "committed_at": (
                        (commit.get("commit", {}).get("author") or {}).get("date")
                    ),
                    "html_url": commit.get("html_url"),
                }
                for commit in commits
            ],
        }

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach the GitHub API. Please try again.",
        ) from exc
