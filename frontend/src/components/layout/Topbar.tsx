import { ChevronRight, Cpu, Sparkles } from 'lucide-react';

interface TopbarProps {
  modelName?: string;
}

export function Topbar({ modelName = 'Model from .env' }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span className="breadcrumb-root">Workspace</span>
        <ChevronRight size={14} className="breadcrumb-slash" />
        <strong className="breadcrumb-current">Autonomous Research Session</strong>
      </div>

      <div className="topbar-status">
        <div className="topbar-status-pill">
          <span className="pulse-dot" />
          <span className="status-label">OpenRouter Connected</span>
        </div>

        <div className="topbar-divider" />

        <div className="model-chip" title="Active Model configured in .env">
          <Cpu size={14} className="model-chip-icon" />
          <span className="model-chip-name">{modelName}</span>
          <Sparkles size={11} className="model-chip-sparkle" />
        </div>
      </div>
    </header>
  );
}
