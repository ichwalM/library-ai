"use client";

import { useState, useEffect } from "react";

const CHAT_SEQUENCE = [
  { 
    type: "ai", 
    text: "Halo! Saya siap membantu kamu menjelajahi koleksi \"Jaringan Komputer\".\n\nKoleksi ini memiliki 1 dokumen yang siap diakses. Tanyakan apa saja tentang isinya, dan saya akan menjawab berdasarkan dokumen yang tersedia.\n\n⚡ Zero Hallucination Protocol aktif — saya hanya menjawab dari sumber dokumen." 
  },
  { type: "user", text: "Jelaskan konsep TCP/IP dari modul!" },
  { type: "ai", text: "Berdasarkan [Modul_Jaringan.pdf], TCP/IP adalah suite protokol komunikasi yang digunakan untuk menghubungkan perangkat jaringan di internet." },
  { type: "user", text: "Bedanya dengan UDP apa?" },
  { type: "ai", text: "UDP lebih cepat namun tidak menjamin pengiriman data utuh (connectionless), sangat cocok untuk streaming video atau game online." },
];

export default function MockChat() {
  const [messages, setMessages] = useState<{type: string, text: string}[]>([]);
  const [typingText, setTypingText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (step >= CHAT_SEQUENCE.length) {
      timeout = setTimeout(() => {
        setMessages([]);
        setTypingText("");
        setIsAiTyping(false);
        setStep(0);
        setCharIndex(0);
      }, 5000);
      return () => clearTimeout(timeout);
    }

    const currentMsg = CHAT_SEQUENCE[step];

    if (currentMsg.type === "user") {
      setIsAiTyping(false);
      if (charIndex < currentMsg.text.length) {
        timeout = setTimeout(() => {
          setTypingText((prev) => prev + currentMsg.text[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setMessages((prev) => [...prev, currentMsg]);
          setTypingText("");
          setCharIndex(0);
          setStep((prev) => prev + 1);
        }, 1000);
      }
    } else if (currentMsg.type === "ai") {
      setIsAiTyping(true);
      timeout = setTimeout(() => {
        setIsAiTyping(false);
        setMessages((prev) => [...prev, currentMsg]);
        setStep((prev) => prev + 1);
      }, 1500); // Waktu AI memproses (800ms)
    }

    return () => clearTimeout(timeout);
  }, [step, charIndex]); // Hapus isAiTyping dari dependency agar timeout tidak tercancel saat state berubah

  return (
    <div className="neo-card p-0 overflow-hidden" aria-hidden="true">
      {/* Titlebar */}
      <div className="bg-neo-black px-4 py-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-neo-pink border-2 border-neo-black" />
        <div className="w-3 h-3 rounded-full bg-neo-yellow border-2 border-neo-black" />
        <div className="w-3 h-3 rounded-full bg-neo-green border-2 border-neo-black" />
        <span className="font-mono text-xs text-white ml-2 opacity-60">librariai / Jaringan Komputer</span>
      </div>
      
      {/* Chat messages */}
      <div className="p-4 space-y-4 bg-neo-gray min-h-[320px] flex flex-col justify-end overflow-hidden relative">
        <div className="space-y-4 absolute bottom-4 left-4 right-4 flex flex-col justify-end">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`${msg.type === "user" ? "neo-bubble-user" : "neo-bubble-ai"} text-sm animate-fade-in whitespace-pre-wrap`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isAiTyping && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="neo-loading"><span /><span /><span /></div>
              <span className="font-mono text-xs text-gray-500">LibrariAI sedang memproses...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Input bar */}
      <div className="p-3 bg-white border-t-3 border-neo-black flex gap-2">
        <div className="neo-input text-sm flex-1 flex items-center font-mono text-xs overflow-hidden whitespace-nowrap">
          {typingText || <span className="text-gray-400 italic">Tanya dokumenmu...</span>}
          {typingText && <span className="inline-block w-1.5 h-3.5 bg-neo-black ml-0.5 animate-pulse" />}
        </div>
        <div className={`neo-button ${typingText.length > 0 ? "neo-button-pink" : "neo-button-yellow"} neo-button-sm transition-colors duration-200`} style={{ pointerEvents: "none" }}>
          ➤
        </div>
      </div>
    </div>
  );
}
