"""Review API routes."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_models import User
from app.schemas.session_schemas import SessionReviewCreate, SessionReviewResponse
from app.services import review_service

router = APIRouter()


@router.post("/create", response_model=SessionReviewResponse, status_code=201)
async def create_review(
    session_id: uuid.UUID = Query(..., description="The session to review"),
    data: SessionReviewCreate = ...,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a review for a completed session."""
    review = await review_service.create_review(db, session_id, current_user, data)
    return review


@router.get("/user/{user_id}", response_model=list[SessionReviewResponse])
async def get_user_reviews(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get all reviews received by a user."""
    reviews = await review_service.get_user_reviews(db, user_id)
    return reviews
