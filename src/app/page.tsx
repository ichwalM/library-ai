import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "LibrariAI — Private Library AI Chat",
  description:
    "Tanya dokumenmu seperti kamu bertanya kepada ahlinya. RAG-powered private library chat dengan Zero Hallucination Protocol.",
};

// ─── Above-fold Marquee items (duplicated for seamless loop) ─────────────────
const marqueeItems = [
  "📚 LIBRARI AI",
  "⚡ RAG POWERED",
  "🔒 PRIVATE & SECURE",
  "🤖 ZERO HALLUCINATION",
  "📄 PDF · DOCX · TXT",
  "🧠 GEMINI AI",
  "📚 LIBRARI AI",
  "⚡ RAG POWERED",
  "🔒 PRIVATE & SECURE",
  "🤖 ZERO HALLUCINATION",
  "📄 PDF · DOCX · TXT",
  "🧠 GEMINI AI",
];

// ─── Feature Cards (below-fold, rendered lazily via Suspense) ─────────────────
const features = [
  {
    icon: "📄",
    title: "Multi-Format Upload",
    desc: "Dukung format PDF, DOCX, dan TXT. Upload sekali, tanya berkali-kali.",
    color: "neo-card-yellow",
  },
  {
    icon: "🔍",
    title: "Vector Search",
    desc: "Pencarian berbasis kemiripan semantik (Cosine Similarity) — bukan keyword biasa.",
    color: "",
  },
  {
    icon: "🤖",
    title: "Zero Hallucination",
    desc: "AI hanya menjawab dari dokumenmu. Tidak ada asumsi, tidak ada karangan.",
    color: "neo-card-black",
  },
];

const howItWorks = [
  { step: "01", label: "Upload Dokumen", icon: "⬆️" },
  { step: "02", label: "AI Proses & Embed", icon: "⚙️" },
  { step: "03", label: "Pilih Kategori", icon: "📚" },
  { step: "04", label: "Chat & Tanya!", icon: "💬" },
];

// ─── Navbar (Server Component – fast) ────────────────────────────────────────
async function Navbar() {
  const session = await auth();
  return (
    <nav
      className="border-b-4 border-neo-black bg-white sticky top-0 z-50"
      aria-label="Navigasi utama"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="LibrariAI Home">
          <div
            className="w-8 h-8 bg-neo-yellow border-3 border-neo-black flex items-center justify-center font-mono font-bold text-sm"
            aria-hidden="true"
          >
            L
          </div>
          <span className="font-mono font-bold text-lg tracking-tight">
            LIBRARI<span className="text-neo-pink">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3" role="navigation">
          <Link href="/browse" className="neo-button neo-button-ghost neo-button-sm">
            Browse
          </Link>
          {session ? (
            <div className="flex items-center gap-2">
              {session.user?.role === "admin" && (
                <Link href="/admin" className="neo-button neo-button-yellow neo-button-sm">
                  Dashboard
                </Link>
              )}
              <Link href="/api/auth/signout" className="neo-button neo-button-black neo-button-sm">
                Keluar
              </Link>
            </div>
          ) : (
            <Link href="/login" className="neo-button neo-button-black neo-button-sm">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Hero Section (above fold – critical render path) ─────────────────────────
async function HeroSection() {
  const session = await auth();

  return (
    <section className="flex-1 flex items-center" aria-labelledby="hero-heading">
      <div className="max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div>
            <div className="neo-badge neo-badge-pink mb-6" aria-hidden="true">
              ✦ RAG-Powered Library AI ✦
            </div>
            <h1
              id="hero-heading"
              className="font-mono font-bold text-5xl lg:text-7xl leading-none tracking-tight mb-6"
            >
              TANYA
              <span className="block text-neo-pink">DOKUMENMU</span>
              <span className="block">SEKARANG.</span>
            </h1>
            <p className="font-sans text-lg text-gray-700 mb-8 leading-relaxed max-w-lg">
              LibrariAI mengubah koleksi dokumenmu menjadi asisten AI yang cerdas.
              Upload PDF, DOCX, atau TXT — dan mulai berdialog dengan isinya secara langsung.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/browse"
                className="neo-button neo-button-yellow neo-button-lg"
                id="cta-browse"
              >
                🔍 Jelajahi Rak Buku
              </Link>
              <Link
                href={session ? "/browse" : "/login"}
                className="neo-button neo-button-black neo-button-lg"
                id="cta-start"
              >
                🚀 Mulai Sekarang
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-10" aria-label="Statistik platform">
              <div className="border-l-4 border-neo-yellow pl-4">
                <div className="font-mono font-bold text-2xl" aria-label="Teknologi RAG">RAG</div>
                <div className="text-sm text-gray-500 font-mono">Technology</div>
              </div>
              <div className="border-l-4 border-neo-pink pl-4">
                <div className="font-mono font-bold text-2xl" aria-label="Zero persen halusinasi">0%</div>
                <div className="text-sm text-gray-500 font-mono">Hallucination</div>
              </div>
              <div className="border-l-4 border-neo-green pl-4">
                <div className="font-mono font-bold text-2xl">MySQL</div>
                <div className="text-sm text-gray-500 font-mono">Backend</div>
              </div>
            </div>
          </div>

          {/* Right — Mock chat window */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              {/* Mock chat window – decorative, aria-hidden */}
              <div className="neo-card p-0 overflow-hidden" aria-hidden="true">
                {/* Titlebar */}
                <div className="bg-neo-black px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neo-pink border-2 border-neo-black" />
                  <div className="w-3 h-3 rounded-full bg-neo-yellow border-2 border-neo-black" />
                  <div className="w-3 h-3 rounded-full bg-neo-green border-2 border-neo-black" />
                  <span className="font-mono text-xs text-white ml-2 opacity-60">
                    chat / Hukum Perdata
                  </span>
                </div>
                {/* Chat messages */}
                <div className="p-4 space-y-4 bg-neo-gray min-h-64">
                  <div className="flex justify-end">
                    <div className="neo-bubble-user text-sm">
                      Apa itu pasal 1234 KUHPerdata?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="neo-bubble-ai text-sm">
                      Pasal 1234 KUHPerdata menetapkan tiga bentuk perikatan:
                      memberikan sesuatu, berbuat sesuatu, atau tidak berbuat
                      sesuatu...
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="neo-bubble-user text-sm">
                      Berikan contoh kasusnya!
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="neo-loading">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="font-mono text-xs text-gray-500">
                      LibrariAI sedang mengetik...
                    </span>
                  </div>
                </div>
                {/* Input bar */}
                <div className="p-3 bg-white border-t-3 border-neo-black flex gap-2">
                  <div className="neo-input text-sm flex-1 flex items-center text-gray-400 font-mono text-xs italic">
                    Ketik pertanyaanmu...
                  </div>
                  <div className="neo-button neo-button-yellow neo-button-sm" style={{ pointerEvents: "none" }}>
                    ➤
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div
                className="absolute -top-4 -right-4 neo-badge neo-badge-green animate-float"
                aria-hidden="true"
              >
                ZERO HALLUCINATION ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features Section (below fold – non-critical) ─────────────────────────────
function FeaturesSection() {
  return (
    <section
      className="border-t-4 border-neo-black bg-white py-20"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="neo-badge neo-badge-yellow mb-4" aria-hidden="true">
            FITUR UNGGULAN
          </div>
          <h2 id="features-heading" className="font-mono font-bold text-4xl">
            MENGAPA LIBRARI AI?
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <article key={f.title} className={`neo-card p-6 ${f.color}`}>
              <div className="text-4xl mb-4" aria-hidden="true">{f.icon}</div>
              <h3 className="font-mono font-bold text-xl mb-2">{f.title}</h3>
              <p className="font-sans text-sm leading-relaxed opacity-80">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works Section ─────────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section
      className="border-t-4 border-neo-black bg-neo-yellow py-20"
      aria-labelledby="how-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="how-heading" className="font-mono font-bold text-4xl">
            CARA KERJA
          </h2>
        </div>
        <ol className="grid md:grid-cols-4 gap-4" aria-label="Langkah-langkah penggunaan">
          {howItWorks.map((s) => (
            <li key={s.step} className="neo-card bg-white p-6 text-center">
              <div
                className="font-mono font-bold text-5xl mb-2 text-neo-black opacity-10"
                aria-hidden="true"
              >
                {s.step}
              </div>
              <div className="text-3xl mb-3" aria-hidden="true">{s.icon}</div>
              <div className="font-mono font-bold text-sm uppercase">{s.label}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t-4 border-neo-black bg-neo-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-mono font-bold text-xl" aria-label="LibrariAI">
          LIBRARI<span className="text-neo-yellow">AI</span>
        </div>
        <div className="font-mono text-sm text-gray-400">
          © {new Date().getFullYear()} LibrariAI · Built with Next.js + Gemini
        </div>
        <nav className="flex gap-4" aria-label="Footer navigation">
          <Link href="/browse" className="neo-button neo-button-yellow neo-button-sm">
            Browse
          </Link>
          <Link
            href="/admin"
            className="neo-button neo-button-ghost neo-button-sm"
            style={{ color: "white", borderColor: "white" }}
          >
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  return (
    <main className="min-h-screen bg-neo-gray flex flex-col">
      {/* Navbar – Server Component (above fold, critical) */}
      <Navbar />

      {/* Marquee Banner – above fold, lightweight */}
      <div className="neo-marquee-wrapper" aria-hidden="true">
        <div className="neo-marquee-track">
          {marqueeItems.map((item, i) => (
            <span key={i} className="neo-marquee-item">
              {item}&nbsp;✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Hero – above fold, critical */}
      <HeroSection />

      {/*
        Performance: Below-fold sections wrapped in Suspense.
        React can stream them after the hero content is shown,
        improving First Contentful Paint (FCP).
      */}
      <Suspense fallback={null}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={null}>
        <HowItWorksSection />
      </Suspense>

      <Footer />
    </main>
  );
}
