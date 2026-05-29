import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import MockChat from "@/components/MockChat";

export const metadata: Metadata = {
  title: "LibrariAI — Baca Ratusan Jurnal Tanpa Perlu Membacanya",
  description:
    "LibrariAI mengubah tumpukan PDF skripsi, modul praktikum, dan arsip jurnal akademik menjadi asisten pintar. Tanyakan langsung pada dokumenmu dengan teknologi RAG + Zero Hallucination.",
};

const marqueeItems = [
  "📚 LIBRARI AI", "⚡ RAG POWERED", "🔒 ZERO HALLUCINATION", "🤖 GEMINI AI",
  "📄 PDF · DOCX · TXT", "🏆 VIBE CODING 2026",
  "📚 LIBRARI AI", "⚡ RAG POWERED", "🔒 ZERO HALLUCINATION", "🤖 GEMINI AI",
  "📄 PDF · DOCX · TXT", "🏆 VIBE CODING 2026",
];

const problemSolution = [
  {
    icon: "😩", badge: "MASALAH LAMA", badgeColor: "neo-badge-pink",
    title: "Riset yang Melelahkan",
    desc: "Mencari landasan teori spesifik di puluhan file PDF atau laporan penelitian sama seperti mencari jarum di tumpukan jerami. Bikin capek dan sangat menyita waktu mahasiswa maupun dosen.",
    color: "",
  },
  {
    icon: "🚀", badge: "SOLUSI LIBRARIAI", badgeColor: "neo-badge-yellow",
    title: "AI Bedah Dokumen",
    desc: "Cukup unggah dokumen akademikmu. Mesin AI kami akan membedah, memahami konteks, dan siap menjawab pertanyaanmu secara akurat berdasarkan isi dokumen tersebut menggunakan teknologi RAG.",
    color: "neo-card-yellow",
  },
  {
    icon: "🎯", badge: "VALIDASI AKADEMIK", badgeColor: "neo-badge-black",
    title: "Bebas Halusinasi & Tersitasi",
    desc: "Tidak seperti AI generik yang sering mengarang jawaban, LibrariAI selalu menyertakan rujukan nama file aslinya. Valid dan bisa dipertanggungjawabkan untuk referensi tugas akhir.",
    color: "neo-card-black",
  },
];

const techStack = [
  { icon: "⚛️", label: "Frontend & Fullstack", value: "Next.js + React (Standalone Mode)" },
  { icon: "🎨", label: "UI/UX", value: "Tailwind CSS + Neobrutalism Design System" },
  { icon: "🤖", label: "AI Engine", value: "Google Gemini AI — Vector Embeddings & RAG Pipeline" },
  { icon: "🗄️", label: "Database", value: "Prisma ORM dengan MySQL (MariaDB)" },
  { icon: "☁️", label: "Infrastructure", value: "GCP Cloud Run ↔ Local DB via Cloudflare TCP Tunnel" },
];

const howItWorks = [
  { step: "01", label: "Upload Dokumen", icon: "⬆️" },
  { step: "02", label: "AI Proses & Embed", icon: "⚙️" },
  { step: "03", label: "Pilih Kategori", icon: "📚" },
  { step: "04", label: "Chat & Tanya!", icon: "💬" },
];

async function Navbar() {
  const session = await auth();
  return (
    <nav className="border-b-4 border-neo-black bg-white sticky top-0 z-50" aria-label="Navigasi utama">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="LibrariAI Home">
          <div className="w-8 h-8 bg-neo-yellow border-3 border-neo-black flex items-center justify-center font-mono font-bold text-sm" aria-hidden="true">L</div>
          <span className="font-mono font-bold text-lg tracking-tight">LIBRARI<span className="text-neo-pink">AI</span></span>
        </Link>
        <div className="flex items-center gap-3" role="navigation">
          <Link href="/browse" className="neo-button neo-button-ghost neo-button-sm">Browse</Link>
          <Link href="/about" className="neo-button neo-button-ghost neo-button-sm">Tentang</Link>
          {session ? (
            <div className="flex items-center gap-2">
              {session.user?.role === "admin" && (
                <Link href="/admin" className="neo-button neo-button-yellow neo-button-sm">Dashboard</Link>
              )}
              <Link href="/api/auth/signout" className="neo-button neo-button-black neo-button-sm">Keluar</Link>
            </div>
          ) : (
            <Link href="/login" className="neo-button neo-button-black neo-button-sm">Masuk</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

async function HeroSection() {
  const session = await auth();
  return (
    <section className="flex-1 flex items-center neo-bg-pattern border-b-4 border-neo-black" aria-labelledby="hero-heading">
      <div className="max-w-7xl mx-auto px-4 py-20 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="neo-badge neo-badge-pink mb-6" aria-hidden="true">✦ RAG-Powered Academic Assistant ✦</div>
            <h1 id="hero-heading" className="font-mono font-bold text-5xl lg:text-6xl leading-none tracking-tight mb-6">
              BACA RATUSAN
              <span className="block text-neo-pink">JURNAL TANPA</span>
              <span className="block">PERLU MEMBACANYA.</span>
            </h1>
            <p className="font-sans text-lg text-gray-700 mb-8 leading-relaxed max-w-lg">
              LibrariAI mengubah tumpukan PDF skripsi, modul praktikum, dan arsip jurnal akademik menjadi asisten pintar. Jangan buang waktu mencari halaman secara manual — tanyakan langsung pada dokumenmu.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/browse" className="neo-button neo-button-yellow neo-button-lg" id="cta-browse">
                📚 MULAI EKSPLORASI
              </Link>
              <Link href={session ? "/admin/documents" : "/login"} className="neo-button neo-button-black neo-button-lg" id="cta-upload">
                ⬆️ UNGGAH DOKUMEN
              </Link>
            </div>
            <div className="flex gap-6 mt-10" aria-label="Statistik platform">
              <div className="border-l-4 border-neo-yellow pl-4">
                <div className="font-mono font-bold text-2xl">RAG</div>
                <div className="text-sm text-gray-500 font-mono">Technology</div>
              </div>
              <div className="border-l-4 border-neo-pink pl-4">
                <div className="font-mono font-bold text-2xl">0%</div>
                <div className="text-sm text-gray-500 font-mono">Hallucination</div>
              </div>
              <div className="border-l-4 border-neo-black pl-4">
                <div className="font-mono font-bold text-2xl">10x</div>
                <div className="text-sm text-gray-500 font-mono">Lebih Cepat</div>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <MockChat />
              <div className="absolute -top-4 -right-4 neo-badge neo-badge-green animate-float" aria-hidden="true">
                ZERO HALLUCINATION ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSolutionSection() {
  return (
    <section className="border-t-4 border-neo-black bg-white py-20" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="neo-badge neo-badge-yellow mb-4" aria-hidden="true">MENGAPA LIBRARI AI?</div>
          <h2 id="features-heading" className="font-mono font-bold text-4xl lg:text-5xl">DARI MASALAH KE SOLUSI.</h2>
          <p className="font-sans text-gray-600 mt-4 max-w-xl mx-auto">Kami paham betul betapa melelahkannya riset akademik konvensional.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {problemSolution.map((f) => (
            <article key={f.title} className={`neo-card p-6 ${f.color} flex flex-col gap-3`}>
              <div className={`neo-badge ${f.badgeColor} self-start`}>{f.badge}</div>
              <div className="text-4xl" aria-hidden="true">{f.icon}</div>
              <h3 className="font-mono font-bold text-xl">{f.title}</h3>
              <p className="font-sans text-sm leading-relaxed opacity-80">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="border-t-4 border-neo-black bg-neo-yellow py-20" aria-labelledby="how-heading">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="how-heading" className="font-mono font-bold text-4xl">CARA KERJA</h2>
          <p className="font-sans text-gray-800 mt-4 max-w-xl mx-auto">Empat langkah mudah dari dokumen mentah menjadi asisten AI yang siap menjawab.</p>
        </div>
        <ol className="grid md:grid-cols-4 gap-4" aria-label="Langkah-langkah penggunaan">
          {howItWorks.map((s) => (
            <li key={s.step} className="neo-card bg-white p-6 text-center">
              <div className="font-mono font-bold text-5xl mb-2 text-neo-black opacity-10" aria-hidden="true">{s.step}</div>
              <div className="text-3xl mb-3" aria-hidden="true">{s.icon}</div>
              <div className="font-mono font-bold text-sm uppercase">{s.label}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function TechStackSection() {
  return (
    <section className="border-t-4 border-neo-black bg-neo-black text-white py-20" aria-labelledby="tech-heading">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="neo-badge neo-badge-yellow mb-4" aria-hidden="true">INFRASTRUKTUR</div>
          <h2 id="tech-heading" className="font-mono font-bold text-4xl lg:text-5xl text-white">
            DITENAGAI INFRASTRUKTUR
            <span className="block text-neo-yellow">MODERN & HYBRID CLOUD.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((t) => (
            <div key={t.label} className="border-3 border-white p-5 flex gap-4 items-start hover:border-neo-yellow hover:bg-white hover:text-neo-black transition-colors duration-150">
              <span className="text-3xl flex-shrink-0" aria-hidden="true">{t.icon}</span>
              <div>
                <div className="font-mono text-xs font-bold uppercase opacity-50 mb-1">{t.label}</div>
                <div className="font-sans text-sm leading-snug font-medium">{t.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 border-3 border-white p-6 font-mono text-sm text-center">
          <div className="opacity-50 text-xs uppercase mb-3">Arsitektur Hybrid Cloud</div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-neo-yellow font-bold">
            <span className="border-2 border-neo-yellow px-3 py-1">GCP Cloud Run</span>
            <span className="opacity-50">↔  Cloudflare TCP Tunnel  ↔</span>
            <span className="border-2 border-neo-yellow px-3 py-1">Local DB Server</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t-4 border-neo-black bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-mono font-bold text-xl">LIBRARI<span className="text-neo-pink">AI</span></div>
        <Link href="https://walldev.my.id/" className="font-mono text-sm " target="_blank">
          © {new Date().getFullYear()} LibrariAI · Ichwal · Built with Next.js + Gemini AI
        </Link>
        <nav className="flex gap-4" aria-label="Footer navigation">
          <Link href="/browse" className="neo-button neo-button-yellow neo-button-sm">Browse</Link>
          <Link href="/about" className="neo-button neo-button-ghost neo-button-sm">About</Link>
          <Link href="/admin" className="neo-button neo-button-black neo-button-sm">Admin</Link>
        </nav>
      </div>
    </footer>
  );
}

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-neo-gray flex flex-col">
      <Navbar />
      <div className="neo-marquee-wrapper" aria-hidden="true">
        <div className="neo-marquee-track">
          {marqueeItems.map((item, i) => (
            <span key={i} className="neo-marquee-item">{item}&nbsp;✦&nbsp;</span>
          ))}
        </div>
      </div>
      <HeroSection />
      <Suspense fallback={null}><ProblemSolutionSection /></Suspense>
      <Suspense fallback={null}><HowItWorksSection /></Suspense>
      <Suspense fallback={null}><TechStackSection /></Suspense>
      <Footer />
    </main>
  );
}
