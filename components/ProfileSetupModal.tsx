"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, User, BookOpen, Target, ChevronRight, GraduationCap } from "lucide-react";
import { StudentProfile } from "@/lib/prompts";

interface Props {
    onSave: (profile: StudentProfile) => void;
}

const BRANCHES = [
    "Computer Science (CSE)",
    "Information Science (ISE)",
    "Electronics & Communication (ECE)",
    "Electrical Engineering (EEE)",
    "Mechanical (ME)",
    "Civil Engineering (CE)",
    "Biotechnology",
    "Chemical Engineering",
    "Artificial Intelligence & ML",
    "Other",
];

const SEMESTERS = ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];

export default function ProfileSetupModal({ onSave }: Props) {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<StudentProfile>({ name: "", branch: "", semester: "", goals: "" });

    const steps = [
        {
            icon: <User size={28} />,
            title: "What's your name?",
            subtitle: "So I can personalize your experience",
            field: "name" as const,
            placeholder: "e.g. Priya Sharma",
            type: "text",
        },
        {
            icon: <GraduationCap size={28} />,
            title: "Your engineering branch?",
            subtitle: "I'll tailor subjects and tips to your curriculum",
            field: "branch" as const,
            placeholder: "Select your branch",
            type: "select",
        },
        {
            icon: <BookOpen size={28} />,
            title: "Which semester?",
            subtitle: "I'll suggest the most relevant topics for your stage",
            field: "semester" as const,
            placeholder: "Select semester",
            type: "select-semester",
        },
        {
            icon: <Target size={28} />,
            title: "What are your goals?",
            subtitle: "Tell me what you want to achieve this semester",
            field: "goals" as const,
            placeholder: "e.g. Score above 85% in all subjects, crack campus placements, understand OS deeply...",
            type: "textarea",
        },
    ];

    const current = steps[step];
    const isValid = form[current.field].trim().length > 0;
    const isLast = step === steps.length - 1;

    const handleNext = () => {
        if (isLast) {
            onSave(form);
        } else {
            setStep((s) => s + 1);
        }
    };

    return (
        <div className="modal-overlay">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="glass gradient-border"
                    style={{ width: "min(520px, 95vw)", padding: "2.5rem", position: "relative" }}
                >
                    {/* Progress dots */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    height: "4px",
                                    flex: 1,
                                    borderRadius: "4px",
                                    background: i <= step ? "linear-gradient(90deg, #7c3aed, #3b82f6)" : "rgba(255,255,255,0.1)",
                                    transition: "background 0.3s ease",
                                }}
                            />
                        ))}
                    </div>

                    {/* Icon */}
                    <div
                        style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "16px",
                            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                            border: "1px solid rgba(124,58,237,0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#c4b5fd",
                            marginBottom: "1.25rem",
                        }}
                    >
                        {current.icon}
                    </div>

                    <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--text-primary)" }}>
                        {current.title}
                    </h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                        {current.subtitle}
                    </p>

                    {/* Input */}
                    {current.type === "text" && (
                        <input
                            className="input-glass"
                            type="text"
                            placeholder={current.placeholder}
                            value={form[current.field]}
                            onChange={(e) => setForm((f) => ({ ...f, [current.field]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && isValid && handleNext()}
                            autoFocus
                        />
                    )}

                    {current.type === "textarea" && (
                        <textarea
                            className="input-glass"
                            placeholder={current.placeholder}
                            value={form[current.field]}
                            onChange={(e) => setForm((f) => ({ ...f, [current.field]: e.target.value }))}
                            rows={4}
                            autoFocus
                            style={{ resize: "vertical", minHeight: "100px" }}
                        />
                    )}

                    {current.type === "select" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
                            {BRANCHES.map((b) => (
                                <button
                                    key={b}
                                    onClick={() => setForm((f) => ({ ...f, [current.field]: b }))}
                                    style={{
                                        padding: "0.6rem 0.75rem",
                                        borderRadius: "10px",
                                        border: `1px solid ${form[current.field] === b ? "rgba(124,58,237,0.6)" : "var(--glass-border)"}`,
                                        background: form[current.field] === b ? "rgba(124,58,237,0.2)" : "var(--glass-bg)",
                                        color: form[current.field] === b ? "#c4b5fd" : "var(--text-secondary)",
                                        cursor: "pointer",
                                        fontSize: "0.82rem",
                                        textAlign: "left",
                                        transition: "all 0.2s ease",
                                        fontFamily: "var(--font-inter), sans-serif",
                                    }}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    )}

                    {current.type === "select-semester" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                            {SEMESTERS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setForm((f) => ({ ...f, [current.field]: s }))}
                                    style={{
                                        padding: "0.7rem",
                                        borderRadius: "10px",
                                        border: `1px solid ${form[current.field] === s ? "rgba(124,58,237,0.6)" : "var(--glass-border)"}`,
                                        background: form[current.field] === s ? "rgba(124,58,237,0.2)" : "var(--glass-bg)",
                                        color: form[current.field] === s ? "#c4b5fd" : "var(--text-secondary)",
                                        cursor: "pointer",
                                        fontSize: "0.88rem",
                                        fontWeight: 600,
                                        transition: "all 0.2s ease",
                                        fontFamily: "var(--font-inter), sans-serif",
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        onClick={handleNext}
                        disabled={!isValid}
                        style={{
                            marginTop: "1.5rem",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            opacity: isValid ? 1 : 0.4,
                            fontSize: "0.95rem",
                            padding: "0.8rem",
                        }}
                    >
                        {isLast ? (
                            <>
                                <Sparkles size={16} />
                                Launch EduNavigator
                            </>
                        ) : (
                            <>
                                Continue
                                <ChevronRight size={16} />
                            </>
                        )}
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
