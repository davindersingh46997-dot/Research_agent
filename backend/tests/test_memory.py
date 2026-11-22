import unittest

from langchain_core.messages import AIMessage, HumanMessage

from backend.core.memory import ShortTermMemory


class ShortTermMemoryTests(unittest.TestCase):
    def test_retains_only_the_last_five_messages_per_session(self):
        memory = ShortTermMemory()

        for index in range(3):
            memory.add_exchange("session-1", f"Question {index}", f"Answer {index}")

        messages = memory.get_messages("session-1")

        self.assertEqual(len(messages), 5)
        self.assertEqual(
            messages,
            [
                AIMessage(content="Answer 0"),
                HumanMessage(content="Question 1"),
                AIMessage(content="Answer 1"),
                HumanMessage(content="Question 2"),
                AIMessage(content="Answer 2"),
            ],
        )
        self.assertEqual(memory.get_messages("session-2"), [])

    def test_rejects_non_positive_message_limit(self):
        with self.assertRaisesRegex(ValueError, "at least 1"):
            ShortTermMemory(max_messages=0)


if __name__ == "__main__":
    unittest.main()
