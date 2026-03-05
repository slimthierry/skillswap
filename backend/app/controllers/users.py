"""User API routes."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user_models import User
from app.schemas.user_schemas import UserProfile, UserResponse, UserUpdate
from app.services import user_service

router = APIRouter()


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_profile(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a user's public profile with skills offered and wanted."""
    user = await user_service.get_profile(db, user_id)
    return user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    updated_user = await user_service.update_profile(db, current_user, data)
    return updated_user


@router.get("/search", response_model=list[UserResponse])
async def search_users(
    q: str = Query(..., min_length=1, description="Search query for skills or usernames"),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Search for users by skill name or username."""
    users = await user_service.search_users_by_skill(db, q, limit)
    return users
