import React from 'react';
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatAssistant from '@/components/ai/ChatAssistant';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "Desa Cibatu Digital - Portal Layanan AI Cerdas",
  description: "Portal layanan mandiri warga Desa Cibatu berbasis kecerdasan buatan. Cepat, transparan, dan modern.",
  keywords: ["Desa Cibatu", "Desa Digital", "Purwakarta", "Layanan Surat Online", "AI Desa"],
  authors: [{ name: "Pemerintah Desa Cibatu" }],
  openGraph: {
    title: "Desa Cibatu Digital - Inovasi Layanan Publik",
    description: "Nikmati kemudahan layanan administrasi desa dengan dukungan teknologi AI terdepan.",
    url: 'https://cibatu-vibe-ai-505268805663.asia-southeast2.run.app',
    siteName: 'Desa Cibatu Digital',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Desa Cibatu Digital',
    description: 'Portal layanan mandiri warga Desa Cibatu berbasis kecerdasan buatan.',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${outfit.variable} font-outfit antialiased`}>
        <div className="mesh-gradient" />
        <Navbar />
        {children}
        <Footer />
        <ChatAssistant />
      </body>
    </html>
  );
}
