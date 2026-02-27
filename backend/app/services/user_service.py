"""User service for profile management and search."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user_models import User
from app.models.skill_models import Skill, UserSkillOffered, UserSkillWanted
from app.schemas.user_schemas import UserUpdate


async def get_profile(db: AsyncSession, user_id: uuid.UUID) -> User:
    """Get a user's full profile with skills offered and wanted."""
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.skills_offered).selectinload(UserSkillOffered.skill),
            selectinload(User.skills_wanted).selectinload(UserSkillWanted.skill),
        )
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user


async def update_profile(
    db: AsyncSession, user: User, data: UserUpdate
) -> User:
    """Update a user's profile fields."""
    update_data = data.model_dump(exclude_unset=True)

    if "username" in update_data and update_data["username"] != user.username:
        result = await db.execute(
            select(User).where(User.username == update_data["username"])
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken.",
            )

    for field, value in update_data.items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user


async def search_users_by_skill(
    db: AsyncSession, query: str, limit: int = 20
) -> list[User]:
    """
    Search for users who offer skills matching the query string.
    """
    result = await db.execute(
        select(User)
        .join(UserSkillOffered, User.id == UserSkillOffered.user_id)
        .join(Skill, UserSkillOffered.skill_id == Skill.id)
        .where(
            UserSkillOffered.is_active == True,
            or_(
                Skill.name.ilike(f"%{query}%"),
                User.username.ilike(f"%{query}%"),
            ),
        )
        .options(
            selectinload(User.skills_offered).selectinload(UserSkillOffered.skill),
        )
        .distinct()
        .limit(limit)
    )
    return list(result.scalars().all())
