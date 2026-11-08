/**
 * Security & Data Privacy Utilities
 * Sistem Informasi Desa Cibatu - Frontend Web Warga
 */

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
 * Mendapatkan PROXY_KEY dengan validasi fail-closed
 * @returns {{ key: string|null, error: string|null }}
 */
export function getValidatedProxyKey() {
  // Fail-closed jika developer mencoba menggunakan prefiks NEXT_PUBLIC_
  if (process.env.NEXT_PUBLIC_PROXY_KEY) {
    const errMsg = 'Pelanggaran Keamanan: Ditemukan NEXT_PUBLIC_PROXY_KEY. Kunci proxy dilarang diekspos ke klien.';
    console.error(`[Security Fail-Closed] ${errMsg}`);
    return { key: null, error: errMsg };
  }

  const key = process.env.PROXY_KEY || process.env.NEXT_PROXY_KEY;
  const validation = validateSecretKey(key, 'PROXY_KEY');

  if (!validation.valid) {
    console.error(`[Security Fail-Closed] ${validation.error}`);
    return { key: null, error: validation.error };
  }

  return { key: key.trim(), error: null };
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
 * Redaksi NIK (16 digit angka) dari string pesan error atau teks log
 * @param {string|null|undefined} text
 * @returns {string}
 */
export function redactNik(text) {
  if (!text || typeof text !== 'string') return '';
  // Redaksi 16 digit NIK dengan menyisakan 4 digit pertama dan 4 digit terakhir: 3202********1234
  return text.replace(/\b(\d{4})\d{8}(\d{4})\b/g, '$1********$2');
}
