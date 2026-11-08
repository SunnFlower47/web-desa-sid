# Changelog Pembaruan Keamanan Frontend — 2026-11-08

## [12:00] docs — Penetapan aturan kerja operasional AGENTS.md dan audit keamanan proxy
- Ringkasan: Mengganti template default AGENTS.md dengan pedoman operasional terstandarisasi untuk frontend Next.js (branching model, conventional commits, larangan NEXT_PUBLIC_ pada rahasia, larangan PII di sessionStorage/URL/log, dan quality gate lint/build).
- File: `AGENTS.md`, `docs/changelogs/2026-11-08_frontend_security_hardening.md`
- Commit: Pending commit
- Test: `npm run lint`, `npm run build`
- Dampak/risiko: Menjamin kepatuhan standar pengembangan dan perlindungan data pribadi warga (UU PDP).
- Rollback: `git revert HEAD`
- Tindakan manual: Tidak ada.
