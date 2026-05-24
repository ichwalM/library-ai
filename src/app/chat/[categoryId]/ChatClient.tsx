"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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

const STARTER_QUESTIONS = [
  "Apa ringkasan dari dokumen ini?",
  "Apa poin-poin utama yang dibahas?",
  "Jelaskan konsep terpenting dalam koleksi ini.",
  "Apakah ada definisi atau istilah khusus?",
];

export default function ChatClient({ category, docCount, userImage, userName }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo! Saya siap membantu kamu menjelajahi koleksi **"${category.title}"**.\n\nKoleksi ini memiliki **${docCount} dokumen** yang siap diakses. Tanyakan apa saja tentang isinya, dan saya akan menjawab berdasarkan dokumen yang tersedia.\n\n⚡ _Zero Hallucination Protocol aktif — saya hanya menjawab dari sumber dokumen._`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

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

    // Prepare history for API (exclude welcome message)
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
        throw new Error(errData.error || "Gagal mendapatkan respons");
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
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Format message content with basic markdown-like rendering
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen bg-neo-gray">
      {/* ─── HEADER ─── */}
      <header className="border-b-4 border-neo-black bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/browse" className="neo-button neo-button-ghost neo-button-sm flex-shrink-0">
            ← Kembali
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <h1 className="font-mono font-bold text-lg truncate">{category.title}</h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="neo-badge neo-badge-green text-xs">{docCount} dokumen siap</span>
              <span className="neo-badge neo-badge-black text-xs">ZERO HALLUCINATION ✓</span>
            </div>
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                width={32}
                height={32}
                className="border-2 border-neo-black"
              />
            ) : (
              <div className="w-8 h-8 bg-neo-yellow border-2 border-neo-black flex items-center justify-center font-mono font-bold text-sm">
                {userName[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── MESSAGES ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-in`}
            >
              {/* Role label */}
              <div className={`font-mono text-xs text-gray-500 mb-1 ${msg.role === "user" ? "text-right" : ""}`}>
                {msg.role === "user" ? `${userName} · ${formatTime(msg.timestamp)}` : `LibrariAI · ${formatTime(msg.timestamp)}`}
              </div>

              {/* Bubble */}
              <div
                className={msg.role === "user" ? "neo-bubble-user" : "neo-bubble-ai"}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="neo-bubble-ai">
                <div className="flex items-center gap-2">
                  <div className="neo-loading">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="font-mono text-xs">LibrariAI sedang mencari...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="neo-card p-3 bg-red-50 border-neo-pink animate-shake max-w-md mx-auto">
              <p className="font-mono text-xs text-neo-pink font-bold">⚠ {error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ─── STARTER QUESTIONS (shown when only welcome message) ─── */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 border-t-2 border-dashed border-gray-300">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <p className="font-mono text-xs text-gray-500 mb-2">💡 PERTANYAAN AWAL:</p>
            <div className="flex flex-wrap gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="neo-button neo-button-ghost neo-button-sm text-xs border-dashed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── INPUT BAR ─── */}
      <div className="flex-shrink-0 border-t-4 border-neo-black bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={docCount === 0 ? "Belum ada dokumen di kategori ini..." : "Ketik pertanyaanmu... (Enter untuk kirim, Shift+Enter baris baru)"}
              rows={1}
              className="neo-textarea flex-1 min-h-[44px] max-h-32 resize-none py-2.5"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim() || docCount === 0}
              className={`neo-button neo-button-yellow flex-shrink-0 ${(isLoading || !input.trim() || docCount === 0) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <div className="neo-loading"><span /><span /><span /></div>
              ) : (
                "➤ Kirim"
              )}
            </button>
          </div>
          <p className="font-mono text-xs text-gray-400 mt-2 text-center">
            ⚡ Dijawab berdasarkan dokumen koleksi · Zero Hallucination Protocol aktif
          </p>
        </div>
      </div>
    </div>
  );
}
