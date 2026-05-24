"use client";

import { useState, useTransition } from "react";
import { createCategory, updateCategory, deleteCategory } from "./actions";

type Category = {
  id: string;
  title: string;
  description: string | null;
  _count: { documents: number };
};

export default function CategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = (formData: FormData) => {
    setError("");
    startTransition(async () => {
      try {
        await createCategory(formData);
        setShowForm(false);
        window.location.reload();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal membuat kategori");
      }
    });
  };

  const handleUpdate = (id: string, formData: FormData) => {
    setError("");
    startTransition(async () => {
      try {
        await updateCategory(id, formData);
        setEditId(null);
        window.location.reload();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal mengupdate kategori");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini? Semua dokumen dan chunk terkait juga akan terhapus!")) return;
    startTransition(async () => {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal menghapus kategori");
      }
    });
  };

  return (
    <div>
      {/* Add button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="neo-badge neo-badge-yellow mb-2">MANAJEMEN RAK</div>
          <h1 className="font-mono font-bold text-3xl">KATEGORI</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); }}
          className="neo-button neo-button-yellow"
        >
          {showForm ? "✕ Tutup" : "+ Tambah Kategori"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="neo-card p-4 mb-4 border-neo-pink bg-red-50 animate-shake">
          <p className="font-mono text-sm text-neo-pink font-bold">⚠ {error}</p>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="neo-card neo-card-yellow p-6 mb-6 animate-slide-in">
          <h2 className="font-mono font-bold text-lg mb-4">TAMBAH KATEGORI BARU</h2>
          <form action={handleCreate} className="space-y-4">
            <div>
              <label className="neo-label">Judul Kategori *</label>
              <input name="title" className="neo-input" placeholder="e.g. Hukum Perdata" required />
            </div>
            <div>
              <label className="neo-label">Deskripsi</label>
              <textarea name="description" className="neo-textarea" placeholder="Deskripsi singkat tentang kategori ini..." />
            </div>
            <button type="submit" disabled={isPending} className="neo-button neo-button-black">
              {isPending ? "Menyimpan..." : "💾 Simpan Kategori"}
            </button>
          </form>
        </div>
      )}

      {/* Category List */}
      {categories.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="font-mono font-bold text-xl">Belum ada kategori</h2>
          <p className="font-sans text-gray-500 mt-2">Klik tombol di atas untuk mulai menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="neo-card p-5">
              {editId === cat.id ? (
                <form action={(fd) => handleUpdate(cat.id, fd)} className="space-y-3">
                  <div>
                    <label className="neo-label">Judul *</label>
                    <input name="title" defaultValue={cat.title} className="neo-input" required />
                  </div>
                  <div>
                    <label className="neo-label">Deskripsi</label>
                    <textarea name="description" defaultValue={cat.description || ""} className="neo-textarea" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={isPending} className="neo-button neo-button-green neo-button-sm">
                      {isPending ? "..." : "✓ Simpan"}
                    </button>
                    <button type="button" onClick={() => setEditId(null)} className="neo-button neo-button-ghost neo-button-sm">
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-mono font-bold text-lg">{cat.title}</h2>
                      <span className="neo-badge neo-badge-black">{cat._count.documents} dokumen</span>
                    </div>
                    <p className="font-sans text-sm text-gray-600 line-clamp-2">
                      {cat.description || <em>Tanpa deskripsi</em>}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setEditId(cat.id); setShowForm(false); }}
                      className="neo-button neo-button-yellow neo-button-sm"
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={isPending}
                      className="neo-button neo-button-pink neo-button-sm"
                    >
                      🗑 Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
