'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Loader2, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

export default function BeritaDetail({ params }) {
  // Next 15 requires unwrapping params Promise
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;
  
  const [berita, setBerita] = useState(null);
  const [related, setRelated] = useState([]);
  const [eksternal, setEksternal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch internal berita
        const detailRes = await api.get(`/berita/${slug}`);
        if (detailRes.data.success) {
          setBerita(detailRes.data.data.berita);
          setRelated(detailRes.data.data.related || []);
        } else {
          setError('Berita tidak ditemukan.');
        }

        // Fetch external berita (Scraping from Antara/Tempo)
        try {
          const ekstRes = await api.get('/berita-eksternal?limit=4');
          if (ekstRes.data.success) {
            setEksternal(ekstRes.data.data || []);
          }
        } catch (e) {
          console.error('External news error:', e);
        }

      } catch (err) {
        console.error('Fetch Error:', err);
        setError('Gagal memuat berita.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-48 pb-20 flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
        <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Memuat Berita...</p>
      </div>
    );
  }

  if (error || !berita) {
    return (
      <div className="min-h-screen pt-48 pb-20 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-3xl font-black text-slate-800 mb-4">Berita Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-8">{error || 'Mungkin berita ini sudah dihapus atau link tidak valid.'}</p>
        <Link href="/info/berita" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-colors">
          Kembali ke Daftar Berita
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-20 bg-slate-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link href="/info/berita" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft size={16} /> Kembali
        </Link>

        {/* Header Berita */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
              {berita.kategori || 'Berita'}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={12} /> {new Date(berita.published_at || berita.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            {berita.judul}
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-5 py-3 rounded-2xl border border-slate-100 inline-flex shadow-sm">
            <User size={16} className="text-emerald-600" /> 
            <span>Ditulis oleh: <span className="font-bold text-slate-900">{berita.author?.name || 'Admin Desa Cibatu'}</span></span>
          </div>
        </div>

        {/* Gambar Utama */}
        <div className="w-full h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden bg-slate-200 mb-12 shadow-2xl relative border-4 border-white">
          <img 
            src={berita.gambar ? getImageUrl(berita.gambar) : 'https://images.unsplash.com/photo-1577017040065-650ee4d43339?auto=format&fit=crop&q=80'} 
            alt={berita.judul}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
        </div>

        {/* Konten Berita */}
        <div className="prose prose-lg md:prose-xl prose-slate max-w-none mb-24 bg-white p-8 md:p-16 rounded-[2.5rem] shadow-sm border border-slate-100 leading-relaxed" 
             dangerouslySetInnerHTML={{ __html: berita.konten }}>
        </div>

        {/* Berita Nasional (Scraped) */}
        {eksternal.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Globe className="text-emerald-600" size={28} /> Lintas Nusantara
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Berita Nasional Terkini dari Portal Resmi</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eksternal.map((ext, idx) => (
                <a href={ext.link} target="_blank" rel="noreferrer" key={idx} className="block group">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[8px] font-black uppercase tracking-widest rounded-md border border-blue-100">Nasional</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{ext.source}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-base leading-snug mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {ext.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-6 flex-1 leading-relaxed">
                      {ext.description}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest group-hover:gap-4 transition-all">
                      Baca di {ext.source} <ArrowRight size={14} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
