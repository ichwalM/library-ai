import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang LibrariAI — Mendefinisikan Ulang Cara Kampus Belajar",
  description:
    "LibrariAI lahir dari keresahan akademik: pengetahuan yang melimpah namun sulit diakses. Kami menghadirkan teknologi RAG untuk menghidupkan perpustakaan digital Anda.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-neo-gray flex flex-col">
      {/* Navbar */}
      <nav className="border-b-4 border-neo-black bg-white sticky top-0 z-50" aria-label="Navigasi utama">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neo-yellow border-3 border-neo-black flex items-center justify-center font-mono font-bold text-sm">L</div>
            <span className="font-mono font-bold text-lg tracking-tight">LIBRARI<span className="text-neo-pink">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="neo-button neo-button-ghost neo-button-sm">Home</Link>
            <Link href="/browse" className="neo-button neo-button-yellow neo-button-sm">Browse</Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="border-b-4 border-neo-black bg-neo-black text-white py-20" aria-labelledby="about-heading">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="neo-badge neo-badge-yellow mb-6 mx-auto inline-block">✦ TENTANG KAMI ✦</div>
          <h1 id="about-heading" className="font-mono font-bold text-5xl lg:text-6xl leading-tight mb-6">
            MENDEFINISIKAN ULANG
            <span className="block text-neo-yellow">CARA KAMPUS BELAJAR.</span>
          </h1>
          <p className="font-sans text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Dari keresahan seorang mahasiswa menjadi solusi untuk seluruh ekosistem akademik.
          </p>
        </div>
      </section>

      {/* Visi Section */}
      <section className="py-20 bg-white border-b-4 border-neo-black" aria-labelledby="visi-heading">
        <div className="max-w-4xl mx-auto px-4">
          <div className="neo-badge neo-badge-pink mb-6 inline-block">VISI & LATAR BELAKANG</div>
          <h2 id="visi-heading" className="font-mono font-bold text-3xl lg:text-4xl mb-8">
            Lahir dari Keresahan Nyata
          </h2>
          <div className="space-y-6">
            <p className="font-sans text-lg text-gray-700 leading-relaxed border-l-4 border-neo-yellow pl-6">
              LibrariAI lahir dari sebuah keresahan sederhana di lingkungan fakultas: <strong>Pengetahuan itu melimpah, tapi akses untuk membedahnya terlalu konvensional dan lambat.</strong> Perpustakaan digital tradisional sering kali hanya berfungsi sebagai rak penyimpanan file mati.
            </p>
            <p className="font-sans text-lg text-gray-700 leading-relaxed">
              Kami hadir untuk menghidupkan dokumen-dokumen tersebut. Dengan memanfaatkan teknologi <em>Retrieval-Augmented Generation</em> (RAG), LibrariAI dirancang khusus untuk membantu mahasiswa dan dosen berinteraksi langsung dengan literatur mereka.
            </p>
            <div className="neo-card neo-card-yellow p-6">
              <p className="font-mono font-bold text-lg">
                🎯 Visi kami jelas: Jadikan proses riset, penyusunan paper, dan validasi data <span className="text-neo-black underline">10x lebih cepat</span>, efisien, dan interaktif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai-nilai */}
      <section className="py-20 bg-neo-gray border-b-4 border-neo-black" aria-labelledby="values-heading">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="neo-badge neo-badge-black mb-4 inline-block">PRINSIP KAMI</div>
            <h2 id="values-heading" className="font-mono font-bold text-3xl lg:text-4xl">Dibangun di Atas Tiga Pilar</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="neo-card bg-white p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-mono font-bold text-lg mb-2">PRIVASI PERTAMA</h3>
              <p className="font-sans text-sm text-gray-600 leading-relaxed">
                Dokumen Anda adalah milik Anda. Sistem kami dirancang agar konten tidak pernah keluar dari lingkungan yang Anda kendalikan.
              </p>
            </div>
            <div className="neo-card neo-card-yellow p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-mono font-bold text-lg mb-2">ZERO HALLUCINATION</h3>
              <p className="font-sans text-sm leading-relaxed">
                AI hanya menjawab berdasarkan konteks dokumen. Setiap jawaban disertai referensi nama file sumber, bukan tebakan.
              </p>
            </div>
            <div className="neo-card neo-card-black p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-mono font-bold text-lg mb-2">PERFORMA TINGGI</h3>
              <p className="font-sans text-sm text-gray-300 leading-relaxed">
                Dibangun di atas arsitektur Hybrid Cloud GCP + Cloudflare untuk memastikan respons cepat dan ketersediaan tinggi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Detail */}
      <section className="py-20 bg-white border-b-4 border-neo-black" aria-labelledby="tech-about-heading">
        <div className="max-w-4xl mx-auto px-4">
          <div className="neo-badge neo-badge-yellow mb-6 inline-block">TEKNOLOGI</div>
          <h2 id="tech-about-heading" className="font-mono font-bold text-3xl lg:text-4xl mb-8">
            Bagaimana RAG Bekerja?
          </h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Upload & Chunking", desc: "Dokumen Anda dipecah menjadi potongan kecil (chunks) yang bermakna secara kontekstual." },
              { step: "2", title: "Vector Embedding", desc: "Setiap chunk diubah menjadi representasi numerik (vektor) menggunakan Google Gemini Embedding API." },
              { step: "3", title: "Semantic Search", desc: "Saat Anda bertanya, pertanyaan juga di-embed. Kami cari chunk paling mirip menggunakan Cosine Similarity." },
              { step: "4", title: "Augmented Response", desc: "Chunk yang relevan dikirim ke Gemini sebagai konteks. AI menjawab hanya dari sumber dokumen Anda." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start border-3 border-neo-black p-4 bg-neo-gray">
                <div className="font-mono font-bold text-3xl text-neo-black opacity-20 flex-shrink-0 w-10">{item.step}</div>
                <div>
                  <div className="font-mono font-bold text-base mb-1">{item.title}</div>
                  <div className="font-sans text-sm text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-neo-yellow border-b-4 border-neo-black">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-mono font-bold text-4xl mb-6">SIAP MENCOBA?</h2>
          <p className="font-sans text-lg mb-8">Mulai eksplorasi koleksi dokumen atau unggah dokumenmu sendiri sekarang.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/browse" className="neo-button neo-button-black neo-button-lg">
              📚 Jelajahi Koleksi
            </Link>
            <Link href="/login" className="neo-button neo-button-white neo-button-lg">
              🚀 Masuk & Mulai
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-neo-black bg-neo-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono font-bold text-xl">LIBRARI<span className="text-neo-yellow">AI</span></div>
          <Link href="https://walldev.my.id/" className="font-mono text-sm text-gray-400" target="_blank">
            © {new Date().getFullYear()} LibrariAI · Ichwal · Built with Next.js + Gemini AI
          </Link>
          <nav className="flex gap-4">
            <Link href="/" className="neo-button neo-button-ghost neo-button-sm" style={{ color: "white", borderColor: "white" }}>Home</Link>
            <Link href="/browse" className="neo-button neo-button-yellow neo-button-sm">Browse</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
