'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Landmark, MessageCircle } from 'lucide-react';

const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16.11 11.64A5 5 0 0 1 12 17a5 5 0 0 1-4.11-5.36 5 5 0 0 1 9.22 0z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <path d="m10 15 5-3-5-3z"/>
  </svg>
);
import api from '@/lib/api';

export default function Footer() {
  const [social, setSocial] = useState({
    facebook: null,
    instagram: null,
    whatsapp: null,
    youtube: null
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get('/public-statistics/info-desa');
        if (res?.data?.success && res.data.data?.social) {
          setSocial(res.data.data.social);
        }
      } catch (err) {
        console.error('Failed to fetch desa info', err);
      }
    };
    fetchInfo();
  }, []);

  return (
    <footer className="bg-slate-950 text-white pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg glow-primary">
                <Landmark size={20} />
              </div>
              <span className="font-black text-xl tracking-tighter italic">Desa<span className="text-emerald-500">Cibatu</span></span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Membangun ekosistem pemerintahan desa yang cerdas, transparan, dan inovatif di Kabupaten Purwakarta.
            </p>
            
            {/* Social Links */}
            <div className="mt-8">
              <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-4">Sosial Media Resmi Desa</p>
              <div className="flex items-center gap-4">
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all overflow-hidden p-1.5">
                    <FacebookIcon size={18} />
                  </a>
                )}
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all overflow-hidden p-1.5">
                    <InstagramIcon size={18} />
                  </a>
                )}
                {social.whatsapp && (
                  <a href={social.whatsapp} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all overflow-hidden p-1.5">
                    <MessageCircle size={18} />
                  </a>
                )}
                {social.youtube && (
                  <a href={social.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all overflow-hidden p-1.5">
                    <YoutubeIcon size={18} />
                  </a>
                )}
                
                {/* Fallback if no social media */}
                {(!social.facebook && !social.instagram && !social.whatsapp && !social.youtube) && (
                  <p className="text-xs text-slate-500 italic">Belum ada tautan sosial media</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-16">
            <div>
              <h4 className="font-black text-[9px] uppercase tracking-[0.2em] text-emerald-500 mb-5">Layanan Pintar</h4>
              <ul className="space-y-4 text-xs font-bold text-slate-300">
                <li><Link href="/layanan/surat" className="hover:text-emerald-400 transition-colors">Administrasi Online</Link></li>
                <li><Link href="/layanan/status" className="hover:text-emerald-400 transition-colors">Lacak Dokumen</Link></li>
                <li><Link href="/layanan/pengaduan" className="hover:text-emerald-400 transition-colors">Lapor Desa</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-[9px] uppercase tracking-[0.2em] text-emerald-500 mb-5">Pusat Info</h4>
              <ul className="space-y-4 text-xs font-bold text-slate-300">
                <li><Link href="/info/berita" className="hover:text-emerald-400 transition-colors">Warta Terkini</Link></li>
                <li><Link href="/info/statistik" className="hover:text-emerald-400 transition-colors">Data Publik</Link></li>
                <li><Link href="/layanan/kontak" className="hover:text-emerald-400 transition-colors">Hubungi Kami</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-6">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Pemerintah Desa Cibatu Purwakarta.
          </p>
        </div>
      </div>
    </footer>
  );
}
