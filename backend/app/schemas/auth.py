
from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    username: str
    email: str
    full_name: str | None = None
    is_active: bool = True
    avatar_url: str = ""
    created_at: str | None = None
