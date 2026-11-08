# 🤖 AGENTS.md — Aturan Kerja AI Agent (Frontend Web Desa Cibatu)

Dokumen ini adalah instruksi operasional wajib bagi AI agent dan pengembang yang bekerja di repositori **Frontend Web Warga Desa Cibatu** (`cibatu-vibe-ai`).

---

## 1. Alur Kerja Git & Percabangan
- **Branch Terpisah:** Selalu buat dan bekerja di branch fitur/perbaikan (`feat/*`, `fix/*`, `chore/*`). Dilarang keras push atau commit langsung ke branch `main`.
- **Commit Kecil & Rapi:** Terapkan aturan *1 perubahan logis = 1 commit* dengan format [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`).
- **Pencatatan Changelog:** Setiap perubahan wajib dicatat pada berkas harian di `docs/changelogs/YYYY-MM-DD_<topik>.md` sebelum commit diselesaikan.

---

## 2. Keamanan & Perlindungan Rahasia (Zero Secrets Leak)
- **Larangan Prefiks Klien:** Dilarang keras memberi prefiks `NEXT_PUBLIC_` pada kunci rahasia, proxy key, API key, atau token backend. Variabel dengan prefiks `NEXT_PUBLIC_` akan dibake oleh compiler Next.js ke bundle JavaScript browser!
- **Larangan Hardcode:** Dilarang menuliskan secret key, token, atau kata sandi default langsung di dalam kode sumber (`fallback string`).
- **File Environment:** Dilarang meng-commit berkas `.env`, `.env.local`, `.env.production`. Pastikan seluruh variasi `.env*` terdaftar di `.gitignore`. Sediakan hanya `.env.example` tanpa nilai nyata.

---

## 3. Perlindungan Data Pribadi Warga (UU No. 27/2022 - UU PDP)
- **Larangan PII di Browser Storage:** Dilarang menyimpan NIK, nomor KK, tanggal lahir, nama ibu, dan dokumen kependudukan di `localStorage`, `sessionStorage`, atau cookies.
- **Larangan PII di URL:** Dilarang mengirimkan NIK atau tanggal lahir melalui query string / URL (metode HTTP GET). Gunakan metode HTTP POST dengan payload JSON di dalam body request.
- **Logging Sanitasi:** Dilarang mencetak NIK, tanggal lahir, nomor KK, atau data identitas warga ke dalam log server, console browser (`console.log`), pesan commit, atau dokumen publik. Terapkan fungsi redaksi NIK (16 digit) pada pesan error.

---

## 4. Quality Gate & Standar Kode
- **Verifikasi Build:** Setiap commit wajib lolos pengujian `npm run lint` dan `npm run build` tanpa error.
- **Larangan Perintah Destruktif:** Dilarang menjalankan `git reset --hard`, `git push --force`, atau `npm audit fix --force` tanpa izin tertulis dari pemilik proyek.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
