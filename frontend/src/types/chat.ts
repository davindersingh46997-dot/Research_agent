export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id?: string;
  model: string;
}

export type ChatStreamEvent =
  | { type: 'chunk'; content: string }
  | { type: 'done'; session_id: string; model: string }
  | { type: 'error'; detail: string };
