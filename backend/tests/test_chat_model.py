import asyncio
import unittest
from unittest.mock import patch

from langchain_core.messages import AIMessage, BaseMessage, ToolMessage
from langchain_core.language_models.fake_chat_models import FakeListChatModel
from langchain_core.runnables import RunnableConfig
from pydantic import SecretStr

from backend.core.config import Settings
from backend.models.chat_model import (
    ChatActivity,
    _requires_planning,
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

    async def ainvoke(
        self, messages: list[BaseMessage], config: RunnableConfig | None = None
    ) -> AIMessage:
        _ = config
        return self.invoke(messages)


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

        chunks = asyncio.run(_collect_stream("Stream this.", model=model))

        self.assertEqual(chunks, ["The completed response."])
        self.assertEqual(model.messages[-1].content, "Stream this.")

    def test_stream_chat_with_model_yields_incremental_chunks(self):
        class StreamingFakeModel(FakeListChatModel):
            def bind_tools(self, tools):
                _ = tools
                return self

        model = StreamingFakeModel(responses=["Chunked response."])

        events = asyncio.run(_collect_stream("What is LangGraph?", model=model))

        self.assertEqual(events, list("Chunked response."))

    def test_planning_is_skipped_for_simple_requests(self):
        self.assertFalse(_requires_planning("What is LangGraph?"))

    def test_planning_is_enabled_for_complex_requests(self):
        self.assertTrue(_requires_planning("Compare two database designs."))
        self.assertTrue(
            _requires_planning("Build a small API and write tests for its routes.")
        )

    def test_stream_chat_with_model_emits_planning_state_without_plan_text(self):
        class FakePlanningModel(FakeModel):
            def __init__(self):
                super().__init__("The completed response.")
                self.invocations: list[list[BaseMessage]] = []

            def invoke(self, messages: list[BaseMessage]) -> AIMessage:
                self.invocations.append(messages)
                if len(messages) == 2:
                    return AIMessage(content="1. Compare options\n2. Recommend one")
                return AIMessage(content=self.content)

        model = FakePlanningModel()
        events = asyncio.run(
            _collect_stream(
                "Compare two database designs and recommend the best fit.",
                model=model,
            )
        )

        self.assertEqual(
            events, [ChatActivity("planning"), "The completed response."]
        )
        self.assertEqual(len(model.invocations), 2)
        self.assertIn("Compare options", model.invocations[-1][1].content)

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
            response = asyncio.run(
                _collect_stream("What is the latest research?", model=model)
            )

        self.assertEqual(
            response,
            [
                ChatActivity("searching"),
                ChatActivity("thinking"),
                "The answer, based on the search results.",
            ],
        )
        mock_search.assert_called_once_with("latest research")
        self.assertTrue(
            any(
                isinstance(message, ToolMessage) and search_results in message.content
                for message in model.messages
            )
        )

    def test_stream_cancellation_cancels_the_model_call(self):
        class SlowModel(FakeModel):
            def __init__(self):
                super().__init__("The answer.")
                self.started = asyncio.Event()
                self.cancelled = False

            async def ainvoke(
                self,
                messages: list[BaseMessage],
                config: RunnableConfig | None = None,
            ) -> AIMessage:
                _ = messages, config
                self.started.set()
                try:
                    await asyncio.Future()
                except asyncio.CancelledError:
                    self.cancelled = True
                    raise

        async def run():
            model = SlowModel()

            async def consume():
                async for _ in stream_chat_with_model(
                    "What is LangGraph?", model=model
                ):
                    pass

            task = asyncio.create_task(consume())
            await asyncio.wait_for(model.started.wait(), timeout=5)
            task.cancel()
            with self.assertRaises(asyncio.CancelledError):
                await task
            self.assertTrue(model.cancelled)

        asyncio.run(run())


async def _collect_stream(prompt: str, model: FakeModel):
    return [event async for event in stream_chat_with_model(prompt, model=model)]


if __name__ == "__main__":
    unittest.main()
