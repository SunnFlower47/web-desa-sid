'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, Home, Briefcase, GraduationCap, 
  Baby, ArrowLeft, Loader2, PieChart, BarChart2,
  TrendingUp, Activity
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function StatistikPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/statistics');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil statistik", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  const mainStats = [
    { label: 'Total Penduduk', value: stats?.total_penduduk, icon: <Users size={24} />, color: 'emerald' },
    { label: 'Kepala Keluarga', value: stats?.total_kk, icon: <Home size={24} />, color: 'blue' },
    { label: 'Laki-Laki', value: stats?.laki_laki, icon: <UserCheck size={24} />, color: 'indigo' },
    { label: 'Perempuan', value: stats?.perempuan, icon: <UserCheck size={24} />, color: 'pink' },
  ];

  return (
    <main className="min-h-screen bg-white pb-20 pt-32 md:pt-40">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-emerald-700 mb-8 font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Kembali
        </Link>

        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <Activity size={12} /> Data Kependudukan Terintegrasi
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            Cibatu <br/> <span className="text-emerald-700">Dalam Angka</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl">
            Transparansi data kependudukan Desa Cibatu yang diperbarui secara berkala untuk perencanaan pembangunan yang lebih baik.
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {mainStats.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-${item.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</h4>
              <p className="text-3xl font-black text-slate-900 tabular-nums">
                {item.value?.toLocaleString('id-ID')}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Education Breakdown */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <GraduationCap className="text-emerald-400" /> Tingkat Pendidikan
            </h3>
            <div className="space-y-6">
              {Object.entries(stats?.pendidikan || {}).map(([label, value], idx) => {
                const percentage = (value / stats.total_penduduk) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-emerald-400">{value} Jiwa</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percentage, 5)}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job Breakdown */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900">
              <Briefcase className="text-emerald-600" /> Profil Pekerjaan
            </h3>
            <div className="space-y-6">
              {Object.entries(stats?.pekerjaan || {}).map(([label, value], idx) => {
                const percentage = (value / stats.total_penduduk) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-emerald-700">{value} Orang</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percentage, 5)}%` }}
                        className="h-full bg-emerald-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Age Groups Summary */}
        <div className="mt-12 bg-emerald-700 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">Struktur Demografi</h3>
            <p className="text-emerald-100 font-medium">Mayoritas penduduk Desa Cibatu berada pada usia produktif.</p>
          </div>
          <div className="flex gap-12 relative z-10">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-emerald-300">Usia Produktif</p>
              <p className="text-5xl font-black">{stats?.usia_produktif?.toLocaleString('id-ID')}</p>
              <p className="text-[10px] font-bold mt-1 text-emerald-200">15 - 64 Tahun</p>
            </div>
            <div className="w-px h-16 bg-emerald-600" />
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-emerald-300">Lanjut Usia</p>
              <p className="text-5xl font-black">{stats?.usia_lansia?.toLocaleString('id-ID')}</p>
              <p className="text-[10px] font-bold mt-1 text-emerald-200">65+ Tahun</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
