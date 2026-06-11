'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, FileSearch, WifiOff } from 'lucide-react';
import Button from './Button';

export default function StateMessage({ 
  type = 'empty', // 'empty', 'error', 'offline'
  title, 
  message, 
  actionLabel, 
  onAction 
}) {
  const config = {
    empty: {
      icon: <FileSearch size={48} className="text-slate-400" />,
      defaultTitle: "Data Tidak Ditemukan",
      defaultMessage: "Belum ada data yang dapat ditampilkan untuk saat ini.",
      bgColor: "bg-slate-50",
      iconBg: "bg-white"
    },
    error: {
      icon: <AlertCircle size={48} className="text-rose-500" />,
      defaultTitle: "Terjadi Kesalahan",
      defaultMessage: "Gagal memuat data dari server. Silakan coba beberapa saat lagi.",
      bgColor: "bg-rose-50",
      iconBg: "bg-white"
    },
    offline: {
      icon: <WifiOff size={48} className="text-orange-500" />,
      defaultTitle: "Koneksi Terputus",
      defaultMessage: "Pastikan perangkat Anda terhubung ke internet dan coba lagi.",
      bgColor: "bg-orange-50",
      iconBg: "bg-white"
    }
  };
  const current = config[type] || config.empty;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center p-12 text-center rounded-[2rem] border border-white/50 ${current.bgColor}`}
    >
      <div className={`w-24 h-24 flex items-center justify-center rounded-3xl mb-6 shadow-sm ${current.iconBg}`}>
        {current.icon}
      </div>
      
      <h3 className="text-2xl font-black text-slate-900 mb-3">
        {title || current.defaultTitle}
      </h3>
      
      <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
        {message || current.defaultMessage}
      </p>

      {onAction && actionLabel && (
        <Button 
          variant={type === 'error' ? 'danger' : 'primary'} 
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
