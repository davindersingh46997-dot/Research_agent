import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from langchain_core.language_models.fake_chat_models import FakeListChatModel
from nemoguardrails import RailsConfig
from nemoguardrails.rails.llm.options import RailStatus, RailType

from backend.guardrails.research_scope import (
    _build_guardrails,
    is_research_question,
)


class ResearchScopeGuardrailTests(unittest.IsolatedAsyncioTestCase):
    async def test_question_passes_only_if_unchanged_and_not_blocked(self):
        message = "Summarize recent research about quantum computing."
        rails = SimpleNamespace(
            check_async=AsyncMock(
                return_value=SimpleNamespace(
                    status=RailStatus.PASSED,
                    content=message,
                )
            )
        )
        with patch(
            "backend.guardrails.research_scope._get_guardrails",
            return_value=rails,
        ):
            self.assertTrue(await is_research_question(message))

        rails.check_async.assert_awaited_once_with(
            [{"role": "user", "content": message}],
            rail_types=[RailType.INPUT],
        )

    async def test_blocked_or_modified_questions_are_rejected(self):
        message = "What should I do about my relationship?"
        results = [
            SimpleNamespace(status=RailStatus.BLOCKED, content=""),
            SimpleNamespace(status=RailStatus.MODIFIED, content="Changed input"),
        ]
        for result in results:
            with self.subTest(status=result.status):
                rails = SimpleNamespace(
                    check_async=AsyncMock(return_value=result)
                )
                with patch(
                    "backend.guardrails.research_scope._get_guardrails",
                    return_value=rails,
                ):
                    self.assertFalse(await is_research_question(message))

    def test_guardrails_config_declares_self_check_input_rail(self):
        config = RailsConfig.from_path(
            str(Path(__file__).resolve().parents[1] / "guardrails")
        )

        self.assertIn("self check input", config.rails.input.flows)
        self.assertEqual(config.prompts[0].task, "self_check_input")

    async def test_input_rail_runs_with_the_chat_model_adapter(self):
        rails = _build_guardrails(FakeListChatModel(responses=["No"]))
        message = "Summarize recent research about quantum computing."

        result = await rails.check_async(
            [{"role": "user", "content": message}],
            rail_types=[RailType.INPUT],
        )

        self.assertIs(result.status, RailStatus.PASSED)


if __name__ == "__main__":
    unittest.main()
