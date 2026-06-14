import React from 'react';
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatAssistant from '@/components/ai/ChatAssistant';
import CacheClearButton from '@/components/dev/CacheClearButton';
import { getDesaSettings } from '@/lib/server-api';
import { DesaProvider } from '@/context/DesaContext';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export async function generateMetadata() {
  const settings = await getDesaSettings();
  const namaDesa = settings?.nama_desa || "Desa Cibatu";
  const kabupaten = settings?.kabupaten || "Purwakarta";
  const metaDescription = settings?.meta_description || `Portal layanan mandiri warga ${namaDesa} berbasis kecerdasan buatan. Cepat, transparan, dan modern.`;
  const metaKeywords = settings?.meta_keywords 
    ? settings.meta_keywords.split(',').map(k => k.trim())
    : [namaDesa, "Desa Digital", kabupaten, "Layanan Surat Online", "AI Desa"];

  return {
    title: `${namaDesa} Digital - Portal Layanan AI Cerdas`,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: `Pemerintah ${namaDesa}` }],
    openGraph: {
      title: `${namaDesa} Digital - Inovasi Layanan Publik`,
      description: metaDescription,
      url: 'https://cibatu-vibe-ai-505268805663.asia-southeast2.run.app',
      siteName: `${namaDesa} Digital`,
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${namaDesa} Digital`,
      description: metaDescription,
    },
    icons: {
      icon: '/icon.png',
      apple: '/icon.png',
    },
  };
}

export default async function RootLayout({ children }) {
  const v3SiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  const initialDesaData = await getDesaSettings();

  if (initialDesaData?.is_inactive) {
    const hotline = initialDesaData.diskominfo_hotline;
    const email = initialDesaData.diskominfo_email;
    const waLink = hotline ? `https://wa.me/${hotline.replace(/^0/, '62')}` : null;

    return (
      <html lang="id">
        <head>
          <title>Website Desa Dinonaktifkan</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-md w-full text-center space-y-6 bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Website Desa Dinonaktifkan</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Mohon maaf, portal digital desa ini sedang dinonaktifkan sementara oleh Administrator Diskominfo Kabupaten Purwakarta.
              </p>
            </div>

            <div className="h-px bg-slate-800/80 my-2" />

            <div className="space-y-4">
              {(hotline || email) && (
                <div className="bg-slate-950/50 border border-slate-800/60 p-4 rounded-2xl text-left space-y-2.5">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Hubungi Bantuan Pusat</p>
                  <div className="text-xs space-y-1.5 font-bold text-slate-300">
                    {hotline && (
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500 font-sans">WhatsApp:</span>
                        <span>{hotline}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500 font-sans">Email:</span>
                        <span className="text-indigo-400">{email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {waLink ? (
                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/10 hover:shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Hubungi Diskominfo via WhatsApp
                </a>
              ) : (
                <p className="text-xs text-slate-500 font-semibold italic">
                  Silakan hubungi pihak Diskominfo Kabupaten Purwakarta untuk informasi pengaktifan kembali.
                </p>
              )}
            </div>
          </div>
        </body>
      </html>
    );
  }

  const primaryColor = initialDesaData?.warna_primer || '#10b981';
  
  return (
    <html lang="id">
      <head />
      <body className={`${inter.variable} ${outfit.variable} font-outfit antialiased`}>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary-light: ${primaryColor} !important;
            --primary: color-mix(in srgb, ${primaryColor} 70%, #000000 30%) !important;
          }
        `}} />

        <DesaProvider initialData={initialDesaData}>
          <div className="mesh-gradient" />
          <Navbar />
          {children}
          <Footer />
          <ChatAssistant />
          <CacheClearButton />
          {v3SiteKey && (
            <Script 
              src={`https://www.google.com/recaptcha/api.js?render=${v3SiteKey}`} 
              strategy="beforeInteractive" 
            />
          )}
        </DesaProvider>
      </body>
    </html>
  );
}
