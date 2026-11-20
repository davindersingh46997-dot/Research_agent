import json
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from openai import OpenAIError
from pydantic import SecretStr

from backend.main import app
from backend.core.config import Settings
from backend.models.chat_model import ChatActivity
from backend.services.search import SearchError


class BackendChatTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.settings = Settings(
            openrouter_api_key=SecretStr("test-key"),
            openrouter_model="provider/free-model",
        )

    @staticmethod
    def _events(response):
        return [
            json.loads(line.removeprefix("data: ").strip())
            for line in response.text.splitlines()
            if line.startswith("data: ")
        ]

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
            },
        )

    def test_chat_endpoint_returns_model_response_and_session(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            return_value=iter(["Hello ", "from OpenRouter!"]),
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
            "backend.api.chat.stream_chat_with_model", return_value=iter(["A response."])
        ):
            response = self.client.post("/api/chat", json={"message": "Hello"})

        self.assertEqual(response.status_code, 200)
        completion = self._events(response)[-1]
        self.assertEqual(completion["type"], "done")
        self.assertTrue(completion["session_id"])

    def test_chat_endpoint_streams_search_activity(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.stream_chat_with_model",
            return_value=iter([ChatActivity("searching"), "Found it."]),
        ):
            response = self.client.post(
                "/api/chat", json={"message": "What is happening today?"}
            )

        events = self._events(response)
        self.assertEqual(events[0], {"type": "activity", "activity": "searching"})
        self.assertEqual(events[1], {"type": "chunk", "content": "Found it."})
        self.assertEqual(events[-1]["type"], "done")
        self.assertTrue(events[-1]["session_id"])
        self.assertEqual(events[-1]["model"], "provider/free-model")

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
            "backend.api.chat.stream_chat_with_model", side_effect=provider_error
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
            "backend.api.chat.stream_chat_with_model",
            side_effect=SearchError("Tavily unavailable"),
        ):
            response = self.client.post("/api/chat", json={"message": "Latest news?"})

        self.assertEqual(response.status_code, 200)
        error_event = self._events(response)[0]
        self.assertEqual(error_event["type"], "error")
        self.assertIn("TAVILY_API_KEY", error_event["detail"])

    def test_chat_endpoint_reports_stream_failure_after_partial_content(self):
        class BrokenStream:
            def __iter__(self):
                yield "partial response"
                raise ValueError("invalid provider chunk")

        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.create_chat_model", return_value=object()
        ), patch(
            "backend.api.chat.stream_chat_with_model", return_value=BrokenStream()
        ):
            response = self.client.post("/api/chat", json={"message": "Hello"})

        events = self._events(response)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(events[0], {"type": "chunk", "content": "partial response"})
        self.assertEqual(events[1]["type"], "error")
        self.assertNotIn("done", [event["type"] for event in events])


if __name__ == "__main__":
    unittest.main()
