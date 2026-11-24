import { Bot, KeyRound, MessageSquare, MessageSquarePlus } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  return (
    <aside className="research-sidebar">
      <a className="brand-lockup" href="#" aria-label="OpenRouter Chat">
        <span className="brand-symbol">
          <Bot size={20} strokeWidth={2} />
        </span>
        <span className="brand-name">
          openchat<span> / router</span>
        </span>
      </a>

      <button
        className="new-research-button"
        type="button"
        onClick={onNewChat}
      >
        <MessageSquarePlus size={16} /> New chat
        <span>⌘ N</span>
      </button>

      <div className="sidebar-rule" />
      <p className="sidebar-label">WORKSPACE</p>
      <div className="workspace-item workspace-current">
        <MessageSquare size={16} />
        <span>OpenRouter Chat</span>
        <span className="live-dot" />
      </div>

      <div className="sidebar-spacer" />

      <div className="memory-notice">
        <div className="memory-icon">
          <KeyRound size={15} />
        </div>
        <div>
          <strong>API Key Routing</strong>
          <p>Requests are routed through OpenRouter using the key configured in your root .env file.</p>
        </div>
      </div>

      <div className="sidebar-footer">
        <span className="provider-dot" />
        OpenRouter <span>·</span> Configured model
      </div>
    </aside>
  );
}
