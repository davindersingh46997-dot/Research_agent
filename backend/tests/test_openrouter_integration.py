import json
import os
import unittest

from fastapi.testclient import TestClient

from backend.core.config import get_settings
from backend.main import app


@unittest.skipUnless(
    os.getenv("RUN_OPENROUTER_INTEGRATION_TESTS") == "1",
    "Set RUN_OPENROUTER_INTEGRATION_TESTS=1 to call OpenRouter.",
)
class OpenRouterIntegrationTests(unittest.TestCase):
    def test_chat_endpoint_returns_a_live_model_response(self):
        response = TestClient(app).post(
            "/api/chat",
            json={
                "message": "Reply with exactly the word OPENROUTER_OK.",
                "session_id": "openrouter-integration-test",
            },
        )

        self.assertEqual(response.status_code, 200, response.text)
        events = [
            json.loads(line.removeprefix("data: ").strip())
            for line in response.text.splitlines()
            if line.startswith("data: ")
        ]
        chunks = "".join(
            event["content"] for event in events if event["type"] == "chunk"
        )
        completion = next(event for event in events if event["type"] == "done")
        self.assertTrue(chunks.strip())
        self.assertEqual(completion["model"], get_settings().openrouter_model)


if __name__ == "__main__":
    unittest.main()
