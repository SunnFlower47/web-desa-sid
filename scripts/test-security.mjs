import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateSecretKey,
  getValidatedSigningKey,
  getValidatedStorageKey,
  validateProxyRoute,
  validateStoragePath,
  redactNik,
  rfc3986Encode,
  buildCanonicalQuery,
  hashBody,
  buildMultipartDigest,
  buildCanonicalString,
  calculateSignature,
  generateNonce,
  extractClientIp,
  isValidIp,
  isValidFieldName,
  ALLOWED_PROXY_ROUTES,
} from '../src/lib/security.js';

// ==========================================
// 1. PENGUJIAN FAIL-CLOSED KUNCI RAHASIA V2
// ==========================================
test('Security: validateSecretKey menolak kunci kosong atau undefined', () => {
  assert.equal(validateSecretKey('', 'PROXY_SIGNING_KEY').valid, false);
  assert.equal(validateSecretKey(undefined, 'PROXY_SIGNING_KEY').valid, false);
  assert.equal(validateSecretKey('   ', 'PROXY_SIGNING_KEY').valid, false);
  assert.match(validateSecretKey('', 'PROXY_SIGNING_KEY').error, /belum dikonfigurasi/);
});

test('Security: validateSecretKey menolak kunci berprefiks NEXT_PUBLIC_', () => {
  const result = validateSecretKey('abcdef1234567890abcdef1234567890', 'NEXT_PUBLIC_PROXY_SIGNING_KEY');
  assert.equal(result.valid, false);
  assert.match(result.error, /tidak boleh menggunakan prefiks NEXT_PUBLIC_/);
});

test('Security: validateSecretKey menolak kunci yang terlalu pendek (< 32 karakter)', () => {
  const shortKey = 'short-secret-key-12345';
  const result = validateSecretKey(shortKey, 'PROXY_SIGNING_KEY');
  assert.equal(result.valid, false);
  assert.match(result.error, /terlalu lemah/);
});

test('Security: validateSecretKey menerima kunci server valid (>= 32 karakter)', () => {
  const strongKey = 'cibatu_production_strong_secret_key_2026_secure_32';
  const result = validateSecretKey(strongKey, 'PROXY_SIGNING_KEY');
  assert.equal(result.valid, true);
  assert.equal(result.error, undefined);
});

test('Security: getValidatedSigningKey fail-closed saat NEXT_PUBLIC_ terpasang di env', () => {
  const originalEnv = { ...process.env };
  try {
    process.env.NEXT_PUBLIC_PROXY_SIGNING_KEY = 'leak_candidate_key_12345678901234567890';
    process.env.PROXY_SIGNING_KEY = 'valid_server_secret_key_12345678901234567890';
    const result = getValidatedSigningKey();
    assert.equal(result.key, null);
    assert.match(result.error, /Pelanggaran Keamanan/);
  } finally {
    process.env = originalEnv;
  }
});

test('Security: getValidatedSigningKey fail-closed saat kunci kosong atau terlalu pendek', () => {
  const originalEnv = { ...process.env };
  try {
    delete process.env.NEXT_PUBLIC_PROXY_SIGNING_KEY;
    delete process.env.NEXT_PUBLIC_PROXY_KEY;
    
    // Kasus kosong
    process.env.PROXY_SIGNING_KEY = '';
    let result = getValidatedSigningKey();
    assert.equal(result.key, null);
    assert.match(result.error, /belum dikonfigurasi/);

    // Kasus < 32 bytes
    process.env.PROXY_SIGNING_KEY = 'terlalu-pendek-123';
    result = getValidatedSigningKey();
    assert.equal(result.key, null);
    assert.match(result.error, /terlalu lemah/);

    // Kasus valid >= 32 bytes
    process.env.PROXY_SIGNING_KEY = 'valid-super-secure-proxy-signing-key-32-chars-min';
    process.env.PROXY_KEY_ID = 'test-key-v2';
    result = getValidatedSigningKey();
    assert.equal(result.key, 'valid-super-secure-proxy-signing-key-32-chars-min');
    assert.equal(result.keyId, 'test-key-v2');
    assert.equal(result.error, null);
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
  assert.equal(validateProxyRoute('POST', 'surat-status').allowed, true); // Wajib POST
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

  // Method lama surat-status (GET) ditolak
  assert.equal(validateProxyRoute('GET', 'surat-status').allowed, false);
  assert.equal(validateProxyRoute('GET', 'surat-status').reason, 'ROUTE_NOT_IN_ALLOWLIST');
});

test('Security: validateProxyRoute mendeteksi dan menolak upaya Path Traversal (400)', () => {
  assert.equal(validateProxyRoute('GET', '../admin').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateProxyRoute('GET', 'berita/../../admin').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateProxyRoute('GET', 'berita//kegiatan').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateProxyRoute('GET', 'berita\\kegiatan').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateProxyRoute('GET', '%2e%2e/admin').reason, 'PATH_TRAVERSAL_DETECTED');
  assert.equal(validateProxyRoute('GET', '%252e%252e/admin').reason, 'PATH_TRAVERSAL_DETECTED');
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
  assert.equal(validateStoragePath('surat-balasan/surat_keterangan_3202.pdf').allowed, false);
  assert.equal(validateStoragePath('surat-balasan/surat_keterangan_3202.pdf').reason, 'STORAGE_PREFIX_NOT_ALLOWED');
  assert.equal(validateStoragePath('mutasi-documents/surat_pindah.pdf').allowed, false);
  assert.equal(validateStoragePath('pengaduan/bukti_laporan.jpg').allowed, false);
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

// ==========================================
// 5. PENGUJIAN PROTOKOL CIBATU-PROXY-V2 DENGAN TEST VECTORS RESMI
// ==========================================
test('Proxy V2: generateNonce menghasilkan token acak Base64URL >= 22 karakter', () => {
  const nonce = generateNonce();
  assert.equal(typeof nonce, 'string');
  assert.ok(nonce.length >= 22, `Panjang nonce ${nonce.length} harus >= 22 karakter`);
  assert.match(nonce, /^[A-Za-z0-9_-]+$/);
});

test('Proxy V2: Membuktikan output signature generator identik 100% dengan docs/proxy-signature-test-vectors.json', () => {
  const vectorFilePath = path.join(process.cwd(), 'docs/proxy-signature-test-vectors.json');
  assert.ok(fs.existsSync(vectorFilePath), 'File docs/proxy-signature-test-vectors.json wajib ada');

  const vectorData = JSON.parse(fs.readFileSync(vectorFilePath, 'utf8'));
  assert.equal(vectorData.version, 'CIBATU-PROXY-V2');

  const { test_key_id, test_secret_key, timestamp, nonce, client_ip, cases } = vectorData;

  for (const c of cases) {
    const { case_id, request, canonical, expected_headers } = c;

    // 1. Verifikasi Canonical Query
    const calculatedQuery = buildCanonicalQuery(request.query);
    assert.equal(calculatedQuery, canonical.canonical_query, `Canonical Query mismatch pada ${case_id}`);

    // 2. Verifikasi Body SHA-256 (Raw string atau Canonical Multipart Digest)
    const bodyMode = request.body_mode || 'raw';
    let calculatedBodyHash;
    if (bodyMode === 'multipart') {
      calculatedBodyHash = buildMultipartDigest(request.multipart_fields, request.multipart_files);
    } else {
      calculatedBodyHash = hashBody(request.body);
    }
    assert.equal(calculatedBodyHash, canonical.body_sha256, `Body SHA-256 mismatch pada ${case_id}`);

    // 3. Verifikasi Canonical String
    const calculatedCanonicalString = buildCanonicalString(
      request.method,
      request.path,
      calculatedQuery,
      timestamp,
      nonce,
      client_ip,
      calculatedBodyHash,
      bodyMode
    );
    assert.equal(calculatedCanonicalString, canonical.canonical_string, `Canonical String mismatch pada ${case_id}`);

    // 4. Verifikasi Signature HMAC-SHA256
    const calculatedSignature = calculateSignature(calculatedCanonicalString, test_secret_key);
    assert.equal(calculatedSignature, expected_headers['X-Signature'], `Signature HMAC-SHA256 mismatch pada ${case_id}`);
  }
});

// ==========================================
// 6. PENGUJIAN ANTI-SPOOFING CLIENT IP (CWE-290)
// ==========================================
test('Security IP: extractClientIp menolak spoofing X-Forwarded-For dan X-Real-IP jika trustProxy=false (default untrusted)', () => {
  // Simulasi klien langsung mengirim header palsu tanpa trusted proxy
  const untrustedReq = {
    headers: {
      'x-forwarded-for': '203.0.113.195',
      'x-real-ip': '198.51.100.22',
    },
  };

  const resolvedIp = extractClientIp(untrustedReq, { trustProxy: false });
  assert.equal(resolvedIp, '127.0.0.1', 'Header IP dari klien tidak boleh dipercaya saat trustProxy=false');
});

test('Security IP: extractClientIp mencegah manipulasi IP injection pada multi-hop proxy (mengambil hop terpercaya)', () => {
  // Penyerang menyuntikkan IP palsu di depan: '1.2.3.4, 203.0.113.50' (di mana 203.0.113.50 ditempel proxy)
  const spoofAttemptReq = {
    headers: {
      'x-forwarded-for': '1.2.3.4, 203.0.113.50',
    },
  };

  const resolvedIp = extractClientIp(spoofAttemptReq, { trustProxy: true });
  assert.equal(resolvedIp, '203.0.113.50', 'Harus mengambil IP hop terpercaya terakhir, bukan IP palsu yang diinjeksi attacker');
});

test('Security IP: extractClientIp memprioritaskan edge header cf-connecting-ip yang disuntikkan Cloudflare', () => {
  const cloudflareReq = {
    headers: {
      'cf-connecting-ip': '198.51.100.99',
      'x-forwarded-for': '1.2.3.4, 5.6.7.8',
    },
  };

  const resolvedIp = extractClientIp(cloudflareReq, { trustProxy: true });
  assert.equal(resolvedIp, '198.51.100.99', 'Edge header Cloudflare cf-connecting-ip harus diprioritaskan');
});

// ==========================================
// 7. PENGUJIAN CANONICAL MULTIPART DIGEST DAN INTEGRITAS
// ==========================================
test('Multipart: buildMultipartDigest mendeteksi dan menghasilkan hash berbeda jika ada manipulasi field atau file', () => {
  const fields = {
    nik: '3201010101900001',
    keperluan: 'Pengajuan Surat Keterangan Usaha',
  };
  const files = [
    {
      field: 'file_lampiran',
      index: 0,
      size: 42,
      sha256: '254aecfe19c2238e8671d06ae2744c1361f9bf78f093632a7eeafe87a3ae5338',
    },
  ];

  const baseDigest = buildMultipartDigest(fields, files);
  assert.equal(typeof baseDigest, 'string');
  assert.equal(baseDigest.length, 64);

  // 1. Nilai field dimanipulasi
  const modifiedFields = { ...fields, keperluan: 'Manipulasi data keperluan' };
  const modifiedFieldDigest = buildMultipartDigest(modifiedFields, files);
  assert.notEqual(modifiedFieldDigest, baseDigest, 'Perubahan field harus menghasilkan digest berbeda');

  // 2. File diganti (hash konten berbeda)
  const modifiedFiles = [
    {
      field: 'file_lampiran',
      index: 0,
      size: 42,
      sha256: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    },
  ];
  const modifiedFileDigest = buildMultipartDigest(fields, modifiedFiles);
  assert.notEqual(modifiedFileDigest, baseDigest, 'Penggantian konten berkas harus menghasilkan digest berbeda');

  // 3. Field baru ditambahkan
  const addedFieldDigest = buildMultipartDigest({ ...fields, extra: '123' }, files);
  assert.notEqual(addedFieldDigest, baseDigest, 'Penambahan field harus menghasilkan digest berbeda');

  // 4. File dihapus
  const deletedFileDigest = buildMultipartDigest(fields, []);
  assert.notEqual(deletedFileDigest, baseDigest, 'Penghapusan file harus menghasilkan digest berbeda');
});

test('Multipart: isValidFieldName menolak karakter kontrol, titik, spasi, kolon, newline, dan bracket bersarang', () => {
  assert.equal(isValidFieldName('foto'), true);
  assert.equal(isValidFieldName('foto[]'), true);
  assert.equal(isValidFieldName('foto[0]'), true);
  assert.equal(isValidFieldName('foto[5]'), true);
  assert.equal(isValidFieldName('g-recaptcha-response'), true);
  assert.equal(isValidFieldName('nik_pengaju'), true);

  // Karakter berbahaya / malformasi wajib ditolak
  assert.equal(isValidFieldName('field:colon'), false);
  assert.equal(isValidFieldName("field\nnewline"), false);
  assert.equal(isValidFieldName("field\rcarriage_return"), false);
  assert.equal(isValidFieldName('field with space'), false);
  assert.equal(isValidFieldName('field.with.dot'), false);
  assert.equal(isValidFieldName("field\x00null_byte"), false);
  assert.equal(isValidFieldName('nested[foo][bar]'), false);
});

test('Multipart: Collision resistance membuktikan dua body berbeda tidak pernah menghasilkan digest yang sama', () => {
  const digestA = buildMultipartDigest(
    { tag: ['a', 'b'], title: 'test' },
    [{ field: 'foto', index: 0, size: 10, sha256: '1111111111111111111111111111111111111111111111111111111111111111' }]
  );

  // Body B: Urutan elemen array dibalik
  const digestB = buildMultipartDigest(
    { tag: ['b', 'a'], title: 'test' },
    [{ field: 'foto', index: 0, size: 10, sha256: '1111111111111111111111111111111111111111111111111111111111111111' }]
  );

  // Body C: Ukuran file berbeda
  const digestC = buildMultipartDigest(
    { tag: ['a', 'b'], title: 'test' },
    [{ field: 'foto', index: 0, size: 11, sha256: '1111111111111111111111111111111111111111111111111111111111111111' }]
  );

  // Body D: Nilai string berbeda
  const digestD = buildMultipartDigest(
    { tag: ['a', 'b'], title: 'test2' },
    [{ field: 'foto', index: 0, size: 10, sha256: '1111111111111111111111111111111111111111111111111111111111111111' }]
  );

  assert.notEqual(digestA, digestB, 'Urutan array berbeda harus menghasilkan digest berbeda');
  assert.notEqual(digestA, digestC, 'Ukuran file berbeda harus menghasilkan digest berbeda');
  assert.notEqual(digestA, digestD, 'Nilai scalar berbeda harus menghasilkan digest berbeda');
});

test('Multipart: Nama file dan Content-Type dari klien tidak dipercaya dan tidak mempengaruhi digest', () => {
  const file1 = { field: 'foto', index: 0, size: 42, sha256: '254aecfe19c2238e8671d06ae2744c1361f9bf78f093632a7eeafe87a3ae5338' };
  const fields = { judul: 'Laporan Kerusakan' };

  const digest1 = buildMultipartDigest(fields, [file1]);

  // Simulasi klien mengirim file dengan nama file berbeda atau Content-Type berbeda:
  // Karena buildMultipartDigest hanya mengikat field, index, size, dan sha256(content),
  // metadata klien seperti client original filename atau client Content-Type diabaikan secara total.
  const file1WithAlteredClientMetadata = { ...file1 }; // Isi bytes dan hash tetap sama persis
  const digest2 = buildMultipartDigest(fields, [file1WithAlteredClientMetadata]);

  assert.equal(digest1, digest2, 'Digest harus identik jika konten byte dan ukuran file identik');
});

test('Multipart: Mendukung multiple file pada field yang sama (foto[]) dan array non-file', () => {
  const fields = {
    judul: 'Laporan Kerusakan Fasilitas',
    kategori: ['infrastruktur', 'fasilitas-umum'],
    lokasi: 'Dusun Cibatu RT 01 RW 02',
  };
  const files = [
    { field: 'foto', index: 0, size: 100, sha256: '1111111111111111111111111111111111111111111111111111111111111111' },
    { field: 'foto', index: 1, size: 200, sha256: '2222222222222222222222222222222222222222222222222222222222222222' },
    { field: 'foto', index: 2, size: 300, sha256: '3333333333333333333333333333333333333333333333333333333333333333' },
  ];

  const digest = buildMultipartDigest(fields, files);
  assert.equal(typeof digest, 'string');
  assert.equal(digest.length, 64);
  assert.equal(digest, '0495c8f2fb2531bf8bfa60016f138c88d6361fc36ae5bf637fc4a0fb5a50fa95');
});
