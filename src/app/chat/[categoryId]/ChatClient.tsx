"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

interface Props {
  category: { id: string; title: string; description: string | null };
  docCount: number;
  userImage: string | null;
  userName: string;
}

// ─── Starter questions ────────────────────────────────────────────────────────
const STARTER_QUESTIONS = [
  "Apa ringkasan dari dokumen ini?",
  "Apa poin-poin utama yang dibahas?",
  "Jelaskan konsep terpenting dalam koleksi ini.",
  "Apakah ada definisi atau istilah khusus?",
];

// ─── Markdown-like formatter (safe, no library needed) ───────────────────────
function formatContent(text: string): string {
  return (
    text
      // Code blocks (before inline code)
      .replace(
        /```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>"
      )
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Unordered list items
      .replace(/^[-•] (.+)$/gm, "<li>$1</li>")
      // Ordered list items
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      // Wrap consecutive <li> in <ul>
      .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
      // Paragraphs — double newline
      .replace(/\n\n/g, "</p><p>")
      // Single newline
      .replace(/\n/g, "<br/>")
      // Wrap all in <p> if not already block-level
      .replace(/^(?!<(ul|ol|pre|h[1-6]|li))(.+)/, "<p>$2</p>")
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function UserAvatar({ image, name }: { image: string | null; name: string }) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={32}
        height={32}
        className="w-8 h-8 border-2 border-neo-black flex-shrink-0 object-cover"
      />
    );
  }
  return (
    <div className="chat-avatar-user">
      {name[0]?.toUpperCase() ?? "U"}
    </div>
  );
}

function AiAvatar() {
  return (
    <div className="chat-avatar-ai" aria-hidden="true">
      AI
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, userName, userImage }: { msg: Message; userName: string; userImage: string | null }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`chat-message-row ${isUser ? "chat-message-row--user" : "chat-message-row--ai"}`}
    >
      {/* AI Avatar — left side */}
      {!isUser && <AiAvatar />}

      <div className={`chat-bubble-group ${isUser ? "chat-bubble-group--user" : ""}`}>
        {/* Sender + time */}
        <div className={`chat-meta ${isUser ? "chat-meta--user" : ""}`}>
          {isUser ? userName : "LibrariAI"}
          <span className="chat-meta-time">{formatTime(msg.timestamp)}</span>
        </div>

        {/* Bubble */}
        <div
          className={isUser ? "chat-bubble-user" : "chat-bubble-ai"}
          dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
        />
      </div>

      {/* User Avatar — right side */}
      {isUser && <UserAvatar image={userImage} name={userName} />}
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="chat-message-row chat-message-row--ai" aria-live="polite" aria-label="LibrariAI sedang mengetik">
      <AiAvatar />
      <div className="chat-bubble-group">
        <div className="chat-meta">LibrariAI</div>
        <div className="chat-bubble-ai chat-bubble-ai--typing">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatClient({ category, docCount, userImage, userName }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo! Saya siap membantu kamu menjelajahi koleksi **"${category.title}"**.\n\nKoleksi ini memiliki **${docCount} dokumen** yang siap diakses. Tanyakan apa saja tentang isinya, dan saya akan menjawab berdasarkan dokumen yang tersedia.\n\n⚡ *Zero Hallucination Protocol aktif — saya hanya menjawab dari sumber dokumen.*`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStarters, setShowStarters] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || docCount === 0) return;

    setShowStarters(false);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const apiMessages = [...messages.filter((m) => m.id !== "welcome"), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, categoryId: category.id }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal mendapatkan respons dari server.");
      }

      const data = await res.json();
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isLoading, messages, category.id, docCount]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const canSend = !isLoading && input.trim().length > 0 && docCount > 0;
  const charCount = input.length;

  return (
    <div className="chat-shell">
      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <header className="chat-header" role="banner">
        <div className="chat-header-inner">
          {/* Back button */}
          <Link
            href="/browse"
            className="neo-button neo-button-ghost neo-button-sm flex-shrink-0"
            aria-label="Kembali ke halaman browse"
          >
            ← <span className="hidden sm:inline">Kembali</span>
          </Link>

          {/* Category info */}
          <div className="chat-header-info">
            <div className="chat-header-title">
              <span className="chat-header-icon" aria-hidden="true">📖</span>
              <h1 className="chat-header-name">{category.title}</h1>
            </div>
            <div className="chat-header-badges">
              <span className="neo-badge neo-badge-green">
                {docCount} dok
              </span>
              <span className="neo-badge neo-badge-black">
                ⚡ ZERO HALLUCINATION
              </span>
              {docCount === 0 && (
                <span className="neo-badge neo-badge-pink">
                  ⚠ Belum ada dokumen
                </span>
              )}
            </div>
          </div>

          {/* User avatar */}
          <div className="flex-shrink-0" aria-label={`Login sebagai ${userName}`}>
            <UserAvatar image={userImage} name={userName} />
          </div>
        </div>
      </header>

      {/* ═══ MESSAGES ══════════════════════════════════════════════════════════ */}
      <div className="chat-messages-area" ref={messagesContainerRef} role="log" aria-live="polite" aria-label="Riwayat percakapan">
        <div className="chat-messages-inner">

          {/* Empty state — no docs */}
          {docCount === 0 && (
            <div className="chat-empty-state">
              <div className="chat-empty-icon" aria-hidden="true">📭</div>
              <h2 className="chat-empty-title">Belum Ada Dokumen</h2>
              <p className="chat-empty-desc">
                Kategori ini belum memiliki dokumen. Minta admin untuk mengunggah dokumen terlebih dahulu.
              </p>
              <Link href="/browse" className="neo-button neo-button-yellow mt-4">
                ← Pilih Kategori Lain
              </Link>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              userName={userName}
              userImage={userImage}
            />
          ))}

          {/* Loading / typing indicator */}
          {isLoading && <TypingIndicator />}

          {/* Error toast */}
          {error && (
            <div className="chat-error animate-shake" role="alert">
              <span aria-hidden="true">⚠</span> {error}
              <button
                onClick={() => setError("")}
                className="chat-error-dismiss"
                aria-label="Tutup pesan error"
              >
                ✕
              </button>
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      </div>

      {/* ═══ STARTER QUESTIONS ═════════════════════════════════════════════════ */}
      {showStarters && messages.length === 1 && docCount > 0 && (
        <div className="chat-starters" aria-label="Pertanyaan awal yang disarankan">
          <p className="chat-starters-label">💡 Coba tanyakan:</p>
          <div className="chat-starters-grid">
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="chat-starter-btn"
                aria-label={`Tanyakan: ${q}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ INPUT BAR ═════════════════════════════════════════════════════════ */}
      <div className="chat-input-bar" role="form" aria-label="Form input pesan">
        <div className="chat-input-inner">
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading || docCount === 0}
              placeholder={
                docCount === 0
                  ? "Belum ada dokumen di kategori ini..."
                  : "Ketik pertanyaanmu... (Enter kirim, Shift+Enter baris baru)"
              }
              rows={1}
              className="chat-textarea"
              maxLength={2000}
              aria-label="Input pesan"
              aria-disabled={isLoading || docCount === 0}
            />

            {/* Char count */}
            {charCount > 0 && (
              <div className={`chat-char-count ${charCount > 1800 ? "chat-char-count--warn" : ""}`}>
                {charCount}/2000
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!canSend}
            className={`chat-send-btn ${canSend ? "chat-send-btn--active" : ""}`}
            aria-label="Kirim pesan"
          >
            {isLoading ? (
              <span className="neo-loading" aria-hidden="true">
                <span /><span /><span />
              </span>
            ) : (
              <span className="chat-send-icon" aria-hidden="true">➤</span>
            )}
            <span className="chat-send-label">{isLoading ? "..." : "Kirim"}</span>
          </button>
        </div>

        {/* Footer hint */}
        <p className="chat-footer-hint">
          <span aria-hidden="true">⚡</span> Dijawab berdasarkan dokumen koleksi · Zero Hallucination Protocol aktif
          <span className="hidden sm:inline"> · Enter untuk kirim</span>
        </p>
      </div>
    </div>
  );
}
