from collections.abc import Iterator
from typing import Protocol

from langchain_openai import ChatOpenAI

from backend.core.config import get_settings


class _ChatModel(Protocol):
    def invoke(self, prompt: str) -> object: ...


class _StreamingChatModel(Protocol):
    def stream(self, prompt: str) -> Iterator[object]: ...


def create_chat_model() -> ChatOpenAI:
    settings = get_settings()
    if (
        settings.openrouter_api_key is None
        or not settings.openrouter_api_key.get_secret_value().strip()
    ):
        raise ValueError("OPENROUTER_API_KEY is not configured.")
    model_name = (settings.openrouter_model or "").strip()
    if not model_name:
        raise ValueError("OPENROUTER_MODEL is not configured.")

    return ChatOpenAI(
        model=model_name,
        api_key=settings.openrouter_api_key.get_secret_value(),
        base_url="https://openrouter.ai/api/v1",
    )


def chat_with_model(prompt: str, model: _ChatModel | None = None) -> str:
    chat_model = model if model is not None else create_chat_model()
    result = chat_model.invoke(prompt)
    response = _get_text(result)
    if not isinstance(response, str):
        raise TypeError("The chat model returned a non-text response.")
    return response


def stream_chat_with_model(
    prompt: str, model: _StreamingChatModel | None = None
) -> Iterator[str]:
    chat_model = model if model is not None else create_chat_model()
    for chunk in chat_model.stream(prompt):
        text = _get_text(chunk)
        if not isinstance(text, str):
            raise TypeError("The chat model returned a non-text stream chunk.")
        if text:
            yield text


def _get_text(result: object) -> object:
    return result if isinstance(result, str) else getattr(result, "content", None)