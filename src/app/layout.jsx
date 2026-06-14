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
  const primaryColor = initialDesaData?.warna_primer || '#10b981';
  
  return (
    <html lang="id">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary-light: ${primaryColor} !important;
            --primary: color-mix(in srgb, ${primaryColor} 70%, #000000 30%) !important;
          }
        `}} />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-outfit antialiased`}>
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
