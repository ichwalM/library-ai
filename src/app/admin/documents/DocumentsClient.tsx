"use client";

import { useState, useRef, useTransition } from "react";
import { uploadDocument, deleteDocument } from "./actions";

type Category = { id: string; title: string };
type Document = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  status: string;
  createdAt: Date;
  category: { title: string };
  _count: { chunks: number };
};

export default function DocumentsClient({
  initialDocs,
  categories,
}: {
  initialDocs: Document[];
  categories: Category[];
}) {
  const [docs, setDocs] = useState<Document[]>(initialDocs);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (formData: FormData) => {
    if (!selectedFile) { setError("Pilih file terlebih dahulu."); return; }
    
    // Validasi ukuran file maks 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Ukuran file melebihi batas maksimal 10MB.");
      return;
    }

    setError(""); setSuccess("");
    formData.append("file", selectedFile);
    startTransition(async () => {
      try {
        await uploadDocument(formData);
        setSuccess("✓ Dokumen berhasil diupload dan diproses!");
        setSelectedFile(null);
        setShowForm(false);
        window.location.reload();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal mengupload dokumen");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus dokumen dan semua chunk-nya?")) return;
    startTransition(async () => {
      try {
        await deleteDocument(id);
        setDocs((prev) => prev.filter((d) => d.id !== id));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal menghapus");
      }
    });
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusColor = (status: string) => {
    if (status === "ready") return "neo-badge-green";
    if (status === "error") return "neo-badge-pink";
    return "neo-badge-yellow";
  };

  const statusLabel = (status: string) => {
    if (status === "ready") return "✓ Siap";
    if (status === "error") return "✕ Error";
    return "⏳ Proses";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="neo-badge neo-badge-black mb-2">RAG PIPELINE</div>
          <h1 className="font-mono font-bold text-3xl">DOKUMEN</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}
          className="neo-button neo-button-yellow"
        >
          {showForm ? "✕ Tutup" : "⬆ Upload Dokumen"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="neo-card p-4 mb-4 bg-red-50 border-neo-pink animate-shake">
          <p className="font-mono text-sm text-neo-pink font-bold">⚠ {error}</p>
        </div>
      )}
      {success && (
        <div className="neo-card neo-card-green p-4 mb-4 animate-slide-in">
          <p className="font-mono text-sm font-bold">{success}</p>
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="neo-card p-6 mb-6 animate-slide-in">
          <h2 className="font-mono font-bold text-lg mb-4">UPLOAD DOKUMEN BARU</h2>
          <form action={handleUpload} className="space-y-4">
            {/* Category Select */}
            <div>
              <label className="neo-label">Kategori *</label>
              <select name="categoryId" className="neo-input" required>
                <option value="">— Pilih Kategori —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Drag-drop zone */}
            <div>
              <label className="neo-label">File (PDF, DOCX, TXT) *</label>
              <div
                className={`border-4 border-dashed border-neo-black p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? "bg-neo-yellow" : "bg-neo-gray hover:bg-neo-yellow"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) setSelectedFile(f);
                }}
              >
                <div className="text-4xl mb-2">📁</div>
                {selectedFile ? (
                  <div>
                    <p className="font-mono font-bold text-sm">{selectedFile.name}</p>
                    <p className="font-mono text-xs text-gray-500">{formatSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <p className="font-mono text-sm">
                    Drag & drop atau klik untuk memilih file (Maks 10MB)
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <button
                type="submit"
                disabled={isPending || !selectedFile}
                className={`neo-button neo-button-black ${(!selectedFile || isPending) ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="neo-loading"><span /><span /><span /></div>
                    Memproses RAG Pipeline...
                  </span>
                ) : "🚀 Upload & Proses"}
              </button>
              {isPending && (
                <span className="font-mono text-xs text-gray-500">
                  Sedang mengekstrak teks & membuat embedding...
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Documents Table */}
      {docs.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="font-mono font-bold text-xl">Belum ada dokumen</h2>
          <p className="font-sans text-gray-500 mt-2">Upload dokumen pertamamu untuk mulai membangun RAG pipeline.</p>
        </div>
      ) : (
        <div className="neo-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-neo-black text-white">
              <tr>
                {["Nama File", "Kategori", "Ukuran", "Chunk", "Status", "Aksi"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr key={doc.id} className={`border-t-2 border-neo-black ${i % 2 === 0 ? "bg-white" : "bg-neo-gray"}`}>
                  <td className="px-4 py-3">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener"
                      className="font-mono text-sm font-bold hover:underline max-w-xs block truncate"
                    >
                      {doc.fileName}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm">{doc.category.title}</td>
                  <td className="px-4 py-3 font-mono text-xs">{formatSize(doc.fileSize)}</td>
                  <td className="px-4 py-3 font-mono text-sm font-bold">{doc._count.chunks}</td>
                  <td className="px-4 py-3">
                    <span className={`neo-badge ${statusColor(doc.status)}`}>
                      {statusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={isPending}
                      className="neo-button neo-button-pink neo-button-sm"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
