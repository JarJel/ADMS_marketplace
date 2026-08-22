import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, Camera, CheckCircle, 
    ArrowLeft, Home, FileText, Settings, ShieldCheck, Info,
    Coins, Star, MapPin, Phone, Globe, Trash2, Rocket, Volume2, Megaphone, Map, Search, User, UserSquare2
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CreateAd({ user, token, onNavigate, darkMode, setDarkMode, onLogout, cartCount = 0, wishlistCount = 0, notifications = [], setNotifications }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [generatedAdId, setGeneratedAdId] = useState('');

    // Form fields state
    const [judul, setJudul] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
    const [kondisi, setKondisi] = useState('Baru');
    const [deskripsi, setDeskripsi] = useState('');
    const [tipeHarga, setTipeHarga] = useState('Harga Tetap');
    const [harga, setHarga] = useState('');
    
    // Media & Contact
    const [photos, setPhotos] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [lokasi, setLokasi] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [namaKontak, setNamaKontak] = useState(user?.name || '');

    // Form errors
    const [errors, setErrors] = useState({});

    // Kategori dinamis dari database
    const [dbCategories, setDbCategories] = useState([]);

    const FALLBACK_CATEGORIES = [
        {
            id: 1,
            name: 'Jasa & Layanan',
            children: [
                { id: 101, name: 'Desain Grafis & Logo' },
                { id: 102, name: 'Pembuatan Website' },
                { id: 103, name: 'Digital Marketing & SEO' }
            ]
        },
        {
            id: 2,
            name: 'Produk Digital',
            children: [
                { id: 201, name: 'Source Code & Script' },
                { id: 202, name: 'Template & Tema' },
                { id: 203, name: 'E-Book & Panduan' }
            ]
        },
        {
            id: 3,
            name: 'Akun & Sosial Media',
            children: [
                { id: 301, name: 'Akun Game & Topup' },
                { id: 302, name: 'Jasa Followers & Likes' }
            ]
        }
    ];

    useEffect(() => {
        const fetchAdCategories = async () => {
            try {
                const res = await fetch('/api/public/categories?type=advertisement');
                const data = await res.json();
                if (data.success && data.data && data.data.length > 0) {
                    setDbCategories(data.data);
                    setSelectedCategoryId(data.data[0].id.toString());
                    if (data.data[0].children && data.data[0].children.length > 0) {
                        setSelectedSubCategoryId(data.data[0].children[0].id.toString());
                    } else {
                        setSelectedSubCategoryId(data.data[0].id.toString());
                    }
                } else {
                    setDbCategories(FALLBACK_CATEGORIES);
                    setSelectedCategoryId(FALLBACK_CATEGORIES[0].id.toString());
                    setSelectedSubCategoryId(FALLBACK_CATEGORIES[0].children[0].id.toString());
                }
            } catch (err) {
                setDbCategories(FALLBACK_CATEGORIES);
                setSelectedCategoryId(FALLBACK_CATEGORIES[0].id.toString());
                setSelectedSubCategoryId(FALLBACK_CATEGORIES[0].children[0].id.toString());
            }
        };
        fetchAdCategories();
    }, []);

    useEffect(() => {
        const parentCat = dbCategories.find(c => c.id.toString() === selectedCategoryId.toString());
        if (parentCat) {
            if (parentCat.children && parentCat.children.length > 0) {
                setSelectedSubCategoryId(parentCat.children[0].id.toString());
            } else {
                setSelectedSubCategoryId(parentCat.id.toString());
            }
        }
    }, [selectedCategoryId, dbCategories]);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0
        })
    };
    const [direction, setDirection] = useState(1);

    const validateStep = (s) => {
        const errs = {};
        if (s === 1) {
            if (!judul.trim()) errs.judul = 'Judul iklan wajib diisi';
            else if (judul.length > 100) errs.judul = 'Judul iklan maksimal 100 karakter';
            if (!selectedCategoryId) errs.kategori = 'Kategori wajib dipilih';
            if (!selectedSubCategoryId) errs.subKategori = 'Sub-kategori wajib dipilih';
            if (!harga) errs.harga = 'Harga wajib diisi';
        } else if (s === 2) {
            if (!deskripsi.trim()) errs.deskripsi = 'Deskripsi iklan wajib diisi';
        } else if (s === 3) {
            // Photos are optional? Let's make at least 1 required
            if (photos.length === 0) errs.photos = 'Minimal 1 foto wajib diunggah';
        } else if (s === 4) {
            if (!lokasi.trim()) errs.lokasi = 'Lokasi penjualan wajib diisi';
        } else if (s === 5) {
            if (!namaKontak.trim()) errs.namaKontak = 'Nama kontak wajib diisi';
            if (!whatsapp.trim()) errs.whatsapp = 'Nomor WhatsApp wajib diisi';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setDirection(1);
            setStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        setDirection(-1);
        setStep((prev) => prev - 1);
    };

    const isPremium = user?.active_package_id && user?.package_expires_at && new Date(user.package_expires_at) > new Date();

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const maxFiles = isPremium ? 5 : 2;
        const currentCount = photos.length;
        const remaining = maxFiles - currentCount;

        if (files.length > remaining) {
            alert(`Batas maksimal foto adalah ${maxFiles} file. ${isPremium ? '' : 'Upgrade paket premium untuk upload hingga 5 foto.'}`);
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        const newPhotos = files.map((file, idx) => ({
                            id: Date.now() + idx,
                            name: file.name,
                            url: URL.createObjectURL(file),
                            file: file
                        }));
                        setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
                        setIsUploading(false);
                        setUploadProgress(0);
                    }, 300);
                    return 100;
                }
                return prev + 25;
            });
        }, 200);
    };

    const handleRemovePhoto = (id) => {
        setPhotos(photos.filter(p => p.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(6)) return;

        setLoading(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('title', judul);
            formData.append('category_id', selectedSubCategoryId);
            formData.append('description', deskripsi);
            formData.append('price', harga);
            formData.append('location', lokasi);
            
            let finalWhatsapp = whatsapp;
            if (!finalWhatsapp.startsWith('+62')) {
                finalWhatsapp = '+62' + finalWhatsapp.replace(/^0+/, '');
            }
            formData.append('whatsapp', finalWhatsapp);
            formData.append('contact_name', namaKontak);
            formData.append('condition', kondisi);

            photos.forEach(photo => {
                if (photo.file) {
                    formData.append('images[]', photo.file);
                }
            });

            const res = await fetch('/api/customer/ads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setGeneratedAdId('ADMS-AD-' + data.data.id);
                setSuccess(true);
            } else {
                alert(data.message || 'Gagal menyimpan iklan.');
                if (data.errors) {
                    setErrors(data.errors);
                }
            }
        } catch (err) {
            alert("Terjadi kesalahan jaringan saat mempublikasikan iklan.");
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

    const activeCategoryName = dbCategories.find(c => c.id.toString() === selectedCategoryId.toString())?.name || '';
    const isJasa = activeCategoryName.toLowerCase().includes('jasa');

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout}
                onNavigate={onNavigate} 
                currentView="create_ad"
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                notifications={notifications}
                setNotifications={setNotifications}
            />

            {!success ? (
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    {/* Header Back Button */}
                    <div className="mb-6 flex items-center">
                        <button 
                            onClick={() => onNavigate('homepage')}
                            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#0f172a] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Beranda
                        </button>
                        <div className="ml-auto text-right">
                            <h2 className="text-sm font-extrabold text-slate-800">{isPremium ? 'Pembuat Iklan Premium' : 'Pembuat Iklan Gratis'}</h2>
                            <p className="text-xs text-slate-400">Halaman Khusus Iklan Baris Klasifikasi</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Kolom Kiri: Form & Stepper (8 Kolom) */}
                        <div className="lg:col-span-8 bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden">
                            {/* Dark Header Banner */}
                            <div className="bg-[#0F3040] p-6 sm:p-8 flex items-center gap-4 text-white border-b border-[#174256]">
                                <div className="w-14 h-14 rounded-2xl bg-[#FFBF00] flex flex-shrink-0 items-center justify-center text-[#0F3040] shadow-lg shadow-[#FFBF00]/20">
                                    <Megaphone className="w-7 h-7 text-[#0F3040]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl sm:text-2xl font-black text-white">Buat Iklan Baris Baru</h1>
                                        {isPremium && (
                                            <span className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" />
                                                Premium
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1 opacity-90">Isi semua detail di bawah untuk {isPremium ? 'mempromosikan produk Anda dengan fitur premium.' : 'mempromosikan produk Anda gratis.'}</p>
                                </div>
                            </div>

                            {/* Stepper Navbar */}
                            <div className="flex border-b border-slate-100 px-6 py-4 overflow-x-auto hide-scrollbar gap-8 text-xs font-bold whitespace-nowrap bg-[#071922]">
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
                                            {s.id}
                                        </div>
                                        <span className={`${step === s.id ? 'text-[#FFBF00] font-black' : step > s.id ? 'text-slate-300' : 'text-slate-400'}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Form Step Content */}
                            <div className="p-6 sm:p-8 min-h-[400px]">
                                <div className="flex items-center gap-2 mb-8 text-[#FFBF00] text-sm font-black uppercase tracking-wide">
                                    <Info className="w-5 h-5" />
                                    LANGKAH {step}: {stepTitles[step-1]}
                                </div>

                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={`step-${step}`}
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* STEP 1: INFORMASI DASAR */}
                                        {step === 1 && (
                                            <div className="space-y-6">
                                                <div className="space-y-1.5">
                                                    <label className="block text-sm font-bold text-slate-700">Judul Iklan *</label>
                                                    <input 
                                                        type="text" 
                                                        value={judul}
                                                        onChange={(e) => setJudul(e.target.value)}
                                                        placeholder="Contoh: Toyota Avanza 2022 Siap Pakai Murah"
                                                        className="w-full text-sm p-4 border border-slate-200 rounded-2xl focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none text-slate-900 bg-white"
                                                    />
                                                    {errors.judul && <span className="text-xs text-rose-500 font-bold">{errors.judul}</span>}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-sm font-bold text-slate-700">Kategori *</label>
                                                        <select
                                                            value={selectedCategoryId}
                                                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                                                            className="w-full text-sm p-4 border border-slate-200 rounded-2xl focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none appearance-none bg-white text-slate-900"
                                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                                        >
                                                            {dbCategories.map((cat) => (
                                                                <option key={cat.id} value={cat.id} className="text-slate-900 bg-white">{cat.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="block text-sm font-bold text-slate-700">Subkategori</label>
                                                        <select
                                                            value={selectedSubCategoryId}
                                                            onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                                                            className="w-full text-sm p-4 border border-slate-200 rounded-2xl focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none appearance-none bg-white text-slate-900"
                                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                                        >
                                                            {(() => {
                                                                const parent = dbCategories.find(c => c.id.toString() === selectedCategoryId.toString());
                                                                if (parent && parent.children && parent.children.length > 0) {
                                                                    return parent.children.map((sub) => (
                                                                        <option key={sub.id} value={sub.id} className="text-slate-900 bg-white">{sub.name}</option>
                                                                    ));
                                                                }
                                                                return parent ? <option value={parent.id} className="text-slate-900 bg-white">Semua {parent.name}</option> : <option className="text-slate-900 bg-white">Pilih Subkategori</option>;
                                                            })()}
                                                        </select>
                                                    </div>
                                                </div>

                                                {!isJasa && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                                                        <div className="space-y-1.5">
                                                            <label className="block text-sm font-bold text-slate-700">Kondisi Barang *</label>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setKondisi('Baru')}
                                                                    className={`flex-1 py-4 text-sm font-bold rounded-2xl transition-all border ${kondisi === 'Baru' ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                                                >
                                                                    Baru
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setKondisi('Bekas')}
                                                                    className={`flex-1 py-4 text-sm font-bold rounded-2xl transition-all border ${kondisi === 'Bekas' ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                                                >
                                                                    Bekas
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5 mt-6 sm:mt-0">
                                                            <label className="block text-sm font-bold text-slate-700">Harga (Rupiah) *</label>
                                                            <input 
                                                                type="number" 
                                                                value={harga}
                                                                onChange={(e) => setHarga(e.target.value)}
                                                                placeholder="Contoh: 185000000"
                                                                className="w-full text-sm p-4 border border-slate-200 rounded-2xl focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none text-slate-900 bg-white"
                                                            />
                                                            {errors.harga && <span className="text-xs text-rose-500 font-bold">{errors.harga}</span>}
                                                        </div>
                                                    </div>
                                                )}
                                                {isJasa && (
                                                    <div className="space-y-1.5">
                                                        <label className="block text-sm font-bold text-slate-700">Harga (Rupiah) *</label>
                                                        <input 
                                                            type="number" 
                                                            value={harga}
                                                            onChange={(e) => setHarga(e.target.value)}
                                                            placeholder="Contoh: 185000000"
                                                            className="w-full text-sm p-4 border border-slate-200 rounded-2xl focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none text-slate-900 bg-white"
                                                        />
                                                        {errors.harga && <span className="text-xs text-rose-500 font-bold">{errors.harga}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* STEP 2: DESKRIPSI */}
                                        {step === 2 && (
                                            <div className="space-y-6">
                                                <div className="space-y-1.5">
                                                    <label className="block text-sm font-bold text-slate-700">Deskripsi Lengkap *</label>
                                                    <textarea 
                                                        rows={8}
                                                        value={deskripsi}
                                                        onChange={(e) => setDeskripsi(e.target.value)}
                                                        placeholder="Jelaskan secara detail spesifikasi, keunggulan, kondisi fisik (jika barang), alasan dijual, dll."
                                                        className="w-full text-sm p-4 border border-slate-200 rounded-2xl focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none resize-none text-slate-900 bg-white"
                                                    />
                                                    {errors.deskripsi && <span className="text-xs text-rose-500 font-bold">{errors.deskripsi}</span>}
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 3: FOTO */}
                                        {step === 3 && (
                                            <div className="space-y-6">
                                                <div className="border-2 border-dashed border-slate-300 hover:border-[#0f172a] rounded-2xl p-8 bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative group">
                                                    <input 
                                                        type="file" 
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        disabled={isUploading}
                                                    />
                                                    <Camera className="w-12 h-12 text-slate-400 group-hover:text-[#0f172a] transition-colors mb-3" />
                                                    <span className="text-sm font-bold text-slate-700">Klik atau Tarik Foto ke Sini</span>
                                                    <span className="text-xs text-slate-500 mt-1">Maksimal {isPremium ? 5 : 2} foto (Format JPG/PNG)</span>
                                                </div>

                                                {errors.photos && <span className="text-xs text-rose-500 font-bold">{errors.photos}</span>}

                                                {isUploading && (
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                                                            <span>Mengunggah file...</span>
                                                            <span>{uploadProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                            <div className="bg-[#0f172a] h-2 transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {photos.length > 0 && (
                                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 mt-6">
                                                        {photos.map((p) => (
                                                            <div key={p.id} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                                                                <img src={p.url} alt="upload preview" className="w-full h-full object-cover" />
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleRemovePhoto(p.id)}
                                                                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* STEP 4: LOKASI */}
                                        {step === 4 && (
                                            <div className="space-y-6">
                                                <div className="space-y-1.5">
                                                    <label className="block text-sm font-bold text-slate-700">Kota & Provinsi Penjualan *</label>
                                                    <div className="relative">
                                                        <Map className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                                        <input 
                                                            type="text" 
                                                            value={lokasi}
                                                            onChange={(e) => setLokasi(e.target.value)}
                                                            placeholder="Contoh: Bandung, Jawa Barat"
                                                            className="w-full text-sm p-4 pl-12 border border-slate-200 rounded-2xl focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none text-slate-900 bg-white"
                                                        />
                                                    </div>
                                                    {errors.lokasi && <span className="text-xs text-rose-500 font-bold">{errors.lokasi}</span>}
                                                </div>
                                                <div className="aspect-[21/9] bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                                    <MapPin className="w-10 h-10 mb-2 opacity-50" />
                                                    <span className="text-sm font-bold">Peta Lokasi Area</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 5: KONTAK */}
                                        {step === 5 && (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 gap-6">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-sm font-bold text-slate-700">Nama Lengkap Penjual *</label>
                                                        <div className="relative">
                                                            <UserSquare2 className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                                            <input 
                                                                type="text" 
                                                                value={namaKontak}
                                                                onChange={(e) => setNamaKontak(e.target.value)}
                                                                placeholder="Budi Santoso"
                                                                className="w-full text-sm p-4 pl-12 border border-slate-200 rounded-2xl focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none text-slate-900 bg-white"
                                                            />
                                                        </div>
                                                        {errors.namaKontak && <span className="text-xs text-rose-500 font-bold">{errors.namaKontak}</span>}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-sm font-bold text-slate-700">Nomor WhatsApp *</label>
                                                        <div className="flex">
                                                            <div className="px-4 border border-r-0 border-slate-200 rounded-l-2xl bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-500">
                                                                +62
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                value={whatsapp}
                                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                                placeholder="812345678"
                                                                className="flex-1 text-sm p-4 border border-slate-200 rounded-r-2xl focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none text-slate-900 bg-white"
                                                            />
                                                        </div>
                                                        {errors.whatsapp && <span className="text-xs text-rose-500 font-bold">{errors.whatsapp}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 6: PRATINJAU AKHIR */}
                                        {step === 6 && (
                                            <div className="space-y-6 text-center py-6">
                                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto text-teal-600 mb-4">
                                                    <CheckCircle className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-800">Selesai! Tinjau Iklan Anda</h3>
                                                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                                    Periksa kembali tampilan kartu pratinjau di sebelah kanan. Jika sudah sesuai, klik <strong>Kirim Iklan</strong> di bawah ini.
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                
                                {/* Form Footer Buttons */}
                                <div className="mt-12 flex items-center justify-between pt-6 border-t border-slate-100">
                                    {step > 1 ? (
                                        <button 
                                            type="button"
                                            onClick={handlePrev}
                                            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                        >
                                            &larr; Kembali
                                        </button>
                                    ) : <div></div>}

                                    {step < 6 ? (
                                        <button 
                                            type="button"
                                            onClick={handleNext}
                                            className="px-8 py-3.5 bg-[#0f172a] hover:bg-slate-800 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2"
                                        >
                                            Lanjutkan &rarr;
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-lg shadow-teal-600/30 flex items-center gap-2 transition-all disabled:opacity-70 disabled:scale-100"
                                        >
                                            {loading ? 'Memproses...' : 'Kirim Iklan Sekarang'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Live Preview (4 Kolom) */}
                        <div className="lg:col-span-4 sticky top-6">
                            <div className="bg-white rounded-[20px] shadow-lg border border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-2 tracking-widest uppercase">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        Pratinjau Langsung
                                    </h3>
                                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Live Card</span>
                                </div>

                                {/* Preview Card */}
                                <div className="border border-slate-200 rounded-[16px] overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
                                    {/* Image Area */}
                                    <div className="aspect-[4/3] bg-slate-100 relative">
                                        {/* Badge Gratis */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="bg-[#0f172a] text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider">
                                                GRATIS
                                            </span>
                                        </div>
                                        
                                        {photos.length > 0 ? (
                                            <img src={photos[0].url} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                                <Camera className="w-12 h-12 mb-2 opacity-50" />
                                                <span className="text-[10px] font-bold">Belum ada foto</span>
                                            </div>
                                        )}
                                        
                                        {!isJasa && (
                                            <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                                                Kondisi: {kondisi}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-4 sm:p-5">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            TEMPLATE
                                        </div>
                                        <h4 className="font-extrabold text-slate-800 text-base sm:text-lg mb-2 line-clamp-2 leading-snug">
                                            {judul || 'Judul Iklan Anda'}
                                        </h4>
                                        <div className="font-black text-[#0f172a] text-xl mb-6">
                                            Rp{harga ? parseInt(harga).toLocaleString('id-ID') : '0'}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-500 pb-4 border-b border-slate-100">
                                            <div className="flex items-center gap-1.5 truncate pr-2">
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{lokasi || 'Kota, Provinsi'}</span>
                                            </div>
                                            <div className="font-bold text-[#3b82f6] whitespace-nowrap text-[10px] uppercase tracking-wider">
                                                Iklan Baris
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Contact area of card */}
                                    <div className="bg-[#0f172a] p-4 m-2 rounded-2xl flex items-center justify-between mt-auto">
                                        <div className="text-white min-w-0 pr-2">
                                            <div className="text-[10px] text-slate-400">Hubungi</div>
                                            <div className="font-bold text-sm truncate">{namaKontak || 'Nama Penjual'}</div>
                                        </div>
                                        <div className="bg-[#059669] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0">
                                            WhatsApp Aktif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-32">
                    <div className="bg-white rounded-[20px] border border-slate-200 shadow-xl p-8 sm:p-16 text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full border-2 border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 mb-6">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Iklan Berhasil Dikirim!</h2>
                        <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
                            Iklan Anda saat ini sedang berada dalam antrean moderasi oleh Tim ADMS. Kami akan segera memberi tahu Anda setelah iklan disetujui untuk tayang.
                        </p>
                        <div className="inline-block bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 font-mono text-sm text-slate-600 font-bold">
                            Kode ID Iklan: <span className="text-[#0f172a]">{generatedAdId}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                            <button 
                                onClick={() => onNavigate('dashboard', '/customer')}
                                className="px-6 py-3 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
                            >
                                Lihat Daftar Iklan Saya
                            </button>
                            <button 
                                onClick={() => onNavigate('homepage', '/')}
                                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-sm font-bold text-slate-700 rounded-xl transition-colors"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
