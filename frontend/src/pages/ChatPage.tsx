import React, { useState, useEffect } from 'react';
import { Message, ChatSession, RAGConfig, VoiceConfig } from '@/types/index';
import { Header } from '@components/Header';
import { ChatHistory } from '@components/ChatHistory';
import { ChatWindow } from '@components/ChatWindow';
import { InputArea } from '@components/InputArea';
import { RAGOptions } from '@components/RAGOptions';
import { generateId } from '@utils/voice';
import { storageUtils } from '@utils/storage';
import { voiceApi } from '@utils/api';

export const ChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ragConfig, setRagConfig] = useState<RAGConfig>(
    storageUtils.getRAGConfig()
  );
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(
    storageUtils.getVoiceConfig()
  );

  // Load sessions on mount
  useEffect(() => {
    const savedSessions = storageUtils.getSessions();
    setSessions(savedSessions);

    const currentSessionData = storageUtils.getCurrentSession();
    if (currentSessionData) {
      setCurrentSession(currentSessionData);
      setMessages(currentSessionData.messages);
    }

    setVoiceEnabled(voiceConfig.enabled);
  }, []);

  // Save sessions to storage
  useEffect(() => {
    storageUtils.saveSessions(sessions);
  }, [sessions]);

  // Save current session to storage
  useEffect(() => {
    if (currentSession) {
      storageUtils.setCurrentSession(currentSession);
    }
  }, [currentSession]);

  // Save RAG config to storage
  useEffect(() => {
    storageUtils.setRAGConfig(ragConfig);
  }, [ragConfig]);

  // Save voice config to storage
  useEffect(() => {
    storageUtils.setVoiceConfig(voiceConfig);
  }, [voiceConfig]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: `Chat ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ragEnabled: ragConfig.enabled,
    };

    setSessions([newSession, ...sessions]);
    setCurrentSession(newSession);
    setMessages([]);
  };

  const selectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setMessages(session.messages);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    storageUtils.deleteSession(sessionId);

    if (currentSession?.id === sessionId) {
      if (sessions.length > 1) {
        const nextSession = sessions.find(s => s.id !== sessionId);
        if (nextSession) selectSession(nextSession.id);
      } else {
        setCurrentSession(null);
        setMessages([]);
      }
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!currentSession) {
      createNewChat();
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      content: messageText,
      role: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Add loading message
    const loadingMessage: Message = {
      id: generateId(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages([...updatedMessages, loadingMessage]);
    setIsLoading(true);

    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        id: generateId(),
        content: `This is a response to: "${messageText}"\n\nThe research agent is processing your query with ${ragConfig.enabled ? 'RAG enabled' : 'standard mode'}.`,
        role: 'assistant',
        timestamp: new Date(),
        sources: ragConfig.enabled
          ? [
              {
                title: 'Sample Research Paper',
                url: '#',
                relevance: 0.95,
              },
              {
                title: 'Documentation Source',
                url: '#',
                relevance: 0.87,
              },
            ]
          : undefined,
      };

      const finalMessages = updatedMessages.concat(assistantMessage);
      setMessages(finalMessages);

      // Update current session
      if (currentSession) {
        const updatedSession: ChatSession = {
          ...currentSession,
          messages: finalMessages,
          updatedAt: new Date(),
          ragEnabled: ragConfig.enabled,
        };
        setCurrentSession(updatedSession);

        // Update sessions list
        setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      const transcribedText = await voiceApi.transcribe(audioBlob);

      if (voiceConfig.autoPlayResponse && transcribedText) {
        await handleSendMessage(transcribedText);
        // Auto-play response if enabled
        if (voiceConfig.autoPlayResponse) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage?.role === 'assistant') {
            const audioBlob = await voiceApi.synthesize(lastMessage.content);
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play().catch(console.error);
          }
        }
      }
    } catch (error) {
      console.error('Voice message error:', error);
      alert('Failed to process voice message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    const newVoiceEnabled = !voiceEnabled;
    setVoiceEnabled(newVoiceEnabled);
    setVoiceConfig({
      ...voiceConfig,
      enabled: newVoiceEnabled,
    });
  };

  const handleRAGConfigChange = (newConfig: RAGConfig) => {
    setRagConfig(newConfig);
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        ragEnabled: newConfig.enabled,
      };
      setCurrentSession(updatedSession);
    }
  };

  return (
    <div className="flex h-screen bg-dark-900 text-dark-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="flex flex-col h-full">
          <ChatHistory
            sessions={sessions}
            currentSessionId={currentSession?.id || null}
            onSelectSession={selectSession}
            onNewChat={createNewChat}
            onDeleteSession={deleteSession}
          />
          <RAGOptions ragConfig={ragConfig} onConfigChange={handleRAGConfigChange} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          voiceEnabled={voiceEnabled}
          onVoiceToggle={handleVoiceToggle}
          sessionTitle={currentSession?.title || 'Research Agent'}
        />

        <ChatWindow messages={messages} isLoading={isLoading} />

        <InputArea
          onSendMessage={handleSendMessage}
          onVoiceMessage={handleVoiceMessage}
          isLoading={isLoading}
          voiceEnabled={voiceEnabled}
        />
      </div>
    </div>
  );
};
