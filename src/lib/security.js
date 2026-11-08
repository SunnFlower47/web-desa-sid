/**
 * Security & Data Privacy Utilities
 * Sistem Informasi Desa Cibatu - Frontend Web Warga
 * Implementasi Protokol CIBATU-PROXY-V2
 */

import crypto from 'crypto';

export const PROTOCOL_VERSION = 'CIBATU-PROXY-V2';

/**
 * Validasi fail-closed kunci rahasia server
 * @param {string|undefined} key Nilai kunci
 * @param {string} name Nama variabel environment
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateSecretKey(key, name) {
  if (name.startsWith('NEXT_PUBLIC_')) {
    return {
      valid: false,
      error: `Konfigurasi rahasia [${name}] tidak boleh menggunakan prefiks NEXT_PUBLIC_ demi mencegah kebocoran ke browser.`
    };
  }

  if (!key || typeof key !== 'string' || key.trim() === '') {
    return {
      valid: false,
      error: `Konfigurasi rahasia [${name}] belum dikonfigurasi di environment server.`
    };
  }

  if (key.trim().length < 32) {
    return {
      valid: false,
      error: `Konfigurasi rahasia [${name}] terlalu lemah (panjang ${key.trim().length} karakter, minimal 32 karakter).`
    };
  }

  return { valid: true };
}

/**
 * Mendapatkan PROXY_SIGNING_KEY dengan validasi fail-closed (Protokol V2)
 * @returns {{ key: string|null, keyId: string, error: string|null }}
 */
export function getValidatedSigningKey() {
  // Fail-closed jika developer mencoba menggunakan prefiks NEXT_PUBLIC_
  if (process.env.NEXT_PUBLIC_PROXY_SIGNING_KEY || process.env.NEXT_PUBLIC_PROXY_KEY) {
    const errMsg = 'Pelanggaran Keamanan: Ditemukan NEXT_PUBLIC_PROXY_SIGNING_KEY / NEXT_PUBLIC_PROXY_KEY. Kunci rahasia signing dilarang diekspos ke klien.';
    console.error(`[Security Fail-Closed] ${errMsg}`);
    return { key: null, keyId: '', error: errMsg };
  }

  const key = process.env.PROXY_SIGNING_KEY;
  const validation = validateSecretKey(key, 'PROXY_SIGNING_KEY');

  if (!validation.valid) {
    console.error(`[Security Fail-Closed] ${validation.error}`);
    return { key: null, keyId: '', error: validation.error };
  }

  const keyId = process.env.PROXY_KEY_ID || 'v1';
  return { key: key.trim(), keyId: keyId.trim(), error: null };
}

/**
 * Mendapatkan BACKEND_SECRET_KEY dengan validasi fail-closed (tanpa fallback hardcode)
 * @returns {{ key: string|null, error: string|null }}
 */
export function getValidatedStorageKey() {
  if (process.env.NEXT_PUBLIC_BACKEND_SECRET_KEY) {
    const errMsg = 'Pelanggaran Keamanan: Ditemukan NEXT_PUBLIC_BACKEND_SECRET_KEY. Kunci storage dilarang diekspos ke klien.';
    console.error(`[Security Fail-Closed] ${errMsg}`);
    return { key: null, error: errMsg };
  }

  const key = process.env.BACKEND_SECRET_KEY;
  const validation = validateSecretKey(key, 'BACKEND_SECRET_KEY');

  if (!validation.valid) {
    console.error(`[Security Fail-Closed] ${validation.error}`);
    return { key: null, error: validation.error };
  }

  return { key: key.trim(), error: null };
}

/**
 * Encode string sesuai standar RFC 3986 (menyamakan rawurlencode di PHP)
 * Karakter !'()* di-encode ke bentuk hex uppercase
 * @param {string} str
 * @returns {string}
 */
export function rfc3986Encode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

/**
 * Susun query string kanonik: parameter diurutkan berdasar key, di-encode RFC 3986
 * @param {Record<string, any>|URLSearchParams|string|null|undefined} query
 * @returns {string}
 */
export function buildCanonicalQuery(query) {
  if (!query) return '';

  let entries = [];
  if (query instanceof URLSearchParams) {
    for (const [key, val] of query.entries()) {
      entries.push([key, val]);
    }
  } else if (typeof query === 'string') {
    const parsed = new URLSearchParams(query);
    for (const [key, val] of parsed.entries()) {
      entries.push([key, val]);
    }
  } else if (typeof query === 'object') {
    for (const [key, val] of Object.entries(query)) {
      if (Array.isArray(val)) {
        const sortedArray = [...val].sort();
        for (const item of sortedArray) {
          entries.push([key, item]);
        }
      } else {
        entries.push([key, val]);
      }
    }
  }

  if (entries.length === 0) return '';

  // Urutkan key secara leksikografis (byte order), jika key sama urutkan berdasar value
  entries.sort((a, b) => {
    if (a[0] === b[0]) {
      return String(a[1]).localeCompare(String(b[1]));
    }
    return String(a[0]).localeCompare(String(b[0]));
  });

  return entries
    .map(([key, value]) => `${rfc3986Encode(String(key))}=${rfc3986Encode(String(value))}`)
    .join('&');
}

/**
 * Validasi apakah string adalah format IPv4 atau IPv6 yang valid
 * @param {string} ip
 * @returns {boolean}
 */
export function isValidIp(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(trimmed) || (trimmed.includes(':') && ipv6.test(trimmed));
}

/**
 * Ekstraksi alamat IP klien terpercaya (Secure Client IP Extraction)
 * 
 * Strategi Keamanan (CWE-290 Spoofing Prevention):
 * 1. Default Mode (TRUST_PROXY tidak aktif):
 *    Header `X-Forwarded-For` dan `X-Real-IP` yang dikirim langsung oleh browser/klien
 *    dianggap TIDAK TEPERCAYA (dapat dipalsukan/spoofed dengan mudah oleh penyerang).
 *    Dalam mode ini, proxy mengabaikan header tersebut dan menggunakan fallback loopback/direct.
 * 2. Trusted Proxy Mode (TRUST_PROXY=true / TRUST_PROXY=cloudflare / TRUST_PROXY=reverse_proxy):
 *    - Cloudflare Edge: Header `cf-connecting-ip` (disuntikkan oleh edge Cloudflare, tidak bisa dipalsukan klien).
 *    - Nginx / Reverse Proxy: Header `x-real-ip` (dikonfigurasi dengan proxy_set_header $remote_addr yang menimpa input klien).
 *    - X-Forwarded-For: Jika berasal dari trusted proxy, ambil IP terakhir (hop terdekat sebelum trusted proxy)
 *      bukan IP pertama yang rentan di-spoof oleh attacker melalui header injection.
 *
 * @param {Request|{ headers: Headers|Map|Record<string, string>, ip?: string }} request
 * @param {object} [options]
 * @param {boolean} [options.trustProxy]
 * @returns {string} Alamat IP klien yang tervalidasi
 */
export function extractClientIp(request, options = {}) {
  // Ambil konfigurasi trust proxy dari parameter atau environment
  const trustProxy = options.trustProxy !== undefined 
    ? options.trustProxy 
    : (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production');

  // Ambil helper untuk membaca header secara seragam
  const getHeader = (name) => {
    if (!request || !request.headers) return null;
    if (typeof request.headers.get === 'function') {
      return request.headers.get(name);
    }
    return request.headers[name] || request.headers[name.toLowerCase()] || null;
  };

  // Jika trustProxy tidak aktif, JANGAN PERCAYA X-Forwarded-For atau X-Real-IP dari klien
  if (!trustProxy) {
    if (request && typeof request.ip === 'string' && isValidIp(request.ip)) {
      return request.ip.trim();
    }
    return '127.0.0.1';
  }

  // 1. Prioritas 1: Header khusus dari penyedia edge tepercaya
  const cfConnectingIp = getHeader('cf-connecting-ip');
  if (cfConnectingIp && isValidIp(cfConnectingIp.trim())) {
    return cfConnectingIp.trim();
  }

  const trueClientIp = getHeader('true-client-ip');
  if (trueClientIp && isValidIp(trueClientIp.trim())) {
    return trueClientIp.trim();
  }

  // 2. Prioritas 2: X-Real-IP dari reverse proxy internal (misal: Nginx)
  const xRealIp = getHeader('x-real-ip');
  if (xRealIp && isValidIp(xRealIp.trim())) {
    return xRealIp.trim();
  }

  // 3. Prioritas 3: X-Forwarded-For dari reverse proxy
  const xff = getHeader('x-forwarded-for');
  if (xff && typeof xff === 'string') {
    const parts = xff.split(',').map((p) => p.trim()).filter(isValidIp);
    if (parts.length > 0) {
      // Ambil hop terakhir yang ditambahkan oleh trusted proxy terdekat
      return parts[parts.length - 1];
    }
  }

  if (request && typeof request.ip === 'string' && isValidIp(request.ip)) {
    return request.ip.trim();
  }

  return '127.0.0.1';
}

/**
 * Hitung hash SHA-256 dari raw body string (hex lowercase)
 * Jika body null/kosong, kembalikan hash dari string kosong
 * @param {string|null|undefined} body
 * @returns {string}
 */
export function hashBody(body) {
  return crypto.createHash('sha256').update(body || '').digest('hex');
}

/**
 * Hitung Canonical Multipart Digest dari form fields dan file upload:
 * - Field non-file: hash nilai, urut nama ASCII
 * - File: nama field, ukuran, SHA-256 isi, urut nama+indeks
 * Digabung dengan newline dan di-hash SHA-256
 * @param {Record<string, any>} fields
 * @param {Array<{ field: string, index: number, size: number, sha256: string }>} files
 * @returns {string} SHA-256 hex digest
 */
export function buildMultipartDigest(fields, files) {
  const lines = [];

  // 1. Non-file fields: hash nilai, urut nama ASCII
  const sortedKeys = Object.keys(fields || {}).sort();
  for (const key of sortedKeys) {
    const val = fields[key];
    const valStr = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
    const valHash = crypto.createHash('sha256').update(valStr).digest('hex');
    lines.push(`field:${key}:${valHash}`);
  }

  // 2. Files: field name, index, size, sha256 of contents, sort by field asc then index asc
  const sortedFiles = [...(files || [])].sort((a, b) => {
    const cmp = String(a.field).localeCompare(String(b.field));
    if (cmp !== 0) return cmp;
    return Number(a.index) - Number(b.index);
  });

  for (const file of sortedFiles) {
    const fName = file.field;
    const fIdx = Number(file.index);
    const fSize = Number(file.size);
    const fHash = String(file.sha256).toLowerCase();
    lines.push(`file:${fName}:${fIdx}:${fSize}:${fHash}`);
  }

  const combined = lines.join('\n');
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Susun string kanonik CIBATU-PROXY-V2
 * @param {string} method
 * @param {string} path
 * @param {string} canonicalQuery
 * @param {string|number} timestamp
 * @param {string} nonce
 * @param {string} clientIp
 * @param {string} bodySha256
 * @param {string} [bodyMode='raw']
 * @returns {string}
 */
export function buildCanonicalString(method, path, canonicalQuery, timestamp, nonce, clientIp, bodySha256, bodyMode = 'raw') {
  const normMethod = (method || '').trim().toUpperCase();
  const normPath = '/' + (path || '').trim().replace(/^\/+/, '');

  return [
    PROTOCOL_VERSION,
    normMethod,
    normPath,
    canonicalQuery || '',
    String(timestamp).trim(),
    (nonce || '').trim(),
    (clientIp || '').trim(),
    (bodySha256 || '').trim().toLowerCase(),
    (bodyMode || 'raw').trim().toLowerCase(),
  ].join('\n');
}

/**
 * Hitung HMAC-SHA256 signature
 * @param {string} canonicalString
 * @param {string} secretKey
 * @returns {string}
 */
export function calculateSignature(canonicalString, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(canonicalString).digest('hex');
}

/**
 * Buat nonce kriptografis acak minimal 16 bytes format Base64URL
 * @returns {string}
 */
export function generateNonce() {
  return crypto.randomBytes(16).toString('base64url');
}

/**
 * Allowlist resmi endpoint API yang diizinkan diakses melalui Next.js Proxy
 * Format: { method: 'GET'|'POST', pattern: RegExp }
 */
export const ALLOWED_PROXY_ROUTES = [
  // Berita
  { method: 'GET', pattern: /^berita$/ },
  { method: 'GET', pattern: /^berita\/[a-zA-Z0-9_-]+$/ },
  { method: 'GET', pattern: /^berita-latest$/ },
  { method: 'GET', pattern: /^berita-eksternal$/ },
  { method: 'GET', pattern: /^berita-categories$/ },

  // Profil & Informasi Desa
  { method: 'GET', pattern: /^desa-info$/ },
  { method: 'GET', pattern: /^public-statistics\/info-desa$/ },
  { method: 'GET', pattern: /^kontak-desa$/ },
  { method: 'GET', pattern: /^contact\/info$/ },
  { method: 'POST', pattern: /^contact\/submit$/ },
  { method: 'GET', pattern: /^statistics$/ },
  { method: 'GET', pattern: /^struktur-desa$/ },
  { method: 'GET', pattern: /^perangkat-desa$/ },
  { method: 'GET', pattern: /^fasilitas-desa$/ },
  { method: 'GET', pattern: /^umkm$/ },
  { method: 'GET', pattern: /^geojson$/ },

  // Transparansi Keuangan & Pembangunan
  { method: 'GET', pattern: /^apbdes$/ },
  { method: 'GET', pattern: /^proyek-pembangunan$/ },
  { method: 'GET', pattern: /^bantuan-sosial-transparansi$/ },

  // Layanan Warga: Bantuan Sosial
  { method: 'POST', pattern: /^bantuan-sosial\/check$/ },

  // Layanan Warga: Surat
  { method: 'GET', pattern: /^surat-types$/ },
  { method: 'GET', pattern: /^master-wilayah$/ },
  { method: 'POST', pattern: /^search-penduduk$/ },
  { method: 'POST', pattern: /^surat-pengajuan$/ },
  { method: 'POST', pattern: /^surat-status$/ }, // Migrasi ke POST + CAPTCHA
  { method: 'POST', pattern: /^surat-history$/ },

  // Layanan Warga: Pengaduan
  { method: 'POST', pattern: /^pengaduan\/submit$/ },

  // Testimoni & AI Chat
  { method: 'GET', pattern: /^testimoni$/ },
  { method: 'POST', pattern: /^testimoni$/ },
  { method: 'POST', pattern: /^chat$/ },
];

/**
 * Validasi apakah path dan method request termasuk dalam allowlist yang sah
 * serta bebas dari upaya path traversal.
 * @param {string} method HTTP Method (GET, POST, dll)
 * @param {string} path Path relatif (misal: 'berita/kegiatan-desa')
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function validateProxyRoute(method, path) {
  if (!path || typeof path !== 'string') {
    return { allowed: false, reason: 'INVALID_PATH' };
  }

  // Deteksi karakter null byte dan encoded traversal
  if (path.includes('\0') || path.includes('%00') || path.includes('%252e')) {
    return { allowed: false, reason: 'PATH_TRAVERSAL_DETECTED' };
  }

  // Deteksi dan tolak Path Traversal & karakter mencurigakan
  let decodedPath = path;
  try {
    decodedPath = decodeURIComponent(path).toLowerCase();
  } catch (e) {
    return { allowed: false, reason: 'PATH_TRAVERSAL_DETECTED' };
  }

  if (
    decodedPath.includes('..') ||
    decodedPath.includes('//') ||
    decodedPath.includes('\\') ||
    path.includes('%2e%2e') ||
    path.includes('%2f%2f') ||
    path.startsWith('/')
  ) {
    return { allowed: false, reason: 'PATH_TRAVERSAL_DETECTED' };
  }

  const cleanMethod = (method || '').toUpperCase();
  const isMatch = ALLOWED_PROXY_ROUTES.some((route) => {
    return route.method === cleanMethod && route.pattern.test(path);
  });

  if (!isMatch) {
    return { allowed: false, reason: 'ROUTE_NOT_IN_ALLOWLIST' };
  }

  return { allowed: true };
}

/**
 * Validasi path penyimpanan berkas publik (mencegah path traversal dan akses direktori privat)
 * @param {string} storagePath Path berkas (misal: 'berita/photos/banner.jpg')
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function validateStoragePath(storagePath) {
  if (!storagePath || typeof storagePath !== 'string') {
    return { allowed: false, reason: 'INVALID_STORAGE_PATH' };
  }

  if (storagePath.includes('\0') || storagePath.includes('%00') || storagePath.includes('%252e')) {
    return { allowed: false, reason: 'PATH_TRAVERSAL_DETECTED' };
  }

  let decoded = storagePath;
  try {
    decoded = decodeURIComponent(storagePath).toLowerCase();
  } catch (e) {
    return { allowed: false, reason: 'PATH_TRAVERSAL_DETECTED' };
  }

  if (
    decoded.includes('..') ||
    decoded.includes('//') ||
    decoded.includes('\\') ||
    storagePath.includes('%2e%2e')
  ) {
    return { allowed: false, reason: 'PATH_TRAVERSAL_DETECTED' };
  }

  // Whitelist prefix direktori publik yang diizinkan dilayani
  const ALLOWED_STORAGE_PREFIXES = [
    'berita/',
    'fasilitas-desa/',
    'struktur-desa/',
    'umkms/',
    'umkm/',
    'logos/',
    'profil-desa/',
    'kontak-desa/',
  ];

  const cleanPath = storagePath.replace(/^\/+/, '');
  const isWhitelisted = ALLOWED_STORAGE_PREFIXES.some((prefix) => cleanPath.startsWith(prefix));

  if (!isWhitelisted) {
    return { allowed: false, reason: 'STORAGE_PREFIX_NOT_ALLOWED' };
  }

  return { allowed: true };
}

/**
 * Redaksi NIK (16 digit angka) dari string pesan error atau teks log
 * @param {string|null|undefined} text
 * @returns {string}
 */
export function redactNik(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\b(\d{4})\d{8}(\d{4})\b/g, '$1********$2');
}
