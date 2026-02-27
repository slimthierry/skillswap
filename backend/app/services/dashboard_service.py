"""Dashboard service for community stats, skill maps, and user dashboards."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user_models import User
from app.models.skill_models import Skill, SkillCategory, UserSkillOffered, UserSkillWanted
from app.models.session_models import Session, SessionStatus
from app.models.transaction_models import TimeTransaction, TransactionType
from app.schemas.dashboard_schemas import (
    CommunityStats,
    SkillMapEntry,
    TopTeacher,
    UserDashboard,
)
from app.schemas.transaction_schemas import TimeBalance
from app.services import transaction_service


async def get_community_stats(db: AsyncSession) -> CommunityStats:
    """Get community-wide statistics."""
    # Total users
    user_count_result = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )
    total_users = user_count_result.scalar() or 0

    # Total unique skills offered
    skill_count_result = await db.execute(
        select(func.count(func.distinct(UserSkillOffered.skill_id))).where(
            UserSkillOffered.is_active == True
        )
    )
    total_skills = skill_count_result.scalar() or 0

    # Total completed sessions
    session_count_result = await db.execute(
        select(func.count(Session.id)).where(
            Session.status == SessionStatus.COMPLETED
        )
    )
    total_sessions = session_count_result.scalar() or 0

    # Total hours exchanged
    hours_result = await db.execute(
        select(func.coalesce(func.sum(Session.duration_hours), 0.0)).where(
            Session.status == SessionStatus.COMPLETED
        )
    )
    total_hours_exchanged = float(hours_result.scalar())

    return CommunityStats(
        total_users=total_users,
        total_skills=total_skills,
        total_sessions=total_sessions,
        total_hours_exchanged=total_hours_exchanged,
    )


async def get_skill_map(db: AsyncSession) -> list[SkillMapEntry]:
    """Get a map of skills with user counts, grouped by category."""
    result = await db.execute(
        select(
            Skill.name.label("skill_name"),
            SkillCategory.name.label("category"),
            func.count(func.distinct(UserSkillOffered.user_id)).label("user_count"),
        )
        .join(SkillCategory, Skill.category_id == SkillCategory.id)
        .outerjoin(
            UserSkillOffered,
            (UserSkillOffered.skill_id == Skill.id)
            & (UserSkillOffered.is_active == True),
        )
        .group_by(Skill.name, SkillCategory.name)
        .order_by(func.count(func.distinct(UserSkillOffered.user_id)).desc())
    )

    rows = result.all()
    return [
        SkillMapEntry(
            skill_name=row.skill_name,
            category=row.category,
            user_count=row.user_count,
        )
        for row in rows
    ]


async def get_top_teachers(
    db: AsyncSession, limit: int = 10
) -> list[TopTeacher]:
    """Get the top-rated teachers with the most teaching hours."""
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.skills_offered).selectinload(UserSkillOffered.skill)
        )
        .where(User.is_active == True, User.total_hours_taught > 0)
        .order_by(User.total_hours_taught.desc(), User.rating_avg.desc())
        .limit(limit)
    )
    users = result.scalars().all()

    teachers = []
    for user in users:
        top_skills = [
            o.skill.name
            for o in user.skills_offered
            if o.is_active and o.skill
        ][:5]

        teachers.append(
            TopTeacher(
                id=user.id,
                username=user.username,
                avatar_url=user.avatar_url,
                total_hours_taught=user.total_hours_taught,
                rating_avg=user.rating_avg,
                rating_count=user.rating_count,
                top_skills=top_skills,
            )
        )

    return teachers


async def get_user_dashboard(
    db: AsyncSession, user_id: uuid.UUID
) -> UserDashboard:
    """Get personalized dashboard data for a user."""
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()

    # Get balance
    balance = await transaction_service.get_balance(db, user_id)

    # Upcoming sessions count
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    upcoming_result = await db.execute(
        select(func.count(Session.id)).where(
            ((Session.teacher_id == user_id) | (Session.learner_id == user_id)),
            Session.status.in_([SessionStatus.PENDING, SessionStatus.CONFIRMED]),
            Session.scheduled_at > now,
        )
    )
    upcoming_count = upcoming_result.scalar() or 0

    # Completed sessions count
    completed_result = await db.execute(
        select(func.count(Session.id)).where(
            ((Session.teacher_id == user_id) | (Session.learner_id == user_id)),
            Session.status == SessionStatus.COMPLETED,
        )
    )
    completed_count = completed_result.scalar() or 0

    # Offered/wanted skill counts
    offered_count_result = await db.execute(
        select(func.count(UserSkillOffered.id)).where(
            UserSkillOffered.user_id == user_id,
            UserSkillOffered.is_active == True,
        )
    )
    skills_offered_count = offered_count_result.scalar() or 0

    wanted_count_result = await db.execute(
        select(func.count(UserSkillWanted.id)).where(
            UserSkillWanted.user_id == user_id
        )
    )
    skills_wanted_count = wanted_count_result.scalar() or 0

    # Recent matches count (approximate: other users who share at least one skill overlap)
    from app.services.matching_service import find_matches

    matches = await find_matches(db, user_id)
    recent_matches_count = len(matches)

    return UserDashboard(
        balance=balance,
        upcoming_sessions_count=upcoming_count,
        completed_sessions_count=completed_count,
        total_hours_taught=user.total_hours_taught,
        total_hours_learned=user.total_hours_learned,
        rating_avg=user.rating_avg,
        rating_count=user.rating_count,
        skills_offered_count=skills_offered_count,
        skills_wanted_count=skills_wanted_count,
        recent_matches_count=recent_matches_count,
    )
