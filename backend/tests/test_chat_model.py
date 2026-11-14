import unittest
from unittest.mock import patch

from pydantic import SecretStr

from backend.core.config import Settings
from backend.models.chat_model import chat_with_model, create_chat_model


class FakeResult:
    def __init__(self, content: str):
        self.content = content


class FakeModel:
    def __init__(self, content: str):
        self.content = content
        self.prompt = None

    def invoke(self, prompt: str) -> FakeResult:
        self.prompt = prompt
        return FakeResult(self.content)


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
        self.assertEqual(model.prompt, "Summarize this.")


if __name__ == "__main__":
    unittest.main()
