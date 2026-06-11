'use client';

import dynamic from 'next/dynamic';

// Next.js dynamic import with ssr: false is required for react-leaflet
const MapViewer = dynamic(() => import('./MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 animate-pulse">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat Peta Interaktif...</p>
    </div>
  )
});

export default MapViewer;
