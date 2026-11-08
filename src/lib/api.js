import axios from 'axios';

// Bersihkan URL dari spasi atau garing di ujung jika tidak sengaja terinput di Vercel
const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/$/, "")
  : "";

const api = axios.create({
  // Selalu gunakan internal proxy Next.js agar origin aman dan tidak perlu mengekspos URL backend
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor untuk menangani reCAPTCHA v3 secara otomatis pada request mutating (POST, PUT, DELETE)
api.interceptors.request.use(async (config) => {
  const v3SiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  if (config.method !== 'get' && v3SiteKey && typeof window !== 'undefined') {
    try {
      // Tunggu hingga window.grecaptcha siap (maksimal 2.5 detik)
      for (let i = 0; i < 25; i++) {
        if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
          break;
        }
        await new Promise((r) => setTimeout(r, 100));
      }

      if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
        const token = await new Promise((resolve) => {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(v3SiteKey, { action: 'api_request' })
              .then(resolve)
              .catch((err) => {
                console.warn('[reCAPTCHA v3] Execute error:', err);
                resolve(null);
              });
          });
        });

        if (token) {
          config.headers['X-Recaptcha-V3-Token'] = token;
          config.headers['x-recaptcha-v3-token'] = token;
          // Sertakan juga di body jika data berupa object
          if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            config.data.recaptcha_token = token;
          }
        }
      } else {
        console.warn('[reCAPTCHA v3] grecaptcha script not ready on window.');
      }
    } catch (e) {
      console.warn('reCAPTCHA v3 generation failed', e);
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor untuk menangani error secara global dengan redaksi data sensitif (PII)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const rawMsg = error.response?.data?.message || error.message || 'API Request Failed';
    // Redaksi jika pesan error memuat 16 digit NIK
    const sanitizedMsg = typeof rawMsg === 'string'
      ? rawMsg.replace(/\b(\d{4})\d{8}(\d{4})\b/g, '$1********$2')
      : 'API Request Failed';
    console.error(`[API Error ${status || 'Network'}]:`, sanitizedMsg);
    return Promise.reject(error);
  }
);

export const getImageUrl = (path) => {
  if (!path) return '';

  // Jika path sudah berupa URL lengkap
  if (path.startsWith('http')) {
    if (path.includes('api-vilage.sunnflower.site') || path.includes('localhost:8000') || path.includes('sistem-desa-cibatu.test')) {
      const segments = path.split('/storage/');
      if (segments.length > 1) {
        return `/api/storage/${segments[1]}`;
      }
    }
    return path;
  }

  // Bersihkan path dari awalan 'storage/' atau '/storage/' jika ada
  let cleanPath = path;
  if (path.startsWith('/storage/')) {
    cleanPath = path.replace('/storage/', '');
  } else if (path.startsWith('storage/')) {
    cleanPath = path.replace('storage/', '');
  }

  // Gunakan Next.js storage proxy
  return `/api/storage/${cleanPath}`;
};

export const getUmkm = async (params = {}) => {
  const response = await api.get('/umkm', { params });
  return response.data;
};

export const getFasilitasDesa = async (params = {}) => {
  const response = await api.get('/fasilitas-desa', { params });
  return response.data;
};

export const getVillageGeoJson = async () => {
  const response = await api.get('/geojson');
  return response.data;
};

export const getPublicDesaInfo = async () => {
  const response = await api.get('/public-statistics/info-desa');
  return response.data;
};

/**
 * Cek status pengajuan surat spesifik berdasarkan NIK dan Nomor Resi/Surat
 * CATATAN ARSITEKTUR LINTAS REPO:
 * Saat ini backend Laravel melayani endpoint ini via GET /api/v1/surat-status dengan query params.
 * Karena query string berisiko tercatat di access log web server, backend Laravel sedang
 * direncanakan untuk mendukung POST /api/v1/surat-status.
 * Ketika backend Laravel telah siap menerima POST, pengembang CUKUP mengubah pemanggilan
 * di dalam fungsi ini (satu tempat terpusat) dari api.get menjadi api.post.
 *
 * @param {Object} params
 * @param {string} params.nik NIK pemohon
 * @param {string} params.nomorSurat Nomor resi atau nomor surat
 * @returns {Promise<any>}
 */
export const checkSuratStatus = async ({ nik, nomorSurat }) => {
  return await api.get('/surat-status', {
    params: {
      nik,
      nomor_surat: nomorSurat,
    },
  });
};

/**
 * Cek riwayat pengajuan surat berdasarkan NIK dan Tanggal Lahir (POST)
 * @param {Object} params
 * @param {string} params.nik NIK pemohon
 * @param {string} params.tanggalLahir Tanggal lahir pemohon (YYYY-MM-DD)
 * @returns {Promise<any>}
 */
export const checkSuratHistory = async ({ nik, tanggalLahir }) => {
  return await api.post('/surat-history', {
    nik,
    tanggal_lahir: tanggalLahir,
  });
};

export default api;
