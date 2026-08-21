import React, { useState, useEffect } from 'react';
import { 
  X, Megaphone, Sparkles, Image as ImageIcon, 
  ArrowLeft, ArrowRight, ShieldCheck, CreditCard, Zap, 
  MapPin, Phone, Mail, User, Info, FileText, Check, Camera, Trash2, Star, Map
} from 'lucide-react';

export default function CreateAdModal({ token, isOpen, onClose, fetchAds, adToEdit, user }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    subcategory: '',
    condition: 'baru',
    price: '',
    description: '',
    provinsi: 'Jawa Barat',
    kota: 'Bandung',
    kecamatan: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    email: user?.email || '',
  });

  const [photos, setPhotos] = useState([]);
  
  // Package states
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [adPackages, setAdPackages] = useState([]);
  const [categories, setCategories] = useState([]);

  // Check if merchant user is premium
  const isPremium = user?.active_package_id && user?.package_expires_at && new Date(user.package_expires_at) > new Date();

  useEffect(() => {
    if (adToEdit && isOpen) {
      const [kota, provinsi] = (adToEdit.location || '').split(',').map(s => s.trim());
      setFormData({
        title: adToEdit.title || '',
        category_id: adToEdit.category_id || adToEdit.category?.id || '',
        subcategory: adToEdit.subcategory || '',
        condition: adToEdit.condition || 'baru',
        price: adToEdit.price || '',
        description: adToEdit.description || '',
        provinsi: provinsi || 'Jawa Barat',
        kota: kota || 'Bandung',
        kecamatan: '',
        contactName: adToEdit.contact_name || user?.name || '',
        contactPhone: adToEdit.whatsapp || user?.phone || '',
        email: adToEdit.email || user?.email || '',
      });
      setStep(1);
    } else if (isOpen && !adToEdit) {
      setFormData({
        title: '',
        category_id: '',
        subcategory: '',
        condition: 'baru',
        price: '',
        description: '',
        provinsi: 'Jawa Barat',
        kota: 'Bandung',
        kecamatan: '',
        contactName: user?.name || '',
        contactPhone: user?.phone || '',
        email: user?.email || '',
      });
      setPhotos([]);
      setStep(1);
    }
  }, [adToEdit, isOpen, user]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/public/categories');
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (err) {}
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
      } catch (err) {}
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
    '1': ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80'],
    '2': ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80'],
    '3': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
    '4': ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80']
  };

  const handleAddMockPhoto = () => {
    const list = mockupImagesByCategory[formData.category_id] || ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'];
    const nextImg = list[0];
    
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
      const MAX_SIZE = 2 * 1024 * 1024;
      const validFiles = [];
      let hasError = false;

      const maxFiles = isPremium ? 5 : 2;
      const currentCount = photos.length;
      const remaining = maxFiles - currentCount;

      if (e.target.files.length > remaining) {
        alert(`Batas maksimal foto adalah ${maxFiles} file. ${isPremium ? '' : 'Upgrade paket premium untuk upload hingga 5 foto.'}`);
        return;
      }

      Array.from(e.target.files).forEach(file => {
        if (file.size > MAX_SIZE) {
          hasError = true;
        } else {
          validFiles.push({ file, preview: URL.createObjectURL(file) });
        }
      });

      if (hasError) setMsg({ type: 'error', text: 'Beberapa foto gagal ditambahkan karena ukurannya melebihi batas 2MB.' });
      setPhotos(prev => [...prev, ...validFiles]);
    }
  };

  const removePhoto = (indexToRemove) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleNext = () => { if (step < 6) setStep(step + 1); };
  const handlePrev = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMsg(null);
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category_id', formData.category_id || (categories[0]?.id || ''));
    formDataToSend.append('description', formData.description);
    if (formData.price) formDataToSend.append('price', formData.price);
    formDataToSend.append('location', `${formData.kota}, ${formData.provinsi}`);
    formDataToSend.append('whatsapp', formData.contactPhone);
    formDataToSend.append('contact_name', formData.contactName);
    formDataToSend.append('condition', formData.condition);
    if (isPremium && selectedPackageId) formDataToSend.append('package_id', selectedPackageId);

    photos.forEach((photo, index) => {
        formDataToSend.append(`images[${index}]`, photo.file);
    });

    if (adToEdit) formDataToSend.append('_method', 'PUT');

    try {
        const url = adToEdit ? `/api/customer/ads/${adToEdit.id}` : '/api/merchant/ads';
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataToSend
        });
        const result = await response.json();
        if (response.ok && result.success) {
            setMsg({ type: 'success', text: result.message || 'Iklan berhasil diunggah!' });
            setTimeout(() => { if (fetchAds) fetchAds(); onClose(); }, 2000);
        } else {
            setMsg({ type: 'error', text: result.message || 'Gagal mengunggah iklan.' });
        }
    } catch (error) {
        setMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
        setLoading(false);
    }
  };

  const stepTitles = [
    "INFORMASI DASAR IKLAN",
    "DESKRIPSI LENGKAP IKLAN",
    "FOTO PRODUK / JASA",
    "LOKASI PENJUALAN",
    "KONTAK PENJUAL",
    "PRATINJAU AKHIR IKLAN"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden font-sans">
      <div 
        className="bg-white border border-slate-200 rounded-[20px] w-full max-w-[1100px] h-[90vh] flex flex-col relative overflow-hidden shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0F3040] p-6 flex items-center gap-4 text-white border-b border-[#174256] shrink-0">
          <div className="w-12 h-12 rounded-xl bg-[#FFBF00] flex flex-shrink-0 items-center justify-center text-[#0F3040] shadow-lg shadow-[#FFBF00]/20">
            <Megaphone className="w-6 h-6 text-[#0F3040]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">{adToEdit ? 'Edit Iklan Baris' : 'Buat Iklan Baris Baru'}</h1>
              {isPremium && (
                <span className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5 opacity-90">
              Isi semua detail di bawah untuk {isPremium ? 'mempromosikan produk Anda dengan fitur premium.' : 'mempromosikan produk Anda gratis.'}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6 py-3 overflow-x-auto hide-scrollbar gap-6 text-xs font-bold whitespace-nowrap bg-[#071922] shrink-0">
          {[
            { id: 1, label: 'Informasi' },
            { id: 2, label: 'Deskripsi' },
            { id: 3, label: 'Foto' },
            { id: 4, label: 'Lokasi' },
            { id: 5, label: 'Kontak' },
            { id: 6, label: 'Pratinjau' }
          ].map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === s.id ? 'bg-[#FFBF00] text-[#0F3040] font-black' : step > s.id ? 'bg-[#FFBF00]/40 text-[#0F3040]' : 'bg-slate-800 text-slate-400'}`}>
                {step > s.id ? <Check className="w-3 h-3 text-[#0F3040]" /> : s.id}
              </div>
              <span className={`${step === s.id ? 'text-[#FFBF00] font-black' : step > s.id ? 'text-slate-300' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex overflow-hidden min-h-0 bg-[#F8FAFC]">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center gap-2 text-[#FFBF00] text-xs font-black uppercase tracking-wide">
              <Info className="w-4 h-4" />
              LANGKAH {step}: {stepTitles[step-1]}
            </div>

            {msg && (
              <div className={`p-3 rounded-xl text-xs font-bold border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {msg.text}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Judul Iklan *</label>
                  <input type="text" name="title" placeholder="Contoh: Toyota Avanza 2022 Siap Pakai Murah" value={formData.title} onChange={handleChange} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none text-slate-900 bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Kategori *</label>
                    <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none bg-white text-slate-900">
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Subkategori</label>
                    <input type="text" name="subcategory" placeholder="Contoh: Hatchback, Mobil Bekas" value={formData.subcategory} onChange={handleChange} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none text-slate-900 bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Kondisi Barang *</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleConditionChange('baru')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all border ${formData.condition === 'baru' ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-slate-600 border-slate-200'}`}>Baru</button>
                      <button type="button" onClick={() => handleConditionChange('bekas')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all border ${formData.condition === 'bekas' ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-slate-600 border-slate-200'}`}>Bekas</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Harga (Rupiah) *</label>
                    <input type="number" name="price" placeholder="Contoh: 185000000" value={formData.price} onChange={handleChange} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none text-slate-900 bg-white" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Deskripsi Lengkap *</label>
                  <textarea name="description" rows={8} placeholder="Jelaskan secara detail spesifikasi, keunggulan, kondisi fisik (jika barang), alasan dijual, dll." value={formData.description} onChange={handleChange} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none resize-none text-slate-900 bg-white" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 hover:border-[#0F3040] rounded-xl p-8 bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative group">
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Camera className="w-10 h-10 text-slate-400 group-hover:text-[#0F3040] transition-colors mb-2" />
                  <span className="text-xs font-bold text-slate-700">Klik atau Tarik Foto ke Sini</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Maksimal {isPremium ? 5 : 2} foto (Format JPG/PNG, maks. 2MB)</span>
                </div>
                <div className="flex justify-center">
                  <button type="button" onClick={handleAddMockPhoto} className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] flex items-center gap-1.5 transition-all"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gunakan Foto Mockup Otomatis</button>
                </div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                        <img src={photo.preview} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Provinsi *</label>
                    <select name="provinsi" value={formData.provinsi} onChange={(e) => setFormData(prev => ({ ...prev, provinsi: e.target.value, kota: locationsData[e.target.value]?.[0] || '' }))} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none bg-white text-slate-900">
                      {Object.keys(locationsData).map((p) => (<option key={p} value={p}>{p}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Kota / Kabupaten *</label>
                    <select name="kota" value={formData.kota} onChange={handleChange} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none bg-white text-slate-900">
                      {(locationsData[formData.provinsi] || []).map((k) => (<option key={k} value={k}>{k}</option>))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Kecamatan</label>
                  <input type="text" name="kecamatan" placeholder="Contoh: Lengkong, Sumur Bandung" value={formData.kecamatan} onChange={handleChange} className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none text-slate-900 bg-white" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Nama Lengkap Penjual *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full text-xs pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none text-slate-900 bg-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Nomor WhatsApp *</label>
                  <div className="flex">
                    <div className="px-3.5 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">+62</div>
                    <input type="tel" name="contactPhone" placeholder="812345678" value={formData.contactPhone} onChange={handleChange} className="flex-1 text-xs p-3 border border-slate-200 rounded-r-xl focus:border-[#0F3040] focus:ring-1 focus:ring-[#0F3040] outline-none text-slate-900 bg-white" />
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4 text-center py-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto text-emerald-600 mb-2">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Selesai! Tinjau Iklan Anda</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Periksa kembali tampilan kartu pratinjau iklan di sebelah kanan. Jika sudah sesuai, klik <strong>Kirim Iklan Sekarang</strong> di bawah ini.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Live Card Preview */}
          <div className="w-[320px] border-l border-slate-200 p-6 bg-white overflow-y-auto shrink-0 sticky top-0 hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-800 flex items-center gap-1.5 tracking-wider uppercase">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Pratinjau Langsung
              </h3>
              <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">Live Card</span>
            </div>

            {/* Preview Card */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-slate-100 relative">
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider text-white ${isPremium ? 'bg-emerald-500' : 'bg-[#0f172a]'}`}>
                    {isPremium ? 'PREMIUM' : 'GRATIS'}
                  </span>
                </div>
                
                {photos.length > 0 ? (
                  <img src={photos[0].preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <Camera className="w-10 h-10 mb-1 opacity-50" />
                    <span className="text-[9px] font-bold">Belum ada foto</span>
                  </div>
                )}
                
                <div className="absolute bottom-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase">
                  Kondisi: {formData.condition}
                </div>
              </div>

              <div className="p-4">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  TEMPLATE
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm mb-1.5 line-clamp-2 leading-snug">
                  {formData.title || 'Judul Iklan Anda'}
                </h4>
                <div className="font-black text-[#0f172a] text-lg mb-4">
                  Rp{formData.price ? parseInt(formData.price).toLocaleString('id-ID') : '0'}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1 truncate pr-2">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{formData.kota}, {formData.provinsi}</span>
                  </div>
                  <span className="font-bold text-[#3b82f6] whitespace-nowrap text-[9px] uppercase tracking-wider">
                    Iklan Baris
                  </span>
                </div>
              </div>

              <div className="bg-[#0f172a] p-3 m-2 rounded-xl flex items-center justify-between">
                <div className="text-white min-w-0 pr-2">
                  <div className="text-[9px] text-slate-400">Hubungi</div>
                  <div className="font-bold text-xs truncate">{formData.contactName || 'Nama Penjual'}</div>
                </div>
                <div className="bg-[#059669] text-white text-[9px] font-bold px-2.5 py-1 rounded">
                  WhatsApp Aktif
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer Buttons */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
                className="px-5 py-2.5 rounded-xl bg-[#0F3040] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#008080] hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-70 cursor-pointer"
              >
                {loading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Check className="w-4 h-4" />}
                {loading ? 'Memproses...' : 'Kirim Iklan Sekarang'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
