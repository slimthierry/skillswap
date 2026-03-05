from fastapi import APIRouter

from app.controllers.auth import router as auth_router
from app.controllers.users import router as users_router
from app.controllers.skills import router as skills_router
from app.controllers.sessions import router as sessions_router
from app.controllers.reviews import router as reviews_router
from app.controllers.matching import router as matching_router
from app.controllers.dashboard import router as dashboard_router
from app.controllers.transactions import router as transactions_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(users_router, prefix="/users", tags=["Users"])
router.include_router(skills_router, prefix="/skills", tags=["Skills"])
router.include_router(sessions_router, prefix="/sessions", tags=["Sessions"])
router.include_router(reviews_router, prefix="/reviews", tags=["Reviews"])
router.include_router(matching_router, prefix="/matching", tags=["Matching"])
router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
