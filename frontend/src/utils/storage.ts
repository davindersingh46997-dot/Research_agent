import { ChatSession, Message, RAGConfig, VoiceConfig } from '@/types/index';

const STORAGE_KEYS = {
  SESSIONS: 'research_agent_sessions',
  CURRENT_SESSION: 'research_agent_current_session',
  RAG_CONFIG: 'research_agent_rag_config',
  VOICE_CONFIG: 'research_agent_voice_config',
};

export const storageUtils = {
  // Sessions
  getSessions: (): ChatSession[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading sessions:', error);
      return [];
    }
  },

  saveSessions: (sessions: ChatSession[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  },

  getCurrentSession: (): ChatSession | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading current session:', error);
      return null;
    }
  },

  setCurrentSession: (session: ChatSession | null): void => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      }
    } catch (error) {
      console.error('Error setting current session:', error);
    }
  },

  addMessageToSession: (sessionId: string, message: Message): void => {
    try {
      const sessions = storageUtils.getSessions();
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        session.messages.push(message);
        session.updatedAt = new Date();
        storageUtils.saveSessions(sessions);
      }
    } catch (error) {
      console.error('Error adding message to session:', error);
    }
  },

  deleteSession: (sessionId: string): void => {
    try {
      const sessions = storageUtils.getSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      storageUtils.saveSessions(filtered);

      const currentSession = storageUtils.getCurrentSession();
      if (currentSession?.id === sessionId) {
        storageUtils.setCurrentSession(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  },

  // RAG Config
  getRAGConfig: (): RAGConfig => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RAG_CONFIG);
      return data
        ? JSON.parse(data)
        : {
            enabled: false,
            sourceType: 'documents' as const,
            maxSources: 5,
            relevanceThreshold: 0.5,
            selectedDocuments: [],
          };
    } catch (error) {
      console.error('Error reading RAG config:', error);
      return {
        enabled: false,
        sourceType: 'documents' as const,
        maxSources: 5,
        relevanceThreshold: 0.5,
        selectedDocuments: [],
      };
    }
  },

  setRAGConfig: (config: RAGConfig): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.RAG_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving RAG config:', error);
    }
  },

  // Voice Config
  getVoiceConfig: (): VoiceConfig => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOICE_CONFIG);
      return data
        ? JSON.parse(data)
        : {
            enabled: false,
            language: 'en-US',
            rate: 1,
            autoTranscribe: true,
            autoPlayResponse: false,
          };
    } catch (error) {
      console.error('Error reading voice config:', error);
      return {
        enabled: false,
        language: 'en-US',
        rate: 1,
        autoTranscribe: true,
        autoPlayResponse: false,
      };
    }
  },

  setVoiceConfig: (config: VoiceConfig): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOICE_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving voice config:', error);
    }
  },

  // Clear all
  clearAll: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
