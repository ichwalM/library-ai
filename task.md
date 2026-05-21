# Blueprint Task: LibrariAI v2 (MySQL Edition)

## 🎯 Tujuan Proyek
Membangun ulang aplikasi **LibrariAI** (Private Library AI Chat berbasis RAG) menggunakan desain antarmuka *Neo-Brutalism* dan alur fitur yang sama persis dengan versi aslinya, namun **mengganti seluruh ekosistem backend (database & authentication) dari Firebase menjadi MySQL**.

File ini dirancang sebagai acuan langkah demi langkah (SOP) bagi Agen AI untuk mengeksekusi pembuatan kode secara terstruktur dan komprehensif.

---

## 🛠 Tech Stack Utama
- **Frontend Framework**: Next.js 15 (App Router) & React 19.
- **Styling**: Tailwind CSS (Wajib menggunakan desain Neo-Brutalism).
- **Database**: MySQL.
- **ORM**: Prisma atau Drizzle ORM (pilih salah satu untuk mempermudah interaksi dan migrasi skema MySQL).
- **Authentication**: NextAuth.js (Auth.js v5) dengan Google Provider.
- **AI & RAG**: `@google/genai` (Gemini SDK) dan `ai` (Vercel AI SDK).
- **File Storage**: Penyimpanan lokal (`public/uploads`) atau sistem penyimpanan file sederhana berbasis direktori untuk tahap awal.

---

## 🎨 Panduan Desain (Neo-Brutalism)
Pastikan konfigurasi Tailwind (`tailwind.config.js`) dan *stylesheet global* mengatur tema Neo-Brutalism berikut:
- **Warna Kontras**: `neo-yellow` (#FFDE03), `neo-pink` (#FF007F), `neo-green` (#00FF7F), `neo-black` (#000000).
- **Borders**: Garis tepi harus tebal berwarna hitam tegas (`border-4 border-neo-black`).
- **Shadows**: Bayangan keras tidak memudar (*solid shadow*), contoh: `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`.
- **Elemen Interaktif**: Tombol menggunakan transisi kasar, misal bergeser posisi saat di-hover (`hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]`).

---

## 📋 Daftar Tugas (Task List)

### Phase 1: Inisialisasi Proyek & Konfigurasi Dasar
- [ ] Inisialisasi aplikasi Next.js baru dengan TypeScript dan TailwindCSS.
- [ ] Konfigurasi `tailwind.config.js` untuk mendaftarkan variabel warna dan bayangan bergaya Neo-Brutalism.
- [ ] Buat fail `globals.css` untuk kelas *utility* dasar (seperti `.neo-button`, `.neo-card`, `.neo-input`).
- [ ] Buat halaman utama pendaratan (`app/page.tsx`) dengan desain yang *bold* dan menarik perhatian (Hero section ala LibrariAI).

### Phase 2: Setup Database MySQL & Schema (ORM)
- [ ] Hubungkan proyek dengan database MySQL menggunakan ORM (contoh: Prisma).
- [ ] Buat dan terapkan rancangan *Schema* database:
  - **User**: Menyimpan data autentikasi dan otorisasi (Admin role).
  - **Category**: Menyimpan daftar perpustakaan/rak buku (kolom: `id`, `title`, `description`).
  - **Document**: Menyimpan metadata file yang diunggah pengguna (kolom: `id`, `categoryId`, `fileName`, `fileUrl`).
  - **Chunk**: Menyimpan potongan teks dari dokumen dan *embedding* vektornya (kolom: `id`, `documentId`, `content`, `embedding`). *Catatan: Embedding dapat disimpan menggunakan tipe kolom JSON untuk kemudahan, atau jika MySQL versi 9.0+, manfaatkan fitur vektor bawaan.*

### Phase 3: Setup Autentikasi (NextAuth)
- [ ] Instal dan konfigurasikan NextAuth.js untuk autentikasi menggunakan akun Google.
- [ ] Implementasikan fungsi proteksi *route* (*middleware* atau *guard*) untuk membatasi akses URL `/admin` hanya bagi email tertentu yang diizinkan (Administrator).
- [ ] Buat halaman *login* kustom yang terintegrasi dengan desain Neo-Brutalism.

### Phase 4: Pembuatan Admin Dashboard & Manajemen Data
- [ ] **Dashboard Admin** (`/admin`): Rancang halaman *overview* dengan kartu statis yang menampilkan total kategori dan dokumen di database.
- [ ] **Manajemen Kategori** (`/admin/categories`): Buat fitur CRUD penuh (Create, Read, Update, Delete) untuk mencatat kategori/rak buku ke dalam MySQL.
- [ ] **Sistem Upload & RAG Pipeline** (`/admin/documents`):
  - Buat form untuk mengunggah file (dukungan ekstensi `.pdf`, `.docx`, `.txt`).
  - Ekstrak teks dari file yang diunggah (gunakan library seperti `pdf-parse` atau `mammoth`).
  - Terapkan logika pemecahan teks (*text chunking*) menjadi potongan yang lebih kecil.
  - Gunakan Google Gemini API (`gemini-embedding-2-preview`) untuk menghasilkan vektor *embedding* dari tiap potongan teks.
  - Simpan keseluruhan teks dan *array* vektor ke dalam tabel `Chunk` di MySQL.

### Phase 5: Implementasi Pencarian Vektor (Vector Search)
- [ ] Buat fungsi backend atau endpoint API (`/api/search`) yang menerima input teks pertanyaan dari pengguna.
- [ ] Konversikan teks input tersebut menjadi vektor menggunakan model *embedding* Gemini.
- [ ] Implementasikan perhitungan kemiripan (*Cosine Similarity*) antara vektor input dengan kumpulan vektor di tabel `Chunk`. *(Catatan teknis: Jika tidak ada fungsi native vector di MySQL yang digunakan, lakukan kalkulasi cosine similarity dengan fungsi matematika standar berbasis kode di Node.js/Backend, ambil 5 hasil dengan skor tertinggi)*.

### Phase 6: Antarmuka Chat & Zero Hallucination Protocol
- [ ] Buat antarmuka direktori rak buku (`/browse`) agar pengguna dapat memilih kategori yang akan diajak berbincang.
- [ ] Kembangkan antarmuka obrolan AI utama (`/chat/[categoryId]`) dengan desain jendela obrolan brutalist.
- [ ] Integrasikan Vercel AI SDK dan Gemini model (`gemini-3-flash-preview`) untuk memicu respons percakapan.
- [ ] Wajib aplikasikan **Zero Hallucination Protocol**: Sisipkan konteks teks hasil pencarian vektor (*Vector Search*) dari MySQL ke dalam *System Instructions*. Instruksikan AI secara eksplisit: *"Kamu adalah asisten perpustakaan. Hanya jawab menggunakan konteks yang diberikan. Dilarang merangkai fakta dari luar konteks. Jika jawabannya tidak ada di teks, balas 'Maaf, informasi tidak tersedia'."*

---

## ⚠️ Aturan Penting Eksekusi untuk Agen AI
1. **DILARANG** menggunakan infrastruktur Firebase (Firestore, Firebase Storage, Firebase Auth). Semua data wajib berada di MySQL.
2. Akses AI ke model Google wajib menggunakan *Environment Variable* standar (mis. `NEXT_PUBLIC_GEMINI_API_KEY` atau `GEMINI_API_KEY`).
3. Konsistensi UI/UX sangat krusial. Desain harus agresif, minim sudut tumpul (*border-radius: 0*), garis tegas, dan bayangan *solid*.
4. Sangat direkomendasikan menggunakan *Server Actions* Next.js 15 untuk proses mutasi database guna meminimalkan pembuatan *endpoint* API yang tidak perlu.
