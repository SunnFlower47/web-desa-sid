'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Menu, X, FileText, CheckCircle2, Megaphone, Home, Phone, BarChart3, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Kunci scroll background (body) saat menu HP terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Beranda', href: '/', icon: <Home size={18} /> },
    { name: 'Berita', href: '/info/berita', icon: <Newspaper size={18} /> },
    { name: 'Ajukan Surat', href: '/layanan/surat', icon: <FileText size={18} /> },
    { name: 'Cek Status', href: '/layanan/status', icon: <CheckCircle2 size={18} /> },
    { name: 'Statistik', href: '/info/statistik', icon: <BarChart3 size={18} /> },
    { name: 'Lapor', href: '/layanan/pengaduan', icon: <Megaphone size={18} /> },
    { name: 'Kontak', href: '/layanan/kontak', icon: <Phone size={18} /> },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-4 md:px-8 py-4 ${
        isScrolled ? 'top-0' : 'top-2'
      }`}>
        <div className={`container mx-auto max-w-7xl rounded-[2rem] transition-all duration-700 ${
          isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl shadow-emerald-950/10 py-3 px-6 border border-white' 
          : 'bg-slate-950/20 backdrop-blur-md shadow-xl py-4 px-6 border border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white group-hover:rotate-[15deg] transition-all duration-500 shadow-xl glow-primary">
                <Landmark size={24} />
              </div>
              <div className="flex flex-col">
                <span className={`font-black text-xl leading-none tracking-tighter transition-colors ${
                  isScrolled ? 'text-slate-900' : 'text-white'
                }`}>
                  Cibatu<span className="text-emerald-500">Vibe</span>
                </span>
                <span className={`text-[9px] font-black uppercase tracking-[0.4em] transition-colors ${
                  isScrolled ? 'text-emerald-600' : 'text-emerald-400'
                }`}>Digital Village</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className={`hidden md:flex items-center gap-1 p-1.5 rounded-2xl border transition-colors ${
              isScrolled ? 'bg-slate-900/5 border-slate-900/5' : 'bg-white/5 border-white/10'
            }`}>
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5 ${
                    pathname === link.href 
                    ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 scale-105' 
                    : isScrolled 
                      ? 'text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-lg' 
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={pathname === link.href ? 'text-emerald-100' : isScrolled ? 'text-slate-400' : 'text-slate-300'}>
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg transition-colors ${
                isScrolled ? 'bg-white text-slate-900' : 'bg-slate-900/50 text-white border border-white/10'
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-40 glass p-6 pt-32 overflow-y-auto"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-6 rounded-[2rem] text-sm font-black uppercase tracking-widest flex items-center gap-5 transition-all ${
                    pathname === link.href 
                    ? 'bg-primary text-white shadow-2xl shadow-emerald-900/20' 
                    : 'bg-white/50 text-slate-600 border border-white'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${pathname === link.href ? 'bg-white/20 text-white' : 'bg-primary text-white'}`}>
                    {link.icon}
                  </div>
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
