import { type FormEvent, type KeyboardEvent, type RefObject } from 'react';
import { ArrowUpRight, Cpu, Square } from 'lucide-react';

interface ComposerProps {
  draft: string;
  setDraft: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  onStop: () => void;
  inputRef: RefObject<HTMLTextAreaElement>;
}

export function Composer({
  draft,
  setDraft,
  onSubmit,
  loading,
  onStop,
  inputRef,
}: ComposerProps) {
  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!draft.trim() || loading) return;
    onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <footer className="composer-area">
      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any research inquiry (e.g. 'Evaluate the scalability of molten salt thorium reactors')..."
          aria-label="Chat research input"
          rows={2}
          disabled={loading}
        />

        <div className="composer-controls">
          <div className="composer-hint">
            <span className="composer-lock">
              <Cpu size={13} />
            </span>
            <span>Target: Configured in OPENROUTER_MODEL</span>
          </div>

          <div className="composer-actions">
            <span className="keyboard-hint">
              <kbd>Return ↵</kbd> to submit · <kbd>Shift + ↵</kbd> new line
            </span>

            <button
              className={`send-button ${loading ? 'send-button-stop' : ''}`}
              type={loading ? 'button' : 'submit'}
              onClick={loading ? onStop : undefined}
              disabled={!loading && !draft.trim()}
              aria-label={loading ? 'Stop generating' : 'Send research prompt'}
              title={loading ? 'Stop generating' : 'Send research prompt'}
            >
              {loading ? (
                <Square size={13} fill="currentColor" />
              ) : (
                <ArrowUpRight size={18} strokeWidth={2.4} />
              )}
            </button>
          </div>
        </div>
      </form>

      <p className="disclaimer">
        Research reports are synthesized using OpenRouter models and Tavily search verification. Guardrails enforce research scope.
      </p>
    </footer>
  );
}
