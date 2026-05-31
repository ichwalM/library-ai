# LibrariAI Mobile API Documentation

**Base URL (Production):** `https://librariai-194076277787.asia-southeast1.run.app`  
**Base URL (Development):** `http://localhost:3000`  
**API Version:** `v1`  
**Prefix:** `/api/v1/`  
**Update terakhir:** 2026-05-31

---

## Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Autentikasi](#autentikasi)
3. [Format Respons](#format-respons)
4. [Kode Status HTTP](#kode-status-http)
5. [Endpoints](#endpoints)
   - [Health Check](#1-health-check)
   - [Daftar Kategori](#2-daftar-kategori)
   - [Detail Kategori](#3-detail-kategori)
   - [Daftar Dokumen](#4-daftar-dokumen)
   - [Detail Dokumen](#5-detail-dokumen)
   - [Pencarian Semantik](#6-pencarian-semantik)
   - [AI Chat](#7-ai-chat)
6. [Skenario Pengujian](#skenario-pengujian)
7. [Contoh Integrasi](#contoh-integrasi)

---

## Gambaran Umum

LibrariAI Mobile API adalah REST API berbasis metode **GET** yang dirancang khusus untuk developer mobile. API ini menyediakan akses ke sistem perpustakaan digital berbasis AI yang mampu:

- Menelusuri koleksi kategori dan dokumen akademik
- Melakukan **pencarian semantik** menggunakan vector embedding (Gemini Embedding)
- Berinteraksi dengan **AI chat berbasis RAG** (Retrieval-Augmented Generation) dengan Zero Hallucination Protocol

### Teknologi

| Komponen | Teknologi |
|---|---|
| Runtime | Next.js 16 (Node.js) |
| Database | MySQL (Prisma ORM) |
| AI Model | Google Gemini 3.5 Flash |
| Embedding | Gemini Embedding 001 |
| Deployment | Google Cloud Run |

---

## Autentikasi

Semua endpoint (kecuali `/api/v1/health`) **wajib** menyertakan API key.

### Cara Menyertakan API Key

**Metode 1 — HTTP Header (Direkomendasikan untuk produksi):**
```
X-API-Key: librariai-mobile-k3y-2026
```

**Metode 2 — Query Parameter (Untuk testing/development):**
```
?apiKey=librariai-mobile-k3y-2026
```

### Contoh Request dengan Auth

```bash
# Menggunakan header (direkomendasikan)
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/categories"

# Menggunakan query param (untuk testing)
curl "https://librariai-194076277787.asia-southeast1.run.app/api/v1/categories?apiKey=librariai-mobile-k3y-2026"
```

### Respons Jika Tanpa API Key

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing API key. Provide it via X-API-Key header or ?apiKey= query param."
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

---

## Format Respons

Semua respons menggunakan format JSON yang konsisten.

### Respons Sukses

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

> **Catatan:** Field `meta` hanya ada pada endpoint yang mengembalikan daftar (list) dengan pagination.

### Respons Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Deskripsi error dalam Bahasa Indonesia"
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

### Error Codes

| Code | Deskripsi |
|---|---|
| `UNAUTHORIZED` | API key tidak ada atau tidak valid |
| `BAD_REQUEST` | Parameter request tidak valid atau kurang |
| `NOT_FOUND` | Resource yang dicari tidak ditemukan |
| `INTERNAL_ERROR` | Kesalahan server internal |

---

## Kode Status HTTP

| Status | Arti |
|---|---|
| `200 OK` | Request berhasil |
| `204 No Content` | OPTIONS preflight (CORS) |
| `400 Bad Request` | Parameter tidak valid |
| `401 Unauthorized` | API key salah atau tidak ada |
| `404 Not Found` | Resource tidak ditemukan |
| `500 Internal Server Error` | Kesalahan server |

---

## Endpoints

---

### 1. Health Check

Mengecek status server dan konektivitas layanan. **Tidak memerlukan API key.**

#### Request

```
GET /api/v1/health
```

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "v1",
    "services": {
      "database": "ok",
      "ai": "configured"
    },
    "uptime": 3600.5
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Field Respons

| Field | Tipe | Deskripsi |
|---|---|---|
| `status` | `string` | `"healthy"` atau `"degraded"` |
| `version` | `string` | Versi API yang aktif |
| `services.database` | `string` | `"ok"` atau `"error"` |
| `services.ai` | `string` | `"configured"` atau `"missing_key"` |
| `uptime` | `number` | Waktu server aktif dalam detik |

#### Contoh cURL

```bash
curl "https://librariai-194076277787.asia-southeast1.run.app/api/v1/health"
```

---

### 2. Daftar Kategori

Mengambil daftar semua kategori koleksi dokumen dengan pagination dan pencarian teks.

#### Request

```
GET /api/v1/categories
```

#### Query Parameters

| Parameter | Tipe | Wajib | Default | Deskripsi |
|---|---|---|---|---|
| `page` | `integer` | Tidak | `1` | Halaman yang ingin diambil |
| `limit` | `integer` | Tidak | `10` | Jumlah item per halaman (maks: 50) |
| `search` | `string` | Tidak | — | Filter berdasarkan judul kategori |

#### Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz123abc",
      "title": "Skripsi Teknik Informatika",
      "description": "Kumpulan skripsi mahasiswa jurusan TI.",
      "documentCount": 12,
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-05-20T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Field Data

| Field | Tipe | Deskripsi |
|---|---|---|
| `id` | `string` | ID unik kategori (CUID) |
| `title` | `string` | Judul kategori |
| `description` | `string \| null` | Deskripsi kategori |
| `documentCount` | `integer` | Total dokumen dalam kategori |
| `createdAt` | `string` (ISO 8601) | Waktu dibuat |
| `updatedAt` | `string` (ISO 8601) | Waktu diperbarui |

#### Contoh cURL

```bash
# Ambil semua kategori
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/categories"

# Cari kategori dengan keyword
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/categories?search=skripsi&page=1&limit=5"
```

---

### 3. Detail Kategori

Mengambil detail satu kategori beserta seluruh daftar dokumen di dalamnya.

#### Request

```
GET /api/v1/categories/:id
```

#### Path Parameter

| Parameter | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `id` | `string` | Ya | ID kategori (CUID) |

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "clxyz123abc",
    "title": "Skripsi Teknik Informatika",
    "description": "Kumpulan skripsi mahasiswa jurusan TI.",
    "documentCount": 2,
    "documents": [
      {
        "id": "cldoc456def",
        "fileName": "skripsi_ahmad.pdf",
        "fileUrl": "/uploads/uuid-skripsi.pdf",
        "fileSize": 2048000,
        "mimeType": "application/pdf",
        "status": "ready",
        "createdAt": "2026-02-10T09:00:00.000Z",
        "updatedAt": "2026-02-10T09:05:00.000Z"
      }
    ],
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-05-20T14:30:00.000Z"
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Status Dokumen

| Status | Deskripsi |
|---|---|
| `processing` | Sedang diproses (embedding belum selesai) |
| `ready` | Siap digunakan untuk chat dan pencarian |
| `error` | Gagal diproses |

#### Response `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Kategori dengan id 'xxx' tidak ditemukan."
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Contoh cURL

```bash
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/categories/clxyz123abc"
```

---

### 4. Daftar Dokumen

Mengambil daftar dokumen dengan filter opsional berdasarkan kategori dan status.

#### Request

```
GET /api/v1/documents
```

#### Query Parameters

| Parameter | Tipe | Wajib | Default | Deskripsi |
|---|---|---|---|---|
| `categoryId` | `string` | Tidak | — | Filter berdasarkan ID kategori |
| `status` | `string` | Tidak | — | Filter: `processing`, `ready`, atau `error` |
| `page` | `integer` | Tidak | `1` | Halaman yang ingin diambil |
| `limit` | `integer` | Tidak | `10` | Jumlah item per halaman (maks: 50) |

#### Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "cldoc456def",
      "categoryId": "clxyz123abc",
      "category": {
        "id": "clxyz123abc",
        "title": "Skripsi Teknik Informatika"
      },
      "fileName": "skripsi_ahmad.pdf",
      "fileUrl": "/uploads/uuid-skripsi.pdf",
      "fileSize": 2048000,
      "mimeType": "application/pdf",
      "status": "ready",
      "chunkCount": 45,
      "createdAt": "2026-02-10T09:00:00.000Z",
      "updatedAt": "2026-02-10T09:05:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Field Tambahan

| Field | Tipe | Deskripsi |
|---|---|---|
| `chunkCount` | `integer` | Jumlah chunk teks yang telah diindeks |
| `fileSize` | `integer \| null` | Ukuran file dalam bytes |

#### Response `400 Bad Request` (status tidak valid)

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Status tidak valid. Nilai yang diizinkan: processing, ready, error."
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Contoh cURL

```bash
# Semua dokumen siap di kategori tertentu
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/documents?categoryId=clxyz123abc&status=ready"

# Semua dokumen dengan paginasi
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/documents?page=2&limit=5"
```

---

### 5. Detail Dokumen

Mengambil detail satu dokumen beserta informasi kategorinya.

#### Request

```
GET /api/v1/documents/:id
```

#### Path Parameter

| Parameter | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `id` | `string` | Ya | ID dokumen (CUID) |

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "cldoc456def",
    "fileName": "skripsi_ahmad.pdf",
    "fileUrl": "/uploads/uuid-skripsi.pdf",
    "fileSize": 2048000,
    "mimeType": "application/pdf",
    "status": "ready",
    "chunkCount": 45,
    "category": {
      "id": "clxyz123abc",
      "title": "Skripsi Teknik Informatika",
      "description": "Kumpulan skripsi mahasiswa jurusan TI."
    },
    "createdAt": "2026-02-10T09:00:00.000Z",
    "updatedAt": "2026-02-10T09:05:00.000Z"
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Contoh cURL

```bash
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/documents/cldoc456def"
```

---

### 6. Pencarian Semantik

Melakukan pencarian menggunakan **vector embedding** untuk menemukan bagian dokumen yang paling relevan dengan pertanyaan.

> ⚡ Endpoint ini menggunakan Gemini Embedding API. Waktu respons: **2–5 detik** tergantung ukuran koleksi.

#### Request

```
GET /api/v1/search
```

#### Query Parameters

| Parameter | Tipe | Wajib | Default | Maks | Deskripsi |
|---|---|---|---|---|---|
| `q` | `string` | **Ya** | — | 1000 karakter | Teks query pencarian |
| `categoryId` | `string` | **Ya** | — | — | ID kategori yang dicari |
| `topK` | `integer` | Tidak | `5` | `20` | Jumlah hasil yang dikembalikan |

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "query": "metode penelitian kualitatif",
    "categoryId": "clxyz123abc",
    "categoryTitle": "Skripsi Teknik Informatika",
    "results": [
      {
        "chunkId": "clchunk789ghi",
        "documentId": "cldoc456def",
        "fileName": "skripsi_ahmad.pdf",
        "chunkIndex": 3,
        "content": "Penelitian ini menggunakan pendekatan kualitatif dengan...",
        "relevanceScore": 0.8921
      }
    ],
    "totalChunksSearched": 150
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Field Hasil Pencarian

| Field | Tipe | Deskripsi |
|---|---|---|
| `chunkId` | `string` | ID chunk teks |
| `documentId` | `string` | ID dokumen asal |
| `fileName` | `string` | Nama file dokumen asal |
| `chunkIndex` | `integer` | Urutan chunk dalam dokumen |
| `content` | `string` | Cuplikan teks yang relevan |
| `relevanceScore` | `float` | Skor relevansi (0.0 – 1.0, semakin tinggi semakin relevan) |
| `totalChunksSearched` | `integer` | Total chunk yang dievaluasi |

#### Respons Jika Tidak Ada Dokumen

```json
{
  "success": true,
  "data": {
    "query": "quantum computing",
    "categoryId": "clxyz123abc",
    "categoryTitle": "Skripsi Teknik Informatika",
    "results": [],
    "totalChunksSearched": 0
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Contoh cURL

```bash
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/search?q=metode+penelitian+kualitatif&categoryId=clxyz123abc&topK=3"
```

---

### 7. AI Chat

Berinteraksi dengan AI berbasis RAG menggunakan dokumen dari kategori tertentu. AI hanya menjawab berdasarkan konten dokumen (**Zero Hallucination Protocol**).

> ⚡ Endpoint ini memanggil Gemini AI. Waktu respons: **3–10 detik**.

#### Request

```
GET /api/v1/chat
```

#### Query Parameters

| Parameter | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `message` | `string` | **Ya** | Pertanyaan/pesan user (maks: 2000 karakter) |
| `categoryId` | `string` | **Ya** | ID kategori sebagai sumber pengetahuan AI |
| `history` | `string` | Tidak | Riwayat percakapan sebelumnya dalam format **base64-encoded JSON** |

#### Format `history`

`history` adalah **base64-encoded JSON** dari array pesan sebelumnya:

```json
[
  { "role": "user", "content": "Apa topik utama skripsi ini?" },
  { "role": "assistant", "content": "Topik utama skripsi ini adalah..." }
]
```

Encode ke base64:
```bash
echo '[{"role":"user","content":"Apa topik utama?"},{"role":"assistant","content":"Topiknya adalah..."}]' | base64
```

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Berdasarkan dokumen yang tersedia, metode penelitian yang digunakan adalah...",
    "role": "assistant",
    "categoryId": "clxyz123abc",
    "categoryTitle": "Skripsi Teknik Informatika",
    "sourcesUsed": [
      "skripsi_ahmad.pdf",
      "skripsi_budi.pdf"
    ],
    "historyForNextRequest": "W3sicm9sZSI6InVzZXIiLCJjb250ZW50IjoiLi4uIn1d..."
  },
  "timestamp": "2026-05-31T08:00:00.000Z"
}
```

#### Field Respons

| Field | Tipe | Deskripsi |
|---|---|---|
| `message` | `string` | Jawaban AI |
| `role` | `string` | Selalu `"assistant"` |
| `categoryId` | `string` | ID kategori yang digunakan |
| `categoryTitle` | `string` | Judul kategori |
| `sourcesUsed` | `string[]` | Daftar nama file yang dijadikan sumber jawaban |
| `historyForNextRequest` | `string` | Base64-encoded history yang sudah termasuk percakapan ini — kirim kembali sebagai `?history=` di request berikutnya |

#### Percakapan Multi-Turn

```
Request 1:  GET /api/v1/chat?message=Apa+topik+skripsi?&categoryId=xxx
Response 1: { "historyForNextRequest": "BASE64_A..." }

Request 2:  GET /api/v1/chat?message=Jelaskan+metodenya&categoryId=xxx&history=BASE64_A...
Response 2: { "historyForNextRequest": "BASE64_B..." }
```

#### Contoh cURL

```bash
# Pesan pertama (tanpa history)
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/chat?message=Apa+metodologi+yang+digunakan+dalam+skripsi+ini%3F&categoryId=clxyz123abc"

# Pesan kedua (dengan history dari response sebelumnya)
curl -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/chat?message=Bisa+dijelaskan+lebih+detail%3F&categoryId=clxyz123abc&history=W3sicm9sZS4uLl0="
```

---

## Skenario Pengujian

### Test 1 — Health Check (Tanpa Auth)

```bash
curl -s "https://librariai-194076277787.asia-southeast1.run.app/api/v1/health" | jq .
```

**Ekspektasi:** `status: 200`, `data.status: "healthy"`, `data.services.database: "ok"`

---

### Test 2 — Auth Gagal (Key Salah)

```bash
curl -s -H "X-API-Key: wrong-key" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/categories" | jq .
```

**Ekspektasi:** `status: 401`, `error.code: "UNAUTHORIZED"`

---

### Test 3 — Daftar Kategori

```bash
curl -s -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/categories" | jq .
```

**Ekspektasi:** `success: true`, `data` adalah array, `meta.total` adalah integer

---

### Test 4 — Kategori Tidak Ditemukan

```bash
curl -s -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/categories/id-yang-tidak-ada" | jq .
```

**Ekspektasi:** `status: 404`, `error.code: "NOT_FOUND"`

---

### Test 5 — Daftar Dokumen dengan Filter

```bash
curl -s -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/documents?status=ready&limit=3" | jq .
```

**Ekspektasi:** Semua item dalam `data` memiliki `status: "ready"`, jumlah item ≤ 3

---

### Test 6 — Status Filter Tidak Valid

```bash
curl -s -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/documents?status=invalid" | jq .
```

**Ekspektasi:** `status: 400`, `error.code: "BAD_REQUEST"`

---

### Test 7 — Pencarian Semantik

```bash
curl -s -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/search?q=metode+penelitian&categoryId=CATEGORY_ID_HERE&topK=3" | jq .
```

**Ekspektasi:** `results` adalah array dengan `relevanceScore` antara 0 dan 1, diurutkan descending

---

### Test 8 — Pencarian Tanpa Parameter `q`

```bash
curl -s -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/search?categoryId=CATEGORY_ID_HERE" | jq .
```

**Ekspektasi:** `status: 400`, `error.code: "BAD_REQUEST"`, message menyebutkan parameter `q`

---

### Test 9 — AI Chat

```bash
curl -s -H "X-API-Key: librariai-mobile-k3y-2026" \
  "https://librariai-194076277787.asia-southeast1.run.app/api/v1/chat?message=Apa+isi+dokumen+ini%3F&categoryId=CATEGORY_ID_HERE" | jq .
```

**Ekspektasi:** `data.role: "assistant"`, `data.message` berisi teks jawaban, `data.historyForNextRequest` adalah string base64

---

## Contoh Integrasi

### Dart / Flutter

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

const baseUrl = 'https://librariai-194076277787.asia-southeast1.run.app';
const apiKey = 'librariai-mobile-k3y-2026';

final headers = {'X-API-Key': apiKey};

// Ambil semua kategori
Future<List<dynamic>> fetchCategories() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/v1/categories'),
    headers: headers,
  );
  final body = jsonDecode(response.body);
  if (body['success'] == true) return body['data'];
  throw Exception(body['error']['message']);
}

// AI Chat multi-turn
Future<Map<String, dynamic>> chat({
  required String message,
  required String categoryId,
  String? history,
}) async {
  var uri = Uri.parse('$baseUrl/api/v1/chat').replace(queryParameters: {
    'message': message,
    'categoryId': categoryId,
    if (history != null) 'history': history,
  });
  final response = await http.get(uri, headers: headers);
  final body = jsonDecode(response.body);
  if (body['success'] == true) return body['data'];
  throw Exception(body['error']['message']);
}
```

### Kotlin (Android)

```kotlin
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

object LibrariAIApi {
    private const val BASE_URL = "https://librariai-194076277787.asia-southeast1.run.app"
    private const val API_KEY = "librariai-mobile-k3y-2026"
    private val client = OkHttpClient()

    fun fetchCategories(): JSONObject {
        val request = Request.Builder()
            .url("$BASE_URL/api/v1/categories")
            .header("X-API-Key", API_KEY)
            .build()
        client.newCall(request).execute().use { response ->
            return JSONObject(response.body!!.string())
        }
    }

    fun chat(message: String, categoryId: String, history: String? = null): JSONObject {
        var url = "$BASE_URL/api/v1/chat?message=${message.encodeURL()}&categoryId=$categoryId"
        if (history != null) url += "&history=${history.encodeURL()}"
        val request = Request.Builder()
            .url(url)
            .header("X-API-Key", API_KEY)
            .build()
        client.newCall(request).execute().use { response ->
            return JSONObject(response.body!!.string())
        }
    }
}
```

---

## Catatan Keamanan untuk Produksi

> **⚠️ Penting:** API key `librariai-mobile-k3y-2026` di atas adalah key development. Untuk produksi:

1. **Generate key baru** yang lebih kuat:
   ```bash
   openssl rand -hex 32
   ```
2. **Jangan hardcode API key** di source code mobile. Gunakan secure storage (Android Keystore / iOS Keychain).
3. **Rotasi API key** secara berkala — cukup update `API_KEY_MOBILE` di Cloud Run environment variables.
4. **Monitor penggunaan** melalui Google Cloud Run logs dan Cloud Monitoring.

---

*Dokumentasi ini dihasilkan untuk LibrariAI Mobile API v1 — 2026-05-31*
