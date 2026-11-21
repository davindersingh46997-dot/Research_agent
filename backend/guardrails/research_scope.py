from functools import lru_cache
from pathlib import Path

from langchain_core.language_models.chat_models import BaseChatModel
from nemoguardrails import LLMRails, RailsConfig
from nemoguardrails.integrations.langchain.llm_adapter import LangChainLLMAdapter
from nemoguardrails.rails.llm.options import RailStatus, RailType

from backend.models.chat_model import create_chat_model


_CONFIG_DIRECTORY = Path(__file__).resolve().parent


@lru_cache
def _load_config() -> RailsConfig:
    return RailsConfig.from_path(str(_CONFIG_DIRECTORY))


def _build_guardrails(model: BaseChatModel) -> LLMRails:
    return LLMRails(_load_config(), llm=LangChainLLMAdapter(model))


@lru_cache
def _get_guardrails() -> LLMRails:
    return _build_guardrails(create_chat_model())


async def is_research_question(message: str) -> bool:
    result = await _get_guardrails().check_async(
        [{"role": "user", "content": message}],
        rail_types=[RailType.INPUT],
    )
    return result.status is RailStatus.PASSED and result.content == message
