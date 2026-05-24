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

export default api;