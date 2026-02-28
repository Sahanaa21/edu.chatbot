"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    FileUp,
    Image as ImageIcon,
    X,
    Loader2,
    FileText,
    AlertCircle,
} from "lucide-react";

interface Props {
    onSend: (text: string, imageBase64?: string, imageMime?: string) => void;
    onPdfUpload: (file: File) => Promise<void>;
    isLoading: boolean;
    isPdfProcessing: boolean;
}

export default function MessageInput({ onSend, onPdfUpload, isLoading, isPdfProcessing }: Props) {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [imageMime, setImageMime] = useState<string>("");
    const [pdfError, setPdfError] = useState<string | null>(null);
    const textRef = useRef<HTMLTextAreaElement>(null);
    const pdfRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!text.trim() && !imageBase64) return;
        if (isLoading) return;
        onSend(text.trim(), imageBase64 ?? undefined, imageMime || undefined);
        setText("");
        setImagePreview(null);
        setImageBase64(null);
        setImageMime("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            setPdfError("Only PDF files are supported.");
            return;
        }
        setPdfError(null);
        try {
            await onPdfUpload(file);
        } catch {
            setPdfError("Failed to process PDF. Please try again.");
        }
        e.target.value = "";
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const mime = file.type;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            setImagePreview(dataUrl);
            // Extract base64 (strip data:xxx;base64,)
            const base64 = dataUrl.split(",")[1];
            setImageBase64(base64);
            setImageMime(mime);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const canSend = (text.trim().length > 0 || !!imageBase64) && !isLoading;

    return (
        <div style={{ padding: "1rem 1.25rem 1.25rem", borderTop: "1px solid var(--glass-border)" }}>
            {/* PDF error */}
            <AnimatePresence>
                {pdfError && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "10px",
                            padding: "0.5rem 0.75rem",
                            marginBottom: "0.75rem",
                            fontSize: "0.82rem",
                            color: "#fca5a5",
                        }}
                    >
                        <AlertCircle size={14} />
                        {pdfError}
                        <button onClick={() => setPdfError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#fca5a5" }}>
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image preview */}
            <AnimatePresence>
                {imagePreview && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{ marginBottom: "0.75rem", position: "relative", display: "inline-block" }}
                    >
                        <img
                            src={imagePreview}
                            alt="preview"
                            style={{ maxHeight: "120px", borderRadius: "10px", border: "1px solid var(--glass-border)" }}
                        />
                        <button
                            onClick={() => { setImagePreview(null); setImageBase64(null); setImageMime(""); }}
                            style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                background: "#ef4444",
                                border: "none",
                                borderRadius: "50%",
                                width: "22px",
                                height: "22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "white",
                            }}
                        >
                            <X size={12} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input area */}
            <div
                className="glass"
                style={{
                    borderRadius: "16px",
                    padding: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    transition: "border-color 0.2s ease",
                }}
            >
                <textarea
                    ref={textRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about your studies... (Shift+Enter for new line)"
                    disabled={isLoading}
                    rows={2}
                    style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "var(--text-primary)",
                        fontSize: "0.93rem",
                        fontFamily: "var(--font-inter), sans-serif",
                        resize: "none",
                        lineHeight: 1.6,
                        maxHeight: "120px",
                        overflowY: "auto",
                    }}
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "6px" }}>
                        {/* PDF Upload */}
                        <button
                            onClick={() => pdfRef.current?.click()}
                            disabled={isPdfProcessing}
                            title="Upload PDF (syllabus, notes, research paper)"
                            style={{
                                background: "rgba(124,58,237,0.15)",
                                border: "1px solid rgba(124,58,237,0.3)",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                cursor: "pointer",
                                color: "#c4b5fd",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "0.78rem",
                                fontFamily: "var(--font-inter), sans-serif",
                                transition: "all 0.2s ease",
                                opacity: isPdfProcessing ? 0.6 : 1,
                            }}
                        >
                            {isPdfProcessing ? (
                                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                            ) : (
                                <FileUp size={14} />
                            )}
                            {isPdfProcessing ? "Processing…" : "Upload PDF"}
                        </button>

                        {/* Image Upload */}
                        <button
                            onClick={() => imgRef.current?.click()}
                            title="Upload an image or diagram"
                            style={{
                                background: "rgba(6,182,212,0.1)",
                                border: "1px solid rgba(6,182,212,0.3)",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                cursor: "pointer",
                                color: "#67e8f9",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "0.78rem",
                                fontFamily: "var(--font-inter), sans-serif",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <ImageIcon size={14} />
                            Image
                        </button>
                    </div>

                    {/* Send */}
                    <motion.button
                        whileHover={canSend ? { scale: 1.05 } : {}}
                        whileTap={canSend ? { scale: 0.95 } : {}}
                        onClick={handleSend}
                        disabled={!canSend}
                        style={{
                            background: canSend ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : "rgba(255,255,255,0.05)",
                            border: "none",
                            borderRadius: "10px",
                            width: "42px",
                            height: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: canSend ? "pointer" : "default",
                            transition: "all 0.2s ease",
                            boxShadow: canSend ? "0 0 20px rgba(124,58,237,0.35)" : "none",
                        }}
                    >
                        <Send size={17} color={canSend ? "white" : "var(--text-muted)"} />
                    </motion.button>
                </div>
            </div>

            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "center" }}>
                EduNavigator can make mistakes. Verify important information.
            </p>

            {/* Hidden inputs */}
            <input ref={pdfRef} type="file" accept="application/pdf" onChange={handlePdfChange} style={{ display: "none" }} />
            <input ref={imgRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
        </div>
    );
}
