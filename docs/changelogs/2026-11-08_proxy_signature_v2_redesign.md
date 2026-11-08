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
- **Commit**: (akan dicatat setelah commit)
- **Test**:
  - `npm test`: PASS (17 tests passed, 0 failed) membuktikan ke-4 test vectors identik 100% dan kunci fail-closed
  - `npm run lint`: PASS (0 errors, 36 warnings)
  - `npm run build`: PASS (seluruh 20 rute terkompilasi dan optimal)
  - `npm audit --omit=dev`: PASS (found 0 vulnerabilities)
- **Dampak/risiko**: Server Next.js wajib memiliki variabel lingkungan `PROXY_SIGNING_KEY` yang cocok dengan backend Laravel. Header lama `X-Proxy-App-Id` tidak lagi dikirimkan.
- **Rollback**: `git revert <commit_hash>`
- **Tindakan manual**: Pastikan `.env` atau environment server Next.js diisi `PROXY_SIGNING_KEY` (dan opsional `PROXY_KEY_ID`).
