import React from 'react';
import Link from 'next/link';
import { Landmark, Camera, Link as LinkIcon, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg glow-primary">
                <Landmark size={20} />
              </div>
              <span className="font-black text-xl tracking-tighter italic">Cibatu<span className="text-emerald-500">Purwakarta</span></span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Membangun ekosistem pemerintahan desa yang cerdas, transparan, dan inovatif di Kabupaten Purwakarta.
            </p>
            
            {/* Social Links */}
            <div className="mt-8">
              <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mb-4">Sosial Media Arsitek Digital</p>
              <div className="flex items-center gap-4">
                <a href="https://instagram.com/ridwan.snflr" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500 transition-all overflow-hidden p-1.5">
                  <img src="/assets/images/icons8-instagram-48.png" alt="Instagram" className="w-full h-full object-contain" />
                </a>
                <a href="https://www.linkedin.com/in/ridwan-andrian-ra7474/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500 transition-all overflow-hidden p-1.5">
                  <img src="/assets/images/icons8-linkedin-60.png" alt="LinkedIn" className="w-full h-full object-contain" />
                </a>
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
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Pemerintah Desa Cibatu Purwakarta.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            Crafted with <Heart size={10} className="text-red-500" /> by <span className="text-emerald-500 glow-primary font-black">Ridwan Andrian</span>
            <span className="mx-2 text-slate-700">|</span>
            Built with <span className="text-white font-black">Antigravity AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
