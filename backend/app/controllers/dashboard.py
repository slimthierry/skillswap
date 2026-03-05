"""Dashboard API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user_models import User
from app.schemas.dashboard_schemas import (
    CommunityStats,
    SkillMapEntry,
    TopTeacher,
    UserDashboard,
)
from app.services import dashboard_service

router = APIRouter()


@router.get("/community-stats", response_model=CommunityStats)
async def get_community_stats(
    db: AsyncSession = Depends(get_db),
):
    """Get community-wide statistics."""
    return await dashboard_service.get_community_stats(db)


@router.get("/skill-map", response_model=list[SkillMapEntry])
async def get_skill_map(
    db: AsyncSession = Depends(get_db),
):
    """Get a map of skills with user counts by category."""
    return await dashboard_service.get_skill_map(db)


@router.get("/top-teachers", response_model=list[TopTeacher])
async def get_top_teachers(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get the top-rated teachers by hours taught."""
    return await dashboard_service.get_top_teachers(db, limit)


@router.get("/my-dashboard", response_model=UserDashboard)
async def get_my_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get personalized dashboard data for the current user."""
    return await dashboard_service.get_user_dashboard(db, current_user.id)
