import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Panel admin LibrariAI — pantau dan kelola seluruh konten.",
};

// ─── Performance: ISR 30 detik untuk dashboard stats ─────────────────────────
export const revalidate = 30;

export default async function AdminDashboard() {
  let stats = { categories: 0, documents: 0, chunks: 0 };

  try {
    // Performance: Parallel queries instead of sequential
    const [categories, documents, chunks] = await Promise.all([
      prisma.category.count(),
      prisma.document.count(),
      prisma.chunk.count(),
    ]);
    stats = { categories, documents, chunks };
  } catch {
    // DB not ready
  }

  const cards = [
    {
      label: "Total Kategori",
      value: stats.categories,
      icon: "📚",
      color: "neo-card-yellow",
      href: "/admin/categories",
      desc: "Kategori rak buku",
    },
    {
      label: "Total Dokumen",
      value: stats.documents,
      icon: "📄",
      color: "",
      href: "/admin/documents",
      desc: "Dokumen terupload",
    },
    {
      label: "Total Chunk",
      value: stats.chunks,
      icon: "🧩",
      color: "neo-card-green",
      href: "#",
      desc: "Potongan teks ter-embed",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-10">
        <div className="neo-badge neo-badge-yellow mb-3" aria-hidden="true">ADMIN PANEL</div>
        <h1 className="font-mono font-bold text-4xl">DASHBOARD</h1>
        <p className="font-sans text-gray-600 mt-2">
          Pantau dan kelola seluruh konten LibrariAI dari sini.
        </p>
      </header>

      {/* Stats Cards */}
      <div
        className="grid md:grid-cols-3 gap-6 mb-12"
        role="list"
        aria-label="Statistik platform"
      >
        {cards.map((card) => (
          <div
            key={card.label}
            className={`neo-card p-6 ${card.color}`}
            role="listitem"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl" aria-hidden="true">{card.icon}</span>
              <span
                className="font-mono font-bold text-5xl"
                aria-label={`${card.value} ${card.label}`}
              >
                {card.value}
              </span>
            </div>
            <div className="font-mono font-bold text-sm uppercase">{card.label}</div>
            <div className="font-sans text-xs text-gray-500 mt-1 opacity-70">{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <section className="neo-card p-6" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="font-mono font-bold text-xl mb-4">
          AKSI CEPAT
        </h2>
        <div className="flex flex-wrap gap-4">
          <a href="/admin/categories" className="neo-button neo-button-yellow" id="btn-add-category">
            + Tambah Kategori
          </a>
          <a href="/admin/documents" className="neo-button neo-button-black" id="btn-upload-doc">
            + Upload Dokumen
          </a>
          <a href="/browse" className="neo-button neo-button-green" id="btn-view-browse">
            🔍 Lihat Browse Page
          </a>
        </div>
      </section>
    </div>
  );
}
