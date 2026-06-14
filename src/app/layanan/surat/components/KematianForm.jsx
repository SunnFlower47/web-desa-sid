import React from 'react';
import { Clock, MapPin, UserPlus, Info } from 'lucide-react';
import { useDesa } from '@/context/DesaContext';

const KematianForm = ({ dynamicData, setDynamicData }) => {
  const { namaDesa } = useDesa();
  const updateData = (key, value) => {
    setDynamicData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-6 sm:p-8 bg-red-50/50 border border-red-100 rounded-[2rem] space-y-6">
        <h4 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-6">
          <Info className="w-4 h-4" /> WAKTU & TEMPAT MENINGGAL
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Meninggal</label>
            <input 
              type="date" 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.tanggal_meninggal || ''} 
              onChange={(e) => {
                const val = e.target.value;
                const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                const hari = val ? days[new Date(val).getDay()] : (dynamicData.hari_meninggal || 'Senin');
                updateData('tanggal_meninggal', val);
                updateData('hari_meninggal', hari);
              }} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Hari Meninggal</label>
            <select 
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed transition-all font-medium outline-none"
              value={dynamicData.hari_meninggal || 'Senin'} 
              onChange={e => updateData('hari_meninggal', e.target.value)} 
              tabIndex="-1"
            >
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Jam Meninggal</label>
            <input 
              type="time" 
              lang="en-GB" 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.jam_meninggal || ''} 
              onChange={e => updateData('jam_meninggal', e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Bertempat Di</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Rumah Sakit Umum" 
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.bertempat_di || ''} 
              onChange={e => updateData('bertempat_di', e.target.value)} 
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Penyebab / Alasan</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Sakit Tua / Kecelakaan" 
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.alasan || ''} 
              onChange={e => updateData('alasan', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] space-y-6">
        <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-6">
          <MapPin className="w-4 h-4" /> DETAIL PEMAKAMAN
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Pemakaman</label>
            <input 
              type="date" 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.tanggal_pemakaman || ''} 
              onChange={(e) => {
                const val = e.target.value;
                const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                const hari = val ? days[new Date(val).getDay()] : (dynamicData.hari_pemakaman || 'Senin');
                updateData('tanggal_pemakaman', val);
                updateData('hari_pemakaman', hari);
              }} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Hari Pemakaman</label>
            <select 
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed transition-all font-medium outline-none"
              value={dynamicData.hari_pemakaman || 'Senin'} 
              onChange={e => updateData('hari_pemakaman', e.target.value)} 
              tabIndex="-1"
            >
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Jam Pemakaman</label>
            <input 
              type="time" 
              lang="en-GB" 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.jam_pemakaman || ''} 
              onChange={e => updateData('jam_pemakaman', e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Lokasi Pemakaman</label>
            <input 
              type="text" 
              required
              placeholder={`Contoh: TPU ${namaDesa}`} 
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.lokasi_pemakaman || ''} 
              onChange={e => updateData('lokasi_pemakaman', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-6">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
          <UserPlus className="w-4 h-4" /> DATA PELAPOR (OPSIONAL)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Nama Pelapor</label>
            <input 
              type="text" 
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.pelapor_nama || ''} 
              onChange={e => updateData('pelapor_nama', e.target.value.toUpperCase())} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Hubungan</label>
            <input 
              type="text" 
              placeholder="Contoh: Anak / Ketua RT" 
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.pelapor_hubungan || ''} 
              onChange={e => updateData('pelapor_hubungan', e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Umur Pelapor</label>
            <input 
              type="number" 
              placeholder="45" 
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.pelapor_umur || ''} 
              onChange={e => updateData('pelapor_umur', e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Pekerjaan Pelapor</label>
            <input 
              type="text" 
              placeholder="Wiraswasta" 
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.pelapor_pekerjaan || ''} 
              onChange={e => updateData('pelapor_pekerjaan', e.target.value)} 
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Alamat Pelapor</label>
            <textarea 
              rows={2} 
              placeholder="Alamat lengkap pelapor..." 
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 resize-none"
              value={dynamicData.pelapor_alamat || ''} 
              onChange={e => updateData('pelapor_alamat', e.target.value)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KematianForm;
