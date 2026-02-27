"""Celery application configuration for SkillSwap background tasks."""

from celery import Celery
from celery.schedules import crontab

from app.config.settings import settings

celery = Celery(
    "skillswap",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.session_tasks",
        "app.tasks.digest_tasks",
    ],
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# Beat schedule for periodic tasks
celery.conf.beat_schedule = {
    "send-session-reminders-every-15-min": {
        "task": "app.tasks.session_tasks.send_session_reminders",
        "schedule": crontab(minute="*/15"),
        "args": (),
    },
    "auto-complete-overdue-sessions-every-hour": {
        "task": "app.tasks.session_tasks.auto_complete_overdue",
        "schedule": crontab(minute=0),
        "args": (),
    },
    "send-weekly-digest-every-monday": {
        "task": "app.tasks.digest_tasks.send_weekly_digest",
        "schedule": crontab(hour=9, minute=0, day_of_week=1),
        "args": (),
    },
}
