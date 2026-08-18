import React, { useState, useEffect } from 'react';
import { 
  X, Megaphone, Sparkles, Image as ImageIcon, 
  ArrowLeft, ArrowRight, ShieldCheck, CreditCard, Zap, 
  MapPin, Phone, Mail, User, Info, FileText, Check 
} from 'lucide-react';

export default function CreateAdModal({ token, isOpen, onClose, fetchAds }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    subcategory: '',
    condition: 'bekas',
    price: '',
    description: '',
    provinsi: 'Jawa Barat',
    kota: 'Bandung',
    kecamatan: '',
    contactName: '',
    contactPhone: '',
    email: '',
  });

  const [photos, setPhotos] = useState([]);
  
  // Package states
  const [adType, setAdType] = useState('free');
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [adPackages, setAdPackages] = useState([]);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/public/categories');
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (err) {
      }
    };
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/public/packages');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const mapped = data.data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            durationDays: p.duration_days,
          }));
          setAdPackages(mapped);
          setSelectedPackageId(mapped[0].id);
        }
      } catch (err) {
      }
    };
    fetchCategories();
    fetchPackages();
  }, []);

  const locationsData = {
    'DKI Jakarta': ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Utara', 'Jakarta Timur'],
    'Jawa Barat': ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Tangerang', 'Cirebon'],
    'Jawa Tengah': ['Semarang', 'Surakarta', 'Yogyakarta', 'Magelang', 'Solo'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Kediri', 'Madiun', 'Sidoarjo'],
    'Bali': ['Denpasar', 'Kuta', 'Seminyak', 'Ubud', 'Jimbaran']
  };

  const mockupImagesByCategory = {
    '1': [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80',
    ],
    '2': [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    ],
    '3': [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    ],
    '4': [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
    ]
  };

  const handleAddMockPhoto = () => {
    const list = mockupImagesByCategory[formData.category_id] || [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    ];
    const nextImg = list[0]; // Simplified for mock
    
    fetch(nextImg)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "mockup.jpg", { type: "image/jpeg" });
        setPhotos(prev => [...prev, { file, preview: nextImg }]);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConditionChange = (condition) => {
    setFormData(prev => ({ ...prev, condition }));
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setPhotos(prev => [...prev, ...newFiles]);
    }
  };

  const removePhoto = (indexToRemove) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMsg(null);
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category_id', formData.category_id || (categories[0]?.id || ''));
    formDataToSend.append('description', formData.description);
    if (formData.price) {
        formDataToSend.append('price', formData.price);
    }
    formDataToSend.append('location', `${formData.kota}, ${formData.provinsi}`);
    formDataToSend.append('whatsapp', formData.contactPhone);
    formDataToSend.append('package_id', selectedPackageId);

    photos.forEach((photo, index) => {
        formDataToSend.append(`images[${index}]`, photo.file);
    });

    try {
        const response = await fetch('/api/merchant/ads', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formDataToSend
        });

        const result = await response.json();

        if (response.ok && result.success) {
            setMsg({ type: 'success', text: result.message || 'Iklan berhasil diunggah dan sudah live!' });
            setTimeout(() => {
                if (fetchAds) fetchAds();
                onClose();
            }, 2000);
        } else {
            if (result.errors) {
                const firstError = Object.values(result.errors)[0][0];
                setMsg({ type: 'error', text: firstError });
            } else {
                setMsg({ type: 'error', text: result.message || 'Gagal mengunggah iklan.' });
            }
        }
    } catch (error) {
        setMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col relative overflow-hidden shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Pasang Iklan Klasifikasi</h3>
              <p className="text-xs text-slate-400 font-medium">Buat iklan berkualitas premium di PT. ADMS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Breadcrumb / Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between overflow-x-auto gap-4 shrink-0">
          {[
            { num: 1, label: 'Informasi' },
            { num: 2, label: 'Deskripsi' },
            { num: 3, label: 'Foto' },
            { num: 4, label: 'Lokasi' },
            { num: 5, label: 'Kontak' },
            { num: 6, label: 'Pratinjau' }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5 shrink-0">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                  step === s.num 
                    ? 'bg-slate-900 text-white' 
                    : step > s.num 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > s.num ? <Check className="w-3 h-3 text-white" /> : s.num}
              </div>
              <span className={`text-[11px] font-bold ${step === s.num ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {msg && (
            <div className={`p-3 rounded-xl text-xs font-bold border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {msg.text}
            </div>
          )}

          {/* STEP 1: Informasi Iklan */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-600" />
                Langkah 1: Informasi Dasar Iklan
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Iklan *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Contoh: Toyota Avanza 2022 Siap Pakai Murah"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subkategori</label>
                  <input
                    type="text"
                    name="subcategory"
                    placeholder="Contoh: Hatchback, Mobil Bekas"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kondisi Barang *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleConditionChange('baru')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formData.condition === 'baru' 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConditionChange('bekas')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formData.condition === 'bekas' 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Bekas
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Harga (Rupiah) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Contoh: 185000000"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Deskripsi Iklan */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-600" />
                Langkah 2: Deskripsi & Rincian Produk
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Lengkap *</label>
                <textarea
                  name="description"
                  rows={6}
                  placeholder="Tuliskan spesifikasi lengkap, kelebihan, riwayat pemakaian, atau penawaran produk Anda secara mendetail..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                ></textarea>
              </div>
            </div>
          )}

          {/* STEP 3: Upload Foto */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-cyan-600" />
                Langkah 3: Unggah Foto Produk
              </h4>

              <input
                type="file"
                id="ad-file-upload"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />

              <div 
                onClick={() => document.getElementById('ad-file-upload')?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all group"
              >
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800 mt-2">Pilih dari Perangkat Anda atau Seret & lepas</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Mendukung format JPG, PNG, WEBP (maks. 5MB per file)</p>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleAddMockPhoto}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Gunakan Foto Mockup Otomatis
                </button>
              </div>

              {photos.length > 0 && (
                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-bold text-slate-700">Foto Tersimpan ({photos.length})</label>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 group h-24">
                        <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Lokasi */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-600" />
                Langkah 4: Lokasi Penjualan
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Provinsi *</label>
                  <select
                    name="provinsi"
                    value={formData.provinsi}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, provinsi: e.target.value, kota: locationsData[e.target.value]?.[0] || '' }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    {Object.keys(locationsData).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten *</label>
                  <select
                    name="kota"
                    value={formData.kota}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    {(locationsData[formData.provinsi] || []).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  name="kecamatan"
                  placeholder="Contoh: Lengkong, Sumur Bandung"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Kontak */}
          {step === 5 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-cyan-600" />
                Langkah 5: Kontak Pengiklan
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kontak Penjual *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="contactPhone"
                    placeholder="Contoh: 081234567890"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Pratinjau & Paket */}
          {step === 6 && (
            <div className="space-y-5">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                Langkah 6: Pratinjau & Paket Iklan
              </h4>

              {/* Listing Card Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                {photos.length > 0 && (
                  <img
                    src={photos[0].preview}
                    alt="Preview"
                    className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                      {formData.condition}
                    </span>
                  </div>
                  <h5 className="text-sm font-extrabold text-slate-900 mt-1 truncate">{formData.title || 'Judul Iklan'}</h5>
                  <p className="text-sm font-black text-cyan-600 mt-0.5">Rp {formData.price || '0'}</p>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {formData.kota}, {formData.provinsi}
                  </p>
                </div>
              </div>

              {/* Package Chooser */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Paket Iklan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setAdType('free')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      adType === 'free'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs">Iklan Gratis Rp0</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Aktif 30 Hari
                      </span>
                    </div>
                    <p className={`text-[10px] mt-1 ${adType === 'free' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Iklan standar di listing pencarian. Melalui moderasi admin.
                    </p>
                  </div>

                  <div
                    onClick={() => setAdType('premium')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      adType === 'premium'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-xs">Premium Boost</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold animate-pulse">
                        Sponsor VIP
                      </span>
                    </div>
                    <p className={`text-[10px] mt-1 ${adType === 'premium' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Penempatan teratas di beranda utama & prioritas tinggi.
                    </p>
                  </div>
                </div>

                {adType === 'premium' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase">
                      Pilih Paket Sponsor
                    </label>
                    <select
                      value={selectedPackageId}
                      onChange={(e) => setSelectedPackageId(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      {adPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - Rp{pkg.price.toLocaleString('id-ID')} / {pkg.durationDays} hari
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Footer Buttons */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-70"
              >
                {loading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Check className="w-4 h-4" />}
                {loading ? 'Menyimpan...' : 'Publikasikan Iklan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
