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
  if (config.method !== 'get' && v3SiteKey && typeof window !== 'undefined' && window.grecaptcha) {
    try {
      const token = await new Promise((resolve) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(v3SiteKey, { action: 'api_request' }).then(resolve);
        });
      });
      if (token) {
        config.headers['X-Recaptcha-V3-Token'] = token;
      }
    } catch (e) {
      console.warn('reCAPTCHA v3 generation failed', e);
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor untuk menangani error secara global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
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

  // Bersihkan path dari awalan 'storage/' jika ada
  const cleanPath = path.startsWith('storage/') ? path.replace('storage/', '') : path;

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

export default api;