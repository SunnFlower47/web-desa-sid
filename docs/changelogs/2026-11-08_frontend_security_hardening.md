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
- Commit: `fc54723`
- Test: `npm run build` (success 18/18 routes)
- Dampak/risiko: Menjamin sistem menolak beroperasi (fail-closed) jika konfigurasi rahasia salah/lemah dan mencegah kebocoran kunci ke bundle browser.
- Rollback: `git revert HEAD`
- Tindakan manual: Pastikan PROXY_KEY dan BACKEND_SECRET_KEY di environment server memiliki panjang minimal 32 karakter.
