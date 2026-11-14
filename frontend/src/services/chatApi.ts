import type { ChatRequest, ChatResponse } from '../types/chat';

const API_BASE = '/api/chat';

export async function sendChatMessage(
  message: string,
  sessionId?: string,
): Promise<ChatResponse> {
  const payload: ChatRequest = {
    message: message.trim(),
    session_id: sessionId,
  };

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail || `Chat request failed with status ${response.status}.`;
    throw new Error(detail);
  }

  return data as ChatResponse;
}

export async function checkChatHealth(): Promise<{ status: string; model: string; tokenConfigured: boolean }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error('Chat service is unavailable');
  }
  return response.json();
}
