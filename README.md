# Cibatu Vibe AI - Sistem Digital Desa Cibatu

Sistem informasi dan pelayanan publik digital terpadu untuk Desa Cibatu. Proyek ini merupakan antarmuka (*frontend*) publik yang dibangun dengan desain modern, cepat, dan responsif untuk memudahkan masyarakat dalam mengakses layanan administrasi, statistik desa, transparansi anggaran, hingga pengaduan.

Aplikasi ini ditujukan untuk dikelola secara berkelanjutan oleh Diskominfo atau tenaga IT Desa.

## 🚀 Teknologi yang Digunakan

*   **Framework Utama**: Next.js 14 (App Router)
*   **Library UI**: React 18, Tailwind CSS v3/v4, Framer Motion (untuk animasi transisi)
*   **Icon & Peta**: Lucide React, Leaflet & React-Leaflet
*   **Koneksi Data**: Axios (dengan Interceptors untuk keamanan)
*   **Keamanan**: Google reCAPTCHA v2 (Form Checkbox) & v3 (Invisible)
*   **Containerization**: Docker (Standalone output)
*   **Deployment Target**: Google Cloud Run

## 📂 Struktur Direktori Proyek

Proyek ini telah distruktur mengikuti pola *best practice* Next.js App Router:

```text
cibatu-vibe-ai/
├── src/
│   ├── app/                # Root directory untuk routing halaman (App Router)
│   │   ├── api/            # Internal Next.js API Routes (termasuk Proxy ke backend Laravel)
│   │   ├── info/           # Halaman informasi (Berita, Profil Desa, Peta, Transparansi)
│   │   ├── layanan/        # Halaman layanan publik (Surat, Pengaduan, Bantuan Sosial)
│   │   ├── testimoni/      # Halaman khusus testimoni warga
│   │   ├── globals.css     # CSS Global (Tailwind directives)
│   │   ├── layout.jsx      # Root Layout (Navigasi & Footer global)
│   │   └── page.jsx        # Halaman Beranda Utama (Landing Page)
│   │
│   ├── components/         # Komponen React Modular
│   │   ├── layout/         # Komponen struktur (Navbar, Footer, Sidebar)
│   │   ├── ui/             # Komponen UI Dasar yang dapat digunakan ulang (Button, Card, Skeleton)
│   │   └── map/            # Komponen peta interaktif Leaflet
│   │
│   └── lib/                # Fungsi utilitas pembantu
│       └── api.js          # Konfigurasi instans Axios dan Interceptors
├── Dockerfile              # Konfigurasi container untuk deploy ke Cloud Run
├── .env                    # Environment variables (JANGAN di-commit ke repositori)
├── .gcloudignore           # Aturan pengabaian file untuk Google Cloud Build
├── next.config.mjs         # Pengaturan Next.js (Standalone build & Image domains)
└── tailwind.config.mjs     # Pengaturan warna, font, dan utilitas Tailwind
```

## ⚙️ Variabel Environment (.env)

Proyek ini membutuhkan variabel *environment* berikut agar dapat terhubung dengan backend (Admin Panel Laravel) dan layanan Google:

```env
# URL Internal Backend Laravel (Digunakan oleh Next.js Proxy Server saat fetching data server-side)
INTERNAL_API_URL=https://admin.pemdescibatu2001.online

# URL Publik Proxy (Digunakan oleh Client-side Axios /lib/api.js)
NEXT_PUBLIC_API_URL=https://admin.pemdescibatu2001.online/api/proxy/v1

# Kunci Keamanan Proxy antara Next.js dan Laravel
NEXT_PUBLIC_PROXY_KEY=CIBATU_VIBE_2026

# Site URL Utama
NEXT_PUBLIC_SITE_URL=https://cibatu-vibe-ai-505268805663.asia-southeast2.run.app

# Keamanan Google reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY=your_recaptcha_v2_site_key
NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY=your_recaptcha_v3_site_key
```

> **Catatan Penting**: Khusus saat mendeploy ke layanan berbasis *container* (seperti Google Cloud Run), Next.js Standalone tidak akan otomatis memuat file `.env`. Gunakan file `.gcloudignore` untuk memasukkan file `.env` dalam proses *build*, atau _inject_ variabel lingkungan menggunakan pengaturan *Environment Variables* di Google Cloud Console.

## 🛠 Panduan Pengembangan (Lokal)

1. **Install Dependensi:**
   ```bash
   npm install
   ```
2. **Siapkan Konfigurasi:**
   Salin file `.env.example` ke `.env` dan isi sesuai dengan konfigurasi backend Anda.
3. **Jalankan Server Lokal (Development):**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3030`.

## 📦 Panduan Deployment (Google Cloud Run)

Proyek ini dioptimalkan untuk Cloud Run dengan fitur Next.js *Standalone Build*.

1. **Siapkan Google Cloud CLI:** Pastikan Anda sudah masuk (login) ke GCP (`gcloud auth login`).
2. **Jalankan Perintah Deploy:**
   ```bash
   gcloud run deploy cibatu-vibe-ai --source . --region asia-southeast2
   ```
3. **Inject Runtime Variable (Jika diperlukan):**
   ```bash
   gcloud run services update cibatu-vibe-ai --region asia-southeast2 \
   --set-env-vars="INTERNAL_API_URL=https://admin.pemdescibatu2001.online,PROXY_KEY=CIBATU_VIBE_2026"
   ```

## 📝 Catatan Versi
**v1.0.0 (Rilis Perdana)**
*   Implementasi antarmuka publik yang komprehensif.
*   Integrasi keamanan `reCAPTCHA v2` dan `v3`.
*   Akses API via Server Proxy Next.js untuk proteksi tautan Backend.
*   Optimalisasi SEO dan caching *Server-Side*.
