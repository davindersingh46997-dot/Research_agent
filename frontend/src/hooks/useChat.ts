import { useState, useCallback } from 'react';
import { sendChatMessage } from '../services/chatApi';
import type { ChatMessage } from '../types/chat';

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>(createId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text || loading) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const data = await sendChatMessage(text, sessionId);

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        model: data.model,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to generate response from model.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setSessionId(createId());
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    sessionId,
    loading,
    error,
    sendMessage,
    clearChat,
    clearError,
  };
}
