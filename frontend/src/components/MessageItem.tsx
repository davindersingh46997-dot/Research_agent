import React from 'react';
import { Message } from '@/types/index';
import { formatDate } from '@utils/voice';
import { ExternalLink, BookOpen } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-dark-700 text-primary-400'
        }`}>
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-2">
          <div className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-primary-500 text-white rounded-br-none'
              : 'bg-dark-700 text-dark-100 rounded-bl-none'
          }`}>
            {message.isLoading ? (
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            )}
          </div>

          {/* Timestamp */}
          <span className={`text-xs ${isUser ? 'text-dark-400 text-right' : 'text-dark-500'}`}>
            {formatDate(message.timestamp)}
          </span>

          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs text-dark-400">
                <BookOpen size={14} />
                <span>Sources:</span>
              </div>
              <div className="flex flex-col gap-1">
                {message.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary-400 hover:text-primary-300 bg-dark-800 px-2 py-1 rounded transition-colors group"
                  >
                    <span className="flex-1 truncate hover:whitespace-normal">
                      {source.title}
                    </span>
                    <ExternalLink size={12} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
