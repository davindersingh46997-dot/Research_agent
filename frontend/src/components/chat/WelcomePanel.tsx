import { ArrowUpRight, Sparkles } from 'lucide-react';
import { DEFAULT_SUGGESTIONS, PIPELINE_STEPS } from '../../utils/constants';

interface WelcomePanelProps {
  onSelectSuggestion: (prompt: string) => void;
}

export function WelcomePanel({ onSelectSuggestion }: WelcomePanelProps) {
  return (
    <section className="welcome-panel">
      <div className="welcome-kicker">
        <Sparkles size={14} /> Open Source AI Chat
      </div>
      <h1>
        Direct chat pipeline<br />
        <span>powered by OpenRouter.</span>
      </h1>
      <p className="welcome-description">
        Send requests from the chat composer below directly to an open-source model.
        Responses from your configured OpenRouter model appear in the chat thread.
      </p>

      <div className="pipeline-strip" aria-label="Pipeline Architecture">
        {PIPELINE_STEPS.map((item, idx) => (
          <div key={item.step} style={{ display: 'contents' }}>
            <div>
              <span className="pipeline-number">{item.step}</span>
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
            </div>
            {idx < PIPELINE_STEPS.length - 1 && <span className="pipeline-connector" />}
          </div>
        ))}
      </div>

      <div className="suggestion-block">
        <p className="suggestion-label">TRY A STARTER PROMPT</p>
        <div className="suggestion-list">
          {DEFAULT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              <span>{suggestion}</span>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
