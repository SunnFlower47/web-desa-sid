import axios from 'axios';

// Bersihkan URL dari spasi atau garing di ujung jika tidak sengaja terinput di Vercel
const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/$/, "")
  : "";

const api = axios.create({
  // Jika di Vercel, tembak langsung domain Laravel (misal: https://api-vilage.sunnflower.site/api)
  // Jika NEXT_PUBLIC_API_URL kosong, dia akan fallback ke '/api/proxy' (opsi aman)
  baseURL: BASE_URL || '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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

  // Ambil base domain backend dari env (misal: https://api-vilage.sunnflower.site)
  // Kita hilangkan '/api' di ujungnya untuk mendapatkan domain utamanya saja
  const backendDomain = BASE_URL.replace('/api', '');

  // Jika path sudah berupa URL lengkap
  if (path.startsWith('http')) {
    // Jika itu gambar dari backend kita, pastikan mengarah ke domain production yang benar
    if (path.includes('api-vilage.sunnflower.site') || path.includes('localhost:8000')) {
      const segments = path.split('/storage/');
      if (segments.length > 1) {
        return `${backendDomain}/storage/${segments[1]}`;
      }
    }
    return path;
  }

  // Bersihkan path dari awalan 'storage/' jika ada
  const cleanPath = path.startsWith('storage/') ? path.replace('storage/', '') : path;

  // Tembak langsung ke folder storage Laravel production
  return `${backendDomain}/storage/${cleanPath}`;
};

export default api;