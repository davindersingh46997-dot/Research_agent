import json
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from nemoguardrails.exceptions import LLMCallException
from openai import OpenAIError
from pydantic import SecretStr

from backend.main import app
from backend.core.config import Settings
from backend.core.memory import ShortTermMemory
from backend.models.chat_model import ChatActivity
from backend.services.search import SearchError, SearchSafetyError


class BackendChatTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.settings = Settings(
            _env_file=None,
            openrouter_api_key=SecretStr("test-key"),
            openrouter_model="provider/free-model",
            tavily_api_key=None,
        )

    @staticmethod
    def _events(response):
        return [
            json.loads(line.removeprefix("data: ").strip())
            for line in response.text.splitlines()
            if line.startswith("data: ")
        ]

    @staticmethod
    async def _stream_events(events):
        for event in events:
            yield event

    @staticmethod
    async def _stream_error(error):
        raise error
        yield ""

    def test_health_check_endpoint(self):
        with patch("backend.api.chat.get_settings", return_value=self.settings):
            response = self.client.get("/api/chat/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "status": "healthy",
                "model": "provider/free-model",
                "tokenConfigured": True,
                "searchConfigured": False,
            },
        )

    def test_health_check_endpoint_with_tavily(self):
        settings_with_tavily = Settings(
            openrouter_api_key=SecretStr("test-key"),
            openrouter_model="provider/free-model",
            tavily_api_key=SecretStr("tavily-key"),
        )
        with patch("backend.api.chat.get_settings", return_value=settings_with_tavily):
            response = self.client.get("/api/chat/health")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["searchConfigured"])

    def test_chat_endpoint_returns_model_response_and_session(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            return_value=self._stream_events(["Hello ", "from OpenRouter!"]),
        ) as mock_stream:
            response = self.client.post(
                "/api/chat",
                json={"message": "  Hello!  ", "session_id": "test-session-1"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers["content-type"].startswith("text/event-stream"))
        events = self._events(response)
        self.assertEqual(
            events,
            [
                {"type": "chunk", "content": "Hello "},
                {"type": "chunk", "content": "from OpenRouter!"},
                {
                    "type": "done",
                    "session_id": "test-session-1",
                    "model": "provider/free-model",
                },
            ],
        )
        mock_stream.assert_called_once()

    def test_chat_endpoint_generates_session_when_missing(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            return_value=self._stream_events(["A response."]),
        ):
            response = self.client.post("/api/chat", json={"message": "Hello"})

        self.assertEqual(response.status_code, 200)
        completion = self._events(response)[-1]
        self.assertEqual(completion["type"], "done")
        self.assertTrue(completion["session_id"])

    def test_chat_endpoint_reuses_session_memory(self):
        memory = ShortTermMemory()
        observed_histories = []

        def stream_with_history(message, *, model, history):
            _ = message, model
            observed_histories.append(list(history))
            return self._stream_events([f"Reply {len(observed_histories)}"])

        with patch(
            "backend.api.chat._chat_memory", memory
        ), patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            side_effect=stream_with_history,
        ):
            for prompt in ("First question", "Follow-up"):
                response = self.client.post(
                    "/api/chat",
                    json={"message": prompt, "session_id": "memory-session"},
                )
                self.assertEqual(response.status_code, 200)

        self.assertEqual(observed_histories[0], [])
        self.assertEqual(
            observed_histories[1][0].content,
            "First question",
        )
        self.assertEqual(observed_histories[1][1].content, "Reply 1")
        self.assertEqual(
            memory.get_messages("memory-session")[-2].content, "Follow-up"
        )

    def test_chat_endpoint_streams_search_activity(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            return_value=self._stream_events(
                [
                    ChatActivity("planning"),
                    ChatActivity("searching"),
                    "Found it.",
                ]
            ),
        ):
            response = self.client.post(
                "/api/chat", json={"message": "What is happening today?"}
            )

        events = self._events(response)
        self.assertEqual(events[0], {"type": "activity", "activity": "planning"})
        self.assertEqual(events[1], {"type": "activity", "activity": "searching"})
        self.assertEqual(events[2], {"type": "chunk", "content": "Found it."})
        self.assertEqual(events[-1]["type"], "done")
        self.assertTrue(events[-1]["session_id"])
        self.assertEqual(events[-1]["model"], "provider/free-model")

    def test_chat_endpoint_rejects_out_of_scope_question(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model"
        ) as mock_create_model, patch(
            "backend.api.chat.is_research_question", return_value=False
        ), patch(
            "backend.api.chat.stream_chat_with_model"
        ) as mock_stream:
            response = self.client.post(
                "/api/chat", json={"message": "What should I do about my relationship?"}
            )

        self.assertEqual(response.status_code, 422)
        self.assertIn("research and current-affairs", response.json()["detail"])
        mock_create_model.assert_not_called()
        mock_stream.assert_not_called()

    def test_chat_endpoint_fails_closed_when_guardrail_is_unavailable(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.is_research_question",
            side_effect=LLMCallException("provider unavailable"),
        ), patch(
            "backend.api.chat.create_chat_model"
        ) as mock_create_model:
            response = self.client.post(
                "/api/chat", json={"message": "What is new in climate research?"}
            )

        self.assertEqual(response.status_code, 503)
        self.assertIn("Unable to validate", response.json()["detail"])
        mock_create_model.assert_not_called()

    def test_chat_endpoint_empty_message_returns_400(self):
        response = self.client.post("/api/chat", json={"message": "   "})
        self.assertEqual(response.status_code, 400)

    def test_chat_endpoint_reports_missing_configuration(self):
        unconfigured = Settings(_env_file=None)
        with patch(
            "backend.api.chat.get_settings", return_value=unconfigured
        ), patch("backend.api.chat.create_chat_model") as mock_create_model:
            response = self.client.post("/api/chat", json={"message": "Hello"})

        self.assertEqual(response.status_code, 503)
        mock_create_model.assert_not_called()

    def test_chat_endpoint_rejects_empty_api_key(self):
        blank_key = Settings(
            _env_file=None,
            openrouter_api_key=SecretStr("  "),
            openrouter_model="provider/free-model",
        )
        with patch(
            "backend.api.chat.get_settings", return_value=blank_key
        ), patch("backend.api.chat.create_chat_model") as mock_create_model:
            response = self.client.post("/api/chat", json={"message": "Hello"})

        self.assertEqual(response.status_code, 503)
        mock_create_model.assert_not_called()

    def test_chat_endpoint_explains_model_access_denial(self):
        provider_error = OpenAIError("model access denied")
        provider_error.status_code = 403
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            return_value=self._stream_error(provider_error),
        ):
            response = self.client.post("/api/chat", json={"message": "Hello"})

        self.assertEqual(response.status_code, 200)
        error_event = self._events(response)[0]
        self.assertEqual(error_event["type"], "error")
        self.assertIn("agentic harnesses", error_event["detail"])

    def test_chat_endpoint_reports_web_search_failure(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            return_value=self._stream_error(SearchError("Tavily unavailable")),
        ):
            response = self.client.post("/api/chat", json={"message": "Latest news?"})

        self.assertEqual(response.status_code, 200)
        error_event = self._events(response)[0]
        self.assertEqual(error_event["type"], "error")
        self.assertIn("TAVILY_API_KEY", error_event["detail"])

    def test_chat_endpoint_reports_unverified_search_content(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            return_value=self._stream_error(
                SearchSafetyError("Prompt injection detected")
            ),
        ):
            response = self.client.post(
                "/api/chat", json={"message": "Summarize recent climate research."}
            )

        error_event = self._events(response)[0]
        self.assertEqual(error_event["type"], "error")
        self.assertIn("could not be verified", error_event["detail"])

    def test_chat_endpoint_fails_closed_when_search_guardrail_is_unavailable(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            return_value=self._stream_error(
                LLMCallException("Search content verification unavailable")
            ),
        ):
            response = self.client.post(
                "/api/chat", json={"message": "Summarize recent climate research."}
            )

        error_event = self._events(response)[0]
        self.assertEqual(error_event["type"], "error")
        self.assertIn("Unable to verify web search results", error_event["detail"])

    def test_chat_endpoint_reports_stream_failure_after_partial_content(self):
        class BrokenStream:
            async def __aiter__(self):
                yield "partial response"
                raise ValueError("invalid provider chunk")

        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.stream_chat_with_model", return_value=BrokenStream()
        ):
            response = self.client.post("/api/chat", json={"message": "Hello"})

        events = self._events(response)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(events[0], {"type": "chunk", "content": "partial response"})
        self.assertEqual(events[1]["type"], "error")
        self.assertNotIn("done", [event["type"] for event in events])

    def test_chat_endpoint_reports_unexpected_stream_exception(self):
        class CrashingStream:
            async def __aiter__(self):
                raise RuntimeError("unexpected network disruption")
                yield ""

        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.is_research_question", return_value=True
        ), patch(
            "backend.api.chat.stream_chat_with_model", return_value=CrashingStream()
        ):
            response = self.client.post("/api/chat", json={"message": "Hello"})

        events = self._events(response)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(events[0]["type"], "error")
        self.assertIn("unexpected error", events[0]["detail"].lower())

    def test_clear_session_endpoint(self):
        response = self.client.delete("/api/chat/sessions/test-session-id")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"success": True, "session_id": "test-session-id"},
        )

    def test_cors_preflight_headers(self):
        response = self.client.options(
            "/api/chat",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access-control-allow-origin", response.headers)


if __name__ == "__main__":
    unittest.main()
