'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, MapPin, Building, Phone, Mail, Globe, 
  Award, FileText, Users2, Briefcase, Landmark,
  MessageCircle, Camera, PlayCircle, Share2
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import SectionTitle from '@/components/ui/SectionTitle';
import StateMessage from '@/components/ui/StateMessage';

export default function ProfilDesaPage() {
  const [data, setData] = useState({
    desa: null,
    statistics: null,
    struktur: null,
    social_media: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resDesa, resStats, resStruktur] = await Promise.all([
          fetch('/api/proxy/desa-info'),
          fetch('/api/proxy/statistics'),
          fetch('/api/proxy/struktur-desa')
        ]);

        const desaData = await resDesa.json();
        const statsData = await resStats.json();
        const strukturData = await resStruktur.json();

        setData({
          desa: desaData?.data?.desa || desaData?.data || null,
          statistics: statsData?.data || null,
          struktur: strukturData?.grouped || strukturData?.data || null,
          social_media: desaData?.data?.social_media || null
        });
      } catch (err) {
        console.error("Gagal memuat profil desa:", err);
        setError("Gagal memuat data profil desa. Periksa koneksi Anda.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-slate-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-slate-700 animate-pulse">Memuat Profil Desa...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pb-20 bg-slate-50 pt-32 flex items-center justify-center">
        <StateMessage 
          type="error"
          title="Gagal Memuat Data"
          message={error}
          actionLabel="Coba Lagi"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const { desa, statistics, struktur, social_media } = data;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <PageHeader 
        title={<>Profil <span className="text-emerald-700">Desa Cibatu</span></>}
        description="Informasi lengkap mengenai data kependudukan, wilayah, dan struktur organisasi Pemerintah Desa."
        breadcrumbs={[
          { label: 'Informasi' },
          { label: 'Profil Desa', href: '/info/profil-desa' }
        ]}
      />

      <div className="container mx-auto px-6 max-w-6xl mt-12">
        
        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlassCard padding="p-8" className="text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
              <Users size={28} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Total Penduduk</h4>
            <p className="text-4xl font-black text-slate-900 relative z-10">{statistics?.total_penduduk?.toLocaleString('id-ID') || '0'}</p>
            <p className="text-xs text-slate-500 font-bold mt-2 relative z-10">Jiwa</p>
          </GlassCard>

          <GlassCard padding="p-8" className="text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
              <Building size={28} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Total Keluarga</h4>
            <p className="text-4xl font-black text-slate-900 relative z-10">{statistics?.total_kk?.toLocaleString('id-ID') || '0'}</p>
            <p className="text-xs text-slate-500 font-bold mt-2 relative z-10">Kepala Keluarga</p>
          </GlassCard>

          <GlassCard padding="p-8" className="text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
              <MapPin size={28} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Wilayah Administratif</h4>
            <p className="text-4xl font-black text-slate-900 relative z-10">{desa?.kecamatan || 'Cibatu'}</p>
            <p className="text-xs text-slate-500 font-bold mt-2 relative z-10">Kecamatan</p>
          </GlassCard>
        </div>

        {/* Info Desa */}
        <SectionTitle title="Informasi Desa" subtitle="Data dan kontak resmi pemerintah Desa Cibatu" />
        <GlassCard className="mb-24" padding="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Alamat Lengkap</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{desa?.alamat_lengkap || 'Kantor Desa Cibatu, Purwakarta, Jawa Barat'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Telepon</h4>
                  <p className="text-slate-600 text-sm">{desa?.telepon || '-'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Email</h4>
                  <p className="text-slate-600 text-sm">{desa?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Globe size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Website</h4>
                  <p className="text-slate-600 text-sm">{desa?.website || '-'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {social_media && (social_media.facebook || social_media.instagram || social_media.youtube || social_media.whatsapp) && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-4">Media Sosial Resmi</h4>
              <div className="flex flex-wrap gap-4">
                {social_media.facebook && (
                  <a href={social_media.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
                    <Share2 size={18} />
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                )}
                {social_media.instagram && (
                  <a href={social_media.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full hover:bg-pink-100 transition-colors">
                    <Camera size={18} />
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                )}
                {social_media.youtube && (
                  <a href={social_media.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition-colors">
                    <PlayCircle size={18} />
                    <span className="text-sm font-medium">YouTube</span>
                  </a>
                )}
                {social_media.whatsapp && (
                  <a href={social_media.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Struktur Organisasi */}
        <SectionTitle title="Struktur Pemerintahan" subtitle="Aparatur Desa Cibatu yang siap melayani masyarakat" />
        
        {struktur ? (
          (() => {
            // Flatten all arrays from grouped data
            const allStruktur = [];
            Object.values(struktur).forEach(arr => {
              if (Array.isArray(arr)) allStruktur.push(...arr);
            });

            // Smart parsing by kategori and jabatan text
            const isMatch = (item, prefixes, keywords) => {
               if (item.kategori && prefixes.some(p => item.kategori.startsWith(p))) return true;
               const j = (item.jabatan || '').toLowerCase();
               return keywords.some(k => j.includes(k));
            };

            const kades = allStruktur.filter(i => isMatch(i, ['kepala_desa'], ['kepala desa', 'kades']));
            const sekdes = allStruktur.filter(i => isMatch(i, ['sekretaris'], ['sekretaris', 'sekdes']) && !kades.includes(i));
            const bendahara = allStruktur.filter(i => isMatch(i, ['bendahara'], ['bendahara']) && !kades.includes(i) && !sekdes.includes(i));
            const kaur = allStruktur.filter(i => isMatch(i, ['kaur', 'staf_kaur'], ['kaur', 'urusan']) && !kades.includes(i) && !sekdes.includes(i) && !bendahara.includes(i));
            
            const kasi = allStruktur.filter(i => isMatch(i, ['kasi'], ['kasi ', 'seksi']) && !kades.includes(i) && !sekdes.includes(i) && !bendahara.includes(i) && !kaur.includes(i));
            
            const kadus = allStruktur.filter(i => isMatch(i, ['kepala_dusun'], ['dusun', 'kadus']) && !kades.includes(i) && !sekdes.includes(i) && !bendahara.includes(i) && !kaur.includes(i) && !kasi.includes(i));
            const rtrw = allStruktur.filter(i => isMatch(i, ['ketua_rt', 'ketua_rw'], ['rt', 'rw']) && !kadus.includes(i) && !kades.includes(i) && !sekdes.includes(i));
            const bumdes = allStruktur.filter(i => isMatch(i, ['ketua_bumdes'], ['bumdes']) && !rtrw.includes(i) && !kadus.includes(i) && !kades.includes(i));

            const assigned = new Set([...kades, ...sekdes, ...bendahara, ...kaur, ...kasi, ...kadus, ...rtrw, ...bumdes]);
            const lainnya = allStruktur.filter(i => !assigned.has(i));

            return (
              <div className="space-y-16">
                
                {/* 1. Kepala Desa (Puncak Hierarki) */}
                {kades.length > 0 && (
                  <div className="flex flex-col items-center relative">
                    <div className="w-full max-w-2xl relative z-10">
                      {kades.map((item, idx) => (
                        <motion.div key={item.id || idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                          <div className="bg-white rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 border-emerald-500 text-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                            <div className="w-24 h-24 bg-emerald-100 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
                              <Award size={48} className="text-emerald-600" />
                            </div>
                            <h3 className="text-3xl font-black mb-2 text-slate-800 drop-shadow-sm">{item.nama}</h3>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full font-bold text-emerald-700 text-sm mb-4 border border-emerald-200">
                              {item.jabatan}
                            </div>
                            {item.no_hp && <p className="text-slate-600 text-sm font-medium">HP: {item.no_hp}</p>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {/* Vertical line connecting Kades to branches */}
                    <div className="hidden lg:block w-0.5 h-12 bg-emerald-300 relative z-0"></div>
                  </div>
                )}

                {/* Cabang Kiri (Sekretariat) & Kanan (Pelaksana Teknis) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative lg:-mt-16 z-10">
                  
                  {/* Garis Horizontal Cabang */}
                  <div className="hidden lg:block absolute top-0 left-1/4 w-2/4 h-0.5 bg-emerald-300"></div>

                  {/* KIRI: Sekretaris & Kaur */}
                  <div className="flex flex-col items-center relative">
                    <div className="hidden lg:block absolute top-0 left-1/2 w-0.5 h-8 bg-emerald-300 -translate-x-1/2"></div>
                    
                    <div className="w-full mt-0 lg:mt-8">
                      <div className="flex justify-center mb-6">
                        <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">
                          Sekretariat Desa
                        </div>
                      </div>

                      {/* Sekretaris */}
                      {sekdes.length > 0 && (
                        <div className="flex justify-center mb-8 relative">
                          <div className="w-full max-w-sm relative z-10">
                            {sekdes.map((item, idx) => (
                              <GlassCard key={item.id || idx} padding="p-6" className="flex items-center gap-5 border-t-4 border-t-blue-500 shadow-lg text-left h-full">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                  <FileText size={28} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-black text-slate-800 mb-1 leading-tight">{item.nama}</h4>
                                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{item.jabatan}</p>
                                  {item.no_hp && <p className="text-xs text-slate-500 font-medium mt-1">HP: {item.no_hp}</p>}
                                </div>
                              </GlassCard>
                            ))}
                          </div>
                          <div className="absolute bottom-[-2rem] left-1/2 w-0.5 h-8 bg-blue-200 -translate-x-1/2 z-0"></div>
                        </div>
                      )}

                      {/* Kaur & Bendahara */}
                      {(kaur.length > 0 || bendahara.length > 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                          {[...bendahara, ...kaur].map((item, idx) => (
                            <GlassCard key={item.id || idx} padding="p-5" className="border-l-4 border-l-blue-400 group hover:border-blue-400 hover:shadow-md transition-all text-left h-full flex flex-col justify-center">
                              <h4 className="font-black text-slate-800 text-md leading-tight mb-1">{item.nama}</h4>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{item.jabatan}</p>
                              {item.no_hp && <p className="text-xs text-slate-500 font-medium mt-2">HP: {item.no_hp}</p>}
                            </GlassCard>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KANAN: Pelaksana Teknis (Kasi) */}
                  <div className="flex flex-col items-center relative">
                    <div className="hidden lg:block absolute top-0 left-1/2 w-0.5 h-8 bg-emerald-300 -translate-x-1/2"></div>
                    
                    <div className="w-full mt-0 lg:mt-8">
                      <div className="flex justify-center mb-6">
                        <div className="bg-rose-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">
                          Pelaksana Teknis (Kasi)
                        </div>
                      </div>

                      {kasi.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {kasi.map((item, idx) => (
                            <GlassCard key={item.id || idx} padding="p-5" className="border-l-4 border-l-rose-400 group hover:border-rose-400 hover:shadow-md transition-all text-left h-full flex flex-col justify-center">
                              <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                  <Briefcase size={20} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-black text-slate-800 text-md leading-tight mb-1">{item.nama}</h4>
                                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">{item.jabatan}</p>
                                </div>
                              </div>
                            </GlassCard>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* 4. Kepala Kewilayahan (Kadus) */}
                {kadus.length > 0 && (
                  <div className="mt-20 border-t border-slate-200 pt-16 relative">
                    <div className="absolute top-0 left-1/2 w-0.5 h-8 bg-slate-200 -translate-x-1/2"></div>
                    <div className="flex flex-col items-center mb-8">
                      <div className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">
                        Kepala Kewilayahan (Kadus)
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {kadus.map((item, idx) => (
                        <div key={item.id || idx} className="bg-white border-b-4 border-amber-500 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:-translate-y-1 transition-transform h-full flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 shrink-0">
                            <MapPin size={20} />
                          </div>
                          <h4 className="font-bold text-slate-800 mb-1">{item.nama}</h4>
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{item.jabatan}</p>
                          {item.dusun && (
                            <p className="text-xs text-slate-500 mt-2">
                              {item.dusun.toLowerCase().includes('dusun') ? item.dusun : `Dusun ${item.dusun}`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Lembaga Desa / RT RW / Lainnya */}
                {(bumdes.length > 0 || rtrw.length > 0 || lainnya.length > 0) && (
                  <div className="mt-16 pt-12 border-t border-slate-200 border-dashed">
                    
                    {/* BUMDes & Lembaga Lain */}
                    {(bumdes.length > 0 || lainnya.length > 0) && (
                      <div className="mb-12">
                        <h3 className="text-xl font-black text-slate-800 mb-6 text-center">Lembaga Desa & Staf Lainnya</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[...bumdes, ...lainnya].map((item, idx) => (
                            <GlassCard key={item.id || idx} padding="p-5" className="flex items-center gap-4 h-full">
                              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                                <Landmark size={24} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-800">{item.nama}</h4>
                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{item.jabatan}</p>
                              </div>
                            </GlassCard>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RT RW */}
                    {rtrw.length > 0 && (
                      <div>
                        <h3 className="text-xl font-black text-slate-800 mb-6 text-center">Ketua RT & RW</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {rtrw.map((item, idx) => {
                            const isRt = item.kategori === 'ketua_rt' || (item.jabatan || '').toLowerCase().includes('rt');
                            return (
                              <div key={item.id || idx} className={`bg-slate-50 hover:bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm transition-all h-full flex flex-col justify-center ${isRt ? 'hover:border-emerald-300' : 'hover:border-blue-300'}`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isRt ? 'text-emerald-600' : 'text-blue-600'}`}>
                                  {item.jabatan}
                                </p>
                                <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{item.nama}</h4>
                                {(item.rt || item.rw) && (
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    {item.rt ? `RT ${item.rt}` : ''} {item.rw ? `RW ${item.rw}` : ''}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })()
        ) : (
          <StateMessage 
            type="empty"
            title="Struktur Pemerintahan Kosong"
            message="Data perangkat desa belum ditambahkan oleh administrator."
          />
        )}

      </div>
    </main>
  );
}
