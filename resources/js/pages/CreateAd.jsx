import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Upload, Camera, CheckCircle, 
    ArrowLeft, Home, FileText, Settings, ShieldCheck, Info,
    Coins, Star, MapPin, Phone, Globe, Trash2, ChevronDown, Check, Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CreateAd({ user, token, onNavigate, darkMode, setDarkMode, onLogout }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [generatedAdId, setGeneratedAdId] = useState('');

    // Dynamic Categories and Packages from DB
    const [dbCategories, setDbCategories] = useState([]);
    const [dbPackages, setDbPackages] = useState([]);

    // Form fields state
    const [judul, setJudul] = useState('');
    const [kategori, setKategori] = useState(''); // Stores root category ID
    const [subKategori, setSubKategori] = useState(''); // Stores sub category ID
    const [kondisi, setKondisi] = useState('Baru');
    const [deskripsi, setDeskripsi] = useState('');
    const [tipeHarga, setTipeHarga] = useState('Harga Tetap');
    const [harga, setHarga] = useState('');
    const [tags, setTags] = useState('');
    
    // Media & Contact
    const [photos, setPhotos] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [namaKontak, setNamaKontak] = useState(user?.name || '');
    const [whatsapp, setWhatsapp] = useState('+62');
    const [lokasi, setLokasi] = useState('');
    const [website, setWebsite] = useState('');

    // Package Upgrade
    const [paket, setPaket] = useState('berkah'); // 'berkah' or 'vip'

    // Form errors
    const [errors, setErrors] = useState({});

    // Fetch categories and packages from DB on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const catRes = await fetch('/api/public/categories');
                const catJson = await catRes.json();
                if (catRes.ok && catJson.success) {
                    setDbCategories(catJson.data);
                    
                    // Set default selection
                    const roots = catJson.data.filter(c => !c.parent_id && c.type === 'advertisement');
                    if (roots.length > 0) {
                        const initialRoot = roots[0];
                        setKategori(initialRoot.id.toString());
                        
                        const subs = catJson.data.filter(c => c.parent_id == initialRoot.id);
                        if (subs.length > 0) {
                            setSubKategori(subs[0].id.toString());
                        }
                    }
                }

                const pkgRes = await fetch('/api/public/packages');
                const pkgJson = await pkgRes.json();
                if (pkgRes.ok && pkgJson.success) {
                    setDbPackages(pkgJson.data);
                }
            } catch (err) {
                console.error("Gagal mengambil data kategori/paket:", err);
            }
        };
        fetchData();
    }, []);

    // Sync subcategory options when root category changes
    useEffect(() => {
        if (dbCategories.length > 0 && kategori) {
            const subs = dbCategories.filter(c => c.parent_id == kategori);
            if (subs.length > 0) {
                setSubKategori(subs[0].id.toString());
            } else {
                setSubKategori('');
            }
        }
    }, [kategori, dbCategories]);

    // Validation helper for live indicators
    const isFieldValid = (field) => {
        switch (field) {
            case 'judul':
                return judul.trim().length > 0 && judul.length <= 100;
            case 'kategori':
                return !!kategori;
            case 'subKategori':
                return !!subKategori;
            case 'deskripsi':
                return deskripsi.trim().length > 0;
            case 'harga':
                return tipeHarga === 'Hubungi Kontak' || (!!harga && parseFloat(harga) > 0);
            case 'namaKontak':
                return namaKontak.trim().length > 0;
            case 'whatsapp':
                return whatsapp.trim().length > 0 && whatsapp !== '+62' && /^\+62\d{8,15}$/.test(whatsapp);
            case 'lokasi':
                return lokasi.trim().length > 0;
            default:
                return false;
        }
    };

    // Slide variants for multi-step transitions
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    const [direction, setDirection] = useState(1);

    const validateStep = (s) => {
        const errs = {};
        if (s === 1) {
            if (!judul.trim()) errs.judul = 'Judul iklan wajib diisi';
            else if (judul.length > 100) errs.judul = 'Judul iklan maksimal 100 karakter';
            if (!kategori) errs.kategori = 'Kategori wajib dipilih';
            if (!subKategori) errs.subKategori = 'Sub-kategori wajib dipilih';
        } else if (s === 2) {
            if (!deskripsi.trim()) errs.deskripsi = 'Deskripsi iklan wajib diisi';
            if (tipeHarga === 'Harga Tetap' && !harga) errs.harga = 'Harga wajib diisi untuk pilihan Harga Tetap';
        } else if (s === 3) {
            if (!namaKontak.trim()) errs.namaKontak = 'Nama kontak penjual wajib diisi';
            if (!whatsapp.trim() || whatsapp === '+62') errs.whatsapp = 'Nomor WhatsApp wajib diisi';
            else if (!/^\+62\d{8,15}$/.test(whatsapp)) errs.whatsapp = 'Nomor WhatsApp harus berformat internasional (+62xxxxxxxx)';
            if (!lokasi.trim()) errs.lokasi = 'Lokasi penjualan wajib diisi';
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

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const maxFiles = paket === 'berkah' ? 2 : 10;
        const currentCount = photos.length;
        const remaining = maxFiles - currentCount;

        if (files.length > remaining) {
            alert(`Batas maksimal foto untuk paket saat ini adalah ${maxFiles} file.`);
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
        }, 150);
    };

    // Inject mockup photo automatically
    const handleMockupPhoto = () => {
        const maxFiles = paket === 'berkah' ? 2 : 10;
        if (photos.length >= maxFiles) {
            alert(`Batas maksimal foto untuk paket saat ini adalah ${maxFiles} file.`);
            return;
        }

        const mockTemplates = [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400&auto=format&fit=crop'
        ];

        const randomMock = mockTemplates[photos.length % mockTemplates.length];
        
        setIsUploading(true);
        setUploadProgress(20);
        
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setPhotos(prevPhotos => [
                            ...prevPhotos,
                            {
                                id: Date.now(),
                                name: `mockup-${Date.now()}.jpg`,
                                url: randomMock
                            }
                        ]);
                        setIsUploading(false);
                        setUploadProgress(0);
                    }, 200);
                    return 100;
                }
                return prev + 40;
            });
        }, 100);
    };

    const handleRemovePhoto = (id) => {
        setPhotos(photos.filter(p => p.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setLoading(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('title', judul);
            formData.append('category_id', subKategori || kategori);
            formData.append('description', deskripsi);
            if (tipeHarga === 'Harga Tetap' && harga) {
                formData.append('price', harga);
            }
            formData.append('location', lokasi);
            formData.append('whatsapp', whatsapp);

            // Append photos
            for (let i = 0; i < photos.length; i++) {
                if (photos[i].file) {
                    formData.append('images[]', photos[i].file);
                } else if (photos[i].url) {
                    try {
                        const res = await fetch(photos[i].url);
                        const blob = await res.blob();
                        formData.append('images[]', blob, photos[i].name || `mockup-${i}.jpg`);
                    } catch (err) {
                        console.error("Gagal download mockup:", err);
                    }
                }
            }

            // Create Free Ad first
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
                const createdAd = data.data;
                const adId = createdAd.id;
                setGeneratedAdId(createdAd.id_code || `ADMS-AD-${adId}`);

                // If user selected VIP Premium, request upgrade
                if (paket === 'vip') {
                    const premiumPkg = dbPackages.find(p => p.type === 'premium') || dbPackages[0];
                    if (premiumPkg) {
                        await fetch(`/api/customer/ads/${adId}/upgrade`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                package_id: premiumPkg.id
                            })
                        });
                    }
                }

                setSuccess(true);
            } else {
                setErrors(data.errors || { general: data.message || 'Gagal menyimpan iklan.' });
            }
        } catch (err) {
            console.error("Error submitting ad:", err);
            setErrors({ general: 'Terjadi kesalahan koneksi saat memproses iklan.' });
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (val) => {
        if (!val) return 'Rp0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    // Get current names for preview
    const getCategoryName = (catId) => {
        const match = dbCategories.find(c => c.id === parseInt(catId));
        return match ? match.name : '';
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20">
            {/* Header Navbar */}
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout}
                onNavigate={onNavigate} 
                currentView="create_ad"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                {!success ? (
                    <>
                        {/* A. Header Halaman */}
                        <div className="relative mb-10 p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800/60 backdrop-blur-xl text-left shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div className="space-y-2 relative z-10 max-w-2xl">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-amber-400" />
                                    Pasang Iklan Baru Anda
                                </h1>
                                <p className="text-slate-400 text-xs sm:text-sm">
                                    Isi detail iklan untuk mulai mempromosikan produk, jasa, atau bisnis Anda secara berkah dan amanah.
                                </p>
                            </div>

                            {/* Alert Box Syariah */}
                            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-xs text-amber-300 max-w-md flex items-start gap-3 shadow-inner relative z-10">
                                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Panduan Syariah:</strong> Semua listing wajib bersih dari riba, penipuan, judi, atau konten non-halal lainnya.
                                </div>
                            </div>
                        </div>

                        {/* General Error Message from submit */}
                        {errors.general && (
                            <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-300 text-left">
                                {errors.general}
                            </div>
                        )}

                        {/* Layout Grid 3 Kolom */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            
                            {/* Kiri: Stepper Form (Wizard) */}
                            <div className="lg:col-span-2 space-y-6">
                                
                                {/* Stepper Progress Bar */}
                                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
                                    <div className="flex items-center justify-between relative">
                                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-800 -z-0"></div>
                                        
                                        {[
                                            { stepNum: 1, label: "Informasi Dasar" },
                                            { stepNum: 2, label: "Detail & Harga" },
                                            { stepNum: 3, label: "Media & Kontak" }
                                        ].map((item) => {
                                            const isActive = step === item.stepNum;
                                            const isCompleted = step > item.stepNum;
                                            return (
                                                <div key={item.stepNum} className="flex-1 flex flex-col items-center relative z-10">
                                                    <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border transition-all duration-300 ${
                                                        isCompleted 
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                                                            : isActive 
                                                                ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-lg shadow-amber-400/25 font-black scale-110' 
                                                                : 'bg-slate-900 border-slate-800 text-slate-500'
                                                    }`}>
                                                        {isCompleted ? <Check className="w-4 h-4" /> : item.stepNum}
                                                    </div>
                                                    <span className={`text-[10px] sm:text-xs font-bold mt-2.5 transition-colors ${
                                                        isActive ? 'text-amber-400 font-extrabold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                                                    }`}>{item.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Form Panel Container */}
                                <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <AnimatePresence mode="wait" custom={direction}>
                                            {step === 1 && (
                                                <motion.div 
                                                    key="step1"
                                                    custom={direction}
                                                    variants={slideVariants}
                                                    initial="enter"
                                                    animate="center"
                                                    exit="exit"
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-6 text-left"
                                                >
                                                    <h3 className="font-extrabold text-lg text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
                                                        <span>Langkah 1: Informasi Dasar</span>
                                                        <span className="text-[10px] text-slate-500 font-normal">Wajib diisi (<span className="text-rose-500">*</span>)</span>
                                                    </h3>
                                                    
                                                    {/* Judul Iklan */}
                                                    <div className="space-y-2">
                                                        <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                            <span>Judul Iklan <span className="text-rose-500 font-bold">*</span></span>
                                                            {isFieldValid('judul') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            maxLength={100}
                                                            value={judul}
                                                            onChange={(e) => setJudul(e.target.value)}
                                                            placeholder="Jasa Pembuatan Website Company Profile UMKM Cepat"
                                                            className={`w-full text-xs sm:text-sm p-4 bg-slate-900 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-slate-700 ${
                                                                errors.judul ? 'border-rose-500/80 focus:ring-rose-500/20' : 'border-slate-800 focus:border-slate-700'
                                                            }`}
                                                        />
                                                        <div className="flex items-center justify-between text-[10px]">
                                                            <span className="text-rose-400 font-semibold">{errors.judul}</span>
                                                            <span className="text-slate-500">{judul.length}/100 Karakter</span>
                                                        </div>
                                                    </div>

                                                    {/* Kategori & Sub-Kategori (Row Grid) */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                                <span>Kategori Iklan <span className="text-rose-500 font-bold">*</span></span>
                                                                {isFieldValid('kategori') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                            </label>
                                                            <select
                                                                value={kategori}
                                                                onChange={(e) => setKategori(e.target.value)}
                                                                className="w-full text-xs sm:text-sm p-4 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-slate-700 transition-all text-slate-100"
                                                            >
                                                                {dbCategories.filter(c => !c.parent_id && c.type === 'advertisement').map((cat) => (
                                                                    <option key={cat.id} value={cat.id} className="bg-slate-950">{cat.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
 
                                                        <div className="space-y-2">
                                                            <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                                <span>Sub-Kategori <span className="text-rose-500 font-bold">*</span></span>
                                                                {isFieldValid('subKategori') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                            </label>
                                                            <select
                                                                value={subKategori}
                                                                onChange={(e) => setSubKategori(e.target.value)}
                                                                className="w-full text-xs sm:text-sm p-4 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-slate-700 transition-all text-slate-100"
                                                            >
                                                                {dbCategories.filter(c => c.parent_id == kategori).map((sub) => (
                                                                    <option key={sub.id} value={sub.id} className="bg-slate-950">{sub.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Kondisi (Radio) */}
                                                    {getCategoryName(kategori) !== 'Jasa & Layanan Syariah' && (
                                                        <div className="space-y-3 bg-slate-900/50 p-4 border border-slate-850 rounded-2xl">
                                                            <label className="block text-xs font-bold text-slate-300">Kondisi Barang <span className="text-rose-500 font-bold">*</span></label>
                                                            <div className="flex gap-6">
                                                                {['Baru', 'Bekas'].map((cond) => (
                                                                    <label key={cond} className="flex items-center gap-2.5 text-xs font-bold cursor-pointer text-slate-300 hover:text-slate-100">
                                                                        <input 
                                                                            type="radio" 
                                                                            name="kondisi" 
                                                                            value={cond}
                                                                            checked={kondisi === cond}
                                                                            onChange={() => setKondisi(cond)}
                                                                            className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-800 focus:ring-offset-slate-900"
                                                                        />
                                                                        {cond}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {step === 2 && (
                                                <motion.div 
                                                    key="step2"
                                                    custom={direction}
                                                    variants={slideVariants}
                                                    initial="enter"
                                                    animate="center"
                                                    exit="exit"
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-6 text-left"
                                                >
                                                    <h3 className="font-extrabold text-lg text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
                                                        <span>Langkah 2: Detail & Harga</span>
                                                        <span className="text-[10px] text-slate-500 font-normal">Wajib diisi (<span className="text-rose-500">*</span>)</span>
                                                    </h3>

                                                    {/* Deskripsi Lengkap */}
                                                    <div className="space-y-2">
                                                        <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                            <span>Deskripsi Lengkap <span className="text-rose-500 font-bold">*</span></span>
                                                            {isFieldValid('deskripsi') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                        </label>
                                                        
                                                        {/* Simulated Rich Text Toolbar */}
                                                        <div className="flex items-center gap-1.5 p-2 bg-slate-900 border border-slate-800 border-b-0 rounded-t-xl text-slate-400">
                                                            <button type="button" onClick={() => setDeskripsi(prev => prev + ' **Tebal** ')} className="px-2.5 py-1 text-xs font-extrabold hover:bg-slate-800 hover:text-slate-200 rounded transition-colors">B</button>
                                                            <button type="button" onClick={() => setDeskripsi(prev => prev + ' *Miring* ')} className="px-2.5 py-1 text-xs italic hover:bg-slate-800 hover:text-slate-200 rounded transition-colors">I</button>
                                                            <button type="button" onClick={() => setDeskripsi(prev => prev + '\n- Item List ')} className="px-2.5 py-1 text-xs hover:bg-slate-800 hover:text-slate-200 rounded transition-colors">&bull; List</button>
                                                        </div>
                                                        
                                                        <textarea 
                                                            rows={6}
                                                            value={deskripsi}
                                                            onChange={(e) => setDeskripsi(e.target.value)}
                                                            placeholder="Tuliskan spesifikasi produk, keunggulan jasa, dan detail lengkap penawaran Anda di sini..."
                                                            className={`w-full text-xs sm:text-sm p-4 bg-slate-900 border border-slate-800 rounded-b-xl outline-none focus:ring-2 focus:ring-slate-700 transition-all text-slate-100 resize-none ${
                                                                errors.deskripsi ? 'border-rose-500/80 focus:ring-rose-500/20' : 'border-slate-800'
                                                            }`}
                                                        />
                                                        <span className="text-[10px] text-rose-400 font-semibold">{errors.deskripsi}</span>
                                                    </div>

                                                    {/* Tipe Harga & Nilai Harga (Row Grid) */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                                                        <div className="space-y-2">
                                                            <label className="block text-xs font-bold text-slate-300">Tipe Harga <span className="text-rose-500 font-bold">*</span></label>
                                                            <div className="flex gap-4 p-4 border border-slate-800 rounded-xl bg-slate-900">
                                                                {['Harga Tetap', 'Hubungi Kontak'].map((tPrice) => (
                                                                    <label key={tPrice} className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-300 hover:text-slate-100">
                                                                        <input 
                                                                            type="radio" 
                                                                            name="tipeHarga"
                                                                            value={tPrice}
                                                                            checked={tipeHarga === tPrice}
                                                                            onChange={() => setTipeHarga(tPrice)}
                                                                            className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-850"
                                                                        />
                                                                        {tPrice}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                                <span>Harga (Rupiah)</span>
                                                                {isFieldValid('harga') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                            </label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-4 text-xs sm:text-sm font-black text-slate-500">Rp</span>
                                                                <input 
                                                                    type="number" 
                                                                    disabled={tipeHarga === 'Hubungi Kontak'}
                                                                    value={tipeHarga === 'Hubungi Kontak' ? '' : harga}
                                                                    onChange={(e) => setHarga(e.target.value)}
                                                                    placeholder="50000"
                                                                    className={`w-full text-xs sm:text-sm p-4 pl-10 bg-slate-900 border rounded-xl outline-none focus:ring-2 focus:ring-slate-700 transition-all text-slate-100 ${
                                                                        tipeHarga === 'Hubungi Kontak' 
                                                                            ? 'bg-slate-900/40 border-slate-850 text-slate-500 cursor-not-allowed' 
                                                                            : errors.harga 
                                                                                ? 'border-rose-500/80 focus:ring-rose-500/20' 
                                                                                : 'border-slate-800'
                                                                    }`}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] text-rose-400 font-semibold">{errors.harga}</span>
                                                        </div>
                                                    </div>

                                                    {/* Tag / Kata Kunci */}
                                                    <div className="space-y-2">
                                                        <label className="block text-xs font-bold text-slate-300">Tag / Kata Kunci (Dipisahkan koma)</label>
                                                        <input 
                                                            type="text" 
                                                            value={tags}
                                                            onChange={(e) => setTags(e.target.value)}
                                                            placeholder="website, jasa landing page, coding"
                                                            className="w-full text-xs sm:text-sm p-4 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-slate-700 transition-all text-slate-100"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {step === 3 && (
                                                <motion.div 
                                                    key="step3"
                                                    custom={direction}
                                                    variants={slideVariants}
                                                    initial="enter"
                                                    animate="center"
                                                    exit="exit"
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-6 text-left"
                                                >
                                                    <h3 className="font-extrabold text-lg text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
                                                        <span>Langkah 3: Media & Kontak</span>
                                                        <span className="text-[10px] text-slate-500 font-normal">Wajib diisi (<span className="text-rose-500">*</span>)</span>
                                                    </h3>

                                                    {/* Media Dropzone & Simulation Button */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="block text-xs font-bold text-slate-300">Foto Iklan <span className="text-rose-500 font-bold">*</span></label>
                                                            <button 
                                                                type="button"
                                                                onClick={handleMockupPhoto}
                                                                className="text-[10px] font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <Sparkles className="w-3 h-3 text-amber-400" />
                                                                Gunakan Foto Mockup Otomatis
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 bg-slate-900/30 hover:bg-slate-900/60 hover:border-slate-700 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative group">
                                                            <input 
                                                                type="file" 
                                                                multiple
                                                                accept="image/*"
                                                                onChange={handleFileUpload}
                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                                disabled={isUploading}
                                                            />
                                                            <Camera className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 transition-colors mb-2" />
                                                            <span className="text-xs font-bold text-slate-300">Tarik atau Pilih Foto</span>
                                                            <span className="text-[10px] text-slate-500 mt-1">Maksimal {paket === 'berkah' ? '2 foto' : '10 foto'} (Format JPG/PNG, Max 2MB)</span>
                                                        </div>

                                                        {/* Uploading progress bar simulation */}
                                                        {isUploading && (
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                                                    <span>Mengunggah file...</span>
                                                                    <span>{uploadProgress}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                                    <div className="bg-emerald-500 h-1.5 transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Photo list preview */}
                                                        {photos.length > 0 && (
                                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                                                                {photos.map((p) => (
                                                                    <div key={p.id} className="relative aspect-square rounded-xl border border-slate-800 overflow-hidden bg-slate-900 group">
                                                                        <img src={p.url} alt="upload" className="w-full h-full object-cover" />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => handleRemovePhoto(p.id)}
                                                                            className="absolute top-1.5 right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 shadow shadow-slate-950"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Contacts Input Form Block */}
                                                    <div className="space-y-4">
                                                        {/* Nama & WA (Row Grid) */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                                    <span>Nama Kontak Penjual <span className="text-rose-500 font-bold">*</span></span>
                                                                    {isFieldValid('namaKontak') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                                </label>
                                                                <input 
                                                                    type="text" 
                                                                    value={namaKontak}
                                                                    onChange={(e) => setNamaKontak(e.target.value)}
                                                                    className={`w-full text-xs sm:text-sm p-4 bg-slate-900 border rounded-xl outline-none focus:ring-2 focus:ring-slate-700 transition-all text-slate-100 ${
                                                                        errors.namaKontak ? 'border-rose-500/80 focus:ring-rose-500/20' : 'border-slate-800'
                                                                    }`}
                                                                />
                                                                <span className="text-[10px] text-rose-400 font-semibold">{errors.namaKontak}</span>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                                    <span>Nomor WhatsApp <span className="text-rose-500 font-bold">*</span></span>
                                                                    {isFieldValid('whatsapp') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                                </label>
                                                                <div className="relative">
                                                                    <Phone className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                                                                    <input 
                                                                        type="text" 
                                                                        value={whatsapp}
                                                                        onChange={(e) => setWhatsapp(e.target.value)}
                                                                        placeholder="+62812345678"
                                                                        className={`w-full text-xs sm:text-sm p-4 pl-11 bg-slate-900 border rounded-xl outline-none focus:ring-2 focus:ring-slate-700 transition-all text-slate-100 ${
                                                                            errors.whatsapp ? 'border-rose-500/80 focus:ring-rose-500/20' : 'border-slate-800'
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-rose-400 font-semibold">{errors.whatsapp}</span>
                                                            </div>
                                                        </div>

                                                        {/* Lokasi & Web (Row Grid) */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="flex items-center justify-between text-xs font-bold text-slate-300">
                                                                    <span>Lokasi Penjualan <span className="text-rose-500 font-bold">*</span></span>
                                                                    {isFieldValid('lokasi') && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                                </label>
                                                                <div className="relative">
                                                                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                                                                    <input 
                                                                        type="text" 
                                                                        value={lokasi}
                                                                        onChange={(e) => setLokasi(e.target.value)}
                                                                        placeholder="Misal: Jakarta Timur atau Sleman, Yogyakarta"
                                                                        className={`w-full text-xs sm:text-sm p-4 pl-11 bg-slate-900 border rounded-xl outline-none focus:ring-2 focus:ring-slate-700 transition-all text-slate-100 ${
                                                                            errors.lokasi ? 'border-rose-500/80 focus:ring-rose-500/20' : 'border-slate-800'
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-rose-400 font-semibold">{errors.lokasi}</span>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="block text-xs font-bold text-slate-300">Tautan Website (Opsional)</label>
                                                                <div className="relative">
                                                                    <Globe className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                                                                    <input 
                                                                        type="url" 
                                                                        value={website}
                                                                        onChange={(e) => setWebsite(e.target.value)}
                                                                        placeholder="https://tokoanda.com"
                                                                        className="w-full text-xs sm:text-sm p-4 pl-11 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-slate-700 transition-all text-slate-100"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Upgrade Options */}
                                                    <div className="border-t border-slate-800 pt-6 text-left space-y-4">
                                                        <label className="block text-xs font-bold text-slate-300">Pilih Paket Penayangan Iklan <span className="text-rose-500 font-bold">*</span></label>
                                                        
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {/* Paket Berkah */}
                                                            <div 
                                                                onClick={() => setPaket('berkah')}
                                                                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                                                                    paket === 'berkah' 
                                                                        ? 'border-emerald-500 bg-emerald-500/5 shadow-sm' 
                                                                        : 'border-slate-850 hover:border-slate-700 bg-slate-900/20'
                                                                }`}
                                                            >
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-extrabold text-slate-200">Paket Berkah (Gratis)</span>
                                                                        <span className="text-xs font-black text-emerald-400">Rp0</span>
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                                                        Cocok untuk UMKM lokal. Iklan reguler ditinjau secara manual oleh tim.
                                                                    </p>
                                                                </div>
                                                                <ul className="text-[9px] text-slate-500 space-y-1 mt-4">
                                                                    <li>&bull; Masa aktif 7 hari</li>
                                                                    <li>&bull; Maksimal 2 foto</li>
                                                                    <li>&bull; Moderasi admin 24 jam</li>
                                                                </ul>
                                                            </div>

                                                            {/* Paket VIP Premium */}
                                                            <div 
                                                                onClick={() => setPaket('vip')}
                                                                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                                                                    paket === 'vip' 
                                                                        ? 'border-amber-400 bg-amber-400/5 shadow-sm' 
                                                                        : 'border-slate-850 hover:border-slate-700 bg-slate-900/20'
                                                                }`}
                                                            >
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-extrabold text-slate-200 flex items-center gap-1">
                                                                            Paket VIP Premium
                                                                            <span className="bg-amber-400 text-slate-950 text-[8px] font-bold px-1.5 py-0.5 rounded shadow">VIP</span>
                                                                        </span>
                                                                        <span className="text-xs font-black text-amber-400">Rp10.000</span>
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                                                        Maksimalkan prospek Anda. Tayang di baris teratas hasil pencarian & beranda.
                                                                    </p>
                                                                </div>
                                                                <ul className="text-[9px] text-slate-500 space-y-1 mt-4">
                                                                    <li>&bull; Masa aktif 30 hari</li>
                                                                    <li>&bull; Maksimal 10 foto</li>
                                                                    <li>&bull; Tayang instan tanpa antrean</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Action Buttons */}
                                        <div className="border-t border-slate-800 pt-6 flex items-center justify-between">
                                            {step > 1 ? (
                                                <button 
                                                    type="button" 
                                                    onClick={handlePrev}
                                                    className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    Kembali
                                                </button>
                                            ) : (
                                                <button 
                                                    type="button" 
                                                    onClick={() => onNavigate('homepage', '/')}
                                                    className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                    <Home className="w-4 h-4" />
                                                    Kembali ke Beranda
                                                </button>
                                            )}

                                            {step < 3 ? (
                                                <button 
                                                    type="button" 
                                                    onClick={handleNext}
                                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                                                >
                                                    Lanjut
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    type="submit" 
                                                    disabled={loading}
                                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/10 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                            <span>Memproses Iklan...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Pasang Iklan Sekarang</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Kanan: Live Preview Card Panel (Sticky) */}
                            <div className="lg:col-span-1 lg:sticky lg:top-10 space-y-4">
                                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl text-left">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            Live Preview Card
                                        </h4>
                                        <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-slate-400">Realtime</span>
                                    </div>

                                    {/* Simulated Listing Card */}
                                    <div className="mt-4 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md flex flex-col">
                                        {/* Card Image Area */}
                                        <div className="aspect-[16/10] bg-slate-950 relative overflow-hidden flex items-center justify-center text-slate-600">
                                            {photos.length > 0 ? (
                                                <img src={photos[0].url} alt="Listing Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <Camera className="w-8 h-8 text-slate-700" />
                                                    <span className="text-[10px] text-slate-600 font-bold">Belum ada foto</span>
                                                </div>
                                            )}

                                            {/* VIP / Free Badge */}
                                            <div className="absolute top-3 left-3 z-10">
                                                {paket === 'vip' ? (
                                                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-current text-slate-950" />
                                                        VIP Sponsor
                                                    </span>
                                                ) : (
                                                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-lg">
                                                        Gratis
                                                    </span>
                                                )}
                                            </div>

                                            {/* Category Tag on bottom left */}
                                            <div className="absolute bottom-3 left-3 bg-slate-950/70 border border-slate-800/80 backdrop-blur text-[8px] font-extrabold text-slate-300 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                {getCategoryName(kategori) || 'Kategori'}
                                            </div>
                                        </div>

                                        {/* Card Body content */}
                                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-extrabold text-slate-400">
                                                        {getCategoryName(subKategori) || 'Sub-kategori'}
                                                    </span>
                                                    {getCategoryName(kategori) !== 'Jasa & Layanan Syariah' && (
                                                        <span className="text-[9px] font-black bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                                                            {kondisi}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-extrabold text-xs text-slate-200 leading-snug line-clamp-2">
                                                    {judul || 'Judul Iklan Menunggu Input...'}
                                                </h4>
                                            </div>

                                            {/* Details section */}
                                            <div className="space-y-2.5 pt-2 border-t border-slate-850">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-500">Harga Penawaran</span>
                                                    <span className="text-xs font-black text-emerald-400">
                                                        {tipeHarga === 'Hubungi Kontak' ? 'Hubungi Kontak' : formatRupiah(harga)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-[9px] text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-slate-500" />
                                                        {lokasi || 'Lokasi Toko'}
                                                    </span>
                                                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                                                        <Phone className="w-3 h-3 text-slate-500" />
                                                        {namaKontak || 'Seller'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* WhatsApp mockup action btn */}
                                            <div className="pt-2">
                                                <div className="w-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    <span>Hubungi via WhatsApp</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 p-3 bg-slate-900 border border-slate-850 rounded-xl">
                                        <p className="text-[10px] text-slate-500 leading-relaxed text-center">
                                            Tampilan di atas adalah simulasi live card dari produk/jasa Anda di katalog penayangan ADMS Marketplace.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    /* C. HALAMAN KONDISI SUKSES */
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-16 text-center space-y-6 max-w-2xl mx-auto"
                    >
                        <motion.div 
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6 }}
                            className="w-20 h-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400"
                        >
                            <CheckCircle className="w-12 h-12" />
                        </motion.div>

                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Iklan Anda Berhasil Dikirim!</h2>
                            <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                                Iklan Anda saat ini sedang berada dalam antrean moderasi oleh Tim ADMS. Kami akan segera memberi tahu Anda melalui notifikasi dan email setelah iklan disetujui untuk tayang.
                            </p>
                        </div>

                        {/* Ad ID Code block */}
                        <div className="inline-block bg-slate-900 border border-slate-800 rounded-xl px-6 py-3 font-mono text-xs sm:text-sm text-slate-300 font-bold">
                            Kode ID Iklan: <span className="text-amber-400">{generatedAdId}</span>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <button 
                                onClick={() => onNavigate('dashboard', '/customer')}
                                className="px-6 py-3 bg-[#0D9488] hover:bg-[#0b7d72] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                            >
                                Lihat Daftar Iklan Saya
                            </button>
                            <button 
                                onClick={() => onNavigate('homepage', '/')}
                                className="px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl transition-colors cursor-pointer"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
