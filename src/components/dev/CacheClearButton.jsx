'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function CacheClearButton() {
  const [isDev, setIsDev] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Tombol ini HANYA akan muncul di local environment (development)
    if (process.env.NODE_ENV === 'development') {
      setIsDev(true);
    }
  }, []);

  if (!isDev) return null;

  const handleClearCache = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clear-cache', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Tampilkan notifikasi kecil di console atau alert
        alert('Data Cache berhasil dibersihkan! Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('Gagal membersihkan cache: ' + data.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan sistem saat clear cache.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClearCache}
      disabled={loading}
      className={`fixed bottom-6 left-6 z-[9999] bg-rose-600 hover:bg-rose-700 text-white p-3 md:p-4 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center transition-all group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      title="[DEV MODE] Hapus Cache Next.js"
    >
      <RefreshCw className={`w-5 h-5 md:w-6 md:h-6 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out pl-0 group-hover:pl-2 font-bold text-sm hidden md:block">
        Clear Cache
      </span>
    </button>
  );
}
