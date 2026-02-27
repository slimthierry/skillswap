import uuid
from typing import Optional

from pydantic import BaseModel

from app.schemas.transaction_schemas import TimeBalance


class CommunityStats(BaseModel):
    total_users: int
    total_skills: int
    total_sessions: int
    total_hours_exchanged: float


class SkillMapEntry(BaseModel):
    skill_name: str
    category: str
    user_count: int


class TopTeacher(BaseModel):
    id: uuid.UUID
    username: str
    avatar_url: Optional[str] = None
    total_hours_taught: float
    rating_avg: float
    rating_count: int
    top_skills: list[str] = []


class UserDashboard(BaseModel):
    balance: TimeBalance
    upcoming_sessions_count: int
    completed_sessions_count: int
    total_hours_taught: float
    total_hours_learned: float
    rating_avg: float
    rating_count: int
    skills_offered_count: int
    skills_wanted_count: int
    recent_matches_count: int
