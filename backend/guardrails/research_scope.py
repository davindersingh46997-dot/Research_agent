import json
from functools import lru_cache
from pathlib import Path

from langchain_core.language_models.chat_models import BaseChatModel
from nemoguardrails import LLMRails, RailsConfig
from nemoguardrails.integrations.langchain.llm_adapter import LangChainLLMAdapter
from nemoguardrails.rails.llm.options import RailStatus, RailType

_CONFIG_DIRECTORY = Path(__file__).resolve().parent
_SEARCH_CONTENT_CONFIG_DIRECTORY = _CONFIG_DIRECTORY / "search_content"
_SEARCH_CONTENT_CHUNK_SIZE = 6000
_SEARCH_CONTENT_CHUNK_STEP = 5600


def _build_guardrails(
    model: BaseChatModel, config_directory: Path = _CONFIG_DIRECTORY
) -> LLMRails:
    config = RailsConfig.from_path(str(config_directory))
    return LLMRails(config, llm=LangChainLLMAdapter(model))


@lru_cache
def _get_guardrail_model() -> BaseChatModel:
    from backend.models.chat_model import create_chat_model

    return create_chat_model()


@lru_cache
def _get_guardrails() -> LLMRails:
    return _build_guardrails(_get_guardrail_model())


@lru_cache
def _get_search_content_guardrails() -> LLMRails:
    return _build_guardrails(
        _get_guardrail_model(), _SEARCH_CONTENT_CONFIG_DIRECTORY
    )


async def is_research_question(message: str) -> bool:
    result = await _get_guardrails().check_async(
        [{"role": "user", "content": message}],
        rail_types=[RailType.INPUT],
    )
    return result.status is RailStatus.PASSED and result.content == message


async def is_search_content_safe(content: str) -> bool:
    guardrails = _get_search_content_guardrails()
    for chunk in _search_content_chunks(content):
        serialized_chunk = json.dumps(chunk, ensure_ascii=False)
        result = await guardrails.check_async(
            [{"role": "user", "content": serialized_chunk}],
            rail_types=[RailType.INPUT],
        )
        if result.status is not RailStatus.PASSED or result.content != serialized_chunk:
            return False
    return True


def is_search_content_safe_sync(content: str) -> bool:
    guardrails = _get_search_content_guardrails()
    for chunk in _search_content_chunks(content):
        serialized_chunk = json.dumps(chunk, ensure_ascii=False)
        result = guardrails.check(
            [{"role": "user", "content": serialized_chunk}],
            rail_types=[RailType.INPUT],
        )
        if result.status is not RailStatus.PASSED or result.content != serialized_chunk:
            return False
    return True


def _search_content_chunks(content: str) -> list[str]:
    if not content:
        return [content]
    return [
        content[start : start + _SEARCH_CONTENT_CHUNK_SIZE]
        for start in range(0, len(content), _SEARCH_CONTENT_CHUNK_STEP)
    ]
