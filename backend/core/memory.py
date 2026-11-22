from collections import deque
from threading import RLock

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage


class ShortTermMemory:
    def __init__(self, max_messages: int = 5) -> None:
        if max_messages < 1:
            raise ValueError("max_messages must be at least 1.")
        self._max_messages = max_messages
        self._sessions: dict[str, deque[BaseMessage]] = {}
        self._lock = RLock()

    def get_messages(self, session_id: str) -> list[BaseMessage]:
        with self._lock:
            return list(self._sessions.get(session_id, ()))

    def add_exchange(
        self, session_id: str, user_message: str, assistant_message: str
    ) -> None:
        with self._lock:
            messages = self._sessions.setdefault(
                session_id, deque(maxlen=self._max_messages)
            )
            messages.extend(
                (HumanMessage(content=user_message), AIMessage(content=assistant_message))
            )

    def clear(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)
