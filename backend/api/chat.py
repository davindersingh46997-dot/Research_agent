import logging
from collections.abc import AsyncIterator
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from nemoguardrails.exceptions import LLMCallException
from openai import OpenAIError
from pydantic import BaseModel

from backend.core.config import get_settings
from backend.guardrails.research_scope import is_research_question
from backend.models.chat_model import (
    ChatActivity,
    create_chat_model,
    stream_chat_with_model,
)
from backend.services.search import SearchError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatStreamChunk(BaseModel):
    type: Literal["chunk"] = "chunk"
    content: str


class ChatStreamActivity(BaseModel):
    type: Literal["activity"] = "activity"
    activity: Literal["planning", "searching", "thinking"]


class ChatStreamComplete(BaseModel):
    type: Literal["done"] = "done"
    session_id: str
    model: str


class ChatStreamError(BaseModel):
    type: Literal["error"] = "error"
    detail: str


def _encode_event(event: BaseModel) -> str:
    return f"data: {event.model_dump_json()}\n\n"


def _openrouter_error_detail(exc: OpenAIError) -> str:
    status_code = getattr(exc, "status_code", None)
    if status_code == 401:
        return "Invalid or expired OpenRouter API key."
    if status_code == 403:
        return (
            "OpenRouter denied this request. Check model permissions and "
            "account restrictions; some free models are limited to approved "
            "agentic harnesses."
        )
    if status_code == 404:
        return "The configured model was not found."
    if status_code == 429:
        return "OpenRouter rate limit or account quota exceeded."
    return "Failed to generate a response from OpenRouter."


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


@router.post("")
async def send_chat_message(request: ChatRequest) -> StreamingResponse:
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
        is_allowed = await is_research_question(message)
    except LLMCallException as exc:
        logger.warning("NeMo input guardrail failed. Provider status=%s", exc.status)
        raise HTTPException(
            status_code=503,
            detail="Unable to validate this message right now. Please try again later.",
        ) from exc

    if not is_allowed:
        raise HTTPException(
            status_code=422,
            detail=(
                "Only research and current-affairs questions are supported. "
                "Personal or unrelated requests are not allowed."
            ),
        )

    chat_model = create_chat_model()
    session_id = request.session_id or str(uuid4())
    model_name = settings.openrouter_model.strip()

    async def stream_response() -> AsyncIterator[str]:
        try:
            async for event in stream_chat_with_model(message, model=chat_model):
                if isinstance(event, ChatActivity):
                    yield _encode_event(
                        ChatStreamActivity(activity=event.activity)
                    )
                else:
                    yield _encode_event(ChatStreamChunk(content=event))
        except OpenAIError as exc:
            status_code = getattr(exc, "status_code", None)
            logger.warning(
                "OpenRouter streaming request failed. Type=%s, Status=%s",
                type(exc).__name__,
                status_code,
            )
            # HTTP status cannot be changed after streaming headers are sent.
            yield _encode_event(ChatStreamError(detail=_openrouter_error_detail(exc)))
            return
        except SearchError as exc:
            logger.warning("Tavily search failed: %s", exc)
            yield _encode_event(
                ChatStreamError(
                    detail="Web search failed. Check TAVILY_API_KEY and try again."
                )
            )
            return
        except (TypeError, ValueError) as exc:
            logger.warning(
                "OpenRouter returned an invalid stream. Type=%s",
                type(exc).__name__,
            )
            yield _encode_event(
                ChatStreamError(
                    detail="OpenRouter returned an invalid response. Check the configured model and try again."
                )
            )
            return

        yield _encode_event(
            ChatStreamComplete(session_id=session_id, model=model_name)
        )

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
