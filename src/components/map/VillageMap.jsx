'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers in Next.js
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to auto-fit bounds when GeoJSON is loaded
function FitBounds({ geoData }) {
  const map = useMap();
  useEffect(() => {
    if (geoData) {
      const geoJsonLayer = L.geoJSON(geoData);
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20], animate: false });
    }
  }, [geoData, map]);
  return null;
}

export default function VillageMap({ fasilitas = [] }) {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('/api/proxy/geojson')
      .then((res) => {
        if (!res.ok) throw new Error("GeoJSON API not reachable");
        return res.json();
      })
      .then((data) => {
        // Handle both raw geojson and wrapped Laravel response
        const geojsonData = (data && data.data && data.success !== undefined) ? data.data : data;
        setGeoData(geojsonData);
      })
      .catch((err) => console.error("Error loading GeoJSON from API", err));
  }, []);

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = `
        <div class="text-center font-outfit">
          <h3 class="font-bold text-slate-800 border-b pb-1 mb-2">Desa Cibatu</h3>
          <p class="text-sm text-slate-600">Wilayah Administratif</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  const style = () => {
    return {
      fillColor: '#10b981', // emerald-500
      weight: 3,
      opacity: 1,
      color: '#047857', // emerald-700
      fillOpacity: 0.25,
      dashArray: '5, 5'
    };
  };

  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden border-4 border-slate-100 shadow-lg relative z-0">
      <MapContainer 
        center={[-6.5001403, 107.5342964]} 
        zoom={14} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {geoData && (
          <>
            <GeoJSON 
              data={geoData} 
              style={style}
              onEachFeature={onEachFeature}
            />
            <FitBounds geoData={geoData} />
          </>
        )}
        
        {fasilitas.map((fasil) => {
          if (fasil.koordinat && fasil.koordinat.lat && fasil.koordinat.lng) {
            return (
              <Marker key={fasil.id} position={[fasil.koordinat.lat, fasil.koordinat.lng]}>
                <Popup>
                  <div className="font-outfit">
                    <h3 className="font-bold text-slate-800 mb-1">{fasil.nama}</h3>
                    <p className="text-xs text-emerald-600 font-semibold mb-2">{fasil.jenis}</p>
                    {fasil.alamat && <p className="text-xs text-slate-600 border-t pt-2">{fasil.alamat}</p>}
                    {fasil.keterangan && <p className="text-xs text-slate-500 mt-1">{fasil.keterangan}</p>}
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
