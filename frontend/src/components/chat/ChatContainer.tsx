import { useEffect, useRef, type RefObject } from 'react';
import type { ChatActivity, ChatMessage } from '../../types/chat';
import { ActivityIndicator } from './ActivityIndicator';
import { MessageItem } from './MessageItem';
import { WelcomePanel } from './WelcomePanel';
import { ErrorBanner } from '../common/ErrorBanner';

interface ChatContainerProps {
  messages: ChatMessage[];
  loading: boolean;
  activity: ChatActivity | null;
  error: string | null;
  onClearError: () => void;
  onSelectSuggestion: (prompt: string) => void;
  scrollRef?: RefObject<HTMLDivElement>;
}

export function ChatContainer({
  messages,
  loading,
  activity,
  error,
  onClearError,
  onSelectSuggestion,
  scrollRef: externalScrollRef,
}: ChatContainerProps) {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = externalScrollRef || internalScrollRef;

  useEffect(() => {
    if (messages.length === 0) {
      scrollRef.current?.scrollTo({ top: 0 });
      return;
    }
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading, scrollRef]);

  return (
    <div
      className={`conversation-scroll ${messages.length === 0 ? 'conversation-empty' : ''}`}
      ref={scrollRef}
    >
      {messages.length === 0 ? (
        <WelcomePanel onSelectSuggestion={onSelectSuggestion} />
      ) : (
        <div className="conversation-thread">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}

          {loading && <ActivityIndicator activity={activity} />}

          {error && (
            <ErrorBanner
              message={error}
              onDismiss={onClearError}
            />
          )}
        </div>
      )}
    </div>
  );
}
