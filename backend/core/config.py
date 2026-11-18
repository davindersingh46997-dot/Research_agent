from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openrouter_api_key: SecretStr | None = Field(
        default=None, validation_alias="OPENROUTER_API_KEY"
    )
    openrouter_model: str | None = Field(
        default=None, validation_alias="OPENROUTER_MODEL"
    )
    tavily_api_key: SecretStr | None = Field(
        default=None, validation_alias="TAVILY_API_KEY"
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()

