from fastapi import HTTPException, status


class InsufficientCreditsError(HTTPException):
    """Raised when a user does not have enough time credits for an operation."""

    def __init__(self, available: float, required: float):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Insufficient time credits. "
                f"Available: {available:.1f}h, Required: {required:.1f}h"
            ),
        )


class SessionConflictError(HTTPException):
    """Raised when a session conflicts with an existing booking."""

    def __init__(self, message: str = "Session time conflicts with an existing booking"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
        )


class SkillNotFoundError(HTTPException):
    """Raised when a referenced skill does not exist."""

    def __init__(self, skill_id: str = ""):
        detail = "Skill not found"
        if skill_id:
            detail = f"Skill with id '{skill_id}' not found"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        )
