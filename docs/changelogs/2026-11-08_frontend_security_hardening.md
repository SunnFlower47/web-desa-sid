# Changelog Pembaruan Keamanan Frontend — 2026-11-08

## [12:00] docs — Penetapan aturan kerja operasional AGENTS.md dan audit keamanan proxy
- Ringkasan: Mengganti template default AGENTS.md dengan pedoman operasional terstandarisasi untuk frontend Next.js (branching model, conventional commits, larangan NEXT_PUBLIC_ pada rahasia, larangan PII di sessionStorage/URL/log, dan quality gate lint/build).
- File: `AGENTS.md`, `docs/changelogs/2026-11-08_frontend_security_hardening.md`
- Commit: `b94345f`
- Test: `npm run lint`, `npm run build`
- Dampak/risiko: Menjamin kepatuhan standar pengembangan dan perlindungan data pribadi warga (UU PDP).
- Rollback: `git revert HEAD`
- Tindakan manual: Tidak ada.

---

## [12:08] fix — Fail-closed validation untuk kunci proxy dan pembersihan dead HMAC code
- Ringkasan: Menghapus fallback NEXT_PUBLIC_PROXY_KEY pada route proxy dan kunci bawaan hardcode pada route storage. Menambahkan helper keamanan `validateSecretKey`, `getValidatedProxyKey`, dan `getValidatedStorageKey` di `src/lib/security.js` untuk memvalidasi bahwa kunci server wajib ada, minimal 32 karakter, dan menolak tegas prefiks NEXT_PUBLIC_. Menghapus dead code komputasi HMAC yang tidak terpakai pada route storage.
- File: `src/lib/security.js`, `src/app/api/proxy/[...path]/route.js`, `src/app/api/storage/[...path]/route.js`
- Commit: `6150f3b`
- Test: `npm run build` (success 18/18 routes)
- Dampak/risiko: Menjamin sistem menolak beroperasi (fail-closed) jika konfigurasi rahasia salah/lemah dan mencegah kebocoran kunci ke bundle browser.
- Rollback: `git revert HEAD`
- Tindakan manual: Pastikan PROXY_KEY dan BACKEND_SECRET_KEY di environment server memiliki panjang minimal 32 karakter.

---

## [12:15] feat — Pengetatan route allowlist, sanitasi path traversal, dan strip client auth headers pada proxy
- Ringkasan: Mengubah catch-all proxy menjadi sistem allowlist ketat berbasis 20 kelompok endpoint publik yang dibutuhkan frontend. Menerapkan penolakan traversal (.., //, \, %2e%2e, null byte) dengan HTTP 400 dan path di luar allowlist dengan HTTP 404. Membatasi Content-Type (json dan multipart) serta batas payload (2MB JSON, 10MB multipart) dengan HTTP 413/415. Menghapus penerusan header Authorization/Cookie dari client, meneruskan X-Forwarded-For untuk rate limiting Laravel, dan membersihkan URL/NIK dari pesan error log server.
- File: `src/lib/security.js`, `src/app/api/proxy/[...path]/route.js`
- Commit: `1024614`
- Test: `npm run build` (success 18/18 routes)
- Dampak/risiko: Request liar atau path di luar rute terdaftar akan ditolak dengan 404; request berbahaya ditolak 400.
- Rollback: `git revert HEAD`
- Tindakan manual: Tidak ada.

---

## [12:20] fix — Pembatasan storage proxy ke allowlist prefix publik dan penolakan traversal
- Ringkasan: Menerapkan validasi ketat pada route handler `/api/storage/[...path]` menggunakan `validateStoragePath()`. Hanya mengizinkan berkas publik dengan prefix resmi (`berita/`, `fasilitas-desa/`, `struktur-desa/`, `umkms/`, `logos/`, `profil-desa/`, `kontak-desa/`). Menolak tegas path traversal dengan HTTP 400 dan memblokir akses ke direktori privat (surat permohonan, mutasi, KTP/KK, pengaduan) dengan HTTP 404.
- File: `src/app/api/storage/[...path]/route.js`
- Commit: `e586fc4`
- Test: `npm run build` (success 18/18 routes)
- Dampak/risiko: File di luar prefix publik tidak dapat diakses melalui endpoint proxy storage.
- Rollback: `git revert HEAD`
- Tindakan manual: Tidak ada. Direkomendasikan mengevaluasi migrasi aset publik langsung ke direct URL CDN S3/R2 di masa mendatang untuk mengeliminasi kebutuhan storage proxy.

---

## [12:25] fix — Penghapusan NIK, tanggal lahir, dan data kependudukan dari browser sessionStorage
- Ringkasan: Menghentikan penyimpanan NIK, tanggal lahir, data identitas penduduk (`pendudukData`), dan data form di `sessionStorage` pada formulir pengajuan surat (`src/app/layanan/surat/page.jsx`). Hanya menyimpan state non-PII (`step`, `selectedSurat`) di storage peramban. Seluruh identitas warga dijaga murni dalam in-memory state React untuk mematuhi UU No. 27/2022 (UU PDP).
- File: `src/app/layanan/surat/page.jsx`
- Commit: `aa083ed`
- Test: `npm run build` (success 18/18 routes)
- Dampak/risiko: Jika halaman di-refresh, pengguna perlu memasukkan kembali NIK dan tanggal lahir demi keamanan data pribadi.
- Rollback: `git revert HEAD`
- Tindakan manual: Tidak ada.

---

## [12:30] fix — Redaksi NIK pada error logging dan pembersihan payload sensitif di console
- Ringkasan: Mencegah kebocoran data warga melalui log peramban dan server: menambahkan sanitasi ekspresi reguler NIK 16 digit pada interceptor response axios (`src/lib/api.js`), membatasi log ke HTTP status dan pesan tersensor tanpa mengekspos response body warga, serta memastikan Route Handler proxy tidak lagi membocorkan URL/query string/body payload warga.
- File: `src/lib/api.js`, `src/app/api/proxy/[...path]/route.js`
- Commit: `e569e29`
- Test: `npm run build` (success 18/18 routes)
- Dampak/risiko: Error logging menjadi bersih dan mematuhi kepatuhan perlindungan data pribadi tanpa mempengaruhi fungsionalitas UI.
- Rollback: `git revert HEAD`
- Tindakan manual: Tidak ada.

---

## [12:35] refactor — Enkapsulasi fungsi pemanggil status surat untuk persiapan migrasi POST
- Ringkasan: Mengenkapsulasi panggilan API status surat ke fungsi pembungkus terpusat `checkSuratStatus` dan `checkSuratHistory` pada `src/lib/api.js`. Menghubungkan form status surat (`src/app/layanan/status/page.jsx`) ke fungsi ini. Mempersiapkan transisi lintas repo dari GET (query params) ke POST tanpa perlu merombak komponen UI saat backend Laravel telah mengimplementasikan route POST /api/v1/surat-status.
- File: `src/lib/api.js`, `src/app/layanan/status/page.jsx`
- Commit: `<hash>`
- Test: `npm run build` (success 18/18 routes)
- Dampak/risiko: Arsitektur API menjadi modular dan siap beralih ke POST hanya dengan mengubah 1 baris kode di helper saat endpoint backend selesai.
- Rollback: `git revert HEAD`
- Tindakan manual: Pada repositori backend Laravel, jadwalkan implementasi endpoint `POST /api/v1/surat-status` agar NIK dan nomor surat tidak lagi dikirim via query string.
