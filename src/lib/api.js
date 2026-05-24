import axios from 'axios';

const api = axios.create({
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
  
  // Jika path sudah berupa URL lengkap (misal dari API eksternal/Unsplash)
  if (path.startsWith('http')) {
    // Jika mengandung domain backend kita, kita arahkan ke proxy rahasia
    if (path.includes('api-vilage.sunnflower.site') || path.includes('localhost:8000')) {
      const segments = path.split('/storage/');
      if (segments.length > 1) {
        return `/api/storage/${segments[1]}`;
      }
    }
    return path;
  }
  
  // Bersihkan path dari awalan 'storage/' jika ada
  const cleanPath = path.startsWith('storage/') ? path.replace('storage/', '') : path;
  
  // Arahkan SEMUA gambar lewat Proxy Next.js
  return `/api/storage/${cleanPath}`;
};

export default api;
