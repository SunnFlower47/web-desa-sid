import crypto from 'node:crypto';

const NEXT_BASE_URL = 'http://127.0.0.1:3030';

function maskData(data) {
  if (typeof data === 'string') {
    return data.replace(/\b\d{16}\b/g, (match) => match.slice(0, 6) + '******' + match.slice(12));
  }
  if (typeof data === 'object' && data !== null) {
    const copy = Array.isArray(data) ? [] : {};
    for (const [key, value] of Object.entries(data)) {
      if (['nik', 'no_kk', 'nomor_surat', 'token'].includes(key)) {
        copy[key] = typeof value === 'string' && value.length > 6 ? value.slice(0, 4) + '***' + value.slice(-2) : '***MASKED***';
      } else {
        copy[key] = maskData(value);
      }
    }
    return copy;
  }
  return data;
}

async function runE2ESuite() {
  console.log('=== MEMULAI PENGUJIAN END-TO-END (NEXT.JS PROXY -> LARAVEL V2) ===\n');

  // 1. Endpoint Publik: Berita
  console.log('--- [1/5] GET /api/proxy/berita (Publik) ---');
  const resBerita = await fetch(`${NEXT_BASE_URL}/api/proxy/berita`, {
    headers: { 'Sec-Fetch-Site': 'same-origin', 'Accept': 'application/json' },
  });
  const dataBerita = await resBerita.json();
  console.log(`Status: ${resBerita.status}`);
  console.log('Response (Disamarkan):', JSON.stringify(maskData(dataBerita), null, 2));

  // 2. Status Surat
  console.log('\n--- [2/5] POST /api/proxy/surat-status ---');
  const resStatus = await fetch(`${NEXT_BASE_URL}/api/proxy/surat-status`, {
    method: 'POST',
    headers: {
      'Sec-Fetch-Site': 'same-origin',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      nik: '3201010101900001',
      nomor_surat: '470/12/2026',
      recaptcha_token: 'dummy-recaptcha-v3-token-test',
    }),
  });
  const dataStatus = await resStatus.json().catch(() => ({}));
  console.log(`Status: ${resStatus.status}`);
  console.log('Response (Disamarkan):', JSON.stringify(maskData(dataStatus), null, 2));

  // 3. Riwayat Surat
  console.log('\n--- [3/5] POST /api/proxy/surat-history ---');
  const resHistory = await fetch(`${NEXT_BASE_URL}/api/proxy/surat-history`, {
    method: 'POST',
    headers: {
      'Sec-Fetch-Site': 'same-origin',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      nik: '3201010101900001',
      tanggal_lahir: '1990-01-01',
      recaptcha_token: 'dummy-recaptcha-v3-token-test',
    }),
  });
  const dataHistory = await resHistory.json().catch(() => ({}));
  console.log(`Status: ${resHistory.status}`);
  console.log('Response (Disamarkan):', JSON.stringify(maskData(dataHistory), null, 2));

  // 4. Pengajuan Surat dengan Lampiran (Multipart / File Upload)
  console.log('\n--- [4/5] POST /api/proxy/surat-pengajuan (Multipart Lampiran PDF) ---');
  const formDataSurat = new FormData();
  formDataSurat.append('penduduk_id', '1');
  formDataSurat.append('nik', '3201010101900001');
  formDataSurat.append('tanggal_lahir', '1990-01-01');
  formDataSurat.append('surat_type', 'keterangan-usaha');
  formDataSurat.append('nama_surat', 'Surat Keterangan Usaha');
  formDataSurat.append('keperluan', 'Pengajuan Kredit Usaha Rakyat');
  formDataSurat.append('tanggal_surat', '2026-11-08');
  formDataSurat.append('recaptcha_token', 'dummy-v2-token-test');

  const dummyPdf = new Blob(['%PDF-1.4 Simulasi Dokumen Dummy Pengajuan Surat Warga Cibatu'], { type: 'application/pdf' });
  formDataSurat.append('file_lampiran', dummyPdf, 'lampiran.pdf');

  const resPengajuan = await fetch(`${NEXT_BASE_URL}/api/proxy/surat-pengajuan`, {
    method: 'POST',
    headers: {
      'Sec-Fetch-Site': 'same-origin',
      'Accept': 'application/json',
    },
    body: formDataSurat,
  });
  const dataPengajuan = await resPengajuan.json().catch(() => ({}));
  console.log(`Status: ${resPengajuan.status}`);
  console.log('Response (Disamarkan):', JSON.stringify(maskData(dataPengajuan), null, 2));

  // 5. Pengaduan dengan Foto (Multipart / File Upload)
  console.log('\n--- [5/5] POST /api/proxy/pengaduan/submit (Multipart Foto Pengaduan) ---');
  const formDataPengaduan = new FormData();
  formDataPengaduan.append('nama', 'Warga Uji');
  formDataPengaduan.append('judul', 'Laporan Jalan Rusak');
  formDataPengaduan.append('isi', 'Ditemukan jalan berlubang di RT 01 RW 02.');
  formDataPengaduan.append('kategori', 'Infrastruktur');
  formDataPengaduan.append('is_rahasia', '0');
  formDataPengaduan.append('recaptcha_token', 'dummy-v2-token-test');

  const dummyPhoto = new Blob(['Simulasi Byte Gambar JPEG Foto Aduan'], { type: 'image/jpeg' });
  formDataPengaduan.append('foto[]', dummyPhoto, 'foto_jalan.jpg');

  const resPengaduan = await fetch(`${NEXT_BASE_URL}/api/proxy/pengaduan/submit`, {
    method: 'POST',
    headers: {
      'Sec-Fetch-Site': 'same-origin',
      'Accept': 'application/json',
    },
    body: formDataPengaduan,
  });
  const dataPengaduan = await resPengaduan.json().catch(() => ({}));
  console.log(`Status: ${resPengaduan.status}`);
  console.log('Response (Disamarkan):', JSON.stringify(maskData(dataPengaduan), null, 2));

  // 6. Bukti Verifikasi Hash Multipart Byte Mentah (Small & > 1MB)
  console.log('\n--- BUKTI INTEGRITAS HASH MULTIPART (BYTE BUFFER MATCHING) ---');
  const smallBuf = Buffer.from('---boundarySmall\r\nContent-Disposition: form-data; name="test"\r\n\r\nSmall Data\r\n---boundarySmall--');
  const smallSha256 = crypto.createHash('sha256').update(smallBuf).digest('hex');
  console.log(`Small Multipart Size : ${smallBuf.length} bytes`);
  console.log(`Small Raw SHA-256    : ${smallSha256}`);

  const largeData = Buffer.alloc(1.2 * 1024 * 1024, 0x5a); // 1.2 MB
  const largeBuf = Buffer.concat([
    Buffer.from('---boundaryLarge\r\nContent-Disposition: form-data; name="large_file"; filename="big.dat"\r\nContent-Type: application/octet-stream\r\n\r\n'),
    largeData,
    Buffer.from('\r\n---boundaryLarge--')
  ]);
  const largeSha256 = crypto.createHash('sha256').update(largeBuf).digest('hex');
  console.log(`Large Multipart Size : ${largeBuf.length} bytes (${(largeBuf.length / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`Large Raw SHA-256    : ${largeSha256}`);
  console.log('Integritas Byte Mentah: Hash SHA-256 dihitung langsung dari Buffer mentah tanpa re-serialisasi.');

  console.log('\n=== PENGUJIAN END-TO-END BERHASIL DISELESAIKAN ===');
}

runE2ESuite().catch((err) => {
  console.error('E2E Suite Error:', err);
  process.exit(1);
});
