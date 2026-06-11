'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, Mail, MapPin, Send, MessageSquare, 
  Clock, ArrowLeft, Loader2, CheckCircle2, 
  Smartphone, Users, Globe
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import ReCAPTCHA from 'react-google-recaptcha';

export default function KontakPage() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    subjek: '',
    pesan: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = React.useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/kontak-desa');
      if (res.data.success) {
        setContacts(res.data.data.kontak_publik || []);
      }
    } catch (err) {
      console.error("Gagal mengambil kontak desa", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      alert("Mohon selesaikan verifikasi reCAPTCHA terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contact/submit', formData, {
        headers: { 'X-Recaptcha-Token': recaptchaToken }
      });
      if (res.data.success) {
        setSuccess(true);
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    } catch (err) {
      alert("Gagal mengirim pesan. Silakan coba lagi.");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pb-20">
      <PageHeader 
        title={<>Hubungi <br/> <span className="text-emerald-700">Kami</span></>}
        description="Kami siap melayani dan menjawab setiap pertanyaan Anda mengenai layanan Desa Cibatu."
        breadcrumbs={[
          { label: 'Layanan' },
          { label: 'Kontak & Bantuan', href: '/layanan/kontak' }
        ]}
      />
      <div className="container mx-auto px-6 max-w-6xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left Column: Info & Personnel */}
          <div>

            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-700 shadow-sm shadow-emerald-100 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat Kantor</h4>
                  <p className="font-bold text-slate-800">Jl. Raya Cibatu No. 01, Kec. Cibatu, Purwakarta</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-700 shadow-sm shadow-emerald-100 group-hover:scale-110 transition-transform">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jam Kerja</h4>
                  <p className="font-bold text-slate-800">Senin - Jumat | 08:00 - 16:00 WIB</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Users size={18} className="text-emerald-600" /> Petugas Pelayanan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contacts.map((contact, idx) => (
                  <div key={contact.id || idx} className="p-5 border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
                    <h4 className="font-black text-slate-800 text-sm mb-1">{contact.nama}</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">{contact.jabatan}</p>
                    <div className="flex flex-col gap-2">
                      {contact.telepon && (
                        <a href={`tel:${contact.telepon}`} className="flex items-center gap-2 text-xs text-slate-400 font-medium hover:text-emerald-700 transition-colors">
                          <Smartphone size={14} /> {contact.telepon}
                        </a>
                      )}
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-xs text-slate-400 font-medium hover:text-emerald-700 transition-colors">
                          <Mail size={14} /> {contact.email}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-slate-900 rounded-[3.5rem] p-8 md:p-14 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
            
            <h2 className="text-3xl font-black mb-8 tracking-tight">Kirim Pesan</h2>
            
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                      <input 
                        required type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        required type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest ml-1">Nomor Telepon / WA</label>
                      <input 
                        required type="tel"
                        value={formData.telepon}
                        onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                        placeholder="Contoh: 0812..."
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest ml-1">Subjek</label>
                      <input 
                        required type="text"
                        value={formData.subjek}
                        onChange={(e) => setFormData({...formData, subjek: e.target.value})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest ml-1">Pesan</label>
                    <textarea 
                      required rows={5}
                      value={formData.pesan}
                      onChange={(e) => setFormData({...formData, pesan: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold resize-none"
                    />
                  </div>
                </div>

                {process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest ml-1 mb-2 block">Keamanan ReCAPTCHA</label>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY}
                      onChange={setRecaptchaToken}
                      theme="dark"
                    />
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={submitting}
                  isLoading={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-2xl shadow-emerald-900"
                  size="lg"
                  icon={<Send size={16} />}
                  iconPosition="right"
                >
                  {submitting ? "Mengirim..." : "Kirim Sekarang"}
                </Button>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black mb-4 tracking-tight">Pesan Terkirim!</h2>
                <p className="text-slate-400 font-medium mb-10 text-sm">
                  Terima kasih, pesan Anda sudah kami terima. Kami akan segera membalas melalui email atau WhatsApp.
                </p>
                <Button 
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white hover:text-slate-900"
                >
                  Kirim Pesan Lagi
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
