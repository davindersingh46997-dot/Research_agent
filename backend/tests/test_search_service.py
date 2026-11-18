import json
import unittest
from unittest.mock import patch

from pydantic import SecretStr

from backend.core.config import Settings
from backend.services.search import SearchError, search_with_tavily


class SearchServiceTests(unittest.TestCase):
    def test_search_uses_configured_key_and_returns_search_results(self):
        settings = Settings(
            _env_file=None,
            tavily_api_key=SecretStr("tavily-test-key"),
        )
        results = {"results": [{"title": "Result", "url": "https://example.com"}]}

        with patch(
            "backend.services.search.get_settings", return_value=settings
        ), patch("backend.services.search.TavilySearch") as mock_tavily:
            mock_tavily.return_value.invoke.return_value = results

            response = search_with_tavily("test query")

        self.assertEqual(json.loads(response), results)
        mock_tavily.assert_called_once_with(
            tavily_api_key="tavily-test-key",
            max_results=5,
            topic="general",
            include_answer=False,
            include_raw_content="markdown",
            include_images=False,
            search_depth="basic",
        )
        mock_tavily.return_value.invoke.assert_called_once_with(
            {"query": "test query"}
        )

    def test_search_requires_configured_key(self):
        with patch(
            "backend.services.search.get_settings",
            return_value=Settings(_env_file=None),
        ):
            with self.assertRaisesRegex(SearchError, "TAVILY_API_KEY"):
                search_with_tavily("test query")


if __name__ == "__main__":
    unittest.main()
