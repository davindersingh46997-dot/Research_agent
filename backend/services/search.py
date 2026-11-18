import json

from langchain_tavily import TavilySearch

from backend.core.config import get_settings


class SearchError(RuntimeError):
    """Raised when a configured web search cannot return usable results."""


def search_with_tavily(query: str, model: TavilySearch | None = None) -> str:
    if model is None:
        settings = get_settings()
        api_key = (
            settings.tavily_api_key.get_secret_value()
            if settings.tavily_api_key is not None
            else ""
        )
        if not api_key.strip():
            raise SearchError("TAVILY_API_KEY is not configured.")

        model = TavilySearch(
            tavily_api_key=api_key,
            max_results=5,
            topic="general",
            include_answer=False,
            include_raw_content="markdown",
            include_images=False,
            search_depth="basic",
        )

    result = model.invoke({"query": query})
    if isinstance(result, str):
        return result
    if not isinstance(result, dict):
        raise SearchError("Tavily returned an unsupported search result.")
    if "error" in result:
        raise SearchError("Tavily could not complete the search.")
    return json.dumps(result, ensure_ascii=False)