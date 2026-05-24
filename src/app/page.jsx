'use client';

import React from 'react';
import { 
  Bot, FileText, Newspaper, ArrowRight, MessageSquare, 
  ShieldCheck, MapPin, Phone, Users, Landmark, 
  HeartHandshake, Megaphone, Search, CheckCircle2,
  Sparkles, Zap, Shield, Globe, MousePointer2, Activity,
  BarChart3
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import api, { getImageUrl } from '@/lib/api';

const slides = [
  {
    id: 1,
    image: "/assets/images/foto-sawah-1.webp",
    title: "Layanan",
    subtitle: "Administrasi Online",
    accent: "Cepat, Mudah, Transparan",
    desc: "Pengajuan surat keterangan, domisili, dan layanan lainnya secara online tanpa ribet. Modernisasi birokrasi untuk kemajuan warga."
  },
  {
    id: 2,
    image: "/assets/images/foto-sawah-2.webp",
    title: "Selamat Datang",
    subtitle: "Desa Digital Cerdas",
    accent: "Inovasi Tanpa Batas",
    desc: "Mewujudkan ekosistem desa yang mandiri melalui integrasi teknologi kecerdasan buatan dalam setiap pelayanan publik."
  },
  {
    id: 3,
    image: "/assets/images/foto-sawah-4.webp",
    title: "Transparansi",
    subtitle: "Tata Kelola Desa",
    accent: "Akurat & Akuntabel",
    desc: "Akses data statistik desa dan monitoring pembangunan secara real-time untuk transparansi informasi publik yang maksimal."
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isTestiModalOpen, setIsTestiModalOpen] = React.useState(false);
  const [testiForm, setTestiForm] = React.useState({ nama: '', instansi: '', isi: '', rating: 5 });
  const [isSubmittingTesti, setIsSubmittingTesti] = React.useState(false);

  const handleTestiSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingTesti(true);
    try {
      const payload = {
        nama: testiForm.nama,
        kategori: testiForm.instansi, // Map instansi to kategori
        testimoni: testiForm.isi,     // Map isi to testimoni
        rating: testiForm.rating
      };
      const res = await api.post('/testimoni', payload);
      
      if (res.data.success || res.status === 201) {
        alert('Terima kasih! Testimoni Anda berhasil dikirim dan menunggu persetujuan admin.');
        setIsTestiModalOpen(false);
        setTestiForm({ nama: '', instansi: '', isi: '', rating: 5 });
      } else {
        alert('Gagal mengirim testimoni: ' + (res.data?.message || 'Terjadi kesalahan'));
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
    } finally {
      setIsSubmittingTesti(false);
    }
  };
  const { scrollY } = useScroll();
  
  // Toned down parallax
  const yBg = useTransform(scrollY, [0, 500], [0, 100]);
  const yContent = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [stats, setStats] = React.useState({
    total_penduduk: '0',
    total_kk: '0',
    total_rt: '0'
  });
  const [testimoni, setTestimoni] = React.useState([]);
  const [berita, setBerita] = React.useState([]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    const fetchData = async () => {
      try {
        const [statsRes, testRes, beritaRes] = await Promise.all([
          api.get('/statistics').catch(() => null),
          api.get('/testimoni?limit=3').catch(() => null),
          api.get('/berita-latest?limit=3').catch(() => null)
        ]);
        
        if (statsRes?.data?.success && statsRes.data.data) {
          setStats({
            total_penduduk: statsRes.data.data.total_penduduk?.toLocaleString('id-ID') || '0',
            total_kk: statsRes.data.data.total_kk?.toLocaleString('id-ID') || '0',
            total_rt: statsRes.data.data.total_rt || '0'
          });
        }
        if (testRes?.data?.success) setTestimoni(testRes.data.data);
        if (beritaRes?.data?.success) setBerita(beritaRes.data.data);
      } catch (err) {
        console.error('Data fetch error:', err);
      }
    };

    fetchData();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative h-screen min-h-[750px] flex items-center overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div 
            key={slides[currentSlide].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <motion.div style={{ y: yBg }} className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/20 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90 z-10" />
              <Image 
                src={slides[currentSlide].image} 
                alt="Desa Digital"
                fill
                priority={currentSlide === 0}
                className="object-cover brightness-[0.8] saturate-[1.1]"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="container mx-auto px-6 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Content Area */}
            <motion.div style={{ y: yContent }} className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-10"
              >
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center p-2 border-emerald-500/20">
                  <img src="/assets/images/logo-desa-cibatu.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-lg tracking-tight leading-none italic uppercase">Desa Digital</span>
                  <span className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.4em]">Smart Village Ecosystem</span>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={slides[currentSlide].id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.9] mb-6">
                    {slides[currentSlide].title} <br />
                    <span className="text-gradient">{slides[currentSlide].subtitle}</span>
                  </h1>
                  
                  <p className="text-emerald-400 font-black text-lg mb-4 italic">
                    {slides[currentSlide].accent}
                  </p>

                  <p className="text-slate-300 text-base max-w-xl mb-8 font-medium leading-relaxed opacity-80">
                    {slides[currentSlide].desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Stats Block */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-8 mb-8"
              >
                <div>
                  <p className="text-2xl font-black text-white">{stats.total_penduduk}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500/70">Total Jiwa</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{stats.total_kk}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500/70">Total KK</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{stats.total_rt}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500/70">Total RT</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/layanan/surat" className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                  Layanan Online <ArrowRight size={16} />
                </Link>
                <button 
                  onClick={() => {
                    const chatBtn = document.querySelector('#chat-assistant-toggle');
                    if (chatBtn) chatBtn.click();
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 glass text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all group"
                >
                  Tanya Asisten AI <Sparkles size={16} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
                </button>
              </motion.div>
            </motion.div>

            {/* Right Side - Floating Indicators */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="space-y-4">
                {slides.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1 transition-all duration-500 rounded-full ${
                      currentSlide === idx ? 'w-20 bg-emerald-500' : 'w-8 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
              
              <div className="mt-12 space-y-6">
                <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/20 flex items-start gap-6 backdrop-blur-md shadow-2xl">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner border border-emerald-500/30">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-lg mb-2 tracking-tight">Tata Kelola</h4>
                    <p className="text-emerald-300 text-[10px] font-bold leading-relaxed italic uppercase tracking-widest">Transparan & Akuntabel</p>
                  </div>
                </div>
                
                <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/20 flex items-start gap-6 backdrop-blur-md shadow-2xl translate-x-8 ring-1 ring-emerald-500/50">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner border border-emerald-500/30 animate-pulse">
                    <Bot size={32} />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-lg mb-2 tracking-tight">Asisten AI</h4>
                    <p className="text-emerald-400 text-[10px] font-bold leading-relaxed italic uppercase tracking-widest">Solusi Cerdas & Responsif</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-2">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-1 bg-emerald-500 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Services */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <Zap size={12} className="text-emerald-500" />
              <span>Smart Solutions</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
              Pusat Layanan <br /><span className="text-emerald-600">Terpadu Digital</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Akses cepat berbagai kebutuhan administrasi dan informasi pelayanan publik dalam satu pintu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[200px]">
            {/* Big Card - Surat */}
            <BentoCard 
              className="md:col-span-8 md:row-span-2"
              title="Administrasi Surat Digital"
              desc="Layanan pengajuan SKU, SKTM, Domisili, dan Keterangan lainnya. Diproses otomatis dengan validasi data penduduk real-time."
              icon={<FileText size={40} />}
              href="/layanan/surat"
              variant="primary"
            />
            
            {/* Medium Card - Berita */}
            <BentoCard 
              className="md:col-span-4 md:row-span-1"
              title="Warta & Kabar Desa"
              desc="Update terkini kegiatan dan pengumuman resmi Desa Cibatu."
              icon={<Newspaper size={32} />}
              href="/info/berita"
              variant="glass"
            />

            {/* Small Card - Statistik */}
            <BentoCard 
              className="md:col-span-4 md:row-span-2"
              title="Statistik Desa"
              desc="Data kependudukan terintegrasi."
              icon={<BarChart3 size={32} />}
              href="/info/statistik"
              variant="dark"
            />

            {/* Big Card - Pengaduan */}
            <BentoCard 
              className="md:col-span-4 md:row-span-2"
              title="Aspirasi & Pengaduan"
              desc="Suarakan aspirasi Anda untuk kemajuan Desa Cibatu."
              icon={<Megaphone size={32} />}
              href="/layanan/pengaduan"
              variant="glass"
            />

            {/* Small Card - Kontak */}
            <BentoCard 
              className="md:col-span-4 md:row-span-1"
              title="Pusat Bantuan"
              desc="Hubungi petugas kami."
              icon={<Phone size={24} />}
              href="/layanan/kontak"
              variant="white"
            />
          </div>
        </div>
      </section>

      {/* Testimoni & Berita Section */}
      <section className="py-24 relative bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Berita Terbaru */}
            <div>
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest mb-3">
                  <Newspaper size={12} /> Warta Terkini
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Kabar <span className="text-emerald-600">Desa</span></h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {berita.length > 0 ? berita.map((item, idx) => (
                  <Link href={`/info/berita/${item.slug}`} key={idx} className="block group">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-500/20 transition-all overflow-hidden flex flex-col h-full">
                      <div className="w-full h-40 bg-slate-100 overflow-hidden relative flex-shrink-0">
                        {item.gambar ? (
                          <Image 
                            src={getImageUrl(item.gambar)} 
                            alt={item.judul} 
                            fill
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Newspaper size={32} />
                          </div>
                        )}
                        {item.kategori && (
                          <div className="absolute top-3 left-3 px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                            {item.kategori}
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">
                          {new Date(item.published_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors mb-3">
                          {item.judul}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-auto">
                          {item.excerpt || "Klik untuk membaca selengkapnya..."}
                        </p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="col-span-1 sm:col-span-2 text-center py-10 bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-medium text-sm">Belum ada berita terbaru.</p>
                  </div>
                )}
              </div>
              <div className="pt-6">
                <Link href="/info/berita" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">
                  Semua Berita <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Testimoni Warga */}
            <div>
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest mb-3">
                    <HeartHandshake size={12} /> Aspirasi Warga
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Suara <span className="text-emerald-600">Warga</span></h3>
                </div>
                <button 
                  onClick={() => setIsTestiModalOpen(true)}
                  className="px-5 py-2.5 bg-white border border-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  + Kirim Testimoni
                </button>
              </div>
              <div className="space-y-6">
                {testimoni.length > 0 ? testimoni.map((testi, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all relative">
                    <MessageSquare className="absolute top-6 right-6 text-slate-100" size={32} />
                    <p className="text-slate-600 text-sm font-medium leading-relaxed mb-5 italic relative z-10">
                      "{testi.testimoni}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-black text-lg shadow-inner">
                        {testi.nama.charAt(0)}
                      </div>
                      <div>
                        <div className="flex gap-0.5 mb-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-[10px] ${i < (testi.rating || 5) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                          ))}
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{testi.nama}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                          {testi.kategori || 'Warga Desa'}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-medium text-sm">Belum ada testimoni.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimoni Modal */}
      <AnimatePresence>
        {isTestiModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsTestiModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsTestiModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
              >
                ✕
              </button>
              <h3 className="text-2xl font-black tracking-tight mb-2">Kirim <span className="text-emerald-600">Testimoni</span></h3>
              <p className="text-xs text-slate-500 font-medium mb-6">Bagikan pengalaman Anda menggunakan layanan Desa Digital Cibatu.</p>
              
              <form onSubmit={handleTestiSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                  <input required type="text" value={testiForm.nama} onChange={e => setTestiForm({...testiForm, nama: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-800 transition-all" placeholder="Misal: Budi Santoso" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Keterangan / Instansi</label>
                  <input required type="text" value={testiForm.instansi} onChange={e => setTestiForm({...testiForm, instansi: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-800 transition-all" placeholder="Misal: Warga RT 02 / Tokoh Masyarakat" />
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
                  <textarea required minLength={10} rows={4} value={testiForm.isi} onChange={e => setTestiForm({...testiForm, isi: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-slate-800 transition-all" placeholder="Tuliskan pengalaman Anda (minimal 10 karakter)..." />
                </div>
                <button disabled={isSubmittingTesti} type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center">
                  {isSubmittingTesti ? "Mengirim..." : "Kirim Testimoni"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function BentoCard({ title, desc, icon, href, className, variant = "glass" }) {
  const variants = {
    primary: "bg-emerald-700 text-white shadow-xl shadow-emerald-900/20",
    glass: "bg-white/50 backdrop-blur-sm text-slate-900",
    dark: "bg-slate-900 text-white shadow-xl",
    white: "bg-white text-slate-900 shadow-sm"
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`${variants[variant]} ${className} p-8 rounded-3xl border border-slate-100 group flex flex-col justify-between relative overflow-hidden`}
    >
      <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
        {React.cloneElement(icon, { size: 140 })}
      </div>
      
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${
        variant === "primary" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
      }`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-black mb-3 tracking-tight leading-tight">{title}</h3>
        <p className={`text-xs font-medium leading-relaxed mb-6 line-clamp-2 opacity-80 ${
          variant === "primary" || variant === "dark" ? "text-slate-200" : "text-slate-500"
        }`}>{desc}</p>
        <Link href={href} className={`inline-flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.2em] transition-all group-hover:gap-4 ${
          variant === "primary" || variant === "dark" ? "text-emerald-300 hover:text-white" : "text-emerald-700 hover:text-emerald-800"
        }`}>
          Explore Service <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}


