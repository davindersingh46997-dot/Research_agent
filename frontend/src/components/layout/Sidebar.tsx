import { Bot, KeyRound, MessageSquare, Plus, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  return (
    <aside className="research-sidebar">
      {/* Brand Header */}
      <a className="brand-lockup" href="/" aria-label="Research Agent Home">
        <div className="brand-symbol">
          <Bot size={20} strokeWidth={2.2} />
        </div>
        <div className="brand-info">
          <span className="brand-name">
            Research<strong>Agent</strong>
          </span>
          <span className="brand-tag">OpenRouter · LangGraph</span>
        </div>
      </a>

      {/* New Research Button */}
      <button
        className="new-research-button"
        type="button"
        onClick={onNewChat}
        title="Start a new research session"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>New Research</span>
        <kbd className="shortcut-badge">⌘ N</kbd>
      </button>

      <div className="sidebar-rule" />

      {/* Workspace Navigation */}
      <div className="sidebar-section-header">
        <span className="sidebar-label">ACTIVE WORKSPACE</span>
      </div>

      <div className="workspace-item workspace-current">
        <MessageSquare size={16} className="workspace-icon" />
        <span className="workspace-title">Research Workspace</span>
        <span className="live-beacon">
          <span className="live-beacon-ring" />
          <span className="live-beacon-core" />
        </span>
      </div>

      <div className="sidebar-spacer" />

      {/* Security & Routing Notice */}
      <div className="memory-notice">
        <div className="memory-icon">
          <ShieldCheck size={16} />
        </div>
        <div>
          <div className="memory-title">
            <strong>NeMo Guardrails Active</strong>
          </div>
          <p>
            Prompts and web content are dynamically verified against prompt injection and jailbreaks.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <div className="footer-status-pill">
          <KeyRound size={12} className="footer-key-icon" />
          <span>API Key Configured in .env</span>
        </div>
      </div>
    </aside>
  );
}
