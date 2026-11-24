import { Globe, ListChecks, Loader2 } from 'lucide-react';
import type { ChatActivity } from '../../types/chat';

interface ActivityIndicatorProps {
  activity: ChatActivity | null;
}

export function ActivityIndicator({ activity }: ActivityIndicatorProps) {
  const getActivityTitle = () => {
    switch (activity) {
      case 'planning':
        return 'Decomposing inquiry & building outline...';
      case 'searching':
        return 'Searching live web & verifying evidence...';
      default:
        return 'Synthesizing evidence-grounded report...';
    }
  };

  const getActivityDescription = () => {
    switch (activity) {
      case 'planning':
        return 'Structuring key sub-topics to ensure an exhaustive and rigorous analysis.';
      case 'searching':
        return 'Querying Tavily for verified facts and checking against prompt injection.';
      default:
        return 'Formulating comprehensive analysis and citing source references.';
    }
  };

  return (
    <div
      className={`working-state${activity ? ` working-state-${activity}` : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="working-icon">
        {activity === 'planning' ? (
          <ListChecks size={18} />
        ) : activity === 'searching' ? (
          <Globe size={18} />
        ) : (
          <Loader2 className="spin" size={18} />
        )}
      </div>

      <div className="working-details">
        <strong>{getActivityTitle()}</strong>
        <p>{getActivityDescription()}</p>
      </div>

      <div className="working-bars">
        <i /><i /><i /><i />
      </div>
    </div>
  );
}
