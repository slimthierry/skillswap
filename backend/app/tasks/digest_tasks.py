"""Celery tasks for periodic digest emails."""

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, create_engine, func, select
from sqlalchemy.orm import sessionmaker

from app.celery_app import celery
from app.config.settings import settings
from app.models.session_models import Session, SessionStatus
from app.models.user_models import User
from app.models.skill_models import UserSkillOffered

logger = logging.getLogger(__name__)

sync_engine = create_engine(settings.DATABASE_URL_SYNC, pool_pre_ping=True)
SyncSessionLocal = sessionmaker(bind=sync_engine)


@celery.task(name="app.tasks.digest_tasks.send_weekly_digest")
def send_weekly_digest() -> dict:
    """
    Send a weekly digest email to all active users with:
    - Their upcoming sessions
    - New skill matches
    - Community activity summary

    In production, this would compose and send actual emails.
    """
    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)

    with SyncSessionLocal() as db:
        # Get all active users
        result = db.execute(select(User).where(User.is_active == True))
        active_users = result.scalars().all()

        # Get community stats for the week
        new_sessions_result = db.execute(
            select(func.count(Session.id)).where(
                Session.created_at >= one_week_ago,
                Session.status == SessionStatus.COMPLETED,
            )
        )
        completed_this_week = new_sessions_result.scalar() or 0

        new_users_result = db.execute(
            select(func.count(User.id)).where(
                User.created_at >= one_week_ago,
                User.is_active == True,
            )
        )
        new_users_this_week = new_users_result.scalar() or 0

        hours_result = db.execute(
            select(func.coalesce(func.sum(Session.duration_hours), 0.0)).where(
                Session.created_at >= one_week_ago,
                Session.status == SessionStatus.COMPLETED,
            )
        )
        hours_this_week = float(hours_result.scalar())

        digests_sent = 0
        for user in active_users:
            # Get user's upcoming sessions
            upcoming_result = db.execute(
                select(Session).where(
                    and_(
                        (Session.teacher_id == user.id) | (Session.learner_id == user.id),
                        Session.status.in_([SessionStatus.PENDING, SessionStatus.CONFIRMED]),
                        Session.scheduled_at > now,
                    )
                )
            )
            upcoming_sessions = upcoming_result.scalars().all()

            # In production: compose and send email
            logger.info(
                f"Weekly digest for {user.username} ({user.email}): "
                f"{len(upcoming_sessions)} upcoming sessions, "
                f"community: {completed_this_week} completed sessions, "
                f"{new_users_this_week} new users, "
                f"{hours_this_week:.1f} hours exchanged this week."
            )
            digests_sent += 1

    return {
        "digests_sent": digests_sent,
        "community_stats": {
            "completed_this_week": completed_this_week,
            "new_users_this_week": new_users_this_week,
            "hours_this_week": hours_this_week,
        },
        "sent_at": now.isoformat(),
    }
