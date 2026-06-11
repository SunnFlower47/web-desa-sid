'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar, User, ArrowRight, Search, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StateMessage from '@/components/ui/StateMessage';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function BeritaPage() {
  const [news, setNews] = useState([]);
  const [eksternalNews, setEksternalNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      // Jalankan berurutan agar tidak membuat worker Laravel (Laragon/Herd) deadlock
      const internalRes = await api.get('/berita').catch(() => null);
      const ekstRes = await api.get('/berita-eksternal?limit=4').catch(() => null);
      
      if (internalRes?.data) {
        setNews(internalRes.data.data || internalRes.data || []);
      }
      
      if (ekstRes?.data?.success) {
        setEksternalNews(ekstRes.data.data || []);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Gagal mengambil data berita. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(item => {
    const matchSearch = item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.konten?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.isi?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeCategory === 'Semua') return matchSearch;
    if (activeCategory === 'Berita Internal') return matchSearch && item.kategori === 'berita';
    if (activeCategory === 'Pengumuman') return matchSearch && item.kategori === 'pengumuman';
    return matchSearch && item.kategori?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <main className="min-h-screen bg-white pb-20">
      <PageHeader 
        title={
          <>Kabar Terbaru dari <br />
          <span className="text-emerald-700">Desa Cibatu</span></>
        }
        description="Informasi resmi mengenai kegiatan, pembangunan, pengumuman penting, hingga kabar terkini seputar warga Desa Cibatu."
        breadcrumbs={[
          { label: 'Informasi' },
          { label: 'Warta & Kabar Desa', href: '/info/berita' }
        ]}
      />

      <div className="container mx-auto px-6 max-w-6xl mt-8">

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 glass rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-xs"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['Semua', 'Berita Internal', 'Pengumuman', 'Nasional'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-emerald-900/10' : 'glass text-slate-500 hover:bg-white hover:text-primary text-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
            <LoadingSkeleton type="card" count={4} />
          </div>
        ) : error ? (
          <StateMessage 
            type="error" 
            title="Gagal Memuat Berita" 
            message={error} 
            actionLabel="Coba Lagi" 
            onAction={fetchNews} 
          />
        ) : (
          <>
          {/* News Grid (Internal & Pengumuman) */}
          {activeCategory !== 'Nasional' && filteredNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNews.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                <Link href={`/info/berita/${item.slug || item.id}`}>
                  <div className="bento-card overflow-hidden h-full flex flex-col p-0 rounded-2xl">
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img 
                        src={item.gambar ? getImageUrl(item.gambar) : 'https://images.unsplash.com/photo-1577017040065-650ee4d43339?auto=format&fit=crop&q=80&w=800'} 
                        alt={item.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg">
                          {item.kategori || 'Berita'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-primary" />
                          {new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-primary" />
                          {item.author?.name || item.penulis || 'Admin'}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-black tracking-tight mb-3 group-hover:text-primary transition-colors leading-tight">
                        {item.judul}
                      </h3>
                      
                      <p className="text-slate-500 font-medium leading-relaxed mb-6 flex-1 line-clamp-2 text-xs">
                        {item.excerpt || item.konten?.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                      </p>
                      
                      <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                        Baca Selengkapnya <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          )}

          {activeCategory !== 'Nasional' && filteredNews.length === 0 && (
            <div className="py-10">
              <StateMessage 
                type="empty" 
                title="Tidak Ada Berita" 
                message="Tidak ada berita yang ditemukan di kategori atau pencarian ini." 
              />
            </div>
          )}
          </>
        )}

        {/* Berita Eksternal */}
        {!loading && eksternalNews.length > 0 && (activeCategory === 'Semua' || activeCategory === 'Nasional') && (
          <div className={`${activeCategory === 'Semua' ? 'mt-24 pt-12 border-t border-slate-200/50' : 'mt-0 pt-4'}`}>
            <div className="flex flex-col mb-10">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                Lintas Nusantara
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Berita Nasional Terkini dari Portal Resmi (Antara & Tempo)</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {eksternalNews.map((ext, idx) => (
                <a href={ext.link} target="_blank" rel="noreferrer" key={idx} className="block group">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col h-full hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1 transition-all">
                    <div className="w-full h-32 rounded-2xl overflow-hidden mb-5 bg-slate-100 relative">
                      <img src={ext.image} alt={ext.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                          {ext.source}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2 px-1">
                      {ext.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-5 flex-1 px-1">
                      {ext.description}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest group-hover:gap-4 transition-all px-1">
                      Baca di {ext.source} <ArrowRight size={14} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
