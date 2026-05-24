# Panduan Deployment LibrariAI ke Google Cloud Platform (GCP)

Dokumen ini menjelaskan langkah-langkah untuk melakukan *deployment* LibrariAI ke GCP menggunakan **Cloud Run** dan **Cloud SQL** (untuk database MySQL/MariaDB). Arsitektur ini dipilih karena performa tinggi, kemudahan integrasi dengan Next.js (Standalone), serta skalabilitas otomatis (*serverless*).

---

## 1. Persiapan Infrastruktur (GCP Console)

Sebelum memulai deployment, pastikan Anda telah mengaktifkan beberapa API berikut di project GCP Anda:
- Cloud Run API
- Cloud Build API
- Cloud SQL Admin API
- Secret Manager API

### A. Membuat Database dengan Cloud SQL
LibrariAI menggunakan Prisma dengan adapter MariaDB/MySQL.
1. Buka **Cloud SQL** di GCP Console.
2. Buat instans baru (**MySQL**).
3. Atur koneksi jaringan (Disarankan: Private IP jika di dalam VPC yang sama, atau Public IP dengan *Authorized Networks*).
4. Buat **Database** baru (misal: `library_ai`).
5. Buat **User** baru beserta *password*-nya.
6. Simpan *Connection String* dalam format berikut:  
   `mysql://USER:PASSWORD@HOST:3306/library_ai`

### B. Mengatur Secret Manager
Alih-alih menaruh `.env` secara mentah, sangat direkomendasikan menyimpan rahasia di **Secret Manager**.
Buat secret berikut (contoh: `LIBRARIAI_ENV`) yang berisi nilai `.env` Anda secara lengkap:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/library_ai"
AUTH_SECRET="<generate-random-secret>"
AUTH_GOOGLE_ID="<google-client-id>"
AUTH_GOOGLE_SECRET="<google-client-secret>"
ADMIN_EMAILS="admin@example.com"
GEMINI_API_KEY="<api-key>"
```

---

## 2. Persiapan File Deployment

Aplikasi ini sudah dikonfigurasi untuk *standalone build* yang sangat optimal untuk Docker dan Cloud Run.

File-file yang telah disiapkan:
1. **`next.config.ts`**: Sudah diset ke `output: "standalone"`.
2. **`Dockerfile`**: Sudah dikonfigurasi *multi-stage build* untuk Node.js 18 Alpine, termasuk menjalankan `prisma generate` saat proses *build* dan instalasi modul `openssl`.
3. **`.dockerignore`**: Sudah diatur agar *build* menjadi ringan dan file yang tidak relevan diabaikan.
4. **`cloudbuild.yaml`**: Template untuk otomatisasi CI/CD di GCP.

---

## 3. Proses Deployment ke Cloud Run

Ada dua cara utama untuk melakukan *deploy*: menggunakan **GCP CLI (`gcloud`)** secara manual atau menggunakan **Cloud Build** untuk CI/CD otomatis.

### Opsi A: Deployment Cepat via gcloud CLI

Jika Anda menggunakan terminal lokal (pastikan sudah login dengan `gcloud auth login`):

1. **Jalankan perintah deploy langsung dari direktori root proyek:**
   ```bash
   gcloud run deploy library-ai-app \
     --source . \
     --platform managed \
     --region asia-southeast2 \
     --allow-unauthenticated \
     --set-secrets /app/.env=LIBRARIAI_ENV:latest
   ```
   *Catatan:* Pastikan Anda menyesuaikan *region* (misal: `asia-southeast2` untuk Jakarta) dan mengatur *service account* yang memiliki akses ke Secret Manager dan Cloud SQL.

2. **Migrasi Database (Setelah Deploy):**
   Karena Cloud Run bersifat *stateless*, Anda dapat menjalankan perintah *db push* di mesin lokal atau melalui *Cloud Build* untuk sinkronisasi schema:
   ```bash
   npx prisma db push
   ```

### Opsi B: Setup CI/CD menggunakan `cloudbuild.yaml`

Jika Anda ingin menghubungkan repositori GitHub/GitLab ke Cloud Build, file `cloudbuild.yaml` telah disiapkan. Pastikan Cloud Build memiliki izin ke Service Account Cloud Run Anda.

---

## 4. Konfigurasi Tambahan & Optimasi Performa

- **Cloud Storage (Optional):** Jika aplikasi ini nantinya menyimpan file statis yang cukup besar, pertimbangkan untuk mengubah penyimpanan dokumen ke Google Cloud Storage daripada sistem file *ephemeral* lokal di Cloud Run. (Saat ini dibatasi pada Server Actions `10mb`).
- **Memory & CPU:** Direkomendasikan untuk mengatur alokasi Cloud Run minimal **1 vCPU dan 512MB RAM** (disarankan 1GB RAM) mengingat proses RAG (`pdf-parse`, `mammoth`) dan Vector search bisa memakan memori.
- **Domain Kustom:** Setelah *deploy* berhasil, buka menu **Integrations** di halaman Cloud Run untuk menghubungkan ke domain kustom Anda.
