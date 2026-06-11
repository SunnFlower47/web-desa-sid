'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, FileText, ClipboardList, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, AlertCircle, Search, 
  Copy, Check, Send, Mail, MapPin, Upload, X,
  Users, Baby, GraduationCap, Briefcase, Sparkles, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import ReCAPTCHA from 'react-google-recaptcha';

export default function LayananSurat() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suratTypes, setSuratTypes] = useState([]);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form Data States
  const [nik, setNik] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [pendudukData, setPendudukData] = useState(null);
  const [formData, setFormData] = useState({
    keperluan: "",
    telepon: "",
    keterangan: ""
  });
  const [dynamicData, setDynamicData] = useState({});
  const [fileLampiran, setFileLampiran] = useState(null);
  const [successData, setSuccessData] = useState(null);
  
  // ReCAPTCHA State
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  // Persistence: Load State on Mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('surat_form_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // We always start at step 1 for a better flow, but we keep the identity data
        setNik(parsed.nik || "");
        setTanggalLahir(parsed.tanggalLahir || "");
        setPendudukData(parsed.pendudukData || null);
        setFormData(parsed.formData || { keperluan: "", telepon: "", keterangan: "" });
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
    
    setStep(1); // Always start fresh at step 1
    fetchSuratTypes();
  }, []);

  // Persistence: Save State on Changes
  useEffect(() => {
    if (step >= 1 && step < 4) { 
      const stateToSave = {
        step,
        selectedSurat,
        nik,
        tanggalLahir,
        pendudukData,
        formData
      };
      sessionStorage.setItem('surat_form_state', JSON.stringify(stateToSave));
    }
  }, [step, selectedSurat, nik, tanggalLahir, pendudukData, formData]);

  // Handle Surat Selection with Auto-Skip Logic
  const handleSelectSurat = (surat) => {
    setSelectedSurat(surat);
    // If user is already verified in this session, skip step 2
    if (pendudukData && nik && tanggalLahir) {
      setStep(3);
    } else {
      setStep(2);
    }
  };


  const fetchSuratTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/surat-types');
      
      if (res.data.success) {
        setSuratTypes(res.data.data || []);
      } else {
        setError(res.data.message || "Gagal memuat daftar layanan.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Tidak dapat terhubung ke server. Pastikan koneksi internet stabil.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      const res = await api.post('/search-penduduk', { nik, tanggal_lahir: tanggalLahir });
      
      if (res.data.success) {
        setPendudukData(res.data.data);
        setStep(3);
      } else {
        setError(res.data.message || "Data penduduk tidak ditemukan. Cek NIK dan Tanggal Lahir.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memverifikasi data. Silakan coba lagi.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setError("Mohon selesaikan verifikasi reCAPTCHA terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Use FormData for Multipart/Form-Data (to handle PDF Upload)
      const data = new FormData();
      data.append('nik', nik);
      data.append('tanggal_lahir', tanggalLahir);
      data.append('surat_type', selectedSurat.id);
      data.append('nama_surat', selectedSurat.name);
      data.append('penduduk_id', pendudukData.id);
      data.append('tanggal_surat', new Date().toISOString().split('T')[0]);
      
      // Keperluan is usually needed, fallback if not available
      data.append('keperluan', formData.keperluan || 'Pengajuan via Layanan Mandiri');
      data.append('telepon', formData.telepon);
      data.append('keterangan', formData.keterangan);
      
      // Dynamic Form Data -> JSON String
      if (Object.keys(dynamicData).length > 0) {
        data.append('data_tambahan', JSON.stringify(dynamicData));
      }

      
      if (fileLampiran) {
        data.append('file_lampiran', fileLampiran);
      }
      
      const res = await api.post('/surat-pengajuan', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Recaptcha-Token': recaptchaToken
        }
      });
      
      if (res.data.success) {
        setSuccessData(res.data.data);
        setStep(4);
        // Clear persistence on success
        sessionStorage.removeItem('surat_form_state');
      } else {
        setError(res.data.message || "Gagal mengirim pengajuan.");
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat mengirim formulir.");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
    
    try {
      // Prioritaskan Navigator API (Modern Browsers)
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        handleCopySuccess();
      } else {
        fallbackCopyTextToClipboard(text);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Coba fallback jika primary gagal (misal karena iframe rules)
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Harus fixed agar tidak scroll otomatis ke bawah document
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999); // Untuk iOS
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        handleCopySuccess();
      } else {
        console.error('Fallback copy command returned false');
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    
    document.body.removeChild(textArea);
  };

  const handleCopySuccess = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getSuratIcon = (iconName) => {
    const icons = {
      'Users': <Users size={28} />,
      'Heart': <CheckCircle size={28} />,
      'Baby': <Baby size={28} />,
      'GraduationCap': <GraduationCap size={28} />,
      'MapPin': <MapPin size={28} />,
      'ClipboardList': <ClipboardList size={28} />,
      'Briefcase': <Briefcase size={28} />,
      'FileText': <FileText size={28} />
    };
    return icons[iconName] || <FileText size={28} />;
  };

  return (
    <main className="min-h-screen bg-white pb-20">
      <PageHeader 
        title={<>Layanan <span className="text-emerald-700">Surat Digital</span></>}
        description="Proses cepat, aman, dan tanpa antre. Urus kebutuhan administrasi kependudukan Anda secara mandiri di mana saja dan kapan saja."
        breadcrumbs={[
          { label: 'Layanan' },
          { label: 'Surat Online', href: '/layanan/surat' }
        ]}
      />
      <div className="container mx-auto px-6 max-w-6xl mt-8">

        {/* Stepper UI */}
        <div className="flex justify-between mb-12 relative px-4 max-w-3xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0 hidden md:block"></div>
          {[
            { id: 1, name: "Pilih Surat", icon: <FileText size={20} /> },
            { id: 2, name: "Identitas", icon: <ShieldCheck size={20} /> },
            { id: 3, name: "Formulir", icon: <ClipboardList size={20} /> },
            { id: 4, name: "Selesai", icon: <CheckCircle size={20} /> }
          ].map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                step >= s.id 
                ? "bg-emerald-700 text-white shadow-lg shadow-emerald-200 scale-110" 
                : "bg-white text-slate-400 border border-slate-100 shadow-sm"
              }`}>
                {s.icon}
              </div>
              <span className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${
                step >= s.id ? "text-emerald-800" : "text-slate-300"
              }`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Pilih Jenis Surat */}
            {step === 1 && (
              <motion.div 
                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                  <h2 className="text-2xl font-bold text-slate-800">Pilih Jenis Layanan</h2>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" placeholder="Cari layanan..."
                      className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-72 transition-all font-medium"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-[2rem]"></div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-20">
                    <div className="bg-red-50 text-red-600 px-6 py-4 rounded-3xl inline-flex items-center gap-3 mb-6 font-bold">
                      <AlertCircle size={20} /> {error}
                    </div>
                    <button onClick={fetchSuratTypes} className="block mx-auto text-emerald-700 font-bold hover:underline">
                      Coba Muat Ulang
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suratTypes.map((surat) => (
                      <motion.div
                        key={surat.id}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => handleSelectSurat(surat)}
                        className="p-8 rounded-[2rem] border border-slate-50 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 cursor-pointer transition-all group"
                      >
                        <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-emerald-700 group-hover:text-white transition-all text-emerald-700`}>
                          {getSuratIcon(surat.icon)}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-emerald-900 tracking-tight">{surat.name}</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">Klik untuk mulai mengisi formulir {surat.name}.</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Verifikasi Identitas */}
            {step === 2 && (
              <motion.div 
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 lg:p-16 w-full"
              >
                <button onClick={() => setStep(1)} className="flex items-center text-slate-400 hover:text-emerald-700 mb-8 font-bold text-[10px] uppercase tracking-widest transition-colors">
                  <ArrowLeft size={14} className="mr-2" /> Kembali pilih surat
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  <div className="lg:col-span-7">
                    <div className="mb-10">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <ShieldCheck size={32} />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Verifikasi Identitas</h2>
                      <p className="text-slate-500 font-medium text-sm">Layanan: <span className="text-emerald-700 font-bold">{selectedSurat?.name}</span></p>
                    </div>

                    <form onSubmit={handleVerifyIdentity} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NIK (Sesuai KTP)</label>
                        <input 
                          required type="text" value={nik} onChange={(e) => setNik(e.target.value)}
                          placeholder="Masukkan 16 digit NIK"
                          className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all text-xl font-black tracking-widest text-slate-900 placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                        <input 
                          required type="date" value={tanggalLahir} onChange={(e) => setTanggalLahir(e.target.value)}
                          className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all text-xl font-black text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email (Opsional)</label>
                          <input 
                            type="email" value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="anda@email.com"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Telepon (Opsional)</label>
                          <input 
                            type="tel" value={formData.telepon || ""} onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                            placeholder="0812xxxxxxxx"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:font-medium"
                          />
                        </div>
                      </div>
                      
                      {error && (
                        <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-start gap-4">
                          <AlertCircle size={20} className="shrink-0 mt-0.5" />
                          {error}
                        </div>
                      )}

                      <Button 
                        type="submit"
                        disabled={verifying}
                        isLoading={verifying}
                        size="lg"
                        className="w-full mt-4"
                        icon={<ArrowRight size={22} />}
                        iconPosition="right"
                      >
                        {verifying ? "Memverifikasi..." : "Mulai Pengajuan Surat"}
                      </Button>
                    </form>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                            <Sparkles size={20} />
                          </div>
                          <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-500">Simulasi Data Terpadu</h4>
                        </div>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed mb-10">
                          Sistem ini terintegrasi dengan database kependudukan. <span className="text-emerald-400 font-bold">Semua data di backend adalah data dummy simulasi, tidak ada data asli masyarakat demi keamanan.</span> Gunakan data simulasi berikut untuk mencoba alur aplikasi:
                        </p>
                        
                        <div className="space-y-6">
                          <div 
                            onClick={() => { setNik("1234567812345678"); setTanggalLahir("1990-01-01"); }}
                            className="p-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 rounded-3xl cursor-pointer transition-all group"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Profil Simulasi A</span>
                              <CheckCircle2 size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="font-mono text-xl font-black tracking-widest text-white">1234567812345678</p>
                            <p className="text-[11px] font-bold text-slate-500 mt-2">Lahir: 01-01-1990 <span className="text-slate-600 ml-2">(User Demo A)</span></p>
                          </div>

                          <div 
                            onClick={() => { setNik("8888999988889999"); setTanggalLahir("1985-05-20"); }}
                            className="p-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 rounded-3xl cursor-pointer transition-all group"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Profil Simulasi B</span>
                              <CheckCircle2 size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="font-mono text-xl font-black tracking-widest text-white">8888999988889999</p>
                            <p className="text-[11px] font-bold text-slate-500 mt-2">Lahir: 20-05-1985 <span className="text-slate-600 ml-2">(User Demo B)</span></p>
                          </div>
                        </div>
                        
                        <div className="mt-10 p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                          <p className="text-[10px] text-emerald-400/80 font-bold leading-relaxed italic">
                            ⚠️ Perhatian: Seluruh data di atas divalidasi ketat oleh sistem backend. Jika NIK atau Tanggal Lahir tidak sesuai, pengajuan tidak dapat dilanjutkan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Isi Formulir Detail */}
            {step === 3 && (
              <motion.div 
                key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-8 md:p-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar Info & Requirements */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Persyaratan</h3>
                        <div className="space-y-4">
                          {selectedSurat?.persyaratan ? (
                            selectedSurat.persyaratan.split('\n').map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                  <Check size={12} strokeWidth={4} />
                                </div>
                                <p className="text-sm font-medium text-slate-600 leading-tight">{item.trim()}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400 italic">Tidak ada persyaratan khusus.</p>
                          )}
                        </div>
                      </div>

                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Identitas Pemohon</h3>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
                            <Send size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Nama Lengkap</p>
                            <p className="font-bold text-slate-900 leading-tight">{pendudukData?.nama}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Alamat Terdaftar</p>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">{pendudukData?.alamat}</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setPendudukData(null); setStep(2); }}
                          className="w-full py-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-4"
                        >
                          Bukan Anda? Ganti Identitas
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-8 bg-emerald-800 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                        <FileText size={24} className="text-emerald-300" />
                      </div>
                      <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest mb-1">Dokumen Yang Diajukan</p>
                      <h4 className="text-2xl font-bold tracking-tight leading-tight">{selectedSurat?.name}</h4>
                    </div>
                  </div>

                  {/* Form Body */}
                  <div className="lg:col-span-8">
                    <form onSubmit={handleSubmitForm} className="space-y-8">
                      <div className="grid grid-cols-1 gap-8">
                        {/* Dynamic Forms / Default Keperluan */}
                        {Array.isArray(selectedSurat?.form_json) && selectedSurat.form_json.length > 0 ? (
                          selectedSurat.form_json.map((field, idx) => (
                            <div key={idx} className="space-y-3">
                              <label className="text-sm font-bold text-slate-700 ml-1">{field.label}</label>
                              {field.type === 'textarea' ? (
                                <textarea 
                                  required 
                                  value={dynamicData[field.name] || ''}
                                  onChange={(e) => setDynamicData({...dynamicData, [field.name]: e.target.value})}
                                  placeholder={`Masukkan ${field.label}`}
                                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                                />
                              ) : field.type === 'select' ? (
                                <select 
                                  required
                                  value={dynamicData[field.name] || ''}
                                  onChange={(e) => setDynamicData({...dynamicData, [field.name]: e.target.value})}
                                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                                >
                                  <option value="" disabled>Pilih {field.label}</option>
                                  {field.options?.map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <input 
                                  required type={field.type || 'text'} 
                                  value={dynamicData[field.name] || ''}
                                  onChange={(e) => setDynamicData({...dynamicData, [field.name]: e.target.value})}
                                  placeholder={`Masukkan ${field.label}`}
                                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">Keperluan Pembuatan Surat</label>
                            <input 
                              required type="text" value={formData.keperluan} 
                              onChange={(e) => setFormData({...formData, keperluan: e.target.value})}
                              placeholder="Contoh: Persyaratan Melamar Kerja di PT Maju Mundur"
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 ml-1">Nomor WhatsApp Aktif</label>
                          <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">+62</div>
                            <input 
                              required type="tel" value={formData.telepon}
                              onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                              placeholder="812xxxxxxxx"
                              className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-900"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold ml-1 italic">* Kami akan mengirim notifikasi via WhatsApp jika surat sudah selesai.</p>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 ml-1">Lampiran Dokumen PDF</label>
                          <p className="text-[10px] text-slate-400 font-bold ml-1 mb-2 italic">* Kosongkan saja bagian ini untuk keperluan Demo / Lomba.</p>
                          <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${
                            fileLampiran ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300"
                          }`}>
                            <input 
                              type="file" accept="application/pdf"
                              onChange={(e) => setFileLampiran(e.target.files[0])}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${fileLampiran ? "bg-emerald-500 text-white" : "bg-white text-slate-400 shadow-sm"}`}>
                              <Upload size={24} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-800">
                                {fileLampiran ? fileLampiran.name : "Klik atau seret file PDF ke sini"}
                              </p>
                              <p className="text-xs text-slate-400 font-medium mt-1">Hanya file PDF (Maks. 2MB)</p>
                            </div>
                            {fileLampiran && (
                              <button 
                                type="button" onClick={() => setFileLampiran(null)}
                                className="absolute top-4 right-4 p-2 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition-all z-20"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 ml-1">Catatan Tambahan (Opsional)</label>
                          <textarea 
                            rows={3} value={formData.keterangan}
                            onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                            placeholder="Tulis informasi tambahan jika ada..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                          ></textarea>
                        </div>
                        
                        {process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY && (
                          <div className="space-y-3 flex flex-col items-start justify-center">
                            <label className="text-sm font-bold text-slate-700 ml-1">Keamanan ReCAPTCHA</label>
                            <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY}
                              onChange={setRecaptchaToken}
                            />
                          </div>
                        )}
                      </div>

                      {error && (
                        <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-start gap-3 animate-shake">
                          <AlertCircle size={20} className="shrink-0 mt-0.5" />
                          {error}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button 
                          type="button" 
                          onClick={() => setStep(2)}
                          variant="outline"
                          size="lg"
                          className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          icon={<ArrowLeft size={18} />}
                        >
                          Batal
                        </Button>
                        <Button 
                          type="submit"
                          disabled={submitting}
                          isLoading={submitting}
                          size="lg"
                          className="flex-1"
                          icon={<Send size={20} />}
                          iconPosition="right"
                        >
                          {submitting ? "Mengirim..." : "Kirim Pengajuan Surat"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success Message */}
            {step === 4 && (
              <motion.div 
                key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="p-12 md:p-24 text-center max-w-3xl mx-auto"
              >
                <div className="w-28 h-28 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner relative">
                  <CheckCircle size={72} className="relative z-10" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-emerald-400 rounded-full"
                  />
                </div>
                
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Pengajuan Terkirim!</h2>
                <p className="text-slate-500 text-lg mb-12 font-medium">
                  Terima kasih <span className="text-slate-900 font-bold">{pendudukData?.nama}</span>. Pengajuan surat Anda telah masuk ke sistem dan akan diproses dalam waktu 1x24 jam.
                </p>

                <div className="bg-slate-900 p-10 rounded-[3rem] mb-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Nomor Pengajuan (Tracking ID)</p>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center gap-4">
                      <span className="text-4xl md:text-5xl font-mono font-black text-white tracking-tighter">
                        {successData?.nomor_resi || successData?.nomor_surat || "#CBT-2026-00452"}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(successData?.nomor_resi || successData?.nomor_surat || "#CBT-2026-00452")}
                        className={`p-3 rounded-xl transition-all active:scale-90 ${
                          copied ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {copied && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-4 flex items-center gap-2 text-emerald-400 font-bold text-xs bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20"
                        >
                          <CheckCircle2 size={14} /> NOMOR BERHASIL DISALIN!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  <Button 
                    onClick={() => setStep(1)}
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                  >
                    Ajukan Surat Lain
                  </Button>
                  <Button 
                    href="/layanan/status"
                    variant="secondary"
                    className="bg-blue-600 hover:bg-blue-700 shadow-blue-200/50 text-white"
                    icon={<Search size={18} />}
                    iconPosition="right"
                  >
                    Cek Status
                  </Button>
                  <Button 
                    href="/"
                    variant="ghost"
                  >
                    Beranda
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl max-w-lg mx-auto">
                  <p className="text-blue-800 text-xs leading-relaxed">
                    <span className="font-bold">Tips:</span> Simpan atau salin Tracking ID di atas. Anda dapat memantau proses verifikasi surat Anda secara berkala melalui menu <span className="font-bold underline">Cek Status</span> yang ada di navigasi utama aplikasi.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
