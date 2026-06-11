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
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StateMessage from '@/components/ui/StateMessage';
import ReCAPTCHA from 'react-google-recaptcha';

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
  
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = React.useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setError("Mohon selesaikan verifikasi reCAPTCHA terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/pengaduan/submit', formData, {
        headers: { 'X-Recaptcha-Token': recaptchaToken }
      });
      if (res.data.success) {
        setSuccess(true);
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim laporan. Silakan coba lagi.");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken(null);
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
    <main className="min-h-screen bg-white pb-20">
      <PageHeader 
        title={<>Laporkan Masalah <br/> <span className="text-emerald-700">Di Sekitar Anda</span></>}
        description="Bantu kami membangun Desa Cibatu yang lebih baik dengan melaporkan masalah infrastruktur, sosial, atau pelayanan."
        breadcrumbs={[
          { label: 'Layanan' },
          { label: 'Pengaduan Warga', href: '/layanan/pengaduan' }
        ]}
      />
      <div className="container mx-auto px-6 max-w-6xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column: Form */}
          <div className="lg:col-span-2">

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit} className="space-y-8"
                >
                  <GlassCard padding="p-8 md:p-10" className="space-y-8 bg-slate-50 border-slate-100 mb-8">
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
                    </div>                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
                        <input 
                          required type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Email aktif untuk balasan"
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">No. WhatsApp / Telepon</label>
                        <input 
                          required type="text" 
                          value={formData.telepon}
                          onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                          placeholder="08xxxxxxxxxx"
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
                  </GlassCard>

                  {process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Keamanan ReCAPTCHA</label>
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY}
                        onChange={setRecaptchaToken}
                      />
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                      <AlertCircle size={18} /> {error}
                    </div>
                  )}

                  <Button 
                    type="submit"
                    disabled={submitting}
                    isLoading={submitting}
                    className="w-full"
                    size="lg"
                    icon={<Send size={18} />}
                    iconPosition="right"
                  >
                    {submitting ? "Mengirim Laporan..." : "Kirim Laporan Pengaduan"}
                  </Button>
                </motion.form>
              ) : (
                <div className="py-10">
                  <StateMessage 
                    type="success"
                    title="Laporan Berhasil Terkirim!"
                    message="Terima kasih telah peduli. Laporan Anda telah masuk ke sistem dan akan segera diproses oleh petugas desa."
                    actionLabel="Buat Laporan Baru"
                    onAction={() => {
                      setSuccess(false);
                      setFormData({
                        nama_pelapor: '', nik_pelapor: '', telepon: '', email: '', alamat: '', 
                        kategori: 'infrastruktur', judul: '', deskripsi: '', lokasi: '', prioritas: 'sedang'
                      });
                    }}
                  />
                </div>
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
