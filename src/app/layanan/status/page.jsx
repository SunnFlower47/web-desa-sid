'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldCheck, FileText, ArrowRight, 
  Loader2, AlertCircle, Clock, CheckCircle2, 
  XCircle, Send, Home, ArrowLeft, Calendar,
  Layers, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function CekStatusSurat() {
  const [searchMode, setSearchMode] = useState("nomor"); // "nomor" or "nik"
  const [nik, setNik] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [nomorSurat, setNomorSurat] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setResults([]);

    try {
      let res;
      if (searchMode === 'nik') {
        // Cek Semua Surat pakai NIK + Tanggal Lahir (Security)
        res = await api.post('/surat-history', {
          nik: nik,
          tanggal_lahir: tanggalLahir
        });
      } else {
        // Cek Spesifik pakai Nomor Surat + NIK
        res = await api.get('/surat-status', {
          params: { nik, nomor_surat: nomorSurat }
        });
      }

      if (res.data.success && res.data.data.length > 0) {
        setResults(res.data.data);
      } else {
        setError("Data tidak ditemukan. Pastikan data yang dimasukkan sudah benar.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil data. Silakan coba lagi.");
    } finally {
      setSearching(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'selesai':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: <CheckCircle2 size={16} />, label: 'Selesai' };
      case 'ditolak':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: <XCircle size={16} />, label: 'Ditolak' };
      case 'diproses':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: <Send size={16} />, label: 'Diproses' };
      default:
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: <Clock size={16} />, label: 'Verifikasi' };
    }
  };

  const getTanggapan = (surat) => {
    if (surat.status?.toLowerCase() === 'selesai') {
      return surat.keterangan_admin || "Surat Anda telah selesai diproses. Silakan datang ke kantor desa untuk mengambil dokumen fisik.";
    }
    if (surat.status?.toLowerCase() === 'ditolak') {
      return surat.keterangan_admin || "Pengajuan ditolak. Silakan cek kembali persyaratan Anda.";
    }
    if (surat.status?.toLowerCase() === 'diproses') {
      return "Surat Anda sedang diproses oleh petugas. Mohon tunggu informasi selanjutnya.";
    }
    return "Surat Anda sedang dalam antrian verifikasi. Mohon cek berkala untuk update selanjutnya.";
  };

  return (
    <main className="min-h-screen bg-white pb-20 pt-32 md:pt-40">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-emerald-700 mb-8 font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Kembali
        </Link>

        <div className="max-w-3xl mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <ShieldCheck size={12} />
            <span>Tracking System Digital</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none"
          >
            Lacak <span className="text-emerald-700">Surat Anda</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl"
          >
            Pantau progres verifikasi pengajuan surat Anda secara real-time. Masukkan NIK atau Nomor Pengajuan untuk memulai.
          </motion.p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8 p-1.5 bg-slate-100 rounded-2xl w-full max-w-md mx-auto">
          <button 
            onClick={() => { setSearchMode('nomor'); setResults([]); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'nomor' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
          >
            <Search size={14} /> Nomor Surat
          </button>
          <button 
            onClick={() => { setSearchMode('nik'); setResults([]); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'nik' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
          >
            <Layers size={14} /> Cek Semua (NIK)
          </button>
        </div>

        {/* Search Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 mb-12"
        >
          <form onSubmit={handleCheckStatus} className="space-y-6">
            <div className="">
              {searchMode === 'nik' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">NIK Pemohon</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        required type="text" value={nik} onChange={(e) => setNik(e.target.value)}
                        placeholder="16 Digit NIK"
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold tracking-wider text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tanggal Lahir</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        required type="date" value={tanggalLahir} onChange={(e) => setTanggalLahir(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nomor Pengajuan Surat (Tracking ID)</label>
                  <div className="relative">
                    <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      required type="text" value={nomorSurat} onChange={(e) => setNomorSurat(e.target.value)}
                      placeholder="Contoh: CBT-2026-XXXXX"
                      className="w-full pl-14 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all text-xl md:text-2xl font-black tracking-widest text-slate-900 uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            <button 
              disabled={searching} type="submit"
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {searching ? <Loader2 className="animate-spin" /> : <>Mulai Melacak <ArrowRight size={18} /></>}
            </button>
          </form>
        </motion.div>

        {/* Results List */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  Ditemukan {results.length} Surat
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scroll untuk melihat</span>
              </div>

              {results.map((surat, idx) => {
                const style = getStatusStyle(surat.status);
                return (
                  <motion.div 
                    key={surat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setExpandedId(expandedId === surat.id ? null : surat.id)}
                    className={`bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      expandedId === surat.id 
                      ? 'border-emerald-200 shadow-2xl shadow-emerald-100 ring-1 ring-emerald-50' 
                      : 'border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100'
                    } group`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{surat.nomor_surat}</p>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{surat.jenis_surat_nama}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${style.bg} ${style.text} border ${style.border}`}>
                            {style.icon} {style.label}
                          </div>
                          <div className="hidden md:block w-px h-8 bg-slate-100" />
                          <div className="text-right hidden md:block">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Update Terakhir</p>
                            <p className="text-xs font-bold text-slate-500">{new Date(surat.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <ChevronRight className={`text-slate-200 transition-all ${expandedId === surat.id ? 'rotate-90 text-emerald-500' : 'group-hover:text-emerald-500 group-hover:translate-x-1'}`} />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === surat.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-50 bg-slate-50/50"
                        >
                          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <div>
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Keperluan Pengajuan</h4>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-white p-4 rounded-2xl border border-slate-100">
                                  {surat.keperluan}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-widest">
                                <Clock size={14} /> Pengajuan: {new Date(surat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/20">
                                <h4 className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-3">Tanggapan Petugas</h4>
                                <p className="text-sm font-bold leading-relaxed">
                                  {getTanggapan(surat)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {!results.length && !searching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 opacity-30">
            <ShieldCheck size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Tracking System Desa Cibatu</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
