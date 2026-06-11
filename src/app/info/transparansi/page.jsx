'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, BarChart3, TrendingUp, Building2, 
  Users, Filter, AlertCircle, PieChart, Activity
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';

export default function TransparansiPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [apbdesData, setApbdesData] = useState(null);
  const [proyekData, setProyekData] = useState([]);
  const [bantuanData, setBantuanData] = useState(null);

  const availableYears = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch paralel
      const [apbdesRes, proyekRes, bantuanRes] = await Promise.all([
        fetch(`/api/proxy/apbdes?tahun=${selectedYear}`).then(r => r.json().catch(() => null)),
        fetch(`/api/proxy/proyek-pembangunan?tahun=${selectedYear}`).then(r => r.json().catch(() => null)),
        fetch(`/api/proxy/bantuan-sosial-transparansi?tahun=${selectedYear}`).then(r => r.json().catch(() => null))
      ]);

      if (apbdesRes?.success) setApbdesData(apbdesRes.data);
      else setApbdesData(null);

      if (proyekRes?.success) setProyekData(proyekRes.data || []);
      else setProyekData([]);

      if (bantuanRes?.success) setBantuanData(bantuanRes.data);
      else setBantuanData(null);

    } catch (err) {
      console.error('Error fetching transparansi:', err);
      setError('Gagal memuat data transparansi dari server.');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getProgressColor = (percent) => {
    if (percent < 30) return 'bg-rose-500';
    if (percent < 70) return 'bg-amber-500';
    if (percent < 100) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'selesai': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'berjalan': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rencana': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <PageHeader 
        title={<>Transparansi <span className="text-emerald-700">Publik</span></>}
        description="Informasi keuangan, realisasi program pembangunan, dan penyaluran bantuan sosial Desa Cibatu yang terbuka, transparan, dan akuntabel."
        breadcrumbs={[
          { label: 'Informasi' },
          { label: 'Transparansi' }
        ]}
      />

      <div className="container mx-auto px-6 max-w-7xl mt-8 relative z-20">
        
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Data Tahun {selectedYear}</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Ringkasan Eksekutif</p>
            </div>
          </div>
          
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <Filter size={16} className="text-slate-400 mr-3" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent border-none focus:ring-0 text-sm font-black text-slate-700 cursor-pointer outline-none"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>Tahun Anggaran {year}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 mb-8">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Overview Stats (Bento Grid) */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Stat 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GlassCard padding="p-6" className="!bg-emerald-700 border-none shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden h-full">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <DollarSign size={24} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">APBDes</span>
                  </div>
                  <p className="text-sm font-medium text-emerald-100 mb-1">Total Anggaran Pendapatan</p>
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tighter">
                    {apbdesData ? formatCurrency(apbdesData.total_anggaran) : 'Rp 0'}
                  </h3>
                  <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs text-emerald-100 font-semibold">Terserap: {apbdesData ? apbdesData.persentase : 0}%</span>
                    <span className="text-xs text-emerald-100 font-bold">{apbdesData ? formatCurrency(apbdesData.realisasi) : 'Rp 0'}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Stat 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard padding="p-6" className="bg-white border-slate-100 shadow-sm h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <Building2 size={24} className="text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">Infrastruktur</span>
                </div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Proyek Desa</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                  {proyekData.length} <span className="text-lg text-slate-400 font-bold">Proyek</span>
                </h3>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <Activity size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600">Dipantau berkala</span>
                </div>
              </GlassCard>
            </motion.div>

            {/* Stat 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GlassCard padding="p-6" className="bg-white border-slate-100 shadow-sm h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center">
                    <Users size={24} className="text-pink-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1.5 rounded-lg">Bansos</span>
                </div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Penerima Manfaat</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                  {bantuanData ? bantuanData.total_penerima.toLocaleString('id-ID') : 0} <span className="text-lg text-slate-400 font-bold">Jiwa</span>
                </h3>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <PieChart size={14} className="text-pink-500" />
                  <span className="text-xs font-bold text-slate-600">{bantuanData ? bantuanData.total_program : 0} Program aktif</span>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}

        {/* Detailed Sections */}
        {loading ? (
          <div className="space-y-8">
            <div className="h-[400px] bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-[300px] bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
              <div className="h-[300px] bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* APBD Detail */}
            {apbdesData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <GlassCard padding="p-8 md:p-10" className="bg-white border-slate-100">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                    <TrendingUp className="text-emerald-500" size={24} /> 
                    Realisasi APBDes Detail
                  </h3>
                  
                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Pendapatan */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Rincian Pendapatan</h4>
                      {apbdesData.pendapatan?.map((item, idx) => (
                        <div key={idx} className="group">
                          <div className="flex justify-between items-end mb-2">
                            <div>
                              <p className="text-sm font-bold text-slate-700">{item.sumber}</p>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Target: {formatCurrency(item.jumlah)}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-emerald-600">{item.persentase}%</span>
                              <p className="text-xs font-bold text-slate-500">{formatCurrency(item.realisasi)}</p>
                            </div>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(item.persentase)}`} style={{ width: `${Math.min(item.persentase, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Belanja */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Penggunaan Anggaran (Belanja)</h4>
                      {apbdesData.belanja?.map((item, idx) => (
                        <div key={idx} className="group">
                          <div className="flex justify-between items-end mb-2">
                            <div>
                              <p className="text-sm font-bold text-slate-700">{item.bidang}</p>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Pagu: {formatCurrency(item.jumlah)}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-blue-600">{item.persentase}%</span>
                              <p className="text-xs font-bold text-slate-500">{formatCurrency(item.realisasi)}</p>
                            </div>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 bg-blue-500`} style={{ width: `${Math.min(item.persentase, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Proyek Pembangunan */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <GlassCard padding="p-8" className="bg-white border-slate-100 h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                      <Building2 className="text-indigo-500" size={24} /> 
                      Proyek Infrastruktur
                    </h3>
                  </div>

                  {proyekData.length > 0 ? (
                    <div className="space-y-6">
                      {proyekData.map((proyek) => (
                        <div key={proyek.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-slate-800">{proyek.nama}</h4>
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(proyek.status)}`}>
                              {proyek.status}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-500 mb-4 leading-relaxed">{proyek.deskripsi}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokasi</p>
                              <p className="text-xs font-bold text-slate-700">{proyek.lokasi}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Anggaran</p>
                              <p className="text-xs font-bold text-indigo-700">{formatCurrency(proyek.anggaran)}</p>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</span>
                              <span className="text-xs font-black text-slate-700">{proyek.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(proyek.progress)}`} style={{ width: `${Math.min(proyek.progress, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                      <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-500">Belum ada proyek tahun ini</p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>

              {/* Bantuan Sosial */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <GlassCard padding="p-8" className="bg-white border-slate-100 h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                      <Users className="text-pink-500" size={24} /> 
                      Program Bantuan
                    </h3>
                  </div>

                  {bantuanData && bantuanData.program?.length > 0 ? (
                    <div className="space-y-6">
                      {bantuanData.program.map((prog) => (
                        <div key={prog.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-slate-800">{prog.nama_program}</h4>
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(prog.status)}`}>
                              {prog.status}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-500 mb-4 leading-relaxed">{prog.deskripsi}</p>
                          
                          <div className="bg-white rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Dana</p>
                              <p className="text-sm font-black text-emerald-600">{formatCurrency(prog.total_dana)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Penerima</p>
                              <p className="text-sm font-black text-pink-600">{prog.jumlah_penerima.toLocaleString('id-ID')} <span className="text-[10px] text-slate-500">Jiwa</span></p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-500">Belum ada program bantuan</p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            </div>
            
          </div>
        )}
      </div>
    </main>
  );
}
