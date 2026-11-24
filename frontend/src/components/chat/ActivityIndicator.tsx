import { ListChecks, Loader2, Search } from 'lucide-react';
import type { ChatActivity } from '../../types/chat';

interface ActivityIndicatorProps {
  activity: ChatActivity | null;
}

export function ActivityIndicator({ activity }: ActivityIndicatorProps) {
  const getActivityTitle = () => {
    switch (activity) {
      case 'planning':
        return 'Planning your response...';
      case 'searching':
        return 'Searching the web...';
      default:
        return 'Reasoning through your request...';
    }
  };

  const getActivityDescription = () => {
    switch (activity) {
      case 'planning':
        return 'Organizing the steps for this complex request.';
      case 'searching':
        return 'Finding current information to answer your question.';
      default:
        return 'Working through the response with your configured model.';
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
          <ListChecks size={17} />
        ) : activity === 'searching' ? (
          <Search size={17} />
        ) : (
          <Loader2 className="spin" size={17} />
        )}
      </div>
      <div>
        <strong>{getActivityTitle()}</strong>
        <p>{getActivityDescription()}</p>
      </div>
      <div className="working-bars">
        <i /><i /><i />
      </div>
    </div>
  );
}
