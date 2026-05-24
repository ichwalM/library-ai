import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-neo-pink flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="neo-card p-8 mb-6">
          <div className="text-7xl mb-4">🚫</div>
          <h1 className="font-mono font-bold text-4xl mb-3">AKSES DITOLAK</h1>
          <p className="font-sans text-gray-700 mb-6">
            Kamu tidak memiliki izin untuk mengakses halaman ini. Halaman admin
            hanya dapat diakses oleh administrator yang terdaftar.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/" className="neo-button neo-button-yellow">
              ← Beranda
            </Link>
            <Link href="/browse" className="neo-button neo-button-black">
              Browse Rak Buku
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
