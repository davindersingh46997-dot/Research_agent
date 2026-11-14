import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from openai import OpenAIError
from pydantic import SecretStr

from backend.main import app
from backend.core.config import Settings


class BackendChatTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.settings = Settings(
            openrouter_api_key=SecretStr("test-key"),
            openrouter_model="provider/free-model",
        )

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
            "backend.api.chat.chat_with_model",
            return_value="Hello from OpenRouter!",
        ) as mock_chat:
            response = self.client.post(
                "/api/chat",
                json={"message": "  Hello!  ", "session_id": "test-session-1"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "response": "Hello from OpenRouter!",
                "session_id": "test-session-1",
                "model": "provider/free-model",
            },
        )
        mock_chat.assert_called_once_with("Hello!")

    def test_chat_endpoint_generates_session_when_missing(self):
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.chat_with_model", return_value="A response."
        ):
            response = self.client.post("/api/chat", json={"message": "Hello"})

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["session_id"])

    def test_chat_endpoint_empty_message_returns_400(self):
        response = self.client.post("/api/chat", json={"message": "   "})
        self.assertEqual(response.status_code, 400)

    def test_chat_endpoint_reports_missing_configuration(self):
        unconfigured = Settings(_env_file=None)
        with patch(
            "backend.api.chat.get_settings", return_value=unconfigured
        ), patch("backend.api.chat.chat_with_model") as mock_chat:
            response = self.client.post("/api/chat", json={"message": "Hello"})

        self.assertEqual(response.status_code, 503)
        mock_chat.assert_not_called()

    def test_chat_endpoint_rejects_empty_api_key(self):
        blank_key = Settings(
            _env_file=None,
            openrouter_api_key=SecretStr("  "),
            openrouter_model="provider/free-model",
        )
        with patch(
            "backend.api.chat.get_settings", return_value=blank_key
        ), patch("backend.api.chat.chat_with_model") as mock_chat:
            response = self.client.post("/api/chat", json={"message": "Hello"})

        self.assertEqual(response.status_code, 503)
        mock_chat.assert_not_called()

    def test_chat_endpoint_explains_model_access_denial(self):
        provider_error = OpenAIError("model access denied")
        provider_error.status_code = 403
        with patch(
            "backend.api.chat.get_settings", return_value=self.settings
        ), patch(
            "backend.api.chat.chat_with_model", side_effect=provider_error
        ):
            response = self.client.post("/api/chat", json={"message": "Hello"})

        self.assertEqual(response.status_code, 502)
        self.assertIn("available for direct API applications", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
