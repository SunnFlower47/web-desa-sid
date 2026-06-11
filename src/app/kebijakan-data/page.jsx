'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Users, Lock, Eye, CheckCircle, AlertTriangle, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';

export default function KebijakanDataPage() {
  const sections = [
    {
      id: 'tujuan',
      title: 'Tujuan Kebijakan Data',
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      content: [
        'Meningkatkan transparansi dan akuntabilitas pemerintahan desa',
        'Memfasilitasi akses informasi publik sesuai dengan UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik',
        'Mendorong partisipasi masyarakat dalam pembangunan desa',
        'Mendukung pengambilan keputusan berbasis data yang akurat'
      ]
    },
    {
      id: 'ruang-lingkup',
      title: 'Ruang Lingkup',
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      content: [
        'Data kependudukan dan demografi desa',
        'Data ekonomi dan UMKM',
        'Data infrastruktur dan fasilitas umum',
        'Data statistik pembangunan desa',
        'Data layanan publik dan administrasi'
      ]
    },
    {
      id: 'prinsip-dasar',
      title: 'Prinsip Dasar',
      icon: <Shield className="w-6 h-6 text-indigo-400" />,
      content: [
        'Transparansi: Data publik harus dapat diakses dengan mudah',
        'Akurasi: Data yang disajikan harus akurat dan terbaru',
        'Keterbukaan: Informasi publik harus terbuka kecuali yang dikecualikan',
        'Perlindungan Privasi: Data pribadi warga harus dilindungi',
        'Keadilan: Akses data harus merata untuk semua pihak'
      ]
    }
  ];

  const dataTypes = [
    {
      category: 'Data Terbuka',
      description: 'Data yang dapat diakses dan digunakan oleh publik',
      examples: [
        'Statistik kependudukan agregat',
        'Data UMKM (tanpa informasi pribadi)',
        'Informasi fasilitas umum',
        'Data pembangunan infrastruktur',
        'Laporan keuangan desa'
      ],
      icon: <Eye className="w-6 h-6 text-emerald-400" />,
      borderColor: 'border-emerald-500/20',
      bgColor: 'bg-emerald-950/20'
    },
    {
      category: 'Data Terbatas',
      description: 'Data yang memerlukan persetujuan khusus untuk akses',
      examples: [
        'Data penduduk dengan identitas terbatas',
        'Informasi keuangan detail',
        'Data perencanaan pembangunan',
        'Dokumen internal pemerintahan'
      ],
      icon: <Lock className="w-6 h-6 text-amber-400" />,
      borderColor: 'border-amber-500/20',
      bgColor: 'bg-amber-950/20'
    },
    {
      category: 'Data Rahasia',
      description: 'Data yang tidak dapat diakses publik',
      examples: [
        'Data pribadi warga (NIK, alamat detail)',
        'Informasi keamanan desa',
        'Data medis warga',
        'Informasi keluarga yang sensitif'
      ],
      icon: <Shield className="w-6 h-6 text-rose-400" />,
      borderColor: 'border-rose-500/20',
      bgColor: 'bg-rose-950/20'
    }
  ];

  return (
    <main className="min-h-screen bg-white pb-20">
      <PageHeader 
        title={<>Kebijakan <br/> <span className="text-emerald-700">Data Desa</span></>}
        description="Transparansi, akuntabilitas, dan perlindungan privasi data warga dalam ekosistem pemerintahan Desa Cibatu."
        breadcrumbs={[
          { label: 'Informasi' },
          { label: 'Kebijakan Data', href: '/kebijakan-data' }
        ]}
        containerClassName="max-w-5xl px-6"
      />
      <div className="container mx-auto px-6 max-w-5xl mt-8">

        {/* Intro Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 md:p-10 mb-8 flex flex-col md:flex-row gap-6 items-start"
        >
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
            <Info size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4">Tentang Kebijakan Data</h2>
            <p className="text-slate-600 font-medium leading-relaxed mb-4">
              Kebijakan Data Desa Cibatu merupakan pedoman dalam pengelolaan, penyimpanan, dan akses
              terhadap data dan informasi publik. Kebijakan ini dibuat untuk memastikan transparansi
              pemerintahan desa sambil tetap melindungi privasi dan keamanan data warga.
            </p>
            <p className="text-slate-600 font-medium leading-relaxed">
              Kebijakan ini mengacu pada Undang-Undang No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik
              dan Peraturan Menteri Dalam Negeri No. 47 Tahun 2016 tentang Pedoman Umum Tata Kelola
              Pemerintahan Desa.
            </p>
          </div>
        </motion.div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 text-white relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                {section.icon}
              </div>
              <h3 className="text-lg font-black mb-4 tracking-tight leading-tight">{section.title}</h3>
              <ul className="space-y-3 mt-auto">
                {section.content.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium leading-relaxed">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Classification */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <Lock className="text-emerald-600" size={24} /> Klasifikasi Keterbukaan Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataTypes.map((type, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className={`p-8 rounded-[2.5rem] border ${type.borderColor} ${type.bgColor} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/5 flex items-center justify-center">
                      {type.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-950 text-base leading-none">{type.category}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">{type.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {type.examples.map((ex, exIdx) => (
                      <li key={exIdx} className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Restrictions & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Restrictions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="p-8 bg-amber-50 border border-amber-200 rounded-[2.5rem] flex flex-col gap-6"
          >
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-3">Pembatasan Akses</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Informasi yang dikecualikan</p>
              <ul className="space-y-2">
                {[
                  'Perlindungan privasi dan data pribadi warga',
                  'Keamanan wilayah desa dan ketertiban umum',
                  'Rahasia dagang dan informasi komersial UMKM',
                  'Informasi yang dapat merugikan hak-hak pihak ketiga',
                  'Dokumen hukum yang sedang dalam proses investigasi'
                ].map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="p-8 bg-emerald-950 text-white rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />
            <div>
              <h3 className="text-xl font-black mb-2">Kontak & Keamanan Data</h3>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-6">Hubungi petugas PPID desa</p>
              <div className="space-y-4 text-xs font-semibold text-slate-300">
                <p>
                  <strong className="text-white">Alamat:</strong> Jl. Cibatu Km. 15, Desa Cibatu, Kec. Cibatu, Kab. Purwakarta, Jawa Barat 41161
                </p>
                <p>
                  <strong className="text-white">Email:</strong> desacibatu.2001@gmail.com
                </p>
                <p>
                  <strong className="text-white">Telepon:</strong> +62 838-7982-7147
                </p>
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-6">
              Dokumen pembaruan: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
