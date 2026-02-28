"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { v4 as uuidv4 } from "uuid";
import { StudentProfile } from "@/lib/prompts";
import { Chunk, retrieveTopKByKeyword } from "@/lib/rag";
import ProfileSetupModal from "@/components/ProfileSetupModal";
import Sidebar from "@/components/Sidebar";
import ChatInterface, { type DisplayMessage } from "@/components/ChatInterface";
import MessageInput from "@/components/MessageInput";

interface Session {
  id: string;
  title: string;
  timestamp: number;
  messageCount: number;
  messages: UIMessage[];
}

const PROFILE_KEY = "edunav_profile";
const SESSIONS_KEY = "edunav_sessions";

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || msg.parts.length === 0) return "";
  const textPart = msg.parts.find((p) => p.type === "text") as { type: "text"; text: string } | undefined;
  return textPart?.text ?? "";
}

function generateTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New Session";
  const content = getMessageText(first);
  return content.length > 48 ? content.slice(0, 48) + "…" : content || "New Session";
}

export default function Home() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => uuidv4());
  const [pdfChunks, setPdfChunks] = useState<Chunk[]>([]);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Use refs so the transport body function always reads latest values
  const profileRef = useRef<StudentProfile | null>(null);
  const extraBodyRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Load profile and sessions from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        setProfile(p);
        profileRef.current = p;
      } catch { /* ignore */ }
    } else {
      setShowProfileModal(true);
    }

    const savedSessions = localStorage.getItem(SESSIONS_KEY);
    if (savedSessions) {
      try { setSessions(JSON.parse(savedSessions)); } catch { /* ignore */ }
    }
  }, []);

  const { messages, sendMessage, status, clearError } = useChat({
    id: activeSessionId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // body function is called on every request with latest ref values
      body: () => ({
        studentProfile: profileRef.current,
        ...extraBodyRef.current,
      }),
    }),
    onFinish: ({ message }) => {
      setSessions((prev) => {
        const allMsgs = [...messages, message];
        const session: Session = {
          id: activeSessionId,
          title: generateTitle(allMsgs),
          timestamp: Date.now(),
          messageCount: allMsgs.length,
          messages: allMsgs,
        };
        const newSessions = prev.some((s) => s.id === activeSessionId)
          ? prev.map((s) => (s.id === activeSessionId ? session : s))
          : [session, ...prev];
        try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions)); } catch { /* ignore */ }
        return newSessions;
      });
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isError = status === "error";

  const displayMessages: DisplayMessage[] = messages.map((m: UIMessage) => ({
    id: m.id,
    role: m.role ?? "user",
    content: getMessageText(m),
  }));

  const handleSaveProfile = (p: StudentProfile) => {
    setProfile(p);
    profileRef.current = p;
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
    setShowProfileModal(false);
  };

  const handleNewSession = () => {
    setActiveSessionId(uuidv4());
    setPdfChunks([]);
    setPdfName(null);
    extraBodyRef.current = {};
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setPdfChunks([]);
    setPdfName(null);
    extraBodyRef.current = {};
  };

  const handlePdfUpload = async (file: File) => {
    setIsPdfProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch("/api/upload-pdf", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      setPdfChunks(data.chunks);
      setPdfName(file.name);
      // Clear extra fields except ragChunks
      extraBodyRef.current = { ragChunks: [] };
      sendMessage({
        text: `I've uploaded my PDF: "${file.name}" (${data.pageCount} pages, ${data.charCount} characters). Please acknowledge this document is now loaded and ready for questions.`,
      });
    } finally {
      setIsPdfProcessing(false);
    }
  };

  const handleSend = useCallback(
    async (text: string, imageBase64?: string, imageMime?: string) => {
      if (!text && !imageBase64) return;

      // RAG: retrieve relevant chunks using keyword search (no API call needed)
      let ragChunks: string[] = [];
      if (pdfChunks.length > 0 && text) {
        ragChunks = retrieveTopKByKeyword(text, pdfChunks, 5).map((c) => c.text);
      }

      // Update extra body via ref (so transport body() sees it immediately)
      extraBodyRef.current = { ragChunks, imageBase64, imageMime };

      if (imageBase64) {
        sendMessage({
          parts: [
            { type: "text", text: text || "Please analyze this image." },
            {
              type: "file",
              mediaType: imageMime ?? "image/jpeg",
              url: `data:${imageMime};base64,${imageBase64}`,
            },
          ],
        } as Parameters<typeof sendMessage>[0]);
      } else {
        sendMessage({ text });
      }
    },
    [pdfChunks, sendMessage]
  );

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden" }}>
      {sidebarOpen && (
        <Sidebar
          profile={profile}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          onEditProfile={() => setShowProfileModal(true)}
          pdfName={pdfName}
        />
      )}

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Header */}
        <div
          className="glass"
          style={{
            padding: "0.9rem 1.5rem",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              padding: "6px 8px",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
              {activeSession?.title ?? "New Study Session"}
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {profile
                ? `${profile.branch} · ${profile.semester}`
                : "Set up your profile to get personalized help"}
            </p>
          </div>
          {pdfName && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "20px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                color: "#6ee7b7",
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 5px #10b981" }} />
              RAG Active
            </div>
          )}
        </div>

        <ChatInterface
          messages={displayMessages}
          isLoading={isLoading}
          studentName={profile?.name}
        />

        {/* Error banner */}
        {isError && (
          <div
            style={{
              margin: "0 1.25rem 0.75rem",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.35)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.86rem",
              color: "#fca5a5",
            }}
          >
            <span>⚠️</span>
            <span style={{ flex: 1 }}>
              API error — check your Gemini API key, quota, or try again in a moment.
            </span>
            <button
              onClick={clearError}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#fca5a5", fontSize: "1rem" }}
            >
              ✕
            </button>
          </div>
        )}

        <MessageInput
          onSend={handleSend}
          onPdfUpload={handlePdfUpload}
          isLoading={isLoading}
          isPdfProcessing={isPdfProcessing}
        />
      </main>

      {showProfileModal && <ProfileSetupModal onSave={handleSaveProfile} />}
    </div>
  );
}
