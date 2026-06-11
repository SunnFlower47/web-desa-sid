'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, Target, Users, MapPin, 
  Calendar, Eye, HeartHandshake, History 
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import SectionTitle from '@/components/ui/SectionTitle';

export default function TentangDesaPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <PageHeader 
        title={<>Tentang <span className="text-emerald-700">Desa Cibatu</span></>}
        description="Pelajari sejarah, visi misi, dan perkembangan Desa Cibatu dari daerah agraris menjadi sentra industri dengan keragaman budaya."
        breadcrumbs={[
          { label: 'Informasi' },
          { label: 'Tentang Desa', href: '/info/tentang-desa' }
        ]}
      />

      <div className="container mx-auto px-6 max-w-6xl mt-12">
        
        {/* Intro */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 leading-relaxed"
          >
            Desa Cibatu adalah desa yang terletak di Kecamatan Cibatu, Kabupaten Purwakarta, Provinsi Jawa Barat.
            Didirikan pada tahun 1860 dengan kepala desa pertama Ki Arpan, desa ini berkembang dari daerah agraris
            menjadi sentra industri dengan keragaman penduduk yang tinggi dari berbagai suku dan budaya.
          </motion.p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <GlassCard className="text-center h-full hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Masyarakat Sejahtera</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Meningkatkan kesejahteraan masyarakat melalui program-program unggulan yang tepat sasaran.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <GlassCard className="text-center h-full hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Visi Masa Depan</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Menjadi desa yang maju, mandiri, dan berkelanjutan menuju era modernisasi.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <GlassCard className="text-center h-full hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <HeartHandshake size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">Gotong Royong</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Mempertahankan nilai-nilai kebersamaan dan gotong royong warisan leluhur.
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Visi Misi */}
        <SectionTitle 
          title="Arah & Tujuan" 
          subtitle="Landasan kami dalam membangun dan memajukan Desa Cibatu"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] p-8 md:p-12 border border-emerald-100 h-full relative overflow-hidden shadow-lg shadow-emerald-900/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              
              <div className="flex items-center gap-4 mb-8 relative">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <Eye size={28} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Visi</h2>
              </div>
              
              <blockquote className="text-xl md:text-2xl text-slate-700 font-medium leading-relaxed relative z-10 italic">
                "Terwujudnya Desa Cibatu yang maju, mandiri, sejahtera, dan berkelanjutan melalui peningkatan kualitas sumber daya manusia, pengembangan ekonomi kerakyatan, dan pelestarian lingkungan hidup."
              </blockquote>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <GlassCard className="h-full border-slate-200" padding="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <Target size={28} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Misi</h2>
              </div>
              
              <ul className="space-y-6 relative z-10">
                {[
                  "Meningkatkan kualitas pelayanan publik yang transparan dan akuntabel",
                  "Mengembangkan ekonomi kerakyatan berbasis potensi lokal",
                  "Meningkatkan kualitas pendidikan dan kesehatan masyarakat",
                  "Melestarikan nilai-nilai budaya dan gotong royong"
                ].map((misi, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm shrink-0 border border-emerald-100 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 text-lg font-medium pt-0.5 leading-relaxed">
                      {misi}
                    </p>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        </div>

        {/* Profil Singkat (Mini Stats) */}
        <SectionTitle 
          title="Fakta Singkat" 
          subtitle="Sekilas info mengenai profil dasar Desa Cibatu"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
          {[
            { title: "Tahun Berdiri", value: "1860", icon: <Calendar />, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Kepala Desa I", value: "Ki Arpan", icon: <History />, color: "text-rose-600", bg: "bg-rose-50" },
            { title: "Lokasi", value: "Purwakarta", icon: <MapPin />, color: "text-emerald-600", bg: "bg-emerald-50" },
            { title: "Karakteristik", value: "Industri", icon: <Building />, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard padding="p-6 md:p-8" className="text-center h-full hover:bg-white transition-colors">
                <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</h4>
                <p className="text-xl md:text-2xl font-black text-slate-800">{stat.value}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
