# Spesifikasi Teknis Tanda Tangan Proxy V2 (CIBATU-PROXY-V2)

## 1. Latar Belakang & Motivasi
Berdasarkan hasil temuan audit keamanan (4.1), arsitektur proxy lama menggunakan kunci statis bersama (`PROXY_CLIENT_KEY`) dan mekanisme handshake di mana Laravel menerbitkan signature kembali ke klien. Desain ini memiliki kelemahan:
- Kunci statis berpotensi bocor ke browser jika dipublikasikan via variabel lingkungan frontend publik.
- Klien dapat meminta token/signature secara bebas tanpa pembuktian identitas server.

Arsitektur **Proxy Signature V2 (`CIBATU-PROXY-V2`)** mengadopsi prinsip *Zero Trust* dan *Fail-Closed*:
1. Kunci rahasia (`PROXY_SIGNING_KEY`) **hanya disimpan di sisi server** (server Next.js Route Handler dan backend Laravel). Kunci **tidak pernah** dikirimkan atau dipaparkan ke browser.
2. Setiap permintaan dari Route Handler Next.js ke backend Laravel wajib menandatangani seluruh komponen HTTP request (metode, path, query string, timestamp, nonce, IP klien, dan hash body).
3. Backend Laravel **hanya memverifikasi** tanda tangan dan tidak pernah menerbitkan signature atau token balik.
4. Sistem mendukung rotasi kunci tanpa *downtime* melalui identifikasi kunci (`X-Key-Id`).

---

## 2. Header Protokol Wajib

Setiap permintaan proxy dari server frontend ke Laravel wajib menyertakan 7 header keamanan berikut:

| Header | Format | Contoh | Deskripsi |
| :--- | :--- | :--- | :--- |
| `X-Key-Id` | String alfanumerik | `v1` | Pengenal kunci yang dipakai untuk menandatangani request. Default: `v1`. |
| `X-Timestamp` | Integer (Unix Epoch detik) | `1762600000` | Waktu pembuatan request di sisi frontend server. |
| `X-Nonce` | Base64URL string (min. 16 byte / 22 karakter) | `nonce-random-base64url-token-12345` | Nilai unik sekali pakai untuk mitigasi *Replay Attack*. |
| `X-Client-Ip` | String IPv4 / IPv6 valid | `203.0.113.50` | Alamat IP asli pengguna akhir yang memanggil frontend. |
| `X-Content-Sha256` | Lowercase Hex SHA-256 (64 karakter) | `e3b0c44298fc1c14...` | Hash SHA-256 dari raw body payload (atau Canonical Multipart Digest untuk multipart). |
| `X-Body-Mode` | String enum (`raw` \| `multipart`) | `raw` | Penanda format body. Wajib `multipart` jika Content-Type adalah `multipart/form-data`. |
| `X-Signature` | Lowercase Hex HMAC-SHA256 (64 karakter) | `1e3e5d2a11905b3d...` | Tanda tangan HMAC dari 9 baris string kanonik menggunakan kunci rahasia. |

---

## 3. Format String Kanonik

String kanonik disusun dengan menggabungkan 9 baris teks yang dipisahkan oleh karakter baris baru (*newline* `\n`):

```text
CIBATU-PROXY-V2\n
<METHOD>\n
<PATH>\n
<CANONICAL_QUERY>\n
<TIMESTAMP>\n
<NONCE>\n
<CLIENT_IP>\n
<BODY_SHA256>\n
<BODY_MODE>
```

### Rincian Baris:
1. **Versi Protokol**: Selalu literal string `"CIBATU-PROXY-V2"`.
2. **HTTP Method**: Huruf kapital (misal: `GET`, `POST`, `PUT`, `DELETE`).
3. **Path**: Path endpoint lengkap diawali dengan garis miring `/`, tanpa query string (misal: `/api/proxy/v1/berita`).
4. **Canonical Query**:
   - Jika request **tidak memiliki query parameter**, baris ini berupa **string kosong** (tetap ada newline pemisah).
   - Jika request memiliki query parameter:
     - Urutkan key parameter berdasarkan urutan byte ASCII (*lexicographical sort*).
     - Encode setiap key dan value menggunakan standar **RFC 3986** (`rawurlencode` di PHP, `encodeURIComponent` yang disesuaikan di JavaScript: `!*'()~` di-encode).
     - Gabungkan pasangan `key=value` dengan pemisah `&`.
     - Contoh: `kategori=kegiatan%20warga&page=2&sort=terbaru`.
5. **Timestamp**: Unix epoch timestamp dalam detik (misal: `1762600000`).
6. **Nonce**: Token acak kriptografis Base64URL minimal 16 bytes (misal: `crypto.randomBytes(16).toString('base64url')`).
7. **Client IP**: Alamat IP publik klien yang tervalidasi.
8. **Body SHA-256**:
   - Mode `raw`: Hash SHA-256 dari *raw request payload*. Jika body kosong, gunakan hash dari string kosong:
     `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
   - Mode `multipart`: Dihitung melalui **Canonical Multipart Digest** lintas-runtime (FrankenPHP / PHP-FPM / CLI server):
     - **Validasi Ketat Nama Field**: Seluruh nama field (teks maupun berkas) wajib memenuhi pola `^[a-zA-Z0-9_-]+(?:\[[0-9]*\])?$`. Nama field yang memuat karakter kontrol, `\n`, `\r`, `:`, spasi, atau titik `.` langsung ditolak (HTTP 400 di Next.js, HTTP 401 di Laravel). Pelarangan titik dan spasi secara eksplisit mencegah anomali mutasi nama variabel PHP (PHP secara otomatis mengubah titik dan spasi menjadi `_`) serta mencegah celah *parameter pollution*.
     - **Field Non-File**:
       - Tipe scalar: `field:{key}:{sha256(value)}`
       - Tipe array berulang (misal `kategori[]` atau `kategori[0]`): `field:{key}:{index}:{sha256(value)}`
       - Diurutkan berdasarkan `key` ASCII ascending, lalu `index` numerik ascending.
     - **File Upload** (mendukung beberapa file pada field yang sama, misal `foto[]` sampai 5 berkas):
       - Format: `file:{field}:{index}:{size}:{sha256(file_content)}`
       - Diurutkan berdasarkan `field` ASCII ascending, lalu `index` numerik ascending.
       - **Nama File dan Content-Type Klien Tidak Dipercaya**: Nama file asli dan header `Content-Type` dari browser tidak pernah dimasukkan ke dalam perhitungan digest untuk mencegah injeksi path traversal atau header spoofing. Backend Laravel melakukan inspeksi biner nyata (`finfo` / `getimagesize()`) dan menyimpan berkas ke disk privat dengan nama UUID v4 acak murni (`Str::uuid()`).
     - Gabungkan setiap baris dengan `\n` dan hash hasilnya dengan SHA-256 menjadi string hex 64 karakter lowercase.
9. **Body Mode**: Huruf kecil `raw` atau `multipart`. Jika `Content-Type` diawali `multipart/form-data`, wajib bernilai `multipart` (mencegah *downgrade attack*).

### Perhitungan Signature:
```text
Signature = HMAC-SHA256(secret_key, canonical_string).toHexLowercase()
```

---

## 4. Alur Verifikasi di Laravel (Fail-Closed)

Middleware `ValidateProxySignatureV2` (`app/Http/Middleware/ValidateProxySignatureV2.php`) mengeksekusi validasi berurutan:

1. **Kelengkapan Header**: Seluruh 6 header wajib ada. Jika salah satu nihil, tolak dengan `401 Unauthorized` generik.
2. **Validasi Kunci**:
   - `X-Key-Id` harus cocok dengan salah satu kunci yang terdaftar di `config('proxy.keys')`.
   - Panjang kunci minimal 32 karakter / byte. Jika tidak dikenal atau lemah, tolak dengan `401 Unauthorized`.
3. **Validasi Waktu**:
   - `abs(now - timestamp) <= 60 detik`. Jika melebihi batas toleransi, tolak dengan `401 Unauthorized`.
4. **Mitigasi Replay Attack (Anti-Replay)**:
   - Nonce diperiksa ke cache dengan key `proxy_nonce:{key_id}:{nonce}` dan TTL 120 detik.
   - Pengecekan menggunakan operasi atomik `Cache::add()`. Jika kunci sudah ada, tolak dengan `401 Unauthorized`.
5. **Validasi Format IP**:
   - `X-Client-Ip` harus berupa format IP yang valid.
6. **Validasi Hash Body**:
   - Laravel membaca raw content `$request->getContent()`, menghitung `hash('sha256', $rawBody)`, dan mencocokkan dengan `X-Content-Sha256` menggunakan `hash_equals()`.
7. **Verifikasi Tanda Tangan**:
   - Laravel merekonstruksi string kanonik dari data request yang diterima.
   - Menghitung `hash_hmac('sha256', $canonicalString, $secretKey)`.
   - Mencocokkan nilai tanda tangan menggunakan fungsi perbandingan waktu konstan `hash_equals()`.
   - Bila tidak cocok, tolak dengan `401 Unauthorized`.

> **Catatan Keamanan Log**: Semua log penolakan di Laravel mencatat kode alasan internal (seperti `SIGNATURE_MISMATCH`, `TIMESTAMP_EXPIRED`, `NONCE_REPLAY_DETECTED`), namun pesan HTTP respon ke klien selalu generik: `{"message": "Unauthorized"}` (HTTP 401). Nilai signature dan secret key dilarang keras dicatat ke log.

---

## 5. Rotasi Kunci (Multi-Key Rotation)

Untuk memperbarui kunci tanpa *downtime*:
1. Tambahkan kunci baru pada konfigurasi `.env` Laravel dan frontend Next.js:
   ```env
   # Laravel config/proxy.php membaca PROXY_SIGNING_KEYS dalam format JSON
   PROXY_SIGNING_KEYS={"key-2026-v2-primary":"kunci_rahasia_lama_minimal_32_karakter","key-2026-v2-secondary":"kunci_rahasia_baru_minimal_32_karakter"}
   ```
2. Setel Next.js untuk menggunakan `X-Key-Id` baru (`key-2026-v2-secondary`).
3. Selama periode transisi, kedua kunci aktif diterima oleh Laravel.
4. Setelah seluruh server frontend beralih ke kunci baru, hapus kunci lama dari konfigurasi Laravel.

---

## 6. Rate Limiting & Perlindungan Data Pribadi

1. **IP Asli Klien**:
   - Nilai `X-Client-Ip` baru dipercaya dan disetel ke atribut request (`$request->attributes->set('proxy_client_ip', $clientIp)`) **hanya setelah verifikasi signature valid**.
2. **Throttling Data Personal**:
   - Endpoint pencarian/riwayat data kependudukan (`/api/v1/search-penduduk`, `/api/v1/surat-history`, `/api/v1/surat-status`, `/api/v1/bantuan-sosial/check`) diproteksi dengan `RateLimitPersonalDataMiddleware`:
     - Maksimal 5 permintaan / menit per IP klien.
     - Maksimal 10 permintaan / jam per NIK (di mana kunci cache menggunakan hash `sha256($nik)` untuk mencegah paparan NIK di cache server).
   - Wajib menyertakan token CAPTCHA (reCAPTCHA v2 / v3) yang diverifikasi di sisi server.
3. **Pencegahan Enumerasi Data**:
   - Endpoint respon mengembalikan pesan seragam (misal: *"Data tidak ditemukan atau tanggal lahir tidak sesuai."*, status HTTP 404) baik ketika NIK tidak ada di database maupun ketika tanggal lahir tidak cocok.

---

## 7. Referensi Test Vectors

File referensi test vectors tersedia di [docs/proxy-signature-test-vectors.json](file:///d:/SISTEM-DESA-CIBATU/sistem-desa-cibatu/docs/proxy-signature-test-vectors.json). Seluruh implementasi suite pengujian di backend dan frontend wajib memverifikasi kecocokan terhadap vector ini.
