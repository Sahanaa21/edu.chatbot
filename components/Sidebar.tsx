"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap,
    Plus,
    MessageSquare,
    Clock,
    BookOpen,
    ChevronRight,
    Sparkles,
    Brain,
    Target,
} from "lucide-react";
import { StudentProfile } from "@/lib/prompts";

interface Session {
    id: string;
    title: string;
    timestamp: number;
    messageCount: number;
}

interface Props {
    profile: StudentProfile | null;
    sessions: Session[];
    activeSessionId: string;
    onNewSession: () => void;
    onSelectSession: (id: string) => void;
    onEditProfile: () => void;
    pdfName: string | null;
}

const SUBJECT_SUGGESTIONS: Record<string, string[]> = {
    "Computer Science (CSE)": ["Data Structures", "OS", "DBMS", "CN", "Algorithms"],
    "Information Science (ISE)": ["Software Eng", "CN", "Web Tech", "DBMS", "AI"],
    "Electronics & Communication (ECE)": ["Signals", "VLSI", "Microprocessors", "DSP", "EMT"],
    "Electrical Engineering (EEE)": ["Power Systems", "Control Systems", "Machines", "PED"],
    "Mechanical (ME)": ["Thermodynamics", "Fluid Mech", "Manufacturing", "FEA"],
    "Artificial Intelligence & ML": ["ML", "DL", "NLP", "Computer Vision", "Reinforcement Learning"],
};

function getSubjects(branch: string): string[] {
    const key = Object.keys(SUBJECT_SUGGESTIONS).find((k) => branch.includes(k.split(" ")[0]));
    return key ? SUBJECT_SUGGESTIONS[key] : ["Mathematics", "Physics", "Programming"];
}

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function Sidebar({
    profile,
    sessions,
    activeSessionId,
    onNewSession,
    onSelectSession,
    onEditProfile,
    pdfName,
}: Props) {
    const subjects = profile ? getSubjects(profile.branch) : [];

    return (
        <aside
            className="glass"
            style={{
                width: "280px",
                flexShrink: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid var(--glass-border)",
                overflow: "hidden",
            }}
        >
            {/* Logo */}
            <div style={{ padding: "1.25rem 1.25rem 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
                    <div
                        style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Brain size={20} color="white" />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.2 }}>
                            EduNavigator
                        </p>
                        <p className="gradient-text" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                            AI Mentor
                        </p>
                    </div>
                </div>

                {/* New Session button */}
                <button
                    className="btn-primary"
                    onClick={onNewSession}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.88rem", padding: "0.65rem" }}
                >
                    <Plus size={15} />
                    New Session
                </button>
            </div>

            {/* Profile card */}
            {profile && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ margin: "1rem 1rem 0" }}
                >
                    <div
                        onClick={onEditProfile}
                        style={{
                            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1))",
                            border: "1px solid rgba(124,58,237,0.3)",
                            borderRadius: "12px",
                            padding: "0.9rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.5)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.3)";
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                            <div
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    color: "white",
                                    flexShrink: 0,
                                }}
                            >
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ overflow: "hidden" }}>
                                <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {profile.name}
                                </p>
                                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Click to edit profile</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <span className="badge" style={{ fontSize: "0.68rem" }}>
                                <GraduationCap size={10} />
                                {profile.branch.split("(")[0].trim()}
                            </span>
                            <span className="badge" style={{ fontSize: "0.68rem" }}>
                                <BookOpen size={10} />
                                {profile.semester}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* PDF Status */}
            {pdfName && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ margin: "0.75rem 1rem 0" }}
                >
                    <div
                        style={{
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.3)",
                            borderRadius: "10px",
                            padding: "0.6rem 0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", flexShrink: 0, boxShadow: "0 0 6px #10b981" }} />
                        <p style={{ fontSize: "0.75rem", color: "#6ee7b7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                            📄 {pdfName}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Suggested subjects */}
            {subjects.length > 0 && (
                <div style={{ padding: "1rem 1rem 0" }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                        Your Subjects
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {subjects.map((s) => (
                            <span key={s} className="badge" style={{ fontSize: "0.7rem" }}>
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Past sessions */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "1rem 1rem 0" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                    Study Sessions
                </p>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <AnimatePresence>
                        {sessions.map((session, i) => (
                            <motion.button
                                key={session.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => onSelectSession(session.id)}
                                style={{
                                    width: "100%",
                                    padding: "0.6rem 0.75rem",
                                    borderRadius: "10px",
                                    border: `1px solid ${session.id === activeSessionId ? "rgba(124,58,237,0.4)" : "transparent"}`,
                                    background: session.id === activeSessionId ? "rgba(124,58,237,0.12)" : "transparent",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontFamily: "var(--font-inter), sans-serif",
                                }}
                                onMouseEnter={(e) => {
                                    if (session.id !== activeSessionId)
                                        (e.currentTarget as HTMLButtonElement).style.background = "var(--glass-hover)";
                                }}
                                onMouseLeave={(e) => {
                                    if (session.id !== activeSessionId)
                                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                }}
                            >
                                <MessageSquare size={14} color={session.id === activeSessionId ? "#c4b5fd" : "var(--text-muted)"} />
                                <div style={{ flex: 1, overflow: "hidden" }}>
                                    <p style={{ fontSize: "0.8rem", color: session.id === activeSessionId ? "#c4b5fd" : "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {session.title}
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <Clock size={10} color="var(--text-muted)" />
                                        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                            {timeAgo(session.timestamp)} · {session.messageCount} msgs
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                    {sessions.length === 0 && (
                        <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)" }}>
                            <Sparkles size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.4 }} />
                            <p style={{ fontSize: "0.78rem" }}>No sessions yet.<br />Start chatting!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--glass-border)" }}>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center" }}>
                    Powered by <span className="gradient-text" style={{ fontWeight: 600 }}>Gemini 2.5 Flash</span>
                </p>
            </div>
        </aside>
    );
}
