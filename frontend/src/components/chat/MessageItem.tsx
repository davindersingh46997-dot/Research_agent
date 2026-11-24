import { useState } from 'react';
import { Bot, Check, Copy, User } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';
import { MarkdownContent } from './MarkdownContent';

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (message.role === 'user') {
    return (
      <section className="conversation-turn">
        <div className="user-query">
          <span className="user-avatar" title="You">
            <User size={15} />
          </span>
          <p>{message.content}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="conversation-turn">
      <div className="assistant-answer">
        <div className="assistant-avatar" title="OpenRouter Model">
          <Bot size={17} />
        </div>
        <div className="assistant-answer-content">
          <div className="answer-byline">
            <strong>OpenRouter</strong>
            <span>{message.model || 'Open Source Model'}</span>
            <button
              type="button"
              className="copy-report-button"
              onClick={() => void handleCopy()}
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </button>
          </div>

          <article className="report-card">
            <section className="report-section report-summary">
              <MarkdownContent content={message.content} />
            </section>
          </article>
        </div>
      </div>
    </section>
  );
}
