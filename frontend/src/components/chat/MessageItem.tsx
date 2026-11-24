import { useState } from 'react';
import { Bot, Check, Copy, ExternalLink, Globe, User } from 'lucide-react';
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

          {/* Structured Sources Section */}
          {message.sources && message.sources.length > 0 && (
            <div className="sources-container">
              <div className="sources-header">
                <Globe size={13} className="sources-header-icon" />
                <span>Verified Sources</span>
                <span className="sources-count">{message.sources.length}</span>
              </div>
              <div className="sources-grid">
                {message.sources.map((src, idx) => {
                  let domain = '';
                  try {
                    domain = new URL(src.url).hostname.replace(/^www\./, '');
                  } catch {
                    domain = 'web';
                  }
                  return (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-card"
                      title={src.snippet || src.title}
                    >
                      <div className="source-card-main">
                        <span className="source-domain">{domain}</span>
                        <span className="source-title">{src.title || src.url}</span>
                      </div>
                      <ExternalLink size={12} className="source-external-icon" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

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
