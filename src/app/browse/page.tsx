import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Browse Rak Buku",
  description:
    "Jelajahi koleksi kategori dokumen di LibrariAI dan mulai berdialog dengan AI.",
};

// ─── Revalidate setiap 60 detik (ISR) ────────────────────────────────────────
// Performance: ISR bukan force-dynamic — halaman di-cache & di-serve dari CDN
// dan hanya di-regenerasi saat data berubah atau setiap 60 detik.
export const revalidate = 60;

type Category = {
  id: string;
  title: string;
  description: string | null;
  _count: { documents: number };
};

const colors = [
  "neo-card-yellow",
  "",
  "neo-card-green",
  "",
  "neo-card-yellow",
  "",
];

// ─── Category Grid ────────────────────────────────────────────────────────────
async function CategoryGrid({ isLoggedIn }: { isLoggedIn: boolean }) {
  let categories: Category[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { documents: true } } },
    });
  } catch {
    // DB not connected yet
  }

  if (categories.length === 0) {
    return (
      <div className="neo-card p-12 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">📚</div>
        <h2 className="font-mono font-bold text-2xl mb-2">RAK MASIH KOSONG</h2>
        <p className="font-sans text-gray-600 mb-6">
          Belum ada kategori yang tersedia. Admin perlu menambahkan koleksi terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat, i) => (
        <Link
          key={cat.id}
          href={isLoggedIn ? `/chat/${cat.id}` : "/login"}
          className={`neo-card neo-card-hover p-6 block cursor-pointer ${colors[i % colors.length]}`}
          aria-label={`${cat.title} — ${cat._count.documents} dokumen. ${isLoggedIn ? "Chat sekarang" : "Login untuk mengakses"}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl" aria-hidden="true">📖</div>
            <span className="neo-badge neo-badge-black text-xs">
              {cat._count.documents} dok
            </span>
          </div>
          <h2 className="font-mono font-bold text-xl mb-2 leading-tight">
            {cat.title}
          </h2>
          <p className="font-sans text-sm leading-relaxed opacity-70 truncate-3">
            {cat.description || "Tidak ada deskripsi."}
          </p>
          <div className="mt-4 neo-button neo-button-black neo-button-sm inline-flex">
            {isLoggedIn ? "💬 Chat Sekarang" : "🔐 Login Dulu"}
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Skeleton placeholder (shown while CategoryGrid fetches) ──────────────────
function CategorySkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Memuat kategori...">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="neo-skeleton h-52" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BrowsePage() {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <main className="min-h-screen bg-neo-gray">
      {/* Nav */}
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
            <span className="font-mono font-bold text-lg">
              LIBRARI<span className="text-neo-pink">AI</span>
            </span>
          </Link>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <div className="flex gap-2">
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="neo-badge neo-badge-pink mb-4" aria-hidden="true">RAK BUKU DIGITAL</div>
          <h1 className="font-mono font-bold text-5xl tracking-tight">
            PILIH KATEGORI
          </h1>
          <p className="font-sans text-gray-600 mt-3">
            Pilih koleksi dokumen yang ingin kamu jelajahi, lalu mulai berdialog dengan AI.
          </p>
        </header>

        {/*
          Performance: Suspense boundary so the page shell renders immediately
          while the DB query runs in the background.
        */}
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryGrid isLoggedIn={isLoggedIn} />
        </Suspense>
      </div>
    </main>
  );
}
