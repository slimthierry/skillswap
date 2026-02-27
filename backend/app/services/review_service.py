"""Review service for creating and managing session reviews."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.session_models import Session, SessionReview, SessionStatus
from app.models.user_models import User
from app.schemas.session_schemas import SessionReviewCreate


async def create_review(
    db: AsyncSession,
    session_id: uuid.UUID,
    reviewer: User,
    data: SessionReviewCreate,
) -> SessionReview:
    """
    Create a review for a completed session.
    Only participants of a completed session can leave a review.
    """
    # Get session
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found.",
        )

    if session.status != SessionStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviews can only be left for completed sessions.",
        )

    # Determine reviewer and reviewee
    if reviewer.id == session.teacher_id:
        reviewee_id = session.learner_id
    elif reviewer.id == session.learner_id:
        reviewee_id = session.teacher_id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only session participants can leave reviews.",
        )

    # Check if reviewer already reviewed this session
    result = await db.execute(
        select(SessionReview).where(
            SessionReview.session_id == session_id,
            SessionReview.reviewer_id == reviewer.id,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this session.",
        )

    review = SessionReview(
        session_id=session_id,
        reviewer_id=reviewer.id,
        reviewee_id=reviewee_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    await db.flush()

    # Update the reviewee's average rating
    await update_user_rating_avg(db, reviewee_id)

    await db.refresh(review)
    return review


async def get_user_reviews(
    db: AsyncSession, user_id: uuid.UUID
) -> list[SessionReview]:
    """Get all reviews received by a user."""
    result = await db.execute(
        select(SessionReview)
        .options(
            selectinload(SessionReview.reviewer),
            selectinload(SessionReview.session),
        )
        .where(SessionReview.reviewee_id == user_id)
        .order_by(SessionReview.created_at.desc())
    )
    return list(result.scalars().all())


async def update_user_rating_avg(db: AsyncSession, user_id: uuid.UUID) -> None:
    """Recalculate and update a user's average rating from all reviews."""
    result = await db.execute(
        select(
            func.avg(SessionReview.rating).label("avg_rating"),
            func.count(SessionReview.id).label("review_count"),
        ).where(SessionReview.reviewee_id == user_id)
    )
    row = result.one()
    avg_rating = float(row.avg_rating) if row.avg_rating else 0.0
    review_count = row.review_count or 0

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()
    user.rating_avg = round(avg_rating, 2)
    user.rating_count = review_count
    await db.flush()
