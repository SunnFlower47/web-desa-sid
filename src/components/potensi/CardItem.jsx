'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Building2, Store, Clock, Users, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getImageUrl } from '@/lib/api';

export default function CardItem({ data, type, index }) {
  const isUmkm = type === 'umkm';
  
  // Normalize fields between UMKM and Fasilitas
  const id = data.id;
  const name = isUmkm ? data.nama_usaha : data.nama;
  const category = isUmkm ? data.jenis_usaha : data.jenis;
  const description = isUmkm ? data.deskripsi_usaha : data.deskripsi;
  const address = isUmkm ? data.alamat_usaha : data.alamat;
  const photos = isUmkm ? data.foto_usaha : (data.foto ? [data.foto] : []);
  const phone = isUmkm ? data.no_telepon : data.kontak;
  
  const mainPhoto = photos && photos.length > 0 ? getImageUrl(photos[0]) : null;

  const bgGradient = isUmkm 
    ? 'from-amber-50 to-orange-50' 
    : 'from-blue-50 to-indigo-50';
    
  const badgeColor = isUmkm
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-blue-100 text-blue-700 border-blue-200';

  const iconColor = isUmkm ? 'text-amber-500' : 'text-blue-500';
  const Icon = isUmkm ? Store : Building2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <GlassCard 
        padding="p-0" 
        className="h-full flex flex-col bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
      >
        {/* Photo Section */}
        <div className={`h-48 w-full relative overflow-hidden bg-gradient-to-br ${bgGradient}`}>
          {mainPhoto ? (
            <img 
              src={mainPhoto} 
              alt={name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <Icon className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-widest">Tidak Ada Foto</p>
            </div>
          )}
          
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm backdrop-blur-md bg-white/90 ${badgeColor}`}>
              {category}
            </div>
          </div>
          
          {isUmkm && data.is_unggulan && (
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm backdrop-blur-md bg-emerald-500/90 text-white flex items-center gap-1">
                ★ Unggulan
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
              {name}
            </h3>
          </div>
          
          <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4 flex-1">
            {description || 'Tidak ada deskripsi tersedia untuk tempat ini.'}
          </p>

          <div className="space-y-2 mt-auto pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2 text-xs text-slate-600 font-medium">
              <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
              <span className="line-clamp-1">{address} {data.rt_label ? `(RT ${data.rt_label}/RW ${data.rw_label})` : ''}</span>
            </div>
            
            {phone && (
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Phone className={`w-4 h-4 shrink-0 ${iconColor}`} />
                <span>{phone}</span>
              </div>
            )}
            
            {!isUmkm && data.jam_operasional && (
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Clock className={`w-4 h-4 shrink-0 ${iconColor}`} />
                <span>{data.jam_operasional}</span>
              </div>
            )}

            {isUmkm && data.nama_pemilik && (
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Users className={`w-4 h-4 shrink-0 ${iconColor}`} />
                <span>{data.nama_pemilik}</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
