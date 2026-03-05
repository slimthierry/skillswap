"""FastAPI application entry point for SkillSwap."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.loggers import setup_logging
from app.routes import app_router
from app.config.database import async_session_factory, engine
from app.config.settings import settings
from app.models.base import Base
from app.models.skill_models import Skill, SkillCategory
from app.utils.skill_categories import DEFAULT_CATEGORIES, DEFAULT_SKILLS
async def seed_default_skills() -> None:
    """Seed default skill categories and skills if they don't exist."""
    async with async_session_factory() as db:
        result = await db.execute(select(SkillCategory).limit(1))
        if result.scalar_one_or_none():
            return  # Already seeded

        for cat_data in DEFAULT_CATEGORIES:
            category = SkillCategory(
                name=cat_data["name"],
                icon=cat_data["icon"],
                description=cat_data["description"],
            )
            db.add(category)
            await db.flush()

            skill_names = DEFAULT_SKILLS.get(cat_data["name"], [])
            for skill_name in skill_names:
                skill = Skill(
                    name=skill_name,
                    category_id=category.id,
                    description=f"Learn and teach {skill_name}",
                )
                db.add(skill)

        await db.commit()
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables and seed data on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_default_skills()
    yield
    await engine.dispose()
app = FastAPI(
    title="SkillSwap API",
    description="Peer-to-peer skill exchange platform with time-banking",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
