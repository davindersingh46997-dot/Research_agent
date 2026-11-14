import logging
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from openai import OpenAIError
from pydantic import BaseModel

from backend.core.config import get_settings
from backend.models.chat_model import chat_with_model

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    model: str


@router.get("/health")
def chat_health() -> dict[str, str | bool]:
    settings = get_settings()
    return {
        "status": "healthy",
        "model": (settings.openrouter_model or "").strip() or "unconfigured",
        "tokenConfigured": bool(
            settings.openrouter_api_key
            and settings.openrouter_api_key.get_secret_value().strip()
        ),
    }


@router.post("", response_model=ChatResponse)
def send_chat_message(request: ChatRequest) -> ChatResponse:
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    settings = get_settings()
    if (
        settings.openrouter_api_key is None
        or not settings.openrouter_api_key.get_secret_value().strip()
        or not (settings.openrouter_model or "").strip()
    ):
        raise HTTPException(
            status_code=503,
            detail="Configure OPENROUTER_API_KEY and OPENROUTER_MODEL to use chat.",
        )

    
    try:
        response = chat_with_model(message)

    except OpenAIError as exc:
        status_code = getattr(exc, "status_code", None)

        logger.exception(
            "OpenRouter API failed. Type=%s, Status=%s, Error=%s",
            type(exc).__name__,
            status_code,
            str(exc)
        )

        if status_code == 401:
            detail = "Invalid or expired OpenRouter API key."

        elif status_code == 403:
            detail = (
                "OpenRouter denied this request. Check model permissions, "
                "account restrictions, and guardrail settings."
            )

        elif status_code == 404:
            detail = "The configured model was not found."

        elif status_code == 429:
            detail = "OpenRouter rate limit or account quota exceeded."

        else:
            detail = "Failed to generate a response from OpenRouter."

        raise HTTPException(
            status_code=502,
            detail=detail,
        ) from exc


    return ChatResponse(
        response=response,
        session_id=request.session_id or str(uuid4()),
        model=settings.openrouter_model.strip(),
    )
