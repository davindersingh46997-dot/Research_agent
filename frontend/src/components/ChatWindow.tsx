import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/index';
import { MessageItem } from './MessageItem';
import { Sparkles } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-dark-900 scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-dark-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-900/30 mb-4">
                <Sparkles size={32} className="text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-dark-100 mb-2">
                Welcome to Research Agent
              </h2>
              <p className="text-dark-400 max-w-md mb-8">
                Start a new research session by asking a question. Use voice input for hands-free research, enable RAG to reference documents, or browse through your chat history.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                  <h3 className="font-semibold text-primary-400 mb-2">💬 Chat</h3>
                  <p className="text-sm text-dark-400">Ask research questions and get AI-powered insights</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                  <h3 className="font-semibold text-primary-400 mb-2">🎤 Voice</h3>
                  <p className="text-sm text-dark-400">Use voice input for natural conversation</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                  <h3 className="font-semibold text-primary-400 mb-2">📚 RAG</h3>
                  <p className="text-sm text-dark-400">Ground responses in your documents</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold bg-dark-700 text-primary-400">
                    AI
                  </div>
                  <div className="rounded-lg px-4 py-3 bg-dark-700 text-dark-100 rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={endOfMessagesRef} />
          </>
        )}
      </div>
    </div>
  );
};
