import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSecretKey,
  getValidatedProxyKey,
  getValidatedStorageKey,
  validateProxyRoute,
  validateStoragePath,
  redactNik,
  ALLOWED_PROXY_ROUTES,
} from '../src/lib/security.js';

// ==========================================
// 1. PENGUJIAN FAIL-CLOSED KUNCI RAHASIA
// ==========================================
test('Security: validateSecretKey menolak kunci kosong atau undefined', () => {
  assert.equal(validateSecretKey('', 'PROXY_KEY').valid, false);
  assert.equal(validateSecretKey(undefined, 'PROXY_KEY').valid, false);
  assert.equal(validateSecretKey('   ', 'PROXY_KEY').valid, false);
  assert.match(validateSecretKey('', 'PROXY_KEY').error, /belum dikonfigurasi/);
});

test('Security: validateSecretKey menolak kunci berprefiks NEXT_PUBLIC_', () => {
  const result = validateSecretKey('abcdef1234567890abcdef1234567890', 'NEXT_PUBLIC_PROXY_KEY');
  assert.equal(result.valid, false);
  assert.match(result.error, /tidak boleh menggunakan prefiks NEXT_PUBLIC_/);
});

test('Security: validateSecretKey menolak kunci yang terlalu pendek (< 32 karakter)', () => {
  const shortKey = 'short-secret-key-12345';
  const result = validateSecretKey(shortKey, 'PROXY_KEY');
  assert.equal(result.valid, false);
  assert.match(result.error, /terlalu lemah/);
});

test('Security: validateSecretKey menerima kunci server valid (>= 32 karakter)', () => {
  const strongKey = 'cibatu_production_strong_secret_key_2026_secure_32';
  const result = validateSecretKey(strongKey, 'PROXY_KEY');
  assert.equal(result.valid, true);
  assert.equal(result.error, undefined);
});

test('Security: getValidatedProxyKey fail-closed saat NEXT_PUBLIC_PROXY_KEY terpasang di env', () => {
  const originalEnv = { ...process.env };
  try {
    process.env.NEXT_PUBLIC_PROXY_KEY = 'leak_candidate_key_12345678901234567890';
    process.env.PROXY_KEY = 'valid_server_secret_key_12345678901234567890';
    const result = getValidatedProxyKey();
    assert.equal(result.key, null);
    assert.match(result.error, /Pelanggaran Keamanan/);
  } finally {
    process.env = originalEnv;
  }
});

// ==========================================
// 2. PENGUJIAN ALLOWLIST PROXY ROUTE
// ==========================================
test('Security: validateProxyRoute mengizinkan rute sah yang terdaftar dalam allowlist', () => {
  // Berita
  assert.equal(validateProxyRoute('GET', 'berita').allowed, true);
  assert.equal(validateProxyRoute('GET', 'berita/kegiatan-desa-cibatu-2026').allowed, true);
  assert.equal(validateProxyRoute('GET', 'berita-latest').allowed, true);

  // Profil & Informasi Desa
  assert.equal(validateProxyRoute('GET', 'desa-info').allowed, true);
  assert.equal(validateProxyRoute('GET', 'public-statistics/info-desa').allowed, true);
  assert.equal(validateProxyRoute('GET', 'kontak-desa').allowed, true);
  assert.equal(validateProxyRoute('GET', 'statistics').allowed, true);
  assert.equal(validateProxyRoute('GET', 'geojson').allowed, true);

  // Layanan Warga
  assert.equal(validateProxyRoute('POST', 'bantuan-sosial/check').allowed, true);
  assert.equal(validateProxyRoute('GET', 'surat-types').allowed, true);
  assert.equal(validateProxyRoute('POST', 'search-penduduk').allowed, true);
  assert.equal(validateProxyRoute('POST', 'surat-pengajuan').allowed, true);
  assert.equal(validateProxyRoute('GET', 'surat-status').allowed, true);
  assert.equal(validateProxyRoute('POST', 'surat-history').allowed, true);
  assert.equal(validateProxyRoute('POST', 'pengaduan/submit').allowed, true);
});

test('Security: validateProxyRoute menolak rute di luar allowlist dengan 404/ROUTE_NOT_IN_ALLOWLIST', () => {
  // Rute tidak dikenal
  assert.equal(validateProxyRoute('GET', 'users').allowed, false);
  assert.equal(validateProxyRoute('GET', 'admin/login').allowed, false);
  assert.equal(validateProxyRoute('GET', 'internal-db-dump').allowed, false);
  assert.equal(validateProxyRoute('GET', 'users/export').allowed, false);

  // Method salah (surat-pengajuan wajib POST, bukan GET)
  assert.equal(validateProxyRoute('GET', 'surat-pengajuan').allowed, false);
  assert.equal(validateProxyRoute('GET', 'surat-pengajuan').reason, 'ROUTE_NOT_IN_ALLOWLIST');

  // Method salah (surat-status saat ini GET, bukan POST)
  assert.equal(validateProxyRoute('DELETE', 'surat-status').allowed, false);
});

test('Security: validateProxyRoute mendeteksi dan menolak upaya Path Traversal (400)', () => {
  // Traversal bertitik
  assert.equal(validateProxyRoute('GET', '../admin').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateProxyRoute('GET', 'berita/../../admin').reason, 'PATH_TRAVERSAL_DETECTED');
  
  // Double slash dan backslash
  assert.equal(validateProxyRoute('GET', 'berita//kegiatan').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateProxyRoute('GET', 'berita\\kegiatan').reason, 'PATH_TRAVERSAL_DETECTED');

  // URL encoded traversal
  assert.equal(validateProxyRoute('GET', '%2e%2e/admin').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateProxyRoute('GET', '%252e%252e/admin').reason, 'PATH_TRAVERSAL_DETECTED');

  // Null byte injection
  assert.equal(validateProxyRoute('GET', 'berita\0.php').reason, 'PATH_TRAVERSAL_DETECTED');
});

// ==========================================
// 3. PENGUJIAN PENYIMPANAN BERKAS (STORAGE PROXY)
// ==========================================
test('Security: validateStoragePath mengizinkan aset publik yang sah', () => {
  assert.equal(validateStoragePath('berita/banner-kegiatan.jpg').allowed, true);
  assert.equal(validateStoragePath('fasilitas-desa/posyandu.png').allowed, true);
  assert.equal(validateStoragePath('struktur-desa/kepala-desa.webp').allowed, true);
  assert.equal(validateStoragePath('umkms/produk-keripik.jpg').allowed, true);
  assert.equal(validateStoragePath('logos/logo-cibatu.svg').allowed, true);
  assert.equal(validateStoragePath('profil-desa/gedung.jpg').allowed, true);
  assert.equal(validateStoragePath('kontak-desa/kantor.png').allowed, true);
});

test('Security: validateStoragePath menolak keras akses ke direktori privat warga', () => {
  // Berkas permohonan surat warga (privat)
  assert.equal(validateStoragePath('surat-balasan/surat_keterangan_3202.pdf').allowed, false);
  assert.equal(validateStoragePath('surat-balasan/surat_keterangan_3202.pdf').reason, 'STORAGE_PREFIX_NOT_ALLOWED');

  // Dokumen mutasi kependudukan (privat)
  assert.equal(validateStoragePath('mutasi-documents/surat_pindah.pdf').allowed, false);

  // Lampiran pengaduan warga (privat)
  assert.equal(validateStoragePath('pengaduan/bukti_laporan.jpg').allowed, false);

  // File identitas KTP/KK
  assert.equal(validateStoragePath('ktp/ktp_warga.jpg').allowed, false);
  assert.equal(validateStoragePath('kk/kartu_keluarga.pdf').allowed, false);
});

test('Security: validateStoragePath mendeteksi dan menolak Path Traversal pada storage', () => {
  assert.equal(validateStoragePath('../../../.env').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateStoragePath('berita/../../private/surat.pdf').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateStoragePath('%2e%2e/database.sqlite').reason, 'PATH_TRAVERSAL_DETECTED');
});

// ==========================================
// 4. PENGUJIAN REDAKSI NIK (DATA PRIVACY UU PDP)
// ==========================================
test('Privacy: redactNik menyamarkan 16 digit NIK menjadi format tersensor', () => {
  const originalError = 'Error: Data penduduk dengan NIK 3202123456789012 tidak ditemukan pada database';
  const redacted = redactNik(originalError);

  assert.equal(redacted, 'Error: Data penduduk dengan NIK 3202********9012 tidak ditemukan pada database');
  assert.doesNotMatch(redacted, /3202123456789012/);
});

test('Privacy: redactNik tidak merusak teks umum tanpa NIK', () => {
  const normalText = 'Koneksi ke backend server timed out setelah 30 detik.';
  assert.equal(redactNik(normalText), normalText);
});

test('Privacy: redactNik menangani input null, undefined, atau string kosong dengan aman', () => {
  assert.equal(redactNik(null), '');
  assert.equal(redactNik(undefined), '');
  assert.equal(redactNik(''), '');
});
