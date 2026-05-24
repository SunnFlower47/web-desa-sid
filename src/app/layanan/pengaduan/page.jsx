'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, ShieldCheck, MapPin, AlertCircle, 
  Send, Loader2, CheckCircle2, ArrowLeft, 
  Camera, Info, Clock, ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function PengaduanPage() {
  const [formData, setFormData] = useState({
    nama_pelapor: '',
    nik_pelapor: '',
    telepon: '',
    email: '',
    alamat: '',
    kategori: 'infrastruktur',
    judul: '',
    deskripsi: '',
    lokasi: '',
    prioritas: 'sedang'
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/pengaduan/submit', formData);
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim laporan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'infrastruktur', label: 'Infrastruktur', icon: '🚧' },
    { id: 'keamanan', label: 'Keamanan', icon: '🛡️' },
    { id: 'kebersihan', label: 'Kebersihan', icon: '🧹' },
    { id: 'administrasi', label: 'Administrasi', icon: '📁' },
    { id: 'lainnya', label: 'Lainnya', icon: '💬' },
  ];

  return (
    <main className="min-h-screen bg-white pb-20 pt-32 md:pt-40">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-emerald-700 mb-8 font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Kembali
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <div className="mb-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4"
              >
                <Megaphone size={12} /> Portal Pengaduan Warga
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
                Laporkan Masalah <br/> <span className="text-emerald-700">Di Sekitar Anda</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-xl">
                Bantu kami membangun Desa Cibatu yang lebih baik dengan melaporkan masalah infrastruktur, sosial, atau pelayanan.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit} className="space-y-8"
                >
                  <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 space-y-8">
                    {/* Identity Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nama Lengkap</label>
                        <input 
                          required type="text" 
                          value={formData.nama_pelapor}
                          onChange={(e) => setFormData({...formData, nama_pelapor: e.target.value})}
                          placeholder="Sesuai KTP"
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">NIK (Opsional)</label>
                        <input 
                          type="text" 
                          value={formData.nik_pelapor}
                          onChange={(e) => setFormData({...formData, nik_pelapor: e.target.value})}
                          placeholder="16 Digit NIK"
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Alamat Domisili Pelapor</label>
                      <textarea 
                        required rows={2}
                        value={formData.alamat}
                        onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                        placeholder="Alamat lengkap tempat tinggal Anda saat ini"
                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900 resize-none"
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kategori Laporan</label>
                      <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => (
                          <button
                            key={cat.id} type="button"
                            onClick={() => setFormData({...formData, kategori: cat.id})}
                            className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                              formData.kategori === cat.id 
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-lg shadow-emerald-200' 
                              : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            <span>{cat.icon}</span> {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Report Content */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Judul Laporan</label>
                        <input 
                          required type="text" 
                          value={formData.judul}
                          onChange={(e) => setFormData({...formData, judul: e.target.value})}
                          placeholder="Contoh: Jalan Rusak di Dusun III"
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Deskripsi Lengkap</label>
                        <textarea 
                          required rows={5}
                          value={formData.deskripsi}
                          onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                          placeholder="Ceritakan detail masalah yang terjadi..."
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900 resize-none"
                        />
                      </div>
                    </div>

                    {/* Location & Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Lokasi Kejadian</label>
                        <div className="relative">
                          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            required type="text" 
                            value={formData.lokasi}
                            onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                            placeholder="Alamat atau Titik Kenal"
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tingkat Prioritas</label>
                        <select 
                          value={formData.prioritas}
                          onChange={(e) => setFormData({...formData, prioritas: e.target.value})}
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900 appearance-none"
                        >
                          <option value="rendah">Biasa (Rendah)</option>
                          <option value="sedang">Penting (Sedang)</option>
                          <option value="tinggi">Sangat Penting (Tinggi)</option>
                          <option value="darurat">Darurat / Mendesak</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                      <AlertCircle size={18} /> {error}
                    </div>
                  )}

                  <button 
                    disabled={submitting} type="submit"
                    className="w-full py-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <>Kirim Laporan Pengaduan <Send size={18} /></>}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-12 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4">Laporan Berhasil Terkirim!</h2>
                  <p className="text-slate-600 font-medium mb-10 max-w-sm mx-auto">
                    Terima kasih telah peduli. Laporan Anda telah masuk ke sistem dan akan segera diproses oleh petugas desa.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="px-10 py-4 bg-white border border-emerald-200 text-emerald-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    Buat Laporan Baru
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Recent Reports */}
          <div className="space-y-10">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
              <h3 className="text-xl font-black mb-6 tracking-tight flex items-center gap-2">
                <Info size={20} className="text-emerald-400" /> Alur Pengaduan
              </h3>
              <div className="space-y-6 relative z-10">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                  <p className="text-xs text-slate-300 font-bold leading-relaxed">Isi formulir pengaduan dengan data yang valid dan jujur.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                  <p className="text-xs text-slate-300 font-bold leading-relaxed">Petugas desa akan memverifikasi laporan Anda dalam 1x24 jam.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                  <p className="text-xs text-slate-300 font-bold leading-relaxed">Status laporan akan diperbarui secara transparan oleh admin desa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
