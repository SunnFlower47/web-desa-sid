import React, { useState, useEffect } from 'react';
import { CreditCard, MapPin, User, Calendar, Info } from 'lucide-react';
import api from '@/lib/api';
import { useDesa } from '@/context/DesaContext';

const DomisiliForm = ({ dynamicData, setDynamicData }) => {
  const { namaDesa } = useDesa();
  const [wilayah, setWilayah] = useState({ dusun: [], rw: [], rt: [] });

  useEffect(() => {
    const fetchWilayah = async () => {
      try {
        const response = await api.get('/master-wilayah');
        if (response.data?.success) {
          setWilayah(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch master wilayah', error);
      }
    };
    fetchWilayah();
  }, []);

  const updateData = (key, value) => {
    setDynamicData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-6 sm:p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem] space-y-6">
        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-6">
          <User className="w-4 h-4" /> IDENTITAS PENDATANG
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">NIK Pendatang</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                required
                maxLength={16}
                placeholder="Masukkan NIK (16 digit)"
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                value={dynamicData.nik || ''} 
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  updateData('nik', val);
                }} 
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
            <input 
              type="text" 
              required
              placeholder="Sesuai KTP"
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.nama || ''} 
              onChange={e => updateData('nama', e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Tempat Lahir</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Bandung"
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.tempat_lahir || ''} 
              onChange={e => updateData('tempat_lahir', e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Lahir</label>
            <input 
              type="date" 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.tanggal_lahir || ''} 
              onChange={e => updateData('tanggal_lahir', e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Jenis Kelamin</label>
            <div className="flex gap-4 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
              {['L', 'P'].map(jk => (
                <button
                  key={jk}
                  type="button"
                  onClick={() => updateData('jenis_kelamin', jk)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                    dynamicData.jenis_kelamin === jk 
                      ? "bg-white text-blue-600 shadow-sm border border-blue-100" 
                      : "text-slate-500 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  {jk === 'L' ? 'Laki-laki' : 'Perempuan'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Agama</label>
            <select 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.agama || ''} 
              onChange={e => updateData('agama', e.target.value)}
            >
              <option value="" disabled>Pilih Agama</option>
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
              <option value="Budha">Budha</option>
              <option value="Khonghucu">Khonghucu</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Status Perkawinan</label>
            <select 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.status_perkawinan || ''} 
              onChange={e => updateData('status_perkawinan', e.target.value)}
            >
              <option value="" disabled>Pilih Status</option>
              <option value="Belum Kawin">Belum Kawin</option>
              <option value="Kawin">Kawin</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Pekerjaan</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Karyawan Swasta"
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.pekerjaan || ''} 
              onChange={e => updateData('pekerjaan', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] space-y-6">
        <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-6">
          <MapPin className="w-4 h-4" /> KETERANGAN PINDAH / DOMISILI
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Alamat Asal (Sesuai KTP)</label>
            <textarea 
              rows={2} 
              required
              placeholder="Masukkan alamat asal yang tercetak di KTP..."
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 resize-none"
              value={dynamicData.alamat_asal || ''} 
              onChange={e => updateData('alamat_asal', e.target.value)} 
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Alamat Tinggal di {namaDesa} (Nama Kampung/Jalan)</label>
            <textarea 
              rows={2} 
              required
              placeholder="Contoh: Kp. Karajan"
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 resize-none"
              value={dynamicData.alamat_tinggal || ''} 
              onChange={e => updateData('alamat_tinggal', e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">RW Domisili</label>
            <select 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.rw_id || ''} 
              onChange={e => { updateData('rw_id', e.target.value); updateData('rt_id', ''); }} 
            >
              <option value="" disabled>Pilih RW</option>
              {wilayah.rw?.map(rw => <option key={rw.id} value={rw.id}>{rw.kode} - {rw.nama}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">RT Domisili</label>
            <select 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.rt_id || ''} 
              onChange={e => updateData('rt_id', e.target.value)} 
            >
              <option value="" disabled>Pilih RT</option>
              {wilayah.rt?.filter(rt => String(rt.rw_id) === String(dynamicData.rw_id)).map(rt => (
                <option key={rt.id} value={rt.id}>{rt.kode} - {rt.nama}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Mulai Domisili</label>
            <input 
              type="date" 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.tanggal_masuk || ''} 
              onChange={e => updateData('tanggal_masuk', e.target.value)} 
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Keperluan Domisili</label>
            <select 
              required
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              value={dynamicData.keperluan || ''} 
              onChange={e => updateData('keperluan', e.target.value)} 
            >
              <option value="" disabled>Pilih Keperluan</option>
              <option value="kerja">Bekerja</option>
              <option value="sekolah">Sekolah / Kuliah</option>
              <option value="ikut_keluarga">Ikut Keluarga</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomisiliForm;
