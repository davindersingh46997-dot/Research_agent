export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: Source[];
  isLoading?: boolean;
}

export interface Source {
  title: string;
  url?: string;
  content?: string;
  relevance?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  ragEnabled: boolean;
  sources?: string[];
}

export interface RAGConfig {
  enabled: boolean;
  sourceType: 'documents' | 'web' | 'both';
  maxSources: number;
  relevanceThreshold: number;
  selectedDocuments: string[];
}

export interface VoiceConfig {
  enabled: boolean;
  language: string;
  rate: number;
  autoTranscribe: boolean;
  autoPlayResponse: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface ChatApiRequest {
  message: string;
  sessionId: string;
  ragConfig?: RAGConfig;
}

export interface ChatApiResponse {
  id: string;
  content: string;
  sources?: Source[];
  timestamp: Date;
}
