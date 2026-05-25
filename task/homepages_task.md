# 📚 Task Finishing & Copywriting LibrariAI

**Project:** LibrariAI (RAG-based Document Assistant)
**Author:** Ichwal
**Event:** Vibe Coding Mayar 2026
**Target Audience:** Lingkungan Akademik (Mahasiswa, Dosen, Peneliti)
**UI/UX Theme:** Neobrutalism (Bold, Edgy, Fungsional)

---

## 1. Homepage: Hero Section
**File Target:** `src/app/page.tsx` (atau komponen Hero)
**Objective:** Menarik perhatian pengunjung dalam 3 detik pertama dengan gaya Neobrutalism (teks besar, kontras tinggi).

* **H1 (Headline Utama):**
    `BACA RATUSAN JURNAL TANPA PERLU MEMBACANYA.`
* **P (Sub-headline):**
    `LibrariAI mengubah tumpukan PDF skripsi, modul praktikum, dan arsip jurnal akademik menjadi asisten pintar. Jangan buang waktu mencari halaman secara manual, tanyakan langsung pada dokumenmu.`
* **CTA (Call to Action) Buttons:**
    * Primary: `[ MULAI EKSPLORASI ]`
    * Secondary: `[ UNGGAH DOKUMEN ]`

---

## 2. Homepage: Problem vs Solution (Fitur Utama)
**File Target:** `src/components/Features.tsx`
**Objective:** Menjelaskan *pain point* akademik dan bagaimana LibrariAI menyelesaikannya. Dibuat dalam 3 kartu berjajar (*grid*) dengan border tebal khas Neobrutalism.

* **Card 1: Masalah Lama 😩**
    * *Judul:* Riset yang Melelahkan
    * *Deskripsi:* Mencari landasan teori spesifik di puluhan file PDF atau laporan penelitian sama seperti mencari jarum di tumpukan jerami. Bikin capek dan sangat menyita waktu mahasiswa maupun dosen.
* **Card 2: Solusi LibrariAI 🚀**
    * *Judul:* AI Bedah Dokumen
    * *Deskripsi:* Cukup unggah dokumen akademikmu. Mesin AI kami akan membedah, memahami konteks, dan siap menjawab pertanyaanmu secara akurat berdasarkan isi dokumen tersebut menggunakan teknologi RAG.
* **Card 3: Validasi Akademik 🎯**
    * *Judul:* Bebas Halusinasi & Tersitasi
    * *Deskripsi:* Tidak seperti AI generik yang sering mengarang jawaban, LibrariAI selalu menyertakan rujukan nama file aslinya. Valid dan bisa dipertanggungjawabkan untuk referensi tugas akhir.

---

## 3. Homepage: Tech Stack & Architecture (Flexing Section)
**File Target:** `src/components/TechStack.tsx`
**Objective:** Menunjukkan kepada juri kompetisi tingkat kompleksitas infrastruktur yang dibangun.

**Judul Bagian:** Ditenagai oleh Infrastruktur Modern & Hybrid Cloud
**List Teknologi:**
* **Frontend & Fullstack:** Next.js + React (Standalone Mode)
* **UI/UX:** Tailwind CSS dengan *Neobrutalism Design System*
* **AI Engine:** Google Gemini AI (Vector Embeddings & Chat) + RAG Pipeline
* **Database:** Prisma ORM dengan MySQL (`mst_users`, `mst_roles`, dll)
* **Infrastructure (Hybrid Cloud):** Google Cloud Run (Frontend & Engine) terhubung secara *real-time* dan aman dengan *Local Home Server* (Database) menggunakan protokol Cloudflare TCP Tunnel.

---

## 4. Halaman About Us
**File Target:** `src/app/about/page.tsx`
**Objective:** Menceritakan visi misi pengembangan LibrariAI secara singkat dan padat.

**H1:** Mendefinisikan Ulang Cara Kampus Belajar
**Paragraf Visi:**
> LibrariAI lahir dari sebuah keresahan sederhana di lingkungan fakultas: Pengetahuan itu melimpah, tapi akses untuk membedahnya terlalu konvensional dan lambat. Perpustakaan digital tradisional sering kali hanya berfungsi sebagai rak penyimpanan file mati. 
> 
> Kami hadir untuk menghidupkan dokumen-dokumen tersebut. Dengan memanfaatkan teknologi *Retrieval-Augmented Generation* (RAG), LibrariAI dirancang khusus untuk membantu mahasiswa dan dosen berinteraksi langsung dengan literatur mereka. Visi kami jelas: Jadikan proses riset, penyusunan paper, dan validasi data 10x lebih cepat, efisien, dan interaktif.

---

## ✅ Checklist Sebelum Presentasi (Vibe Coding)
- [ ] Pastikan animasi/hover efek tombol ala Neobrutalism (translasi X/Y dan bayangan solid) berjalan mulus.
- [ ] Siapkan 2-3 PDF contoh (contoh: Jurnal FIKOM UMI, modul praktikum, atau panduan akademik) untuk demo langsung ke juri.
- [ ] Uji coba login via Google OAuth di *production* URL (Cloud Run).
- [ ] Lakukan *stress test* memecah (*chunking*) PDF dan *chat* dengan Gemini untuk memastikan *timeout* aman.