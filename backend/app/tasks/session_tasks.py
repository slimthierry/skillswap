"""Celery tasks for session management."""

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, create_engine, select, update
from sqlalchemy.orm import Session as DBSession, sessionmaker

from app.celery_app import celery
from app.config.settings import settings
from app.models.session_models import Session, SessionStatus

logger = logging.getLogger(__name__)

# Sync engine for Celery tasks (Celery doesn't support async natively)
sync_engine = create_engine(settings.DATABASE_URL_SYNC, pool_pre_ping=True)
SyncSessionLocal = sessionmaker(bind=sync_engine)


@celery.task(name="app.tasks.session_tasks.send_session_reminders")
def send_session_reminders() -> dict:
    """
    Send reminders for sessions starting within the next hour.
    In production, this would send emails or push notifications.
    """
    now = datetime.now(timezone.utc)
    reminder_window = now + timedelta(hours=1)

    with SyncSessionLocal() as db:
        result = db.execute(
            select(Session).where(
                and_(
                    Session.status == SessionStatus.CONFIRMED,
                    Session.scheduled_at > now,
                    Session.scheduled_at <= reminder_window,
                )
            )
        )
        upcoming_sessions = result.scalars().all()

        reminded_count = 0
        for session in upcoming_sessions:
            # In production: send email/notification to both teacher and learner
            logger.info(
                f"Reminder: Session {session.id} starts at {session.scheduled_at}. "
                f"Teacher: {session.teacher_id}, Learner: {session.learner_id}"
            )
            reminded_count += 1

    return {
        "reminded": reminded_count,
        "checked_at": now.isoformat(),
    }


@celery.task(name="app.tasks.session_tasks.auto_complete_overdue")
def auto_complete_overdue() -> dict:
    """
    Mark overdue in-progress sessions as needing attention.
    Sessions that started more than duration + 2 hours ago and are still
    confirmed/in_progress are flagged.
    """
    now = datetime.now(timezone.utc)

    with SyncSessionLocal() as db:
        result = db.execute(
            select(Session).where(
                Session.status.in_([
                    SessionStatus.CONFIRMED,
                    SessionStatus.IN_PROGRESS,
                ])
            )
        )
        sessions = result.scalars().all()

        flagged_count = 0
        for session in sessions:
            session_end = session.scheduled_at + timedelta(hours=session.duration_hours)
            overdue_threshold = session_end + timedelta(hours=2)

            if now > overdue_threshold:
                # Log for admin attention; do not auto-complete to avoid
                # incorrect credit transfers without participant confirmation
                logger.warning(
                    f"Overdue session {session.id}: scheduled end was "
                    f"{session_end.isoformat()}, status is {session.status.value}. "
                    f"Needs manual review."
                )
                flagged_count += 1

        db.commit()

    return {
        "flagged": flagged_count,
        "checked_at": now.isoformat(),
    }
