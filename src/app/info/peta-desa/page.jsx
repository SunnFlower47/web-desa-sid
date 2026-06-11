'use client';

import React, { useState, useEffect } from 'react';
import { Map, MapPin, Store, Building2, Filter, ChevronDown, ListFilter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import MapViewer from '@/components/peta';
import CardItem from '@/components/potensi/CardItem';
import { getUmkm, getFasilitasDesa, getVillageGeoJson } from '@/lib/api';

export default function PetaDesaPage() {
  const [activeFilter, setActiveFilter] = useState('all'); // all, umkm, fasilitas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [umkmData, setUmkmData] = useState([]);
  const [fasilitasData, setFasilitasData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  
  // Selected item from map click
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [umkmRes, fasRes, geoRes] = await Promise.all([
          getUmkm(),
          getFasilitasDesa(),
          getVillageGeoJson().catch(() => null) // Geojson is optional if missing
        ]);
        
        // Handle paginated or non-paginated UMKM data
        setUmkmData(umkmRes.data?.data || umkmRes.data || []);
        setFasilitasData(fasRes.data?.data || fasRes.data || []);
        
        if (geoRes && geoRes.data) {
           setGeoJsonData(geoRes.data);
        } else if (geoRes && geoRes.type === 'FeatureCollection') {
           setGeoJsonData(geoRes);
        }
      } catch (err) {
        console.error('Error fetching peta data:', err);
        setError('Gagal memuat data peta dan potensi desa. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkerClick = ({ type, data }) => {
    setSelectedItem({ type, data });
    // If user clicks a marker, we scroll down to list or show modal. 
    // For now we'll just set it.
  };

  const getFilteredItems = () => {
    let items = [];
    if (activeFilter === 'all' || activeFilter === 'umkm') {
      items = [...items, ...umkmData.map(d => ({ ...d, itemType: 'umkm' }))];
    }
    if (activeFilter === 'all' || activeFilter === 'fasilitas') {
      items = [...items, ...fasilitasData.map(d => ({ ...d, itemType: 'fasilitas' }))];
    }
    // Sort randomly or by name
    return items.sort((a, b) => {
       const nameA = a.itemType === 'umkm' ? a.nama_usaha : a.nama;
       const nameB = b.itemType === 'umkm' ? b.nama_usaha : b.nama;
       return (nameA || '').localeCompare(nameB || '');
    });
  };

  const displayItems = getFilteredItems();

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      <PageHeader 
        title={<>Peta & <span className="text-emerald-700">Potensi Desa</span></>}
        description="Jelajahi berbagai Usaha Mikro, Kecil, dan Menengah (UMKM) serta Fasilitas Desa Cibatu melalui peta interaktif."
        breadcrumbs={[
          { label: 'Informasi Desa', href: '#' },
          { label: 'Peta & Potensi' }
        ]}
      />

      <div className="container mx-auto px-6 max-w-7xl mt-8 relative z-20 space-y-10">
        
        {/* Map Section */}
        <section>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Map className="w-6 h-6 text-emerald-500" />
              Peta Interaktif
            </h2>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeFilter === 'all' 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveFilter('umkm')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                  activeFilter === 'umkm' 
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Store size={14} /> UMKM
              </button>
              <button
                onClick={() => setActiveFilter('fasilitas')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                  activeFilter === 'fasilitas' 
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Building2 size={14} /> Fasilitas
              </button>
            </div>
          </div>

          <GlassCard padding="p-2" className="bg-white border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="h-[600px] w-full rounded-3xl overflow-hidden relative">
              <MapViewer 
                geoJsonData={geoJsonData}
                umkmData={umkmData}
                fasilitasData={fasilitasData}
                activeFilter={activeFilter}
                onMarkerClick={handleMarkerClick}
              />
              
              {/* Overlay legend or info if needed */}
              <div className="absolute bottom-6 right-6 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 pointer-events-none">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Legenda Peta</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-sm flex items-center justify-center text-white"><Store size={12} /></div>
                    <span className="text-xs font-bold text-slate-700">Lokasi UMKM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-sm flex items-center justify-center text-white"><Building2 size={12} /></div>
                    <span className="text-xs font-bold text-slate-700">Fasilitas Desa</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* List Section */}
        <section className="pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ListFilter className="w-6 h-6 text-emerald-500" />
              Direktori {activeFilter === 'all' ? 'Desa' : activeFilter === 'umkm' ? 'UMKM' : 'Fasilitas'}
            </h2>
            <div className="text-xs font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              Menampilkan <span className="text-emerald-600 font-black">{displayItems.length}</span> data
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-[380px] bg-slate-100 rounded-[2rem] animate-pulse border border-slate-200"></div>
                ))}
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center flex flex-col items-center justify-center min-h-[300px]"
              >
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <h3 className="text-lg font-black text-red-800 mb-2">{error}</h3>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">Coba Lagi</Button>
              </motion.div>
            ) : displayItems.length > 0 ? (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {displayItems.map((item, idx) => (
                  <CardItem 
                    key={`${item.itemType}-${item.id}`}
                    data={item}
                    type={item.itemType}
                    index={idx}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Tidak Ada Data</h3>
                <p className="text-slate-500 font-medium">Belum ada titik lokasi yang ditambahkan untuk kategori ini.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </div>
    </main>
  );
}
