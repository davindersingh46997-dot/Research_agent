export interface SourceItem {
  title: string;
  url: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  sources?: SourceItem[];
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id?: string;
  model: string;
  sources?: SourceItem[];
}

export type ChatActivity = 'planning' | 'searching' | 'thinking';

export type ChatStreamEvent =
  | { type: 'chunk'; content: string }
  | { type: 'activity'; activity: ChatActivity }
  | { type: 'sources'; sources: SourceItem[] }
  | { type: 'done'; session_id: string; model: string }
  | { type: 'error'; detail: string };

export interface HealthStatus {
  status: string;
  model: string;
  tokenConfigured: boolean;
  searchConfigured?: boolean;
}
