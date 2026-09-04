import React from 'react';
import { ChatSession } from '@/types/index';
import { Trash2, Plus, MessageSquare } from 'lucide-react';
import { truncateText } from '@utils/voice';

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  return (
    <div className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-dark-400 text-sm">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
            <p>No chat history yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group rounded-lg transition-colors ${
                  currentSessionId === session.id
                    ? 'bg-primary-900/30 border border-primary-700'
                    : 'hover:bg-dark-700'
                }`}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="w-full flex-1 text-left px-3 py-2 text-sm text-dark-100 hover:text-dark-50"
                >
                  <div className="font-medium truncate">
                    {truncateText(session.title, 25)}
                  </div>
                  <div className="text-xs text-dark-500 mt-1">
                    {session.messages.length} messages
                  </div>
                </button>
                <div className="flex items-center gap-2 px-3 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {session.ragEnabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-900/50 border border-blue-700/50 text-xs text-blue-400">
                      RAG
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this chat?')) {
                        onDeleteSession(session.id);
                      }
                    }}
                    className="ml-auto p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-red-400 transition-colors"
                    title="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
