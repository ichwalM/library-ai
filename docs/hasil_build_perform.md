# Laporan Optimasi Performa — LibrariAI v2 (MySQL Edition)

> **Status Build**: ✅ Sukses — `next build` selesai tanpa error  
> **TypeScript**: ✅ `tsc --noEmit` — 0 errors  
> **Versi Next.js**: 16.2.6 (Turbopack)  
> **Tanggal**: 2026-05-24

---

## 1. Analisis Status Platform (Vs. task.md)

### Phase 1 — Inisialisasi & Konfigurasi ✅
| Item | Status | Catatan |
|------|--------|---------|
| Next.js 15/App Router | ✅ | Menggunakan Next.js 16.2.6 (lebih baru) |
| TailwindCSS v4 | ✅ | Dikonfigurasi dengan `@theme` di globals.css |
| Warna Neo-Brutalism | ✅ | `neo-yellow`, `neo-pink`, `neo-green`, `neo-black` |
| `globals.css` (utility classes) | ✅ | `.neo-button`, `.neo-card`, `.neo-input`, `.neo-badge`, dll. |
| Halaman Landing (`/`) | ✅ | Hero dengan marquee, features section, how-it-works |

### Phase 2 — MySQL & Schema ✅
| Item | Status | Catatan |
|------|--------|---------|
| Koneksi MySQL (Prisma v7) | ✅ | `@prisma/adapter-mariadb` + MariaDB driver |
| Model `User` | ✅ | Dengan `role` field |
| Model `Category` | ✅ | `id`, `title`, `description` |
| Model `Document` | ✅ | `id`, `categoryId`, `fileName`, `fileUrl`, `fileSize`, `status` |
| Model `Chunk` | ✅ | `id`, `documentId`, `content`, `embedding` (JSON) |
| Tabel NextAuth (Account, Session, etc.) | ✅ | Lengkap di schema.prisma |

### Phase 3 — NextAuth ✅
| Item | Status | Catatan |
|------|--------|---------|
| Google Provider | ✅ | Dikonfigurasi di `src/lib/auth.ts` |
| Proteksi `/admin` | ✅ | Via `src/proxy.ts` (Next.js 16 middleware convention) |
| Proteksi `/chat` | ✅ | Redirect ke `/login` jika belum autentikasi |
| Halaman login kustom | ✅ | `/login` — Neo-Brutalism, Google OAuth button |
| Session `role` field | ✅ | Di-inject via `callbacks.session` |

### Phase 4 — Admin Dashboard ✅
| Item | Status | Catatan |
|------|--------|---------|
| `/admin` Dashboard | ✅ | Stats: kategori, dokumen, chunk |
| `/admin/categories` CRUD | ✅ | Create, Read, Update, Delete dengan Server Actions |
| `/admin/documents` Upload | ✅ | Drag-drop, kategori selector, RAG pipeline |
| Ekstraksi PDF | ✅ | pdf-parse v2 `PDFParse` class API |
| Ekstraksi DOCX | ✅ | mammoth.extractRawText |
| Text Chunking | ✅ | 1000 karakter, 200 overlap |
| Gemini Embedding | ✅ | `gemini-embedding-exp-03-07` |
| Simpan Chunk+Embedding ke MySQL | ✅ | JSON column |

### Phase 5 — Vector Search ✅
| Item | Status | Catatan |
|------|--------|---------|
| Endpoint `/api/search` | ✅ | Menerima `query` + `categoryId` |
| Konversi query ke embedding | ✅ | Via `generateEmbedding()` |
| Cosine Similarity | ✅ | Implementasi manual di Node.js (`cosineSimilarity()`) |
| Top-5 hasil | ✅ | Sorted by score, slice(0, 5) |

### Phase 6 — Chat & Zero Hallucination ✅
| Item | Status | Catatan |
|------|--------|---------|
| `/browse` — direktori kategori | ✅ | Grid dengan ISR 60 detik |
| `/chat/[categoryId]` | ✅ | Full chat interface |
| Vercel AI SDK / Gemini | ✅ | `gemini-2.0-flash` via `@google/genai` |
| Zero Hallucination Protocol | ✅ | System instruction di `/api/chat/route.ts` |
| Jawaban "Maaf, info tidak tersedia" | ✅ | Jika konteks kosong |

---

## 2. Optimasi Performa — Implementasi Lengkap

### 2.1 Next.js Configuration (`next.config.ts`)

```typescript
// Ditambahkan:
images: {
  formats: ["image/avif", "image/webp"],  // Format modern, 40-60% lebih kecil
  deviceSizes: [640, 768, 1024, 1280, 1920],
}
compress: true,  // Gzip/Brotli compression
serverExternalPackages: ["pdf-parse", "mammoth", "@prisma/client", ...]
experimental: {
  optimizeCss: true,  // Eliminasi render-blocking CSS
  serverComponentsHmrCache: true,
}
headers() {
  // Cache-Control untuk static assets: immutable 1 tahun
  // Cache-Control untuk uploads: 24 jam
  // Security headers: X-Content-Type, X-Frame-Options, dll.
}
```

### 2.2 Rendering Strategy (Per Route)

| Route | Strategi | Alasan |
|-------|----------|--------|
| `/` (Homepage) | Dynamic (ISR-siap) | Memerlukan session untuk nav |
| `/browse` | **ISR — revalidate: 60s** | Data berubah jarang, cache CDN optimal |
| `/admin` | **ISR — revalidate: 30s** | Stats real-time cukup 30 detik |
| `/chat/[categoryId]` | Force Dynamic | Data per-user, tidak bisa di-cache |
| `/admin/categories` | Force Dynamic | CRUD, data harus segar |
| `/admin/documents` | Force Dynamic | Upload real-time |
| `/login`, `/unauthorized` | **Static** | Tidak ada data server |

> ⚡ Sebelumnya **semua halaman** menggunakan `force-dynamic`. Dengan ISR, `/browse` dan `/admin` kini di-cache dan disajikan dari CDN, mengurangi database queries secara signifikan.

### 2.3 Server Components & Streaming

```
Homepage (/page.tsx):
  ├── <Navbar />        → Server Component (above fold)
  ├── <Marquee />       → Server Component (above fold)
  ├── <HeroSection />   → Server Component (above fold, critical path)
  ├── <Suspense>        ← streaming boundary
  │   └── <FeaturesSection />   → renders after hero
  └── <Suspense>        ← streaming boundary
      └── <HowItWorksSection /> → renders after features
```

**Manfaat Streaming:**
- FCP (First Contentful Paint) terjadi saat hero selesai render
- Browser tidak harus menunggu semua konten sebelum menampilkan sesuatu
- Perkiraan pengurangan FCP: **200-400ms**

### 2.4 Data Fetching Optimization

```typescript
// SEBELUM (sequential):
const category = await prisma.category.findUnique(...)
const docCount = await prisma.document.count(...)
// Total: T1 + T2

// SESUDAH (parallel Promise.all):
const [category, docCount] = await Promise.all([
  prisma.category.findUnique(...),
  prisma.document.count(...),
])
// Total: max(T1, T2)
```

Semua halaman admin dan chat kini menggunakan `Promise.all` untuk query paralel.

### 2.5 CSS Performance

```css
/* Performance-critical additions in globals.css: */

/* GPU compositing untuk animasi: */
.neo-button { will-change: transform, box-shadow; }
.neo-card   { will-change: transform, box-shadow; }

/* Marquee GPU acceleration: */
.neo-marquee-track { will-change: transform; }
.neo-marquee-wrapper { contain: layout style; }

/* Reduced Motion support (accessibility + battery): */
@media (prefers-reduced-motion: reduce) {
  .animate-float, .neo-marquee-track, ... { animation: none !important; }
}

/* Skeleton loading (mengurangi CLS): */
.neo-skeleton { animation: shimmer 1.5s infinite; }
```

### 2.6 Bundle Size Optimization

```typescript
// next.config.ts — serverExternalPackages:
serverExternalPackages: [
  "pdf-parse",    // ~5MB library, TIDAK dimasukkan ke client bundle
  "mammoth",      // DOCX parser, server-only
  "@prisma/client", // DB client, server-only
  "mariadb",      // DB driver, server-only
]
```

Tanpa konfigurasi ini, Next.js akan mencoba mem-bundle lib-lib ini ke client, menyebabkan JavaScript bundle bloat yang signifikan.

### 2.7 HTTP Caching Headers

```
Static Assets (_next/static/*):
  Cache-Control: public, max-age=31536000, immutable
  → Browser/CDN cache 1 tahun, tidak pernah re-fetch

Uploads (/uploads/*):
  Cache-Control: public, max-age=86400, stale-while-revalidate=3600
  → Cache 24 jam, background refresh

Font Files:
  Cache-Control: public, max-age=31536000, immutable
```

### 2.8 Image Optimization

- **Format modern**: AVIF (40-60% lebih kecil dari JPEG) dan WebP (25-35% lebih kecil)
- **Lazy loading**: Next.js `<Image>` menggunakan `loading="lazy"` secara default untuk gambar di bawah fold
- **Ukuran responsif**: DeviceSizes disesuaikan untuk menghindari pembuatan terlalu banyak varian

### 2.9 Font Loading Strategy

```html
<!-- Layout.tsx: -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
```

Preconnect memulai TCP handshake lebih awal, mengurangi font loading latency sebesar **100-300ms** (tergantung koneksi).

### 2.10 SEO & Core Web Vitals

```typescript
// layout.tsx — Viewport export (mencegah CLS dari mobile reflow):
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFDE03",
}

// Setiap page memiliki metadata unik:
// /browse → "Browse Rak Buku | LibrariAI"
// /chat/[id] → "Chat — {categoryTitle} | LibrariAI"
// /admin → "Admin Dashboard | LibrariAI"
```

---

## 3. Target Core Web Vitals

| Metric | Target | Implementasi |
|--------|--------|-------------|
| **FCP** (First Contentful Paint) | ≤ 1.8 detik | Server Components + Streaming + Font Preconnect |
| **TTI** (Time to Interactive) | ≤ 3.8 detik | Minimal client JS (mostly Server Components) |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | Skeleton loading + Font display + Viewport meta |
| **LCP** (Largest Contentful Paint) | ≤ 2.5 detik | Static hero text (tidak ada large image) |
| **INP** (Interaction to Next Paint) | ≤ 200ms | GPU compositing (`will-change`) + minimal re-renders |

---

## 4. Keamanan Platform

| Implementasi | Mekanisme |
|-------------|-----------|
| Route Protection | `src/proxy.ts` via NextAuth JWT |
| Security Headers | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` |
| File Upload Validation | Whitelist ekstensi: `.pdf`, `.docx`, `.txt` |
| UUID filename | Mencegah path traversal attack |
| Category validation | Server Action memverifikasi `categoryId` sebelum proses |

---

## 5. Cara Menjalankan

### Development
```bash
# Clone dan install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env dengan kredensial Anda

# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# Jalankan dev server
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

---

## 6. Pengujian Performa (Panduan)

### Menggunakan Lighthouse CLI
```bash
# Install
npm install -g lighthouse

# Test homepage
lighthouse http://localhost:3000 --only-categories=performance --output=json

# Target skor: ≥ 90 untuk Performance
```

### Menggunakan WebPageTest
1. Buka https://www.webpagetest.org
2. Masukkan URL production
3. Pilih lokasi: "Singapore" (dekat Indonesia)
4. Run test dan lihat FCP, TTI, CLS

### Checklist Pengujian Berkelanjutan
- [ ] Jalankan Lighthouse setelah setiap fitur baru
- [ ] Pantau bundle size: `npx @next/bundle-analyzer`
- [ ] Monitor database query time via Prisma logs
- [ ] Test dengan throttled network (3G) di Chrome DevTools

---

## 7. Environment Variables yang Diperlukan

```env
DATABASE_URL=mysql://USER:PASS@HOST:PORT/DATABASE
AUTH_SECRET=<32-byte random string>
AUTH_GOOGLE_ID=<Google OAuth Client ID>
AUTH_GOOGLE_SECRET=<Google OAuth Client Secret>
ADMIN_EMAILS=admin@example.com
GEMINI_API_KEY=<Google AI Studio API Key>
```

> ⚠️ **Penting**: Pastikan MySQL database sudah berjalan dan `GEMINI_API_KEY` sudah dikonfigurasi sebelum menggunakan fitur upload dokumen.
