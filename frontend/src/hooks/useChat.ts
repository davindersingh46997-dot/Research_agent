import { useState, useCallback, useEffect, useRef } from 'react';
import { streamChatMessage } from '../services/chatApi';
import type { ChatActivity, ChatMessage } from '../types/chat';

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>(createId);
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState<ChatActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => () => requestController.current?.abort(), []);

  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text || requestController.current) return;

    setError(null);
    const controller = new AbortController();
    requestController.current = controller;

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    const assistantId = createId();

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);
    setLoading(true);
    setActivity('thinking');

    try {
      const data = await streamChatMessage(
        text,
        sessionId,
        (chunk) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: message.content + chunk }
                : message,
            ),
          );
        },
        controller.signal,
        setActivity,
        (sources) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, sources }
                : message,
            ),
          );
        },
      );

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: data.response,
                model: data.model,
                sources: data.sources || message.sources,
              }
            : message,
        ),
      );
      if (data.session_id) setSessionId(data.session_id);
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        setMessages((prev) =>
          prev.filter(
            (message) => message.id !== assistantId || message.content.length > 0,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.filter(
            (message) => message.id !== assistantId || message.content.length > 0,
          ),
        );
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to generate response from model.',
        );
      }
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setLoading(false);
        setActivity(null);
      }
    }
  }, [sessionId]);

  const clearChat = useCallback(() => {
    requestController.current?.abort();
    requestController.current = null;
    setMessages([]);
    setError(null);
    setLoading(false);
    setActivity(null);
    setSessionId(createId());
  }, []);

  const stopGeneration = useCallback(() => {
    requestController.current?.abort();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    sessionId,
    loading,
    activity,
    error,
    sendMessage,
    stopGeneration,
    clearChat,
    clearError,
  };
}
