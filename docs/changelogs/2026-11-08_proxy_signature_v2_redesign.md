# Changelog: 2026-11-08 — Proxy Signature V2 Redesign (Frontend Next.js)

## [18:05] feat(security) — Implementasi Pengiriman Header Handshake Proxy Signature V2 & Migrasi POST Surat Status

- **Ringkasan**: Menghapus seluruh dependensi pada kunci statis `PROXY_KEY` dan header `X-Proxy-App-Id` yang rentan terekspos ke sisi klien (temuan audit 4.1). Mengimplementasikan protokol `CIBATU-PROXY-V2` di Route Handler Next.js (`src/app/api/proxy/[...path]/route.js`) dengan kalkulasi canonical string, canonical query (RFC 3986), raw body SHA-256 hex, nonce anti-replay Base64URL, dan HMAC-SHA256 signature dari kunci rahasia server `PROXY_SIGNING_KEY` (fail-closed jika tidak ada atau <32 byte). Memigrasikan pemanggilan `checkSuratStatus` ke HTTP POST body JSON (mencegah pencatatan NIK di log query string). Menyinkronkan dan memverifikasi test vectors resmi 100% cocok.
- **File**:
  - `src/lib/security.js`
  - `src/app/api/proxy/[...path]/route.js`
  - `src/lib/api.js`
  - `.env.example`
  - `docs/proxy-signature-test-vectors.json`
  - `docs/proxy-signature.md`
  - `scripts/test-security.mjs`
  - `eslint.config.mjs`
  - `docs/changelogs/2026-11-08_proxy_signature_v2_redesign.md`
- **Commit**: c8936d6
- **Test**:
  - `npm test`: PASS (17 tests passed, 0 failed) membuktikan ke-4 test vectors identik 100% dan kunci fail-closed
  - `npm run lint`: PASS (0 errors, 36 warnings)
  - `npm run build`: PASS (seluruh 20 rute terkompilasi dan optimal)
  - `npm audit --omit=dev`: PASS (found 0 vulnerabilities)
- **Dampak/risiko**: Server Next.js wajib memiliki variabel lingkungan `PROXY_SIGNING_KEY` yang cocok dengan backend Laravel. Header lama `X-Proxy-App-Id` tidak lagi dikirimkan.
- **Rollback**: `git revert <commit_hash>`
- **Tindakan manual**: Pastikan `.env` atau environment server Next.js diisi `PROXY_SIGNING_KEY` (dan opsional `PROXY_KEY_ID`).

## [19:15] fix & chore — Pemulihan Aturan Linting ESLint, Penanganan Hoisting & Unescaped Entities, Serta Verifikasi E2E
- **Ringkasan**:
  1. Memulihkan aturan ESLint `react/no-unescaped-entities` dan `react-hooks/immutability` di `eslint.config.mjs` dengan memperbaiki kode akar penyebab masalah daripada membungkam lint.
  2. Memperbaiki hoisting function `fetchNews`, `fetchContacts`, dan `fetchSuratTypes` dengan membungkusnya dalam `useCallback` sebelum `useEffect`.
  3. Memperbaiki unescaped quotes di JSX pada halaman berita, tentang-desa, surat, dan testimoni.
  4. Menghapus pemanggilan `setState` di dalam `useEffect` pada komponen `CacheClearButton`.
  5. Menambahkan skrip verifikasi otomatis E2E (`scripts/e2e-verification.mjs`) untuk membuktikan 5 rute proxy (berita, status surat, riwayat surat, pengajuan multipart PDF, dan pengaduan multipart foto) serta integritas hash byte mentah multipart kecil dan > 1MB.
- **File**:
  - `eslint.config.mjs`
  - `src/app/info/berita/page.jsx`
  - `src/app/layanan/kontak/page.jsx`
  - `src/app/layanan/surat/page.jsx`
  - `src/app/info/tentang-desa/page.jsx`
  - `src/app/page.jsx`
  - `src/app/testimoni/page.jsx`
  - `src/components/dev/CacheClearButton.jsx`
  - `scripts/e2e-verification.mjs`
  - `docs/changelogs/2026-11-08_proxy_signature_v2_redesign.md`
- **Commit**: 6d94456
- **Test**:
  - `npm run lint`: PASS (0 errors, 26 warnings)
  - `npm test`: PASS (17 tests passed)
  - `npm run build`: PASS (seluruh rute terkompilasi sukses 15.7s)
  - `node scripts/e2e-verification.mjs`: PASS (5 endpoint terverifikasi lolos proxy signature V2)
- **Dampak/risiko**: Rendah. Kode frontend lebih bersih dan patuh standar React 19 / ESLint 9.
- **Rollback**: `git checkout HEAD~1 <file>`
- **Tindakan manual**: Tidak ada.

## [20:45] security — Canonical Multipart Digest, Anti-Spoofing Client IP & Harmonisasi Konfigurasi V2
- **Ringkasan**:
  1. **Canonical Multipart Digest Lintas-Runtime**:
     - Mengimplementasikan penghitungan `buildMultipartDigest` di `src/lib/security.js` dan Route Handler `src/app/api/proxy/[...path]/route.js`.
     - Request multipart di-parse via Web API `request.formData()`: field non-file di-hash SHA-256 dan diurutkan secara ASCII, sedangkan berkas di-digest berdasarkan `field:index:size:sha256(content)` yang diurutkan berdasar field dan index.
     - Menyertakan header `X-Body-Mode: multipart` dan menandatangani 9 baris canonical string yang cocok 100% dengan test vector backend.
  2. **Anti-Spoofing Client IP (Task 7)**:
     - Memindahkan fungsi ekstraksi IP ke `src/lib/security.js` dengan fungsi `extractClientIp(request, options)` dan `isValidIp(ip)`.
     - Menerapkan arsitektur pencegahan manipulasi header IP (CWE-290): Pada mode default / untrusted (`trustProxy = false`), header `X-Forwarded-For` dan `X-Real-IP` yang dikirim langsung oleh klien diabaikan secara total (fallback `127.0.0.1`).
     - Pada mode trusted proxy, sistem memprioritaskan edge header tepercaya (`cf-connecting-ip`) atau hop IP terakhir yang sah pada multi-hop proxy, mencegah injeksi IP palsu pada bagian awal header.
  3. **Harmonisasi Konfigurasi V2 (Task 6)**:
     - Menyamakan default pengenal kunci `PROXY_KEY_ID=v1` di `.env.example` dan fallback di `security.js`.
  4. **Quality Gate Penuh**:
     - Pengujian unit dan keamanan: 21 tests passed (termasuk verifikasi anti-spoofing IP, multipart digest, fail-closed keys).
     - Linting ESLint: 0 errors.
     - Production Build Next.js: Sukses terkompilasi optimal.
     - Audit dependensi: 0 vulnerabilities.
- **File**:
  - `src/lib/security.js`
  - `src/app/api/proxy/[...path]/route.js`
  - `.env.example`
  - `docs/proxy-signature.md`
  - `docs/proxy-signature-test-vectors.json`
  - `scripts/test-security.mjs`
  - `scripts/e2e-verification.mjs`
  - `docs/changelogs/2026-11-08_proxy_signature_v2_redesign.md`
- **Commit**: ea5606d
- **Test**:
  - `npm test`: PASS (21 tests passed, 0 failed)
  - `npm run lint`: PASS (0 errors, 26 warnings)
  - `npm run build`: PASS (terkompilasi 18/18 static/dynamic routes)
  - `npm audit --omit=dev`: PASS (found 0 vulnerabilities)
- **Dampak/risiko**: Rendah.
- **Rollback**: `git checkout HEAD~1 <file>`
- **Tindakan manual**: Pastikan `PROXY_KEY_ID=v1` di `.env` lokal/produksi.

## [23:15] feat(security) — Final Round: Multipart Digest Multi-File & Array, Field Name Validation, Localhost E2E Restriction & 3-Foto
- **Ringkasan**:
  1. **Canonical Multipart Digest Multi-File & Array**:
     - Memperluas digest multipart kanonik di Route Handler Next.js (`src/app/api/proxy/[...path]/route.js`) dan library keamanan (`src/lib/security.js`) untuk mendukung form data dengan banyak file pada field yang sama (`foto[]`, `foto[0]`, dll.) dan field non-file berulang (`kategori[]`, `kategori[0]`).
     - Menolak nama field yang memuat karakter kontrol, `\n`, `\r`, `:`, spasi, titik `.`, atau bracket bersarang dengan HTTP 400 Bad Request (`Akses Ditolak: Nama field payload tidak valid`).
     - Menyinkronkan vektor uji resmi `case_5_post_multipart_multiple_files_and_arrays` ke `docs/proxy-signature-test-vectors.json`.
     - Menegaskan bahwa client original filename dan client Content-Type diabaikan secara total dari digest untuk memastikan kompatibilitas dan keamanan terhadap path traversal / spoofing.
  2. **Pembatasan Host Lokal Skrip E2E**:
     - Menambahkan validasi URL host pada `scripts/e2e-verification.mjs` sehingga hanya mau berjalan terhadap host lokal (`localhost`, `127.0.0.1`, `::1`) dan menolak URL non-localhost secara fail-safe.
     - Memperbarui pengujian pengaduan dengan mengirimkan **3 file foto** valid secara multipart ke backend.
  3. **Quality Gate Penuh**:
     - Unit test: 25 tests passed (termasuk validasi field name, collision resistance, untrusted metadata, case 5 test vector).
     - Linting: 0 error.
     - Production build: Sukses terkompilasi optimal (18/18 routes).
     - Dependency audit: 0 vulnerabilities.
- **File**:
  - `src/lib/security.js`
  - `src/app/api/proxy/[...path]/route.js`
  - `docs/proxy-signature.md`
  - `docs/proxy-signature-test-vectors.json`
  - `scripts/test-security.mjs`
  - `scripts/e2e-verification.mjs`
  - `docs/changelogs/2026-11-08_proxy_signature_v2_redesign.md`
- **Commit**: 3025ee3
- **Test**:
  - `npm test`: PASS (25 passed, 0 failed)
  - `npm run lint`: PASS (0 errors, 26 warnings)
  - `npm run build`: PASS (terkompilasi 18/18 routes)
  - `npm audit --omit=dev`: PASS (0 vulnerabilities)
  - `node scripts/e2e-verification.mjs`: PASS (Semua 5 flow sukses 2xx)
- **Dampak/risiko**: Rendah.
- **Rollback**: `git checkout HEAD~1 <file>`
- **Tindakan manual**: Tidak ada.

## [23:40] fix(layanan) -- Pemulihan Definisi fetchSuratTypes pada Halaman Pengajuan Surat
- Ringkasan: Mengembalikan definisi fetchSuratTypes menggunakan useCallback di src/app/layanan/surat/page.jsx yang sempat terhapus saat pembersihan linter, memperbaiki uncaught ReferenceError pada client component.
- File:
  - src/app/layanan/surat/page.jsx
  - docs/changelogs/2026-11-08_proxy_signature_v2_redesign.md
- Commit: PENDING_COMMIT
- Test: npm test (25 passed, 0 failed), npm run lint (0 errors)
- Dampak/risiko: Rendah. Memperbaiki rendering awal daftar layanan jenis surat di /layanan/surat.
- Rollback: git revert <commit_hash>
- Tindakan manual: Tidak ada.
