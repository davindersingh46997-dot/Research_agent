import { ArrowRight, Atom, Cpu, Dna, Sparkles, TrendingUp } from 'lucide-react';

interface WelcomePanelProps {
  onSelectSuggestion: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Atom,
    title: 'Quantum error correction',
    query: 'Explain quantum computing and how fault-tolerant error correction works with practical examples.',
  },
  {
    icon: TrendingUp,
    title: 'Semiconductor supply chains',
    query: 'Analyze the economic impact of semiconductor export restrictions on global supply chains.',
  },
  {
    icon: Cpu,
    title: 'Open weights vs frontier AI',
    query: 'Compare the architecture, capabilities, and safety of open-weights models vs proprietary frontier models.',
  },
  {
    icon: Dna,
    title: 'CRISPR prime editing advances',
    query: 'What are the most recent clinical breakthroughs in CRISPR and prime editing for genetic diseases?',
  },
] as const;

export function WelcomePanel({ onSelectSuggestion }: WelcomePanelProps) {
  return (
    <div className="simple-welcome">
      <div className="simple-welcome-icon">
        <Sparkles size={24} strokeWidth={2.2} />
      </div>

      <h1 className="simple-welcome-title">
        Where would you like to start?
      </h1>

      <p className="simple-welcome-subtitle">
        Ask complex questions across science, technology, economics, or public policy.
      </p>

      <div className="simple-suggestions">
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              className="simple-chip"
              onClick={() => onSelectSuggestion(item.query)}
            >
              <div className="simple-chip-icon-box">
                <Icon size={16} />
              </div>
              <span className="simple-chip-text">{item.title}</span>
              <ArrowRight size={14} className="simple-chip-arrow" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
