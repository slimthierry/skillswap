"""Session API routes."""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_models import User
from app.schemas.session_schemas import SessionCreate, SessionResponse
from app.services import session_service

router = APIRouter()


@router.post("/book", response_model=SessionResponse, status_code=201)
async def book_session(
    data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Book a new skill exchange session as the learner."""
    session = await session_service.book_session(db, current_user, data)
    return session


@router.put("/{session_id}/confirm", response_model=SessionResponse)
async def confirm_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Confirm a pending session. Only the teacher can confirm."""
    session = await session_service.confirm_session(db, session_id, current_user)
    return session


@router.put("/{session_id}/complete", response_model=SessionResponse)
async def complete_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Complete a session and trigger credit transfer."""
    session = await session_service.complete_session(db, session_id, current_user)
    return session


@router.put("/{session_id}/cancel", response_model=SessionResponse)
async def cancel_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a pending or confirmed session."""
    session = await session_service.cancel_session(db, session_id, current_user)
    return session


@router.get("/my-sessions", response_model=list[SessionResponse])
async def get_my_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all sessions for the current user."""
    sessions = await session_service.get_user_sessions(db, current_user.id)
    return sessions


@router.get("/upcoming", response_model=list[SessionResponse])
async def get_upcoming_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get upcoming sessions for the current user."""
    sessions = await session_service.get_upcoming_sessions(db, current_user.id)
    return sessions
