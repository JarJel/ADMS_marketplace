import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Upload, Camera, CheckCircle, 
    ArrowLeft, Home, FileText, Settings, ShieldCheck, Info,
    Coins, Star, MapPin, Phone, Globe, Trash2, ChevronDown
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CreateAd({ user, token, onNavigate, darkMode, setDarkMode, onLogout }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [generatedAdId, setGeneratedAdId] = useState('');

    // Form fields state
    const [judul, setJudul] = useState('');
    const [kategori, setKategori] = useState('Jasa & Layanan');
    const [subKategori, setSubKategori] = useState('');
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

    // Kategori dinamis dari database
    const [dbCategories, setDbCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');

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
                console.error("Gagal memuat kategori iklan gratis:", err);
                setDbCategories(FALLBACK_CATEGORIES);
                setSelectedCategoryId(FALLBACK_CATEGORIES[0].id.toString());
                setSelectedSubCategoryId(FALLBACK_CATEGORIES[0].children[0].id.toString());
            }
        };
        fetchAdCategories();
    }, []);

    useEffect(() => {
        const parentId = parseInt(selectedCategoryId);
        const parentCat = dbCategories.find(c => c.id === parentId);
        if (parentCat) {
            if (parentCat.children && parentCat.children.length > 0) {
                setSelectedSubCategoryId(parentCat.children[0].id.toString());
            } else {
                setSelectedSubCategoryId(parentCat.id.toString());
            }
        }
    }, [selectedCategoryId, dbCategories]);

    const activeCategoryName = dbCategories.find(c => c.id === parseInt(selectedCategoryId))?.name || '';
    const isJasa = activeCategoryName.toLowerCase().includes('jasa');

    // Slide variants for multi-step transitions
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

        // Validation based on Package
        const maxFiles = paket === 'berkah' ? 2 : 10;
        const currentCount = photos.length;
        const remaining = maxFiles - currentCount;

        if (files.length > remaining) {
            alert(`Batas maksimal foto untuk paket saat ini adalah ${maxFiles} file.`);
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        // Simulate progress bar loading animation
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
        if (!validateStep(3)) return;

        setLoading(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('title', judul);
            formData.append('category_id', selectedSubCategoryId);
            formData.append('description', deskripsi);
            formData.append('price', tipeHarga === 'Harga Tetap' ? harga : 0);
            formData.append('location', lokasi);
            formData.append('whatsapp', whatsapp);
            formData.append('contact_name', namaKontak);
            if (!isJasa) {
                formData.append('condition', kondisi);
            }
            if (website) {
                formData.append('website_url', website);
            }

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
            console.error("Error submitting ad:", err);
            alert("Terjadi kesalahan jaringan saat mempublikasikan iklan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 transition-colors duration-300 font-sans pb-20">
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

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                {!success ? (
                    <>
                        {/* A. Header Halaman */}
                        <div className="text-center mb-8 space-y-2">
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pasang Iklan Baru Anda</h1>
                            <p className="text-slate-500 text-sm">
                                Isi detail iklan untuk mulai mempromosikan produk, jasa, atau bisnis Anda secara gratis.
                            </p>

                            {/* Alert Box Syariah */}
                            <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-left text-xs sm:text-sm text-amber-800 flex items-start gap-2.5 shadow-sm">
                                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong>Pemberitahuan:</strong> Semua iklan yang masuk akan ditinjau oleh Admin dalam waktu maksimal 24 jam untuk memastikan kesesuaian dengan panduan syariah (bebas dari konten riba, judi, pornografi, penipuan, atau produk non-halal).
                                </div>
                            </div>
                        </div>

                        {/* B. Stepper */}
                        <div className="mb-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                {[
                                    { stepNum: 1, label: "Informasi Dasar" },
                                    { stepNum: 2, label: "Detail & Harga" },
                                    { stepNum: 3, label: "Media & Kontak" }
                                ].map((item) => (
                                    <div key={item.stepNum} className="flex-1 flex flex-col items-center relative">
                                        <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border z-10 transition-all ${
                                            step >= item.stepNum 
                                                ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10' 
                                                : 'bg-white border-slate-200 text-slate-400'
                                        }`}>
                                            {item.stepNum}
                                        </div>
                                        <span className={`text-[10px] sm:text-xs font-bold mt-2 transition-colors ${
                                            step >= item.stepNum ? 'text-slate-800' : 'text-slate-400'
                                        }`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Panel Container */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 relative overflow-hidden">
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
                                            className="space-y-6"
                                        >
                                            <h3 className="font-extrabold text-lg text-slate-800 border-b border-slate-100 pb-3">Langkah 1: Informasi Dasar</h3>
                                            
                                            {/* Judul Iklan */}
                                            <div className="space-y-1.5 text-left">
                                                <label className="block text-xs font-bold text-slate-700">Judul Iklan <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    maxLength={100}
                                                    value={judul}
                                                    onChange={(e) => setJudul(e.target.value)}
                                                    placeholder="Jasa Pembuatan Website Company Profile UMKM Cepat"
                                                    className="w-full text-slate-800 text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                                />
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-rose-500 font-semibold">{errors.judul}</span>
                                                    <span className="text-slate-400">{judul.length}/100 Karakter</span>
                                                </div>
                                            </div>

                                            {/* Kategori & Sub-Kategori (Row) */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-bold text-slate-700">Kategori Iklan <span className="text-red-500">*</span></label>
                                                    <select
                                                        value={selectedCategoryId}
                                                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                                                        className="w-full text-slate-800 text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl outline-none bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                                    >
                                                        {dbCategories.map((cat) => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                    <span className="text-[10px] text-rose-500 font-semibold">{errors.kategori}</span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-bold text-slate-700">Sub-Kategori <span className="text-red-500">*</span></label>
                                                    <select
                                                        value={selectedSubCategoryId}
                                                        onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                                                        className="w-full text-slate-800 text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl outline-none bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                                    >
                                                        {(() => {
                                                            const parent = dbCategories.find(c => c.id === parseInt(selectedCategoryId));
                                                            if (parent && parent.children && parent.children.length > 0) {
                                                                return parent.children.map((sub) => (
                                                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                                                ));
                                                            }
                                                            return parent ? <option value={parent.id}>Semua {parent.name}</option> : null;
                                                        })()}
                                                    </select>
                                                    <span className="text-[10px] text-rose-500 font-semibold">{errors.subKategori}</span>
                                                </div>
                                            </div>

                                            {/* Kondisi (Radio) */}
                                            {!isJasa && (
                                                <div className="space-y-2 text-left">
                                                    <label className="block text-xs font-bold text-slate-700">Kondisi Barang <span className="text-red-500">*</span></label>
                                                    <div className="flex gap-4">
                                                        {['Baru', 'Bekas'].map((cond) => (
                                                            <label key={cond} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-800">
                                                                <input 
                                                                    type="radio" 
                                                                    name="kondisi" 
                                                                    value={cond}
                                                                    checked={kondisi === cond}
                                                                    onChange={() => setKondisi(cond)}
                                                                    className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"
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
                                            className="space-y-6"
                                        >
                                            <h3 className="font-extrabold text-lg text-slate-800 border-b border-slate-100 pb-3">Langkah 2: Detail & Harga</h3>

                                            {/* Deskripsi Lengkap */}
                                            <div className="space-y-1.5 text-left">
                                                <label className="block text-xs font-bold text-slate-700">Deskripsi Lengkap <span className="text-red-500">*</span></label>
                                                
                                                {/* Simulated Rich Text Toolbar */}
                                                <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-b-0 border-slate-200 rounded-t-xl text-slate-500">
                                                    <button type="button" onClick={() => setDeskripsi(prev => prev + ' **Tebal** ')} className="px-2 py-1 text-xs font-bold hover:bg-slate-200 rounded">B</button>
                                                    <button type="button" onClick={() => setDeskripsi(prev => prev + ' *Miring* ')} className="px-2 py-1 text-xs italic hover:bg-slate-200 rounded">I</button>
                                                    <button type="button" onClick={() => setDeskripsi(prev => prev + '\n- Item List ')} className="px-2 py-1 text-xs hover:bg-slate-200 rounded">&bull; List</button>
                                                </div>
                                                
                                                <textarea 
                                                    rows={6}
                                                    value={deskripsi}
                                                    onChange={(e) => setDeskripsi(e.target.value)}
                                                    placeholder="Tuliskan spesifikasi produk, keunggulan jasa, dan detail lengkap penawaran Anda di sini..."
                                                    className="w-full text-slate-800 text-xs sm:text-sm p-4 border border-slate-200 rounded-b-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                                                />
                                                <span className="text-[10px] text-rose-500 font-semibold">{errors.deskripsi}</span>
                                            </div>

                                            {/* Tipe Harga & Nilai Harga (Row) */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left items-end">
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-bold text-slate-700">Tipe Harga <span className="text-red-500">*</span></label>
                                                    <div className="flex gap-4 p-3 border border-slate-200 rounded-xl bg-white">
                                                        {['Harga Tetap', 'Hubungi Kontak'].map((tPrice) => (
                                                            <label key={tPrice} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-slate-800">
                                                                <input 
                                                                    type="radio" 
                                                                    name="tipeHarga"
                                                                    value={tPrice}
                                                                    checked={tipeHarga === tPrice}
                                                                    onChange={() => setTipeHarga(tPrice)}
                                                                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                                                                />
                                                                {tPrice}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-bold text-slate-700">Harga (Rupiah)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-3.5 text-xs sm:text-sm font-bold text-slate-400">Rp</span>
                                                        <input 
                                                            type="number" 
                                                            disabled={tipeHarga === 'Hubungi Kontak'}
                                                            value={tipeHarga === 'Hubungi Kontak' ? '' : harga}
                                                            onChange={(e) => setHarga(e.target.value)}
                                                            placeholder="50000"
                                                            className={`w-full text-slate-800 text-xs sm:text-sm p-3.5 pl-10 border rounded-xl outline-none ${
                                                                tipeHarga === 'Hubungi Kontak' 
                                                                    ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed' 
                                                                    : 'border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                                                            }`}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-rose-500 font-semibold">{errors.harga}</span>
                                                </div>
                                            </div>

                                            {/* Tag / Kata Kunci */}
                                            <div className="space-y-1.5 text-left">
                                                <label className="block text-xs font-bold text-slate-700">Tag / Kata Kunci (Dipisahkan koma)</label>
                                                <input 
                                                    type="text" 
                                                    value={tags}
                                                    onChange={(e) => setTags(e.target.value)}
                                                    placeholder="website, jasa landing page, coding"
                                                    className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
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
                                            className="space-y-6"
                                        >
                                            <h3 className="font-extrabold text-lg text-slate-800 border-b border-slate-100 pb-3">Langkah 3: Media & Kontak</h3>

                                            {/* Media Dropzone */}
                                            <div className="space-y-2 text-left">
                                                <label className="block text-xs font-bold text-slate-700">Foto Iklan <span className="text-red-500">*</span></label>
                                                
                                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative group">
                                                    <input 
                                                        type="file" 
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        disabled={isUploading}
                                                    />
                                                    <Camera className="w-8 h-8 text-slate-400 group-hover:text-teal-500 transition-colors mb-2" />
                                                    <span className="text-xs font-bold text-slate-700">Tarik atau Pilih Foto</span>
                                                    <span className="text-[10px] text-slate-400 mt-1">Maksimal {paket === 'berkah' ? '2 foto' : '10 foto'} (Format JPG/PNG, Max 2MB per file)</span>
                                                </div>

                                                {/* Uploading progress bar simulation */}
                                                {isUploading && (
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                                                            <span>Mengunggah file...</span>
                                                            <span>{uploadProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-teal-600 h-1.5 transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Photo list preview */}
                                                {photos.length > 0 && (
                                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                                                        {photos.map((p) => (
                                                            <div key={p.id} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                                                                <img src={p.url} alt="upload" className="w-full h-full object-cover" />
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleRemovePhoto(p.id)}
                                                                    className="absolute top-1 right-1 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                {/* Nama & WA (Row) */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-bold text-slate-700">Nama Kontak Penjual <span className="text-red-500">*</span></label>
                                                        <input 
                                                            type="text" 
                                                            value={namaKontak}
                                                            onChange={(e) => setNamaKontak(e.target.value)}
                                                            className="w-full text-slate-800 text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                                                        />
                                                        <span className="text-[10px] text-rose-500 font-semibold">{errors.namaKontak}</span>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-bold text-slate-700">Nomor WhatsApp <span className="text-red-500">*</span></label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                                            <input 
                                                                type="text" 
                                                                value={whatsapp}
                                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                                placeholder="+6281121211933"
                                                                className="w-full text-slate-800 text-xs sm:text-sm p-3.5 pl-11 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-rose-500 font-semibold">{errors.whatsapp}</span>
                                                    </div>
                                                </div>

                                                {/* Lokasi & Web (Row) */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-bold text-slate-700">Lokasi Penjualan <span className="text-red-500">*</span></label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                                            <input 
                                                                type="text" 
                                                                value={lokasi}
                                                                onChange={(e) => setLokasi(e.target.value)}
                                                                placeholder="Misal: Jakarta Timur atau Sleman, Yogyakarta"
                                                                className="w-full text-slate-800 text-xs sm:text-sm p-3.5 pl-11 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-rose-500 font-semibold">{errors.lokasi}</span>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-bold text-slate-700">Tautan Website (Opsional)</label>
                                                        <div className="relative">
                                                            <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                                            <input 
                                                                type="url" 
                                                                value={website}
                                                                onChange={(e) => setWebsite(e.target.value)}
                                                                placeholder="https://tokoanda.com"
                                                                className="w-full text-slate-800 text-xs sm:text-sm p-3.5 pl-11 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Langkah 4: Opsi Peningkatan Iklan (Upgrade Options inside step 3) */}
                                            <div className="border-t border-slate-100 pt-6 text-left space-y-4">
                                                <label className="block text-xs font-bold text-slate-700">Pilih Paket Penayangan Iklan <span className="text-red-500">*</span></label>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Paket Berkah */}
                                                    <div 
                                                        onClick={() => setPaket('berkah')}
                                                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                                                            paket === 'berkah' 
                                                                ? 'border-teal-600 bg-teal-50/10 shadow-sm' 
                                                                : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-extrabold text-slate-800">Paket Berkah (Gratis)</span>
                                                                <span className="text-xs font-black text-teal-600">Rp0</span>
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
                                                                ? 'border-indigo-600 bg-indigo-50/10 shadow-sm shadow-indigo-600/5' 
                                                                : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                                                                    Paket VIP Premium
                                                                    <span className="bg-amber-400 text-slate-900 text-[8px] font-bold px-1 py-0.5 rounded shadow">VIP</span>
                                                                </span>
                                                                <span className="text-xs font-black text-indigo-600">Rp10.000</span>
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
                                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                                    {step > 1 ? (
                                        <button 
                                            type="button" 
                                            onClick={handlePrev}
                                            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Kembali
                                        </button>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={() => onNavigate('homepage', '/')}
                                            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors"
                                        >
                                            <Home className="w-4 h-4" />
                                            Kembali ke Beranda
                                        </button>
                                    )}

                                    {step < 3 ? (
                                        <button 
                                            type="button" 
                                            onClick={handleNext}
                                            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-md shadow-teal-600/10"
                                        >
                                            Lanjut
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-teal-600/10 disabled:opacity-50"
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
                    </>
                ) : (
                    /* 3. HALAMAN KONDISI SUKSES */
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-16 text-center space-y-6"
                    >
                        {/* Bouncing/Rotating checkmark */}
                        <motion.div 
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6 }}
                            className="w-20 h-20 bg-emerald-50 rounded-full border-2 border-emerald-100 flex items-center justify-center mx-auto text-emerald-500"
                        >
                            <CheckCircle className="w-12 h-12" />
                        </motion.div>

                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Iklan Anda Berhasil Dikirim!</h2>
                            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                                Iklan Anda saat ini sedang berada dalam antrean moderasi oleh Tim ADMS. Kami akan segera memberi tahu Anda melalui notifikasi dan email setelah iklan disetujui untuk tayang.
                            </p>
                        </div>

                        {/* Ad ID Code block */}
                        <div className="inline-block bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 font-mono text-xs sm:text-sm text-slate-600 font-bold">
                            Kode ID Iklan: <span className="text-teal-600">{generatedAdId}</span>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <button 
                                onClick={() => onNavigate('dashboard', '/customer')}
                                className="px-6 py-3 bg-[#0D9488] hover:bg-[#0b7d72] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                            >
                                Lihat Daftar Iklan Saya
                            </button>
                            <button 
                                onClick={() => onNavigate('homepage', '/')}
                                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-xl transition-colors"
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
