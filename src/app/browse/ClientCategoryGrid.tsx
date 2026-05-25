"use client";

import Link from "next/link";
import { useState } from "react";

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

export default function ClientCategoryGrid({ 
  categories, 
  isLoggedIn 
}: { 
  categories: Category[]; 
  isLoggedIn: boolean;
}) {
  const [query, setQuery] = useState("");

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

  const filtered = categories.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    (c.description?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-8 max-w-md">
        <div className="relative">
          <input 
            type="search" 
            placeholder="🔍 Cari kategori dokumen..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="neo-input w-full pl-4 pr-10 py-3"
            aria-label="Cari kategori"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="neo-card p-12 text-center bg-white">
          <div className="text-4xl mb-4" aria-hidden="true">🧐</div>
          <h2 className="font-mono font-bold text-xl mb-2">TIDAK DITEMUKAN</h2>
          <p className="font-sans text-gray-600">
            Tidak ada kategori yang cocok dengan pencarian "{query}".
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat, i) => (
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
      )}
    </div>
  );
}
