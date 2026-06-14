'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPublicDesaInfo, getImageUrl } from '@/lib/api';

const DesaContext = createContext();

export function DesaProvider({ children, initialData }) {
  const [desa, setDesa] = useState(initialData || {
    nama_desa: 'Desa Cibatu',
    kabupaten: 'Purwakarta',
    provinsi: 'Jawa Barat',
    logo_desa: '/assets/images/logo-desa-cibatu.png',
    kontak: {},
    sosmed: {},
  });
  
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    // Jika kita tidak memiliki initialData dari server (misal di beberapa kasus SPA navigation), fetch dari client
    if (!initialData) {
      const fetchDesa = async () => {
        try {
          setLoading(true);
          const data = await getPublicDesaInfo();
          if (data) {
             setDesa(prev => ({
               ...prev,
               ...data
             }));
          }
        } catch (error) {
          console.error("Gagal memuat profil desa", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDesa();
    }
  }, [initialData]);

  // Derived states untuk memudahkan pemakaian di komponen
  const namaDesa = desa?.nama_desa || 'Desa Cibatu';
  const namaDesaPendek = namaDesa.replace(/^Desa\s+/i, '');
  const kabupaten = desa?.kabupaten || 'Purwakarta';
  const logoDesa = desa?.logo_desa ? getImageUrl(desa.logo_desa) : '/assets/images/logo-desa-cibatu.png';

  const value = {
    desa,
    loading,
    namaDesa,
    namaDesaPendek,
    kabupaten,
    logoDesa,
    kontak: desa?.kontak || {},
    sosmed: desa?.social || desa?.sosmed || {},
  };

  return (
    <DesaContext.Provider value={value}>
      {children}
    </DesaContext.Provider>
  );
}

export function useDesa() {
  const context = useContext(DesaContext);
  if (context === undefined) {
    throw new Error('useDesa must be used within a DesaProvider');
  }
  return context;
}
