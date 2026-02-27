import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.skill_schemas import UserSkillOfferedResponse, UserSkillWantedResponse


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    bio: Optional[str] = None


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    time_balance_hours: float
    total_hours_taught: float
    total_hours_learned: float
    rating_avg: float
    rating_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfile(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    time_balance_hours: float
    total_hours_taught: float
    total_hours_learned: float
    rating_avg: float
    rating_count: int
    skills_offered: list[UserSkillOfferedResponse] = []
    skills_wanted: list[UserSkillWantedResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}
