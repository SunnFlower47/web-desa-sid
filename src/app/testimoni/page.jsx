'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MessageCircle, User, Calendar, Filter, 
  ArrowLeft, Loader2, HeartHandshake, Sparkles, MessageSquare 
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import ReCAPTCHA from 'react-google-recaptcha';

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [categories, setCategories] = useState([]);

  // Form State
  const [testiForm, setTestiForm] = useState({ 
    nama: '', instansi: '', isi: '', rating: 5, 
    email: '', telepon: '', is_anonymous: false 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = React.useRef(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/testimoni');
      if (res.data.success) {
        const data = res.data.data || [];
        setTestimonials(data);
        
        // Extract unique categories
        const cats = Array.from(new Set(data.map((t) => t.kategori).filter(Boolean)));
        setCategories(cats);
      }
    } catch (err) {
      console.error("Gagal mengambil data testimoni", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleTestiSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      alert("Mohon selesaikan verifikasi reCAPTCHA terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nama: testiForm.is_anonymous ? 'Warga Anonim' : testiForm.nama,
        kategori: testiForm.instansi, // Map instansi to kategori
        testimoni: testiForm.isi,     // Map isi to testimoni
        rating: testiForm.rating,
        email: testiForm.is_anonymous ? '' : testiForm.email,
        telepon: testiForm.is_anonymous ? '' : testiForm.telepon,
        is_anonymous: testiForm.is_anonymous
      };
      const res = await api.post('/testimoni', payload, {
        headers: { 'X-Recaptcha-Token': recaptchaToken }
      });
      
      if (res.data.success || res.status === 201) {
        alert('Terima kasih! Testimoni Anda berhasil dikirim dan menunggu persetujuan admin.');
        setIsModalOpen(false);
        setTestiForm({ nama: '', instansi: '', isi: '', rating: 5, email: '', telepon: '', is_anonymous: false });
        // Refresh testimonials lists
        fetchTestimonials();
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaToken(null);
      } else {
        alert('Gagal mengirim testimoni: ' + (res.data?.message || 'Terjadi kesalahan'));
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        alert('Data tidak valid: ' + firstError);
      } else {
        alert('Gagal mengirim testimoni. Silakan coba lagi nanti.');
      }
      console.error(err);
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < (rating || 5) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter and sort testimonials
  const filteredTestimonials = testimonials
    .filter((t) => !selectedCategory || t.kategori === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime();
    });

  const totalRating = testimonials.reduce((sum, t) => sum + (t.rating || 0), 0);
  const averageRating = testimonials.length > 0 ? (totalRating / testimonials.length).toFixed(1) : '0.0';

  return (
    <main className="min-h-screen bg-white pb-20">
      <PageHeader 
        title={<>Suara <span className="text-emerald-700">Masyarakat</span></>}
        description="Daftar testimoni dan tanggapan langsung dari warga mengenai pelayanan publik digital Desa Cibatu."
        breadcrumbs={[
          { label: 'Informasi' },
          { label: 'Testimoni Warga', href: '/testimoni' }
        ]}
        action={
          <Button 
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="shadow-xl shadow-emerald-600/20"
          >
            + Tulis Testimoni
          </Button>
        }
      />
      <div className="container mx-auto px-6 max-w-6xl mt-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GlassCard padding="p-8" className="text-center bg-slate-50 border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Aspirasi</h4>
            <p className="text-4xl font-black text-slate-900">{testimonials.length}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Telah disetujui</p>
          </GlassCard>
          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Rating Rata-Rata</h4>
            <p className="text-4xl font-black text-white">{averageRating} <span className="text-yellow-400 text-2xl">★</span></p>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Skala 1 - 5 Bintang</p>
          </div>
          <GlassCard padding="p-8" className="text-center bg-slate-50 border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori Warga</h4>
            <p className="text-4xl font-black text-slate-900">{categories.length}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Jenis instansi / profesi</p>
          </GlassCard>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-50 rounded-[2.5rem] p-6 mb-8 border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 border border-slate-200">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none text-slate-700 cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 border border-slate-200">
              <Sparkles size={14} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none text-slate-700 cursor-pointer"
              >
                <option value="latest">Terbaru</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Menampilkan {filteredTestimonials.length} Data
          </span>
        </div>

        {/* Testimonials Display */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : filteredTestimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((testimonial, idx) => (
              <motion.div 
                key={testimonial.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:border-emerald-500/20 transition-all flex flex-col justify-between relative overflow-hidden group shadow-sm"
              >
                <MessageSquare className="absolute top-6 right-6 text-slate-100/50 group-hover:text-emerald-50/50 transition-colors" size={40} />
                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6 italic relative z-10">
                  "{testimonial.testimoni}"
                </p>
                <div className="flex items-center gap-4 relative z-10 pt-4 border-t border-slate-50">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-black text-lg shadow-inner">
                    {testimonial.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="font-black text-slate-900 text-xs leading-none mb-1">{testimonial.nama}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600">
                      {testimonial.kategori || 'Warga Desa'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard padding="py-20" className="text-center bg-slate-50 border-slate-100">
            <MessageCircle className="mx-auto mb-4 text-slate-300" size={48} />
            <h3 className="text-lg font-black text-slate-700">Belum Ada Testimoni</h3>
            <p className="text-slate-400 text-xs font-semibold mt-1">Jadilah yang pertama memberikan testimoni!</p>
          </GlassCard>
        )}
      </div>

      {/* Submission Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative z-10 shadow-2xl border border-slate-100"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-colors font-bold"
              >
                ✕
              </button>
              <h3 className="text-2xl font-black tracking-tight mb-2">Kirim <span className="text-emerald-600">Testimoni</span></h3>
              <p className="text-xs text-slate-500 font-medium mb-6">Bagikan pengalaman Anda menggunakan layanan Desa Digital Cibatu.</p>
              
              <form onSubmit={handleTestiSubmit} className="space-y-4">
                <div className="flex items-center gap-2 px-1 mb-2">
                  <input 
                    type="checkbox" id="anon" 
                    checked={testiForm.is_anonymous} 
                    onChange={e => setTestiForm({...testiForm, is_anonymous: e.target.checked})}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="anon" className="text-xs font-bold text-slate-600 cursor-pointer">
                    Kirim sebagai Anonim (Sembunyikan Identitas)
                  </label>
                </div>

                <AnimatePresence>
                  {!testiForm.is_anonymous && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                        <input 
                          required type="text" value={testiForm.nama} 
                          onChange={e => setTestiForm({...testiForm, nama: e.target.value})} 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-800 transition-all" 
                          placeholder="Misal: Budi Santoso" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email (Opsional)</label>
                          <input 
                            type="email" value={testiForm.email} 
                            onChange={e => setTestiForm({...testiForm, email: e.target.value})} 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-800 transition-all" 
                            placeholder="budi@email.com" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Telepon (Opsional)</label>
                          <input 
                            type="text" value={testiForm.telepon} 
                            onChange={e => setTestiForm({...testiForm, telepon: e.target.value})} 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-800 transition-all" 
                            placeholder="08xxxxxxxxxx" 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Keterangan / Instansi</label>
                  <input 
                    required type="text" value={testiForm.instansi} 
                    onChange={e => setTestiForm({...testiForm, instansi: e.target.value})} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-800 transition-all" 
                    placeholder="Misal: Warga RT 02 / Tokoh Masyarakat" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Rating Kepuasan</label>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTestiForm({...testiForm, rating: star})}
                        className={`text-2xl transition-all ${star <= testiForm.rating ? 'text-yellow-400' : 'text-slate-200'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pesan Testimoni (Min. 10 Karakter)</label>
                  <textarea 
                    required minLength={10} rows={4} value={testiForm.isi} 
                    onChange={e => setTestiForm({...testiForm, isi: e.target.value})} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-800 transition-all" 
                    placeholder="Tuliskan pengalaman Anda (minimal 10 karakter)..." 
                  />
                </div>

                {process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Keamanan ReCAPTCHA</label>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY}
                      onChange={setRecaptchaToken}
                    />
                  </div>
                )}
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="w-full shadow-lg shadow-emerald-600/20"
                  size="lg"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Testimoni"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
