import { Cpu } from 'lucide-react';

interface TopbarProps {
  modelName?: string;
}

export function Topbar({ modelName = 'Model from .env' }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-slash">/</span>
        <strong>OpenRouter Chat</strong>
      </div>
      <div className="topbar-status">
        <span className="status-indicator" />
        <span>OpenRouter</span>
        <span className="topbar-divider" />
        <span className="inline-flex items-center gap-1">
          <Cpu size={13} className="text-forest" /> {modelName}
        </span>
      </div>
    </header>
  );
}
