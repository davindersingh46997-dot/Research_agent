import { useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import {
  Sidebar,
  Topbar,
  ChatContainer,
  Composer,
  ErrorBanner,
} from '../components';

export function ChatPage() {
  const {
    messages,
    loading,
    activity,
    error,
    sendMessage,
    stopGeneration,
    clearChat,
    clearError,
  } = useChat();

  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text || loading) return;
    setDraft('');
    void sendMessage(text);
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (prompt: string) => {
    void sendMessage(prompt);
  };

  const handleNewChat = () => {
    clearChat();
    inputRef.current?.focus();
  };

  return (
    <div className="research-shell">
      <Sidebar onNewChat={handleNewChat} />
      <main className="research-main">
        <Topbar />
        <ChatContainer
          messages={messages}
          loading={loading}
          activity={activity}
          error={error}
          onClearError={clearError}
          onSelectSuggestion={handleSelectSuggestion}
        />
        {messages.length === 0 && error && (
          <ErrorBanner
            message={error}
            onDismiss={clearError}
            className="composer-error"
          />
        )}
        <Composer
          draft={draft}
          setDraft={setDraft}
          onSubmit={handleSubmit}
          loading={loading}
          onStop={stopGeneration}
          inputRef={inputRef}
        />
      </main>
    </div>
  );
}

export default ChatPage;
