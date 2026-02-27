from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "skillswap-dev-secret-key-change-in-production-abc123xyz"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "postgresql+asyncpg://skillswap_user:skillswap_pass@localhost:55432/skillswap"
    DATABASE_URL_SYNC: str = "postgresql://skillswap_user:skillswap_pass@localhost:55432/skillswap"
    REDIS_URL: str = "redis://localhost:56379/0"

    ENVIRONMENT: str = "development"
    STARTER_CREDITS_HOURS: float = 3.0

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
