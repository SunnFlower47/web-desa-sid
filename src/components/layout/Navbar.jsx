'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, Menu, X, FileText, CheckCircle2, Megaphone, Home, 
  Phone, BarChart3, Newspaper, Users, ChevronDown, Info, 
  UserCircle, Map, Eye, Send, Search, AlertTriangle, HeartHandshake, 
  Star, Shield 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
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

  const navItems = [
    { name: 'Beranda', href: '/', icon: <Home size={18} /> },
    { 
      name: 'Profil', 
      icon: <Users size={18} />, 
      subItems: [
        { name: 'Tentang Desa', href: '/info/tentang-desa', icon: <Info size={16} /> },
        { name: 'Profil Desa', href: '/info/profil-desa', icon: <UserCircle size={16} /> },
        { name: 'Peta Desa', href: '/info/peta-desa', icon: <Map size={16} /> },
      ]
    },
    { 
      name: 'Layanan', 
      icon: <FileText size={18} />,
      subItems: [
        { name: 'Ajukan Surat', href: '/layanan/surat', icon: <Send size={16} /> },
        { name: 'Cek Status', href: '/layanan/status', icon: <Search size={16} /> },
        { name: 'Pengaduan', href: '/layanan/pengaduan', icon: <AlertTriangle size={16} /> },
        { name: 'Bantuan Sosial', href: '/layanan/bantuan-sosial', icon: <HeartHandshake size={16} /> },
      ]
    },
    { 
      name: 'Informasi', 
      icon: <Newspaper size={18} />,
      subItems: [
        { name: 'Berita', href: '/info/berita', icon: <Newspaper size={16} /> },
        { name: 'Statistik', href: '/info/statistik', icon: <BarChart3 size={16} /> },
        { name: 'Transparansi', href: '/info/transparansi', icon: <Eye size={16} /> },
        { name: 'Testimoni', href: '/testimoni', icon: <Star size={16} /> },
      ]
    },
    { 
      name: 'Lainnya', 
      icon: <Phone size={18} />,
      subItems: [
        { name: 'Kontak', href: '/layanan/kontak', icon: <Phone size={16} /> },
        { name: 'Kebijakan Data', href: '/kebijakan-data', icon: <Shield size={16} /> },
      ]
    },
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
                  Desa<span className="text-emerald-500">Cibatu</span>
                </span>
                <span className={`text-[9px] font-black uppercase tracking-[0.4em] transition-colors ${
                  isScrolled ? 'text-emerald-600' : 'text-emerald-400'
                }`}>Digital Village</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className={`hidden md:flex items-center gap-3 p-1.5 rounded-2xl border transition-colors ${
              isScrolled ? 'bg-slate-900/5 border-slate-900/5' : 'bg-white/5 border-white/10'
            }`}>
              {navItems.map((item, idx) => (
                <div 
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(idx)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.subItems ? (
                    <button className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5 cursor-pointer ${
                      activeDropdown === idx || item.subItems.some(sub => pathname === sub.href)
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 scale-105' 
                      : isScrolled 
                        ? 'text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-lg' 
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}>
                      <span className={activeDropdown === idx || item.subItems.some(sub => pathname === sub.href) ? 'text-emerald-100' : isScrolled ? 'text-slate-400' : 'text-slate-300'}>
                        {item.icon}
                      </span>
                      {item.name}
                      <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === idx ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link 
                      href={item.href}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5 ${
                        pathname === item.href 
                        ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 scale-105' 
                        : isScrolled 
                          ? 'text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-lg' 
                          : 'text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className={pathname === item.href ? 'text-emerald-100' : isScrolled ? 'text-slate-400' : 'text-slate-300'}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  )}

                  {/* Desktop Dropdown */}
                  {item.subItems && (
                    <AnimatePresence>
                      {activeDropdown === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={`absolute top-full left-0 mt-3 w-64 rounded-xl p-2 shadow-2xl border backdrop-blur-2xl ${
                            isScrolled 
                            ? 'bg-white border-white/50 shadow-emerald-900/10' 
                            : 'bg-slate-900/40 border-white/20 shadow-black/40'
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            {item.subItems.map((subItem) => {
                              const isActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`relative px-4 py-3 text-sm font-semibold transition-all duration-300 rounded-lg flex items-center gap-3 overflow-hidden group ${
                                    isActive 
                                    ? (isScrolled ? 'text-emerald-700 bg-emerald-50' : 'text-emerald-300 bg-emerald-500/20') 
                                    : (isScrolled ? 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50' : 'text-white drop-shadow-md hover:bg-white/15')
                                  }`}
                                >
                                  {isActive && (
                                    <motion.div 
                                      layoutId={`activeIndicator-${idx}`}
                                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-emerald-500 rounded-r-full"
                                    />
                                  )}
                                  <div className={`transition-transform duration-300 ${
                                    isActive ? 'text-emerald-500 scale-110' : 'text-inherit group-hover:scale-110 group-hover:text-emerald-500'
                                  }`}>
                                    {subItem.icon}
                                  </div>
                                  {subItem.name}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
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
            className="fixed inset-0 z-40 glass p-6 pt-32 overflow-y-auto pb-24"
          >
            <div className="flex flex-col gap-3">
              {navItems.map((item, idx) => (
                <div key={item.name} className="flex flex-col gap-2">
                  {item.subItems ? (
                    <div className="bg-white/50 border border-white rounded-[2rem] overflow-hidden">
                      <div className="p-6 text-sm font-black uppercase tracking-widest flex items-center gap-5 text-slate-700 bg-white/60">
                        <div className="p-4 rounded-2xl bg-primary text-white">
                          {item.icon}
                        </div>
                        <span className="flex-1">{item.name}</span>
                      </div>
                      <div className="flex flex-col pb-4 px-4">
                        {item.subItems.map(sub => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`py-3 px-6 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                              pathname === sub.href
                              ? 'text-emerald-600 bg-white shadow-sm'
                              : 'text-slate-600 hover:bg-white/50'
                            }`}
                          >
                            <span className={`${pathname === sub.href ? 'text-emerald-500' : 'text-slate-400'}`}>
                              {sub.icon}
                            </span>
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link 
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-6 rounded-[2rem] text-sm font-black uppercase tracking-widest flex items-center gap-5 transition-all ${
                        pathname === item.href 
                        ? 'bg-primary text-white shadow-2xl shadow-emerald-900/20' 
                        : 'bg-white/50 text-slate-600 border border-white'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl ${pathname === item.href ? 'bg-white/20 text-white' : 'bg-primary text-white'}`}>
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
