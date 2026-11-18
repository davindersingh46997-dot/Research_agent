import unittest
from unittest.mock import patch

from langchain_core.messages import AIMessage, BaseMessage, ToolMessage
from pydantic import SecretStr

from backend.core.config import Settings
from backend.models.chat_model import (
    chat_with_model,
    create_chat_model,
    stream_chat_with_model,
)


class FakeModel:
    def __init__(self, content: str):
        self.content = content
        self.messages: list[BaseMessage] | None = None

    def bind_tools(self, tools: list) -> "FakeModel":
        self.tools = tools
        return self

    def invoke(self, messages: list[BaseMessage]) -> AIMessage:
        self.messages = messages
        return AIMessage(content=self.content)


class FakeToolCallingModel(FakeModel):
    def __init__(self):
        super().__init__("The answer, based on the search results.")
        self.invocations = 0

    def invoke(self, messages: list[BaseMessage]) -> AIMessage:
        self.messages = messages
        self.invocations += 1
        if any(isinstance(message, ToolMessage) for message in messages):
            return AIMessage(content=self.content)
        return AIMessage(
            content="",
            tool_calls=[
                {
                    "name": "web_search",
                    "args": {"query": "latest research"},
                    "id": "search-1",
                    "type": "tool_call",
                }
            ],
        )


class ChatModelTests(unittest.TestCase):
    def test_create_chat_model_uses_openrouter_settings(self):
        settings = Settings(
            openrouter_api_key=SecretStr("test-key"),
            openrouter_model="provider/free-model",
        )
        with patch(
            "backend.models.chat_model.get_settings", return_value=settings
        ), patch("backend.models.chat_model.ChatOpenAI") as mock_chat_openai:
            result = create_chat_model()

        self.assertIs(result, mock_chat_openai.return_value)
        mock_chat_openai.assert_called_once_with(
            model="provider/free-model",
            api_key="test-key",
            base_url="https://openrouter.ai/api/v1",
        )

    def test_create_chat_model_requires_api_key(self):
        with patch(
            "backend.models.chat_model.get_settings",
            return_value=Settings(
                _env_file=None,
                openrouter_model="provider/free-model",
            ),
        ):
            with self.assertRaisesRegex(ValueError, "OPENROUTER_API_KEY"):
                create_chat_model()

    def test_chat_with_model_invokes_model_and_returns_text(self):
        model = FakeModel("The model response.")

        response = chat_with_model("Summarize this.", model=model)

        self.assertEqual(response, "The model response.")
        self.assertEqual(model.messages[-1].content, "Summarize this.")

    def test_stream_chat_with_model_yields_final_text(self):
        model = FakeModel("The completed response.")

        chunks = list(stream_chat_with_model("Stream this.", model=model))

        self.assertEqual(chunks, ["The completed response."])
        self.assertEqual(model.messages[-1].content, "Stream this.")

    def test_chat_with_model_searches_only_when_model_calls_search_tool(self):
        model = FakeToolCallingModel()
        search_results = '[{"title":"Result", "url":"https://example.com"}]'

        with patch(
            "backend.models.chat_model.search_with_tavily",
            return_value=search_results,
        ) as mock_search:
            response = chat_with_model("What is the latest research?", model=model)

        self.assertEqual(response, "The answer, based on the search results.")
        mock_search.assert_called_once_with("latest research")
        self.assertEqual(model.invocations, 2)
        self.assertTrue(
            any(
                isinstance(message, ToolMessage) and search_results in message.content
                for message in model.messages
            )
        )

    def test_stream_chat_with_model_uses_search_results_for_final_response(self):
        model = FakeToolCallingModel()
        search_results = '[{"title":"Result", "url":"https://example.com"}]'

        with patch(
            "backend.models.chat_model.search_with_tavily",
            return_value=search_results,
        ) as mock_search:
            response = list(
                stream_chat_with_model("What is the latest research?", model=model)
            )

        self.assertEqual(response, ["The answer, based on the search results."])
        mock_search.assert_called_once_with("latest research")
        self.assertTrue(
            any(
                isinstance(message, ToolMessage) and search_results in message.content
                for message in model.messages
            )
        )


if __name__ == "__main__":
    unittest.main()
