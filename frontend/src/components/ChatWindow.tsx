import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
    ArrowUpRight,
    Bot,
    Check,
    Copy,
    Cpu,
    KeyRound,
    ListChecks,
    Loader2,
    MessageSquare,
    MessageSquarePlus,
    Search,
    Sparkles,
    Square,
    User,
    X,
} from "lucide-react";
import { useChat } from "../hooks/useChat";
import type { ChatMessage } from "../types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const suggestions = [
    "Explain quantum computing in simple terms with an example",
    "Write a clean Python function to parse JSON data safely",
    "Compare open weights vs proprietary language models",
];

export function ChatWindow() {
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
    const [draft, setDraft] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll on new message or loading change
    useEffect(() => {
        if (messages.length === 0) {
            scrollRef.current?.scrollTo({ top: 0 });
            return;
        }
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, loading]);

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();
        const content = draft.trim();
        if (!content || loading) return;
        setDraft("");
        void sendMessage(content);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleCopy = async (message: ChatMessage) => {
        await navigator.clipboard.writeText(message.content);
        setCopiedId(message.id);
        setTimeout(() => setCopiedId(null), 1800);
    };

    return (
        <div className="research-shell">
            {/* Sidebar */}
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
                    onClick={() => {
                        clearChat();
                        inputRef.current?.focus();
                    }}
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

            {/* Main Area */}
            <main className="research-main">
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
                            <Cpu size={13} className="text-forest" /> Model from .env
                        </span>
                    </div>
                </header>

                <div
                    className={`conversation-scroll ${messages.length === 0 ? "conversation-empty" : ""}`}
                    ref={scrollRef}
                >
                    {messages.length === 0 ? (
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
                                <div>
                                    <span className="pipeline-number">01</span>
                                    <strong>Frontend UI</strong>
                                    <small>Chat area input</small>
                                </div>
                                <span className="pipeline-connector" />
                                <div>
                                    <span className="pipeline-number">02</span>
                                    <strong>Routing</strong>
                                    <small>FastAPI / Vite proxy</small>
                                </div>
                                <span className="pipeline-connector" />
                                <div>
                                    <span className="pipeline-number">03</span>
                                    <strong>OpenRouter</strong>
                                    <small>Configured model</small>
                                </div>
                            </div>

                            <div className="suggestion-block">
                                <p className="suggestion-label">TRY A STARTER PROMPT</p>
                                <div className="suggestion-list">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => void sendMessage(suggestion)}
                                        >
                                            <span>{suggestion}</span>
                                            <ArrowUpRight size={15} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ) : (
                        <div className="conversation-thread">
                            {messages.map((msg) => (
                                <section className="conversation-turn" key={msg.id}>
                                    {msg.role === "user" ? (
                                        <div className="user-query">
                                            <span className="user-avatar" title="You">
                                                <User size={15} />
                                            </span>
                                            <p>{msg.content}</p>
                                        </div>
                                    ) : (
                                        <div className="assistant-answer">
                                            <div className="assistant-avatar" title="OpenRouter Model">
                                                <Bot size={17} />
                                            </div>
                                            <div className="assistant-answer-content">
                                                <div className="answer-byline">
                                                    <strong>OpenRouter</strong>
                                                    <span>{msg.model || "Open Source Model"}</span>
                                                    <button
                                                        type="button"
                                                        className="copy-report-button"
                                                        onClick={() => void handleCopy(msg)}
                                                        title="Copy response"
                                                    >
                                                        {copiedId === msg.id ? (
                                                            <>
                                                                <Check size={14} /> Copied
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy size={14} /> Copy
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                <article className="report-card">
                                                    <section className="report-section report-summary">
                                                        <div className="markdown-content">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                                rehypePlugins={[rehypeKatex]}
                                                                components={{
                                                                    a: ({ children, ...props }) => (
                                                                        <a {...props} target="_blank" rel="noopener noreferrer">
                                                                            {children}
                                                                        </a>
                                                                    ),
                                                                    img: ({ src, alt }) => (
                                                                        <img
                                                                            src={src}
                                                                            alt={alt || "Response image"}
                                                                            loading="lazy"
                                                                            className="markdown-image"
                                                                        />
                                                                    ),
                                                                    table: ({ children }) => (
                                                                        <div className="markdown-table-wrap">
                                                                            <table>{children}</table>
                                                                        </div>
                                                                    ),
                                                                    code: ({ className, children, ...props }) => (
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    ),
                                                                }}
                                                            >
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </section>
                                                </article>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            ))}

                            {loading && (
                                <div
                                    className={`working-state${activity ? ` working-state-${activity}` : ""}`}
                                    role="status"
                                    aria-live="polite"
                                >
                                    <div className="working-icon">
                                        {activity === "planning" ? (
                                            <ListChecks size={17} />
                                        ) : activity === "searching" ? (
                                            <Search size={17} />
                                        ) : (
                                            <Loader2 className="spin" size={17} />
                                        )}
                                    </div>
                                    <div>
                                        <strong>
                                            {activity === "planning"
                                                ? "Planning your response..."
                                                : activity === "searching"
                                                    ? "Searching the web..."
                                                    : "Reasoning through your request..."}
                                        </strong>
                                        <p>
                                            {activity === "planning"
                                                ? "Organizing the steps for this complex request."
                                                : activity === "searching"
                                                    ? "Finding current information to answer your question."
                                                    : "Working through the response with your configured model."}
                                        </p>
                                    </div>
                                    <div className="working-bars">
                                        <i /><i /><i />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="error-banner" role="alert">
                                    <X size={16} />
                                    <span>{error}</span>
                                    <button type="button" onClick={clearError} aria-label="Dismiss error">
                                        <X size={15} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Composer area */}
                <footer className="composer-area">
                    {messages.length === 0 && error && (
                        <div className="error-banner composer-error" role="alert">
                            <X size={16} />
                            <span>{error}</span>
                            <button type="button" onClick={clearError} aria-label="Dismiss error">
                                <X size={15} />
                            </button>
                        </div>
                    )}

                    <form className="composer" onSubmit={handleSubmit}>
                        <textarea
                            ref={inputRef}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message for the OpenRouter model..."
                            aria-label="Chat input"
                            rows={2}
                            disabled={loading}
                        />

                        <div className="composer-controls">
                            <span className="composer-hint">
                                <span className="composer-lock">
                                    <Cpu size={12} />
                                </span>{" "}
                                Model configured in OPENROUTER_MODEL
                            </span>
                            <div className="composer-actions">
                                <span className="keyboard-hint">Enter to send · Shift + Enter for new line</span>
                                <button
                                    className="send-button"
                                    type={loading ? "button" : "submit"}
                                    onClick={loading ? stopGeneration : undefined}
                                    disabled={!loading && !draft.trim()}
                                    aria-label={loading ? "Stop generating" : "Send message"}
                                    title={loading ? "Stop generating" : "Send message"}
                                >
                                    {loading ? (
                                        <Square size={14} fill="currentColor" />
                                    ) : (
                                        <ArrowUpRight size={19} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    <p className="disclaimer">
                        Responses are generated by the model selected in OPENROUTER_MODEL. Keep your OPENROUTER_API_KEY in the root .env file.
                    </p>
                </footer>
            </main>
        </div>
    );
}

export default ChatWindow;
