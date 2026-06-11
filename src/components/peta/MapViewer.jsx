'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store, Building2, MapPin, Navigation } from 'lucide-react';
import { getImageUrl } from '@/lib/api';

// Fix Leaflet's default icon path issues in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color, IconComponent) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="
      background-color: ${color};
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      color: white;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const umkmIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="bg-amber-500 w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const fasilitasIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="bg-blue-500 w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

export default function MapViewer({ 
  geoJsonData, 
  umkmData = [], 
  fasilitasData = [], 
  activeFilter = 'all',
  onMarkerClick
}) {
  const [map, setMap] = useState(null);

  // Default center to Cibatu, Garut (approximate)
  const defaultCenter = [-7.0858, 107.9942];

  // Adjust map bounds when GeoJSON loads
  useEffect(() => {
    if (map && geoJsonData) {
      try {
        const layer = L.geoJSON(geoJsonData);
        map.fitBounds(layer.getBounds(), { padding: [50, 50] });
      } catch (e) {
        console.error("Error fitting bounds to GeoJSON", e);
      }
    }
  }, [map, geoJsonData]);

  const geoJsonStyle = {
    fillColor: '#10b981',
    weight: 2,
    opacity: 1,
    color: '#059669',
    fillOpacity: 0.1
  };

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={14} 
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', zIndex: 10 }}
      ref={setMap}
      className="rounded-3xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {geoJsonData && (
        <GeoJSON data={geoJsonData} style={geoJsonStyle} />
      )}

      {(activeFilter === 'all' || activeFilter === 'umkm') && umkmData.map((umkm) => {
        if (!umkm.latitude || !umkm.longitude) return null;
        return (
          <Marker 
            key={`umkm-${umkm.id}`} 
            position={[umkm.latitude, umkm.longitude]}
            icon={umkmIcon}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick({ type: 'umkm', data: umkm })
            }}
          >
            <Popup className="custom-popup rounded-2xl border-0 overflow-hidden">
              <div className="p-1 min-w-[200px]">
                {umkm.foto_usaha && umkm.foto_usaha.length > 0 && (
                  <div className="w-full h-24 mb-3 rounded-xl overflow-hidden bg-slate-100">
                    <img 
                      src={getImageUrl(umkm.foto_usaha[0])} 
                      alt={umkm.nama_usaha} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 mb-1">
                  UMKM / {umkm.jenis_usaha}
                </div>
                <h3 className="font-black text-slate-800 leading-tight mb-1">{umkm.nama_usaha}</h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-2">{umkm.deskripsi_usaha || 'Tidak ada deskripsi'}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                  <MapPin size={10} />
                  <span>{umkm.rt_label ? `RT ${umkm.rt_label}/RW ${umkm.rw_label}, ${umkm.dusun_label}` : 'Lokasi tidak spesifik'}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {(activeFilter === 'all' || activeFilter === 'fasilitas') && fasilitasData.map((fas) => {
        if (!fas.latitude || !fas.longitude) return null;
        return (
          <Marker 
            key={`fas-${fas.id}`} 
            position={[fas.latitude, fas.longitude]}
            icon={fasilitasIcon}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick({ type: 'fasilitas', data: fas })
            }}
          >
            <Popup className="custom-popup rounded-2xl border-0 overflow-hidden">
              <div className="p-1 min-w-[200px]">
                {fas.foto && (
                  <div className="w-full h-24 mb-3 rounded-xl overflow-hidden bg-slate-100">
                    <img 
                      src={getImageUrl(fas.foto)} 
                      alt={fas.nama} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 mb-1">
                  Fasilitas / {fas.jenis}
                </div>
                <h3 className="font-black text-slate-800 leading-tight mb-1">{fas.nama}</h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-2">{fas.deskripsi || fas.alamat || 'Tidak ada deskripsi'}</p>
                {fas.jam_operasional && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{fas.jam_operasional}</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
