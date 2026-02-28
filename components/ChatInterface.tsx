"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, User, Copy, Check, Sparkles, BookOpen, Map, Code2 } from "lucide-react";

export interface DisplayMessage {
    id: string;
    role: string;
    content: string;
}

interface Props {
    messages: DisplayMessage[];
    isLoading: boolean;
    studentName?: string;
}

// Welcome screen suggestion cards
const SUGGESTIONS = [
    { icon: <BookOpen size={16} />, text: "Suggest topics for my next exam", color: "#7c3aed" },
    { icon: <Map size={16} />, text: "I have an exam in 3 days. Make a roadmap", color: "#3b82f6" },
    { icon: <Code2 size={16} />, text: "Explain this code snippet to me", color: "#06b6d4" },
    { icon: <Sparkles size={16} />, text: "What are the key concepts in my syllabus?", color: "#10b981" },
];

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={copy}
            style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                padding: "4px 8px",
                cursor: "pointer",
                color: copied ? "#10b981" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.72rem",
                transition: "all 0.2s",
            }}
        >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}

export default function ChatInterface({ messages, isLoading, studentName }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const isStreaming = isLoading && messages.length > 0 && messages[messages.length - 1].role === "assistant";

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Welcome screen */}
            {messages.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "3rem 1rem" }}
                >
                    <div
                        style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "20px",
                            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 0 40px rgba(124,58,237,0.4)",
                        }}
                    >
                        <Sparkles size={34} color="white" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                            {studentName ? (
                                <>Hey, <span className="gradient-text">{studentName.split(" ")[0]}</span>! 👋</>
                            ) : (
                                <>Welcome to <span className="gradient-text">EduNavigator AI</span></>
                            )}
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "420px", lineHeight: 1.6 }}>
                            Your personalized academic mentor. Upload a syllabus, ask anything, or let me build you a study plan.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%", maxWidth: "480px" }}>
                        {SUGGESTIONS.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.07 }}
                                style={{
                                    background: "var(--glass-bg)",
                                    border: "1px solid var(--glass-border)",
                                    borderRadius: "12px",
                                    padding: "0.9rem",
                                }}
                            >
                                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                    <div style={{ color: s.color, marginTop: "1px", flexShrink: 0 }}>{s.icon}</div>
                                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{s.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Messages */}
            <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "flex-start",
                            flexDirection: msg.role === "user" ? "row-reverse" : "row",
                        }}
                    >
                        {/* Avatar */}
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: msg.role === "assistant"
                                    ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                                    : "rgba(255,255,255,0.08)",
                                border: "1px solid var(--glass-border)",
                            }}
                        >
                            {msg.role === "assistant" ? (
                                <Bot size={18} color="white" />
                            ) : (
                                <User size={18} color="var(--text-secondary)" />
                            )}
                        </div>

                        {/* Bubble */}
                        <div style={{ maxWidth: "75%", position: "relative" }}>
                            {msg.role === "assistant" ? (
                                <div
                                    className="glass markdown-body"
                                    style={{
                                        borderRadius: "14px",
                                        borderTopLeftRadius: "4px",
                                        padding: "1rem 1.1rem",
                                        fontSize: "0.92rem",
                                        lineHeight: 1.7,
                                    }}
                                >
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            code({ node, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || "");
                                                const isBlock = node?.position?.start?.line !== node?.position?.end?.line;
                                                return match || isBlock ? (
                                                    <div style={{ position: "relative" }}>
                                                        <CopyButton text={String(children)} />
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus as Record<string, React.CSSProperties>}
                                                            language={match?.[1] ?? "text"}
                                                            PreTag="div"
                                                            customStyle={{ borderRadius: "10px", margin: 0, fontSize: "0.85rem" }}
                                                        >
                                                            {String(children).replace(/\n$/, "")}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                    {isStreaming && i === messages.length - 1 && (
                                        <span className="typing-cursor" />
                                    )}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.15))",
                                        border: "1px solid rgba(124,58,237,0.3)",
                                        borderRadius: "14px",
                                        borderTopRightRadius: "4px",
                                        padding: "0.75rem 1rem",
                                        fontSize: "0.92rem",
                                        color: "var(--text-primary)",
                                        lineHeight: 1.6,
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Loading dots */}
            {isLoading && !isStreaming && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Bot size={18} color="white" />
                    </div>
                    <div className="glass" style={{ borderRadius: "14px", padding: "1rem 1.25rem", display: "flex", gap: "6px", alignItems: "center" }}>
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                                style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent-purple)" }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}
