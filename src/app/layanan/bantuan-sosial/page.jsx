'use client';

import React, { useState } from 'react';
import { Search, User, Info, AlertCircle, CreditCard, CalendarDays, Wallet, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';

export default function BantuanSosialPage() {
  const [nik, setNik] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setSearchResult(null);
    setHasSearched(true);
    setLoading(true);

    if (!nik || nik.length !== 16) {
      setError('NIK harus berisi 16 digit angka.');
      setLoading(false);
      return;
    }

    if (!tanggalLahir) {
      setError('Tanggal lahir wajib diisi.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/proxy/bantuan-sosial/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nik: nik,
          tanggal_lahir: tanggalLahir
        })
      });

      const response = await res.json();

      if (res.ok && response.success) {
        setSearchResult(response.data);
      } else {
        if (response.message?.includes('tidak ditemukan') || res.status === 404) {
          setError(`Data bantuan sosial tidak ditemukan untuk NIK ${nik.substring(0, 4)}****${nik.substring(nik.length - 4)}. Pastikan NIK dan tanggal lahir sudah benar.`);
        } else if (res.status === 429) {
          setError('Terlalu banyak percobaan. Silakan tunggu beberapa saat sebelum mencoba lagi.');
        } else if (res.status === 400 || res.status === 422) {
          setError(response.message || 'Data yang dimasukkan tidak valid. Silakan periksa kembali NIK dan tanggal lahir.');
        } else {
          setError(response.message || 'Terjadi kesalahan saat mencari data.');
        }
      }
    } catch (err) {
      setError('Gagal terhubung ke server. Silakan periksa koneksi internet Anda dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-800 border-slate-200';
    switch (status.toLowerCase()) {
      case 'aktif': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'nonaktif': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak tersedia';
    try {
      if (dateString.includes('/')) return dateString; 
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <main className="min-h-screen bg-white pb-20">
      <PageHeader 
        title={<>Cek <span className="text-emerald-700">Bantuan Sosial</span></>}
        description="Fasilitas pengecekan status kepesertaan program bantuan sosial secara mandiri, transparan, dan real-time bagi warga desa."
        breadcrumbs={[
          { label: 'Layanan', href: '#' },
          { label: 'Bantuan Sosial' }
        ]}
      />

      <div className="container mx-auto px-6 max-w-6xl mt-8 relative z-20">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Form Column */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard padding="p-8 md:p-10" className="space-y-8 bg-slate-50 border-slate-100 mb-8 sticky top-32">
              <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2 tracking-tight">
                <Search className="w-5 h-5 text-emerald-500" />
                Cek Kepesertaan
              </h2>

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">NIK (16 Digit)</label>
                  <input
                    type="text"
                    id="nik"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900"
                    placeholder="Masukkan NIK..."
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    maxLength={16}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tanggal Lahir</label>
                  <input
                    type="date"
                    id="tanggalLahir"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold text-slate-900"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    required
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-start gap-3 mt-4">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" /> 
                        <span className="leading-relaxed">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  type="submit"
                  disabled={loading || nik.length !== 16 || !tanggalLahir}
                  isLoading={loading}
                  className="w-full justify-center"
                  size="lg"
                  icon={<Search size={18} />}
                >
                  {loading ? 'Memproses...' : 'Cari Data'}
                </Button>
              </form>
            </GlassCard>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7">
            {!hasSearched ? (
              <div className="bg-slate-50/80 rounded-[2.5rem] p-8 md:p-12 text-slate-800 border border-slate-100 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] text-center shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 relative z-10 border border-slate-100">
                  <Search className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tight relative z-10 text-slate-800">Belum Ada Pencarian</h3>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed relative z-10 font-medium">Masukkan NIK dan Tanggal Lahir di form sebelah kiri untuk melihat status kepesertaan Anda pada program Bantuan Sosial.</p>
              </div>
            ) : loading ? (
              <div className="bg-slate-50/50 rounded-[2.5rem] p-8 min-h-[400px] flex items-center justify-center border border-slate-100">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-bold text-sm tracking-wide uppercase animate-pulse">Memuat Data...</p>
                </div>
              </div>
            ) : searchResult ? (
              <div className="space-y-8">
                {/* User Info Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassCard padding="p-8" className="bg-slate-50 border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl" />
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-xl tracking-tight">{searchResult.penduduk?.nama || '-'}</h3>
                        <p className="font-mono text-sm font-semibold text-slate-500 tracking-wider mt-1">{searchResult.penduduk?.nik || '-'}</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6 text-sm relative z-10">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Domisili</p>
                        <p className="font-bold text-slate-700 leading-relaxed">{searchResult.penduduk?.alamat || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RT/RW & Dusun</p>
                        <p className="font-bold text-slate-700 leading-relaxed">RT {searchResult.penduduk?.rt || '-'} / RW {searchResult.penduduk?.rw || '-'}, {searchResult.penduduk?.dusun || '-'}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Bantuan List */}
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 pt-2 tracking-tight">
                  <Info className="w-6 h-6 text-emerald-500" />
                  Daftar Program Bantuan ({searchResult.bantuan_sosials?.length || 0})
                </h3>

                {searchResult.bantuan_sosials && searchResult.bantuan_sosials.length > 0 ? (
                  <div className="grid gap-6">
                    {searchResult.bantuan_sosials.map((bantuan, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        <GlassCard padding="p-8" className="bg-white border-slate-100 shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                              <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">{bantuan.program}</h4>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(bantuan.status)}`}>
                                  {bantuan.status}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-black px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 uppercase tracking-widest">
                                  <CreditCard className="w-3 h-3" />
                                  {bantuan.jenis}
                                </span>
                              </div>
                            </div>
                            <div className="sm:text-right bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100">
                              <p className="text-[10px] font-black text-emerald-600/80 uppercase tracking-widest mb-1">Nilai Bantuan</p>
                              <p className="text-2xl font-black text-emerald-700 tracking-tight">{bantuan.nilai}</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            {bantuan.nomor_kartu && (
                              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor Kartu</p>
                                <p className="font-mono text-sm font-bold text-slate-800">{bantuan.nomor_kartu}</p>
                              </div>
                            )}
                            {bantuan.keterangan && (
                              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 sm:col-span-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Keterangan</p>
                                <p className="text-sm font-semibold text-slate-700 leading-relaxed">{bantuan.keterangan}</p>
                              </div>
                            )}
                          </div>

                          {bantuan.sistem_pembayaran === 'triwulanan' && bantuan.triwulan ? (
                            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                              <p className="text-xs font-black text-emerald-400 mb-4 flex items-center gap-2 tracking-widest uppercase relative z-10">
                                <CalendarDays className="w-4 h-4" />
                                Jadwal Triwulanan
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                                {[1, 2, 3].map((num) => {
                                  const tw = bantuan.triwulan[`triwulan_${num}`];
                                  if (!tw) return null;
                                  return (
                                    <div key={num} className="bg-slate-800/80 rounded-2xl p-4 shadow-sm border border-slate-700">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">TW {num}</p>
                                      <p className="text-sm font-black text-white mb-2">Rp {tw.jumlah?.toLocaleString('id-ID')}</p>
                                      <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                                        <CalendarDays className="w-3.5 h-3.5 opacity-70" />
                                        {tw.tanggal ? formatDate(tw.tanggal) : 'Belum turun'}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500">
                                <CalendarDays className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal Penerimaan</p>
                                <p className="text-sm font-bold text-slate-800">{bantuan.tanggal_penerimaan ? formatDate(bantuan.tanggal_penerimaan) : 'Menunggu Jadwal'}</p>
                              </div>
                            </div>
                          )}
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <GlassCard padding="p-10 text-center" className="bg-slate-50 border-slate-100">
                      <div className="w-20 h-20 bg-slate-200/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-slate-400" />
                      </div>
                      <h5 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Tidak Ada Data Bantuan</h5>
                      <p className="text-sm font-medium text-slate-500">Penduduk ini tidak terdaftar sebagai penerima program bantuan sosial manapun saat ini.</p>
                    </GlassCard>
                  </motion.div>
                )}
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </main>
  );
}
