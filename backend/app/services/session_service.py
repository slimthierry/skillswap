"""Session service for booking, managing, and completing skill exchange sessions."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.exceptions import SessionConflictError
from app.models.session_models import Session, SessionStatus
from app.models.user_models import User
from app.models.transaction_models import TimeTransaction, TransactionType
from app.schemas.session_schemas import SessionCreate
from app.utils.validators import (
    validate_balance_sufficient,
    validate_no_self_booking,
    validate_session_time,
)


async def book_session(
    db: AsyncSession, learner: User, data: SessionCreate
) -> Session:
    """
    Book a new skill exchange session.
    Validates balance, no self-booking, time, and conflicts.
    """
    validate_no_self_booking(data.teacher_id, learner.id)
    validate_session_time(data.scheduled_at)
    validate_balance_sufficient(learner.time_balance_hours, data.duration_hours)

    # Verify teacher exists
    result = await db.execute(select(User).where(User.id == data.teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found.",
        )

    # Check for scheduling conflicts
    session_end = data.scheduled_at + timedelta(hours=data.duration_hours)
    conflict_query = select(Session).where(
        and_(
            or_(
                Session.teacher_id == data.teacher_id,
                Session.learner_id == data.teacher_id,
                Session.teacher_id == learner.id,
                Session.learner_id == learner.id,
            ),
            Session.status.in_([
                SessionStatus.PENDING,
                SessionStatus.CONFIRMED,
                SessionStatus.IN_PROGRESS,
            ]),
            Session.scheduled_at < session_end,
            # existing session end > new session start
        )
    )
    result = await db.execute(conflict_query)
    existing_sessions = result.scalars().all()

    for existing in existing_sessions:
        existing_end = existing.scheduled_at + timedelta(hours=existing.duration_hours)
        if existing.scheduled_at < session_end and existing_end > data.scheduled_at:
            raise SessionConflictError()

    session = Session(
        teacher_id=data.teacher_id,
        learner_id=learner.id,
        skill_id=data.skill_id,
        scheduled_at=data.scheduled_at,
        duration_hours=data.duration_hours,
        status=SessionStatus.PENDING,
        notes=data.notes,
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return session


async def confirm_session(
    db: AsyncSession, session_id: uuid.UUID, user: User
) -> Session:
    """Confirm a pending session. Only the teacher can confirm."""
    session = await _get_session(db, session_id)

    if session.teacher_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can confirm a session.",
        )

    if session.status != SessionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot confirm a session with status '{session.status.value}'.",
        )

    session.status = SessionStatus.CONFIRMED
    await db.flush()
    await db.refresh(session)
    return session


async def complete_session(
    db: AsyncSession, session_id: uuid.UUID, user: User
) -> Session:
    """
    Complete a session and transfer time credits.
    Debits the learner, credits the teacher, and updates totals.
    """
    session = await _get_session(db, session_id)

    if session.teacher_id != user.id and session.learner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only session participants can complete a session.",
        )

    if session.status not in (SessionStatus.CONFIRMED, SessionStatus.IN_PROGRESS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete a session with status '{session.status.value}'.",
        )

    # Fetch learner and teacher
    result = await db.execute(select(User).where(User.id == session.learner_id))
    learner = result.scalar_one()

    result = await db.execute(select(User).where(User.id == session.teacher_id))
    teacher = result.scalar_one()

    hours = session.duration_hours

    # Check learner has sufficient balance
    validate_balance_sufficient(learner.time_balance_hours, hours)

    # Debit learner
    learner.time_balance_hours -= hours
    learner.total_hours_learned += hours

    # Credit teacher
    teacher.time_balance_hours += hours
    teacher.total_hours_taught += hours

    # Create debit transaction (learner spent)
    debit_tx = TimeTransaction(
        from_user_id=learner.id,
        to_user_id=teacher.id,
        session_id=session.id,
        hours=hours,
        type=TransactionType.SPENT,
        description=f"Session payment: {hours}h for skill exchange",
    )
    db.add(debit_tx)

    # Create credit transaction (teacher earned)
    credit_tx = TimeTransaction(
        from_user_id=learner.id,
        to_user_id=teacher.id,
        session_id=session.id,
        hours=hours,
        type=TransactionType.EARNED,
        description=f"Session earning: {hours}h for teaching",
    )
    db.add(credit_tx)

    session.status = SessionStatus.COMPLETED
    await db.flush()
    await db.refresh(session)
    return session


async def cancel_session(
    db: AsyncSession, session_id: uuid.UUID, user: User
) -> Session:
    """Cancel a session. Either participant can cancel pending/confirmed sessions."""
    session = await _get_session(db, session_id)

    if session.teacher_id != user.id and session.learner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only session participants can cancel a session.",
        )

    if session.status in (SessionStatus.COMPLETED, SessionStatus.CANCELLED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel a session with status '{session.status.value}'.",
        )

    session.status = SessionStatus.CANCELLED
    await db.flush()
    await db.refresh(session)
    return session


async def get_user_sessions(
    db: AsyncSession, user_id: uuid.UUID, status_filter: SessionStatus | None = None
) -> list[Session]:
    """Get all sessions for a user (as teacher or learner)."""
    query = (
        select(Session)
        .options(
            selectinload(Session.teacher),
            selectinload(Session.learner),
            selectinload(Session.skill),
        )
        .where(
            or_(Session.teacher_id == user_id, Session.learner_id == user_id)
        )
        .order_by(Session.scheduled_at.desc())
    )
    if status_filter:
        query = query.where(Session.status == status_filter)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_upcoming_sessions(
    db: AsyncSession, user_id: uuid.UUID
) -> list[Session]:
    """Get upcoming sessions for a user."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Session)
        .options(
            selectinload(Session.teacher),
            selectinload(Session.learner),
            selectinload(Session.skill),
        )
        .where(
            or_(Session.teacher_id == user_id, Session.learner_id == user_id),
            Session.status.in_([SessionStatus.PENDING, SessionStatus.CONFIRMED]),
            Session.scheduled_at > now,
        )
        .order_by(Session.scheduled_at.asc())
    )
    return list(result.scalars().all())


async def _get_session(db: AsyncSession, session_id: uuid.UUID) -> Session:
    """Get a session by ID or raise 404."""
    result = await db.execute(
        select(Session)
        .options(
            selectinload(Session.teacher),
            selectinload(Session.learner),
            selectinload(Session.skill),
        )
        .where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found.",
        )
    return session
