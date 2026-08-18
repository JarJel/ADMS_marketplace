import React, { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { 
    Search, Palette, BookOpen, Code, Cpu, Megaphone, 
    Briefcase, Star, MessageSquare, Sun, Moon, ArrowRight, 
    Shield, CheckCircle, Smartphone, ExternalLink, HelpCircle,
    LayoutGrid, Share2, ShoppingBag, Store, Download, Zap, Users, Quote, ChevronDown,
    LayoutTemplate, Book, Globe, Video, Headphones, GraduationCap, TrendingUp, Wrench, Handshake, MoreHorizontal,
    Heart, ShoppingCart, X, Phone
} from 'lucide-react';
import debounce from 'lodash.debounce';

// Reusable scroll fade-in animation component using Intersection Observer
function ScrollFadeIn({ children, className = '' }) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(domRef.current);
                }
            });
        });
        
        if (domRef.current) {
            observer.observe(domRef.current);
        }
        return () => {
            if (domRef.current) {
                observer.unobserve(domRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${className}`}
        >
            {children}
        </div>
    );
}

export default function Homepage({ isLoggedIn, user, token, onNavigateToLogin, onNavigateToRegister, onNavigateToDashboard, onNavigateToCreateAd, onNavigateToClassifieds, onNavigateToProducts, onNavigate, onLogout, darkMode, setDarkMode }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [merchants, setMerchants] = useState([]);
    const [loadingMerchants, setLoadingMerchants] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((query) => {
            setSearchQuery(query);
            // You can add an API call or filter logic here based on the query
            console.log("Searching for:", query); 
        }, 500), // 500ms debounce delay
        []
    );

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchInput(query); // Update local input state instantly
        debouncedSearch(query); // Call debounced function
    };

    useEffect(() => {
        fetchMerchants();
    }, []);

    const fetchMerchants = async () => {
        try {
            const response = await fetch('/api/public/merchants');
            const data = await response.json();
            if (response.ok && data.success) {
                setMerchants(data.data);
            }
        } catch (err) {
            console.error("Gagal mengambil data merchant:", err);
        } finally {
            setLoadingMerchants(false);
        }
    };

    const handleAddToCart = async (productId) => {
        if (!isLoggedIn) {
            alert('Silakan login terlebih dahulu untuk menambah ke keranjang');
            onNavigateToLogin();
            return;
        }
        try {
            const res = await fetch('/api/customer/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ product_id: productId, quantity: 1 })
            });
            const data = await res.json();
            if (data.success) {
                alert('Berhasil ditambahkan ke keranjang!');
            } else {
                alert(data.message || 'Gagal menambahkan ke keranjang');
            }
        } catch (error) { console.error(error); }
    };

    const toggleWishlist = async (productId) => {
        if (!isLoggedIn) {
            alert('Silakan login terlebih dahulu untuk menyimpan wishlist');
            onNavigateToLogin();
            return;
        }
        try {
            const res = await fetch('/api/customer/wishlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ product_id: productId })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
            }
        } catch (error) { console.error(error); }
    };

    const [activeTab, setActiveTab] = useState('buyer');
    const [expandedFaq, setExpandedFaq] = useState(0);

    const stepsData = {
        buyer: [
            { num: "01", title: "Cari Produk Digital", desc: "Gunakan fitur pencarian atau jelajahi kategori template, ebook, software, dan aset digital.", step: "Langkah 1", arrow: true },
            { num: "02", title: "Pilih & Cek Detail", desc: "Lihat preview produk, spesifikasi, serta ulasan pembeli terdahulu.", step: "Langkah 2", arrow: true },
            { num: "03", title: "Checkout & Pilih Pembayaran", desc: "Isi informasi pesanan dan pilih metode pembayaran QRIS, Transfer Bank, atau E-Wallet.", step: "Langkah 3", arrow: true },
            { num: "04", title: "Bayar & Verifikasi", desc: "Sistem pembayaran aman memproses transaksi secara otomatis secara instan.", step: "Langkah 4", arrow: true },
            { num: "05", title: "Download Produk Instan", desc: "Unduh file digital langsung dari halaman transaksi atau menu My Downloads.", step: "Langkah 5", arrow: false }
        ],
        merchant: [
            { num: "01", title: "Daftar Toko", desc: "Daftarkan nama dan deskripsi toko Anda di dashboard merchant.", step: "Langkah 1", arrow: true },
            { num: "02", title: "Verifikasi Toko", desc: "Tunggu proses verifikasi keabsahan toko oleh admin ADMS.", step: "Langkah 2", arrow: true },
            { num: "03", title: "Unggah Produk", desc: "Tambahkan aset digital halal Anda beserta harga dan file zip/download.", step: "Langkah 3", arrow: true },
            { num: "04", title: "Proses Penjualan", desc: "Mulai terima pesanan masuk dan pantau grafik hasil penjualan Anda.", step: "Langkah 4", arrow: true },
            { num: "05", title: "Tarik Pendapatan", desc: "Ajukan withdrawal untuk menarik saldo hasil penjualan langsung ke rekening bank.", step: "Langkah 5", arrow: false }
        ],
        advertiser: [
            { num: "01", title: "Buat Iklan", desc: "Isi detail iklan baris, deskripsi jasa/barang, dan nomor kontak WA Anda.", step: "Langkah 1", arrow: true },
            { num: "02", title: "Pilih Paket Promosi", desc: "Tentukan paket iklan Gratis (Berkah) atau VIP Premium (Amanah/Muamalah).", step: "Langkah 2", arrow: true },
            { num: "03", title: "Verifikasi Iklan", desc: "Admin memoderasi iklan Anda untuk menjamin kesesuaian syariat.", step: "Langkah 3", arrow: true },
            { num: "04", title: "Tayang & Dapatkan Kontak", desc: "Iklan tayang di halaman utama dan pembeli dapat menghubungi langsung via WA.", step: "Langkah 4", arrow: false }
        ]
    };

    // Mock Products
    const products = [
        {
            id: 1,
            title: "Template Bundling Social Media Canva untuk UMKM 2026",
            category: "Template Canva",
            merchant: "Amanah Creative",
            merchantObj: { store_name: "Amanah Creative", whatsapp: "6281121211933", is_verified: true },
            isSyariah: true,
            rating: 4.9,
            reviewsCount: 142,
            price: 49000,
            image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop",
            description: "Paket lengkap berisi 500+ template Canva siap pakai untuk promosi produk kuliner, fashion, jasa, dan edukasi. Membantu UMKM meningkatkan branding secara profesional dalam hitungan menit."
        },
        {
            id: 2,
            title: "Source Code Aplikasi Kasir Web Laravel 11 & React",
            category: "Source Code",
            merchant: "Afifah Tech",
            merchantObj: { store_name: "Afifah Tech", whatsapp: "6281121211933", is_verified: true },
            isSyariah: true,
            rating: 4.8,
            reviewsCount: 89,
            price: 199000,
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
            description: "Aplikasi kasir web modern berbasis Laravel 11 (backend API) dan ReactJS (frontend SPA). Dilengkapi dengan fitur multi-cabang, laporan penjualan realtime, cetak struk thermal, dan manajemen inventori barang."
        },
        {
            id: 3,
            title: "Ebook Panduan Sukses Jualan Produk Digital Dari Nol",
            category: "E-Book",
            merchant: "Deni Book Store",
            merchantObj: { store_name: "Deni Book Store", whatsapp: "6281121211933", is_verified: false },
            isSyariah: false,
            rating: 4.7,
            reviewsCount: 54,
            price: 29000,
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
            description: "Ebook panduan praktis setebal 150 halaman yang membahas strategi riset pasar, pembuatan aset digital bernilai tinggi, hingga cara memasarkannya menggunakan taktik organik dan iklan berbayar."
        },
        {
            id: 4,
            title: "Mega Prompt Generator ChatGPT untuk Copywriting Iklan",
            category: "AI Prompt",
            merchant: "AI Studio Bandung",
            merchantObj: { store_name: "AI Studio Bandung", whatsapp: "6281121211933", is_verified: true },
            isSyariah: true,
            rating: 5.0,
            reviewsCount: 30,
            price: 15000,
            image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop",
            description: "Koleksi 1000+ prompt ChatGPT super spesifik untuk menghasilkan naskah iklan, landing page copy, email marketing, dan ide konten kreatif secara instan yang terbukti mendatangkan pembeli."
        }
    ];

    // Mock VIP Ads
    const vipAds = [
        {
            id: 1,
            title: "Jasa Pembuatan Landing Page Profesional Tercepat 24 Jam",
            advertiser: "Arta Media Jasa",
            price: "Mulai Rp350.000",
            location: "Sleman, Yogyakarta",
            whatsapp: "6281121211933",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Jual Laptop Asus ROG Zephyrus G14 Bekas Mulus Nominus",
            advertiser: "Budi Santoso",
            price: "Rp14.500.000",
            location: "Jakarta Selatan",
            whatsapp: "6281121211933",
            image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Jasa Service & Kustomisasi Database MySQL Syariah Selesai Cepat",
            advertiser: "Citra Solusindo",
            price: "Hubungi Kami",
            location: "Surabaya, Jawa Timur",
            whatsapp: "6281121211933",
            image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 4,
            title: "Sewa Coworking Space Premium & Ruang Rapat Murah Bandung",
            advertiser: "Deni Workspace",
            price: "Rp50.000/Hari",
            location: "Bandung, Jawa Barat",
            whatsapp: "6281121211933",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop"
        }
    ];

    const categories = [
        { name: "Template", count: "42+ Layanan", icon: LayoutTemplate },
        { name: "Ebook", count: "28+ Layanan", icon: Book },
        { name: "Software", count: "19+ Layanan", icon: Code },
        { name: "Website", count: "35+ Layanan", icon: Globe },
        { name: "Design", count: "54+ Layanan", icon: Palette },
        { name: "Video", count: "22+ Layanan", icon: Video },
        { name: "Audio", count: "15+ Layanan", icon: Headphones },
        { name: "Course", count: "31+ Layanan", icon: GraduationCap },
        { name: "Social Media", count: "48+ Layanan", icon: Share2, isBlueIcon: true },
        { name: "Digital Marketing", count: "39+ Layanan", icon: TrendingUp },
        { name: "Business", count: "26+ Layanan", icon: Briefcase },
        { name: "Education", count: "18+ Layanan", icon: BookOpen },
        { name: "Tools", count: "45+ Layanan", icon: Wrench },
        { name: "Jasa", count: "29+ Layanan", icon: Handshake },
        { name: "Lainnya", count: "12+ Layanan", icon: MoreHorizontal }
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 font-sans ${
            darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}>
            {/* Global light sources (Dark Mode decoration) */}
            {darkMode && (
                <>
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>
                </>
            )}

            {/* A. Sticky Glassmorphic Header */}
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout} 
                onNavigate={onNavigate}
                currentView="homepage"
            />

            {/* B. Hero Section with dark blue background wrapper */}
            <ScrollFadeIn>
            <section className="bg-[#0A1B33] text-slate-100 py-16 transition-colors duration-300 relative overflow-hidden">
                {/* Background ambient glow effects */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(99,102,241,0.05)_0%,transparent_60%)] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                    
                    {/* Copywriting (7 columns) */}
                    <div className="space-y-6 lg:col-span-7">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-400 shadow-lg shadow-emerald-500/5">
                            <Star className="w-3.5 h-3.5 fill-current text-emerald-400" />
                            Platform #1 Digital Marketplace & Ad Exchange
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                            Temukan <span className="text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text">Produk Digital</span>.<br />
                            <span className="text-transparent bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text">Pasang Iklan</span>. Kembangkan Bisnis.
                        </h1>

                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                            ADMS adalah platform marketplace dan digital advertising terpadu yang membantu Anda menemukan produk digital terbaik, berjualan sebagai merchant, dan mempromosikan bisnis dalam satu ekosistem.
                        </p>

                        {/* Search Bar inside Hero */}
                        <div className="max-w-lg mt-8 relative flex items-center bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-xl p-1.5 pl-4 shadow-2xl shadow-black/20">
                            <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                            <input 
                                type="text"
                                placeholder="Cari produk digital, jasa, atau iklan promosi..."
                                className="w-full bg-transparent focus:outline-none text-xs sm:text-sm text-slate-100 placeholder-slate-500"
                                value={searchInput}
                                onChange={handleSearchChange}
                            />
                            <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold px-5 py-2.5 rounded-lg active:scale-95 transition-all shadow-lg shadow-emerald-500/25">
                                Cari
                            </button>
                        </div>

                        {/* Popular Tags */}
                        <p className="text-[11px] text-slate-400 font-medium">
                            Pencarian Populer: <span className="text-slate-300">Template Canva &bull; Ebook Marketing &bull; Source Code Web</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <a 
                                href="#marketplace"
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3.5 px-7 rounded-xl text-xs shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5"
                            >
                                Jelajahi Marketplace &rarr;
                            </a>
                            <button 
                                onClick={onNavigateToClassifieds}
                                className="border border-white/[0.12] bg-white/[0.05] backdrop-blur-sm text-slate-100 hover:bg-white/[0.1] font-bold py-3.5 px-6 rounded-xl text-xs cursor-pointer active:scale-[0.98] transition-all flex items-center gap-1.5"
                            >
                                <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
                                Pasang Iklan Gratis
                            </button>
                        </div>

                        {/* Core benefits checklist */}
                        <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Instan Download
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Verified Merchant
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Iklan Gratis Rp0
                            </span>
                        </div>
                    </div>

                    {/* Visual Card Showcase (5 columns) */}
                    <div className="relative flex justify-center lg:justify-end lg:col-span-5 pt-8 lg:pt-0">
                        <div className="relative w-full max-w-[400px]">
                            {/* Ambient glow blobs behind card */}
                            <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none"></div>
                            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none"></div>

                            {/* Main glass card */}
                            <div className="w-full rounded-3xl bg-gradient-to-br from-[#0f1f3d] to-[#0a1528] backdrop-blur-xl border border-white/[0.07] p-5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
                                {/* Top shimmer border */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent"></div>
                                <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm"></div>

                                {/* Card Header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/20 flex items-center justify-center border border-indigo-400/20 text-indigo-300 text-sm font-black shadow-inner shadow-indigo-500/10">
                                            %
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-white">Spesial Buat Member Baru</span>
                                            <span className="block text-[9px] text-slate-400 mt-0.5">Klaim sebelum kehabisan!</span>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-400/25 uppercase tracking-wider">
                                        🔥 Promo
                                    </span>
                                </div>

                                {/* Inner Product Display Box */}
                                <div className="relative bg-gradient-to-br from-emerald-950/80 to-teal-950/60 border border-emerald-500/20 rounded-2xl p-5 flex flex-col items-center text-center mb-4 overflow-hidden">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/8 rounded-full blur-2xl pointer-events-none"></div>
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"></div>

                                    <span className="relative z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-full mb-3 shadow-lg shadow-emerald-500/30">
                                        ✦ DISKON 50%
                                    </span>
                                    <h4 className="relative z-10 font-extrabold text-sm text-white mb-1.5 tracking-tight">Diskon Source Code & Template</h4>
                                    <p className="relative z-10 text-[10px] text-slate-400 leading-relaxed max-w-[220px]">
                                        Pakai kode promo <strong className="text-emerald-400 font-black tracking-wider">ADMSBARU</strong> pas checkout buat dapetin potongan harga 50% di transaksi pertamamu!
                                    </p>
                                    <button className="relative z-10 mt-3 text-[9px] font-black text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-1 rounded-lg transition-all">
                                        Klaim Sekarang &rarr;
                                    </button>
                                </div>

                                {/* Stats mini row */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[
                                        { value: '9.8K', label: 'Produk', color: 'text-teal-400' },
                                        { value: '3.2K', label: 'Merchant', color: 'text-indigo-400' },
                                        { value: '25K', label: 'User', color: 'text-amber-400' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-2 text-center">
                                            <span className={`block text-xs font-black ${s.color}`}>{s.value}</span>
                                            <span className="block text-[8px] text-slate-500 font-medium mt-0.5">{s.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom Ads Exchange block */}
                                <div className="flex items-center gap-3 bg-indigo-500/8 border border-indigo-500/15 rounded-2xl p-3">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/20 flex items-center justify-center border border-indigo-400/20 flex-shrink-0">
                                        <Megaphone className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <span className="block text-xs font-bold text-white truncate">Boost Iklan Premium</span>
                                        <span className="block text-[9px] text-slate-400 mt-0.5 truncate">Bikin iklanmu nangkring di halaman utama selama 30 hari penuh.</span>
                                    </div>
                                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse"></span>
                                </div>

                                {/* Pagination dots */}
                                <div className="flex items-center justify-center gap-1.5 mt-5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                                    <span className="w-5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-400/40"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                                </div>
                            </div>

                            {/* Floating Stats Card */}
                            <div className="bg-[#080f1e]/95 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-3.5 absolute bottom-10 -left-14 w-56 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex items-center gap-3 overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"></div>
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600/30 to-emerald-600/20 flex items-center justify-center border border-teal-400/20 text-teal-400 text-sm font-black flex-shrink-0">
                                    ↑
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-[10px] font-bold text-white truncate">Performa Iklan Meroket</span>
                                    <span className="block text-[8px] text-slate-500 mt-0.5">Dilihat: 12.5K · Klik: 5.4%</span>
                                    <div className="flex gap-2 mt-1.5">
                                        <span className="text-[8px] font-bold text-emerald-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span> Aktif
                                        </span>
                                        <span className="text-[8px] font-bold text-indigo-400 bg-indigo-400/10 px-1.5 rounded">VIP Boost</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Social Stats footer */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className={`p-6 border rounded-2xl shadow-sm text-center ${
                        darkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200'
                    }`}>
                        <span className="block text-3xl font-black text-teal-400">15.4K+</span>
                        <span className="text-xs text-slate-500 uppercase font-semibold mt-1">Iklan Baris Aktif</span>
                    </div>
                    <div className={`p-6 border rounded-2xl shadow-sm text-center ${
                        darkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200'
                    }`}>
                        <span className="block text-3xl font-black text-indigo-400">9.8K+</span>
                        <span className="text-xs text-slate-500 uppercase font-semibold mt-1">Aset Digital Terverifikasi</span>
                    </div>
                    <div className={`p-6 border rounded-2xl shadow-sm text-center ${
                        darkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200'
                    }`}>
                        <span className="block text-3xl font-black text-white">25K+</span>
                        <span className="text-xs text-slate-500 uppercase font-semibold mt-1">Pengguna & Merchant Aktif</span>
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* C. Quick Categories Grid */}
            <ScrollFadeIn>
            <section className="py-20 bg-[#FBFDFE] dark:bg-slate-950 border-y border-slate-200/60 dark:border-slate-800/80 relative overflow-hidden text-slate-900 dark:text-slate-100">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Subtle dotted grid matrix */}
                    <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    {/* Soft colored mesh gradient glowing circles */}
                    <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-400/5 dark:bg-emerald-500/5 blur-[80px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-400/5 dark:bg-indigo-500/5 blur-[80px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Premium Creative Header */}
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm shadow-indigo-100/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            Kategori Pilihan
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                            Jelajahi <span className="bg-gradient-to-r from-[#10B981] to-indigo-600 bg-clip-text text-transparent">Kategori Layanan</span>
                        </h2>
                        {/* Elegant under-title visual divider */}
                        <div className="w-16 h-1 bg-gradient-to-r from-[#10B981] to-indigo-50 rounded-full mx-auto"></div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium pt-1">
                            Temukan berbagai kebutuhan digital marketing, website, pembuatan legalitas usaha, hingga layanan offline dalam satu platform.
                        </p>
                    </div>
                    
                    {/* 5-column grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {categories.map((cat, idx) => {
                            const IconComponent = cat.icon;
                            const colorThemes = [
                                // Template (Emerald)
                                { bg: 'bg-emerald-50 text-emerald-600', border: 'hover:border-emerald-500 hover:shadow-emerald-500/10', text: 'group-hover:text-emerald-700', textLight: 'group-hover:text-emerald-500', bar: 'group-hover:bg-emerald-500', overlay: 'from-emerald-50/50' },
                                // Ebook (Indigo)
                                { bg: 'bg-indigo-50 text-indigo-600', border: 'hover:border-indigo-500 hover:shadow-indigo-500/10', text: 'group-hover:text-indigo-700', textLight: 'group-hover:text-indigo-500', bar: 'group-hover:bg-indigo-500', overlay: 'from-indigo-50/50' },
                                // Software (Sky)
                                { bg: 'bg-sky-50 text-sky-600', border: 'hover:border-sky-500 hover:shadow-sky-500/10', text: 'group-hover:text-sky-700', textLight: 'group-hover:text-sky-500', bar: 'group-hover:bg-sky-500', overlay: 'from-sky-50/50' },
                                // Website (Blue)
                                { bg: 'bg-blue-50 text-blue-600', border: 'hover:border-blue-500 hover:shadow-blue-500/10', text: 'group-hover:text-blue-700', textLight: 'group-hover:text-blue-500', bar: 'group-hover:bg-blue-500', overlay: 'from-blue-50/50' },
                                // Design (Purple)
                                { bg: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-500 hover:shadow-purple-500/10', text: 'group-hover:text-purple-700', textLight: 'group-hover:text-purple-500', bar: 'group-hover:bg-purple-500', overlay: 'from-purple-50/50' },
                                // Video (Rose)
                                { bg: 'bg-rose-50 text-rose-600', border: 'hover:border-rose-500 hover:shadow-rose-500/10', text: 'group-hover:text-rose-700', textLight: 'group-hover:text-rose-500', bar: 'group-hover:bg-rose-500', overlay: 'from-rose-50/50' },
                                // Audio (Cyan)
                                { bg: 'bg-cyan-50 text-cyan-600', border: 'hover:border-cyan-500 hover:shadow-cyan-500/10', text: 'group-hover:text-cyan-700', textLight: 'group-hover:text-cyan-500', bar: 'group-hover:bg-cyan-500', overlay: 'from-cyan-50/50' },
                                // Course (Teal)
                                { bg: 'bg-teal-50 text-teal-600', border: 'hover:border-teal-500 hover:shadow-teal-500/10', text: 'group-hover:text-teal-700', textLight: 'group-hover:text-teal-500', bar: 'group-hover:bg-teal-500', overlay: 'from-teal-50/50' },
                                // Social Media (Violet)
                                { bg: 'bg-violet-50 text-violet-600', border: 'hover:border-violet-500 hover:shadow-violet-500/10', text: 'group-hover:text-violet-700', textLight: 'group-hover:text-violet-500', bar: 'group-hover:bg-violet-500', overlay: 'from-violet-50/50' },
                                // Digital Marketing (Amber)
                                { bg: 'bg-amber-50 text-amber-600', border: 'hover:border-amber-500 hover:shadow-amber-500/10', text: 'group-hover:text-amber-700', textLight: 'group-hover:text-amber-500', bar: 'group-hover:bg-amber-500', overlay: 'from-amber-50/50' },
                                // Business (Lime)
                                { bg: 'bg-lime-50 text-lime-600', border: 'hover:border-lime-500 hover:shadow-lime-500/10', text: 'group-hover:text-lime-700', textLight: 'group-hover:text-lime-500', bar: 'group-hover:bg-lime-500', overlay: 'from-lime-50/50' },
                                // Education (Fuchsia)
                                { bg: 'bg-fuchsia-50 text-fuchsia-600', border: 'hover:border-fuchsia-500 hover:shadow-fuchsia-500/10', text: 'group-hover:text-fuchsia-700', textLight: 'group-hover:text-fuchsia-500', bar: 'group-hover:bg-fuchsia-500', overlay: 'from-fuchsia-50/50' },
                                // Tools (Orange)
                                { bg: 'bg-orange-50 text-orange-600', border: 'hover:border-orange-500 hover:shadow-orange-500/10', text: 'group-hover:text-orange-700', textLight: 'group-hover:text-orange-500', bar: 'group-hover:bg-orange-500', overlay: 'from-orange-50/50' },
                                // Jasa (Pink)
                                { bg: 'bg-pink-50 text-pink-600', border: 'hover:border-pink-500 hover:shadow-pink-500/10', text: 'group-hover:text-pink-700', textLight: 'group-hover:text-pink-500', bar: 'group-hover:bg-pink-500', overlay: 'from-pink-50/50' },
                                // Lainnya (Slate)
                                { bg: 'bg-slate-100 text-slate-700', border: 'hover:border-slate-500 hover:shadow-slate-500/10', text: 'group-hover:text-slate-800', textLight: 'group-hover:text-slate-600', bar: 'group-hover:bg-slate-500', overlay: 'from-slate-100/50' }
                            ];
                            const theme = colorThemes[idx % colorThemes.length];
                            return (
                                <div 
                                    key={idx}
                                    className={`p-6 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer text-left flex flex-col justify-between min-h-[140px] group relative overflow-hidden shadow-sm hover:shadow-lg dark:backdrop-blur-md ${theme.border}`}
                                >
                                    {/* Hover overlay gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.overlay} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                    
                                    {/* Top colored accent line on hover */}
                                    <div className={`absolute top-0 left-0 w-full h-[4px] bg-transparent transition-all duration-300 ${theme.bar}`}></div>
                                    
                                    <div className="relative z-10">
                                        {/* Icon container top left */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${theme.bg}`}>
                                            <IconComponent className="w-6 h-6 transition-transform duration-300" strokeWidth={2} />
                                        </div>
 
                                        {/* Left-aligned titles and count */}
                                        <div>
                                            <h4 className={`font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-tight mb-1 transition-colors duration-300 ${theme.text}`}>{cat.name}</h4>
                                            <span className={`text-[10px] text-slate-400 dark:text-slate-500 font-semibold transition-all duration-300 flex items-center gap-1 ${theme.textLight}`}>
                                                {cat.count} 
                                                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* D. Marketplace Featured Products with light theme and side-by-side header */}
            <ScrollFadeIn>
            <section id="marketplace" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/80 relative overflow-hidden text-slate-900 dark:text-slate-100">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Subtle diagonal lines pattern */}
                    <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] bg-[linear-gradient(135deg,#4f46e5_10%,transparent_10%,transparent_50%,#4f46e5_50%,#4f46e5_60%,transparent_60%,transparent)] bg-[size:40px_40px]"></div>
                    {/* Soft colored mesh gradient glowing circles */}
                    <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-400/5 dark:bg-indigo-500/5 blur-[100px]"></div>
                    <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-teal-400/5 dark:bg-teal-500/5 blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-slate-100 pb-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-3 shadow-sm shadow-emerald-50/50">
                                <Star className="w-3 h-3 fill-current text-emerald-500 animate-pulse" />
                                Rekomendasi Utama
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                Produk Digital <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent">Pilihan</span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2 font-medium">
                                Aset digital terlaris dan berkualitas tinggi yang diverifikasi oleh tim ADMS.
                            </p>
                        </div>
                        <button 
                            onClick={onNavigateToProducts}
                            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-500 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            <span>Lihat Semua Produk</span>
                            <span className="text-sm font-semibold">&rarr;</span>
                        </button>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.filter(p => 
                            p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length > 0 ? (
                            products.filter(p => 
                                p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                p.category.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((prod) => (
                                <div 
                                    key={prod.id}
                                    onClick={() => setSelectedProduct(prod)}
                                    className="rounded-2xl border border-slate-300 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-500/5 relative dark:backdrop-blur-md cursor-pointer"
                                >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-500 hover:scale-110 active:scale-95 shadow-md border border-slate-100/50 dark:border-slate-800/50 transition-all duration-300"
                                >
                                    <Heart className="w-4 h-4" />
                                </button>
                                <div>
                                    {/* Product Image */}
                                    <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                                        <img 
                                            src={prod.image} 
                                            alt={prod.title} 
                                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                                        />
                                        <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[9px] font-bold text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full border border-white/50 dark:border-slate-700 shadow-sm uppercase tracking-wider">
                                            {prod.category}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 h-10 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{prod.title}</h4>
                                        
                                        <div className="flex items-center gap-1 text-xs mb-3 text-amber-500">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{prod.rating}</span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">({prod.reviewsCount} Ulasan)</span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                            <span>Toko:</span>
                                            <strong className="text-slate-700 dark:text-slate-300 font-bold">{prod.merchant}</strong>
                                            {prod.isSyariah && (
                                                <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 text-[8px] uppercase tracking-wider">
                                                    Syariah Certified
                                                </span>
                                            )}
                                        </div>

                                    </div>
                                </div>

                                {/* Buy action */}
                                <div className="p-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                    <span className="font-extrabold text-base text-teal-600 dark:text-teal-400">Rp{numberFormat(prod.price)}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleAddToCart(prod.id); }}
                                        className="bg-gradient-to-r from-[#10B981] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                        <span>Keranjang</span>
                                    </button>
                                </div>
                            </div>
                        ))) : (
                            <div className="col-span-full py-12 text-center text-slate-500 font-medium">
                                Tidak ada produk yang sesuai dengan pencarian "{searchQuery}".
                            </div>
                        )}
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* D.2 Merchant Terverifikasi Section with light theme */}
            <ScrollFadeIn>
            <section id="merchants" className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/80 relative overflow-hidden text-slate-900 dark:text-slate-100">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <div className="text-sky-600 text-xs font-bold uppercase tracking-wider mb-2">
                                Mitra Vendor
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Merchant Terverifikasi</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                                Daftar kreator dan penyedia aset digital terpercaya di ADMS.
                            </p>
                        </div>
                        <button 
                            onClick={() => onNavigate('merchants')}
                            className="text-xs font-extrabold bg-white hover:bg-slate-100 text-indigo-600 px-4.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-transparent shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                            <span>Lihat Semua Merchant</span>
                            <span className="text-sm font-semibold">&rarr;</span>
                        </button>
                    </div>

                    {/* Merchants Grid */}
                    {loadingMerchants ? (
                        <div className="text-xs text-slate-400 italic">Memuat daftar merchant terverifikasi...</div>
                    ) : merchants.length === 0 ? (
                        <div className="text-xs text-slate-400 italic">Belum ada merchant terverifikasi yang terdaftar.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {merchants.map((merchant) => (
                                <div 
                                    key={merchant.id}
                                    className="p-6 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[160px] group dark:backdrop-blur-md"
                                >
                                    <div>
                                        {/* Top profile row */}
                                        <div className="flex items-start gap-3.5 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <img 
                                                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop" 
                                                    alt={merchant.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1 leading-snug">
                                                    {merchant.name}
                                                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 flex-shrink-0" />
                                                </h4>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                    <span className="font-semibold text-slate-600 dark:text-slate-300">5.0</span>
                                                    <span>&bull;</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verified</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 italic">
                                            "{merchant.slug || 'Penyedia aset digital profesional di platform ADMS.'}"
                                        </p>
                                    </div>

                                    {/* Bottom Info Row */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold uppercase tracking-wide">
                                            <Shield className="w-3.5 h-3.5 text-slate-300 dark:text-slate-400" />
                                            Official Merchant
                                        </span>
                                        <button 
                                            onClick={onNavigateToLogin}
                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors flex items-center gap-0.5"
                                        >
                                            Kunjungi Toko &rarr;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            </ScrollFadeIn>

            {/* F. How It Works (Tabbed interactive guide) */}
            <ScrollFadeIn>
            <section id="how" className="py-20 bg-[#FBFDFE] dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/80 relative overflow-hidden text-slate-900 dark:text-slate-100">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Subtle dotted grid matrix */}
                    <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    {/* Soft colored mesh gradient glowing circles */}
                    <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-sky-400/5 dark:bg-sky-500/5 blur-[80px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-400/5 dark:bg-indigo-500/5 blur-[80px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Section Header */}
                    <div className="text-center mb-10 space-y-3">
                        <span className="inline-block text-[10px] font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Panduan Platform
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Cara Kerja ADMS</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Proses mudah dan transparan untuk Pembeli, Merchant, maupun Pengiklan.
                        </p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex justify-center mb-16">
                        <div className="inline-flex bg-slate-100/80 dark:bg-slate-800/85 border border-slate-200/50 dark:border-slate-700/50 p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setActiveTab('buyer')}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    activeTab === 'buyer' 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/30 dark:border-slate-600/30' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Untuk Pembeli
                            </button>
                            <button
                                onClick={() => setActiveTab('merchant')}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    activeTab === 'merchant' 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/30 dark:border-slate-600/30' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Store className="w-3.5 h-3.5" />
                                Untuk Merchant
                            </button>
                            <button
                                onClick={() => setActiveTab('advertiser')}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    activeTab === 'advertiser' 
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/30 dark:border-slate-600/30' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Megaphone className="w-3.5 h-3.5" />
                                Untuk Pengiklan
                            </button>
                        </div>
                    </div>

                    {/* Steps Showcase Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {stepsData[activeTab].map((step, idx) => {
                            const hoverOutlineClass = activeTab === 'buyer' 
                                ? 'hover:border-amber-400/70 hover:shadow-amber-500/5 dark:hover:border-amber-500/30 dark:hover:bg-amber-500/5' 
                                : activeTab === 'merchant'
                                    ? 'hover:border-indigo-400/70 hover:shadow-indigo-500/5 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5'
                                    : 'hover:border-sky-400/70 hover:shadow-sky-500/5 dark:hover:border-sky-500/30 dark:hover:bg-sky-500/5';
                                    
                            const numberColorClass = activeTab === 'buyer' 
                                ? 'text-amber-500' 
                                : activeTab === 'merchant' 
                                    ? 'text-indigo-500' 
                                    : 'text-sky-500';

                            const badgeColorClass = activeTab === 'buyer' 
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' 
                                : activeTab === 'merchant' 
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' 
                                    : 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20';

                            return (
                                <div 
                                    key={`${activeTab}-${idx}`}
                                    className={`p-6 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between min-h-[220px] dark:backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg relative overflow-hidden group ${hoverOutlineClass}`}
                                >
                                    {/* Giant Watermark Step Number at top right */}
                                    <div className={`absolute top-3 right-4 text-5xl font-black select-none opacity-20 dark:opacity-10 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300 font-sans ${numberColorClass}`}>
                                        {step.num}
                                    </div>

                                    <div className="relative z-10 space-y-3">
                                        {/* Step badge */}
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider border ${badgeColorClass}`}>
                                            {step.step}
                                        </span>

                                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-tight mb-2 pr-6 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {step.title}
                                        </h4>
                                        
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                                            {step.desc}
                                        </p>
                                    </div>

                                    {/* Footer with connection indicator */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider relative z-10 mt-4">
                                        <span>Panduan</span>
                                        {step.arrow && (
                                            <span className="text-slate-400 dark:text-slate-500 group-hover:translate-x-1.5 transition-transform duration-300">
                                                &rarr;
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* F.2 Why Choose ADMS (Keunggulan ADMS) */}
            <ScrollFadeIn>
            <section className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/80 relative overflow-hidden text-slate-900 dark:text-slate-100">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                    {/* Soft colored mesh gradient glowing circles */}
                    <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-emerald-400/5 dark:bg-emerald-500/5 blur-[90px]"></div>
                    <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-sky-400/5 dark:bg-sky-500/5 blur-[90px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center mb-16 space-y-3">
                        <span className="inline-block text-[10px] font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Keunggulan ADMS
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Mengapa Memilih Platform ADMS?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Platform modern yang dirancang khusus untuk mempercepat pertumbuhan produk digital dan promosi bisnis Anda.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Card 1 */}
                        <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] text-left flex flex-col justify-between min-h-[220px] dark:backdrop-blur-md">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 flex items-center justify-center text-sky-500 mb-6">
                                    <Download className="w-5 h-5" />
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-tight mb-3">Akses Instant Digital Download</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                                    Setelah pembayaran berhasil terkonfirmasi, file digital langsung siap diunduh tanpa perlu menunggu konfirmasi manual.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] text-left flex flex-col justify-between min-h-[220px] dark:backdrop-blur-md">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500 mb-6">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-tight mb-3">Iklan Gratis & Promosi Berbayar</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                                    Dukungan penuh untuk pelaku UMKM dan kreator memasang iklan gratis atau memilih paket boost posisi teratas.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] text-left flex flex-col justify-between min-h-[220px] dark:backdrop-blur-md">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-tight mb-3">Keamanan Transaksi Terjamin</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                                    Sistem proteksi transaksi dan opsi Payment Gateway terintegrasi untuk menjamin keamanan dana pembeli dan merchant.
                                </p>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] text-left flex flex-col justify-between min-h-[220px] dark:backdrop-blur-md">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-6">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-tight mb-3">Sistem Multi-Vendor Merchant</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                                    Siapapun dapat membuka toko digital, mengunggah karya, serta mengelola pesanan dan laporan pendapatan secara mandiri.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* F.3 Testimonial Section with light theme */}
            <ScrollFadeIn>
            <section className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/80 relative overflow-hidden text-slate-900 dark:text-slate-100">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center mb-16 space-y-3">
                        <span className="inline-block text-[10px] font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Testiomoni Pengguna
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Kata Mereka Tentang ADMS</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Pengalaman nyata dari para pembeli, merchant, dan pengiklan di platform ADMS.
                        </p>
                    </div>

                    {/* Testimonials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="p-8 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[240px] dark:backdrop-blur-md">
                            <div>
                                <Quote className="w-8 h-8 text-slate-300 dark:text-slate-400 mb-4" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
                                    "ADMS membantu agensi saya mendapatkan ratusan calon klien dari iklan promosi gratis dan berbayarnya. Konversinya tinggi banget!"
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                                <img 
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" 
                                    alt="Rian Prasetya" 
                                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                                />
                                <div>
                                    <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Rian Prasetya</h5>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Digital Marketer & Agency Owner</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-8 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[240px] dark:backdrop-blur-md">
                            <div>
                                <Quote className="w-8 h-8 text-slate-300 dark:text-slate-400 mb-4" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
                                    "Sebagai merchant di ADMS, penjualan template Canva saya meningkat drastis. Penarikan dana cepat dan pembeli bisa download otomatis."
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                                <img 
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" 
                                    alt="Siti Rahmawati" 
                                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                                />
                                <div>
                                    <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Siti Rahmawati</h5>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Merchant Template Canva</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-8 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[240px] dark:backdrop-blur-md">
                            <div>
                                <Quote className="w-8 h-8 text-slate-300 dark:text-slate-400 mb-4" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
                                    "Source code Next.js yang saya beli di marketplace ADMS sangat memuaskan. Lengkap dengan panduan dan penjual sangat responsif."
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                                <img 
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" 
                                    alt="Deni Kurniawan" 
                                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                                />
                                <div>
                                    <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Deni Kurniawan</h5>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Pembeli Aset Web Developer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* F.4 FAQ Section (Frequently Asked Questions) with light theme */}
            <ScrollFadeIn>
            <section id="faq" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/80 relative overflow-hidden text-slate-900 dark:text-slate-100">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center mb-12 space-y-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
                            Pertanyaan Umum
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Frequently Asked Questions (FAQ)</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Jawaban lengkap atas pertanyaan yang sering diajukan mengenai platform ADMS.
                        </p>
                    </div>

                    {/* Accordion list */}
                    <div className="space-y-4">
                        {[
                            {
                                q: "Apa itu ADMS (PT. Armada Digital Marketing Syariah)?",
                                a: "ADMS adalah platform serba ada yang menggabungkan marketplace produk digital (template, ebook, software, source code), sistem toko merchant multi-vendor, dan platform iklan (gratis & berbayar)."
                            },
                            {
                                q: "Bagaimana cara mendownload produk setelah pembelian?",
                                a: "Setelah transaksi pembayaran terverifikasi otomatis secara instan, Anda dapat langsung mengunduh file produk melalui halaman riwayat transaksi di dashboard customer atau menu 'My Downloads'."
                            },
                            {
                                q: "Apakah saya bisa memasang iklan secara gratis di ADMS?",
                                a: "Ya, ADMS menyediakan paket iklan Gratis (Berkah) Rp0 yang diperuntukkan bagi UMKM lokal dengan jaminan kesesuaian syariat tanpa biaya tersembunyi."
                            },
                            {
                                q: "Apa perbedaan Iklan Gratis dan Paket Iklan Premium?",
                                a: "Iklan Gratis ditayangkan pada listing reguler dengan masa aktif terbatas. Sedangkan Paket Iklan Premium mendapatkan visibilitas ekstra berupa VIP Boost di halaman utama, tayang lebih lama, dan fitur prioritas."
                            },
                            {
                                q: "Bagaimana cara menjadi Merchant dan berjualan produk digital?",
                                a: "Anda cukup mendaftar atau masuk ke akun ADMS, lalu pilih opsi 'Daftar Merchant' di dashboard. Setelah mengisi profil toko dan diverifikasi oleh admin, Anda bisa langsung mengunggah produk digital Anda."
                            }
                        ].map((faq, index) => {
                            const isOpen = expandedFaq === index;
                            return (
                                <div 
                                    key={index}
                                    className="border border-slate-300 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden transition-all duration-200 dark:backdrop-blur-md"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(isOpen ? null : index)}
                                        className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown 
                                            className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180' : ''
                                            }`} 
                                        />
                                    </button>
                                    
                                    <div 
                                        className={`transition-all duration-200 ease-in-out overflow-hidden ${
                                            isOpen ? 'max-h-40 border-t border-slate-100 dark:border-slate-800/60' : 'max-h-0'
                                        }`}
                                    >
                                        <div className="p-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900/40">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            </ScrollFadeIn>
            {/* H. Redesigned Premium Footer */}
            <footer className="bg-[#071324] text-slate-100 pt-20 pb-10 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Upper column links grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                        
                        {/* Company logo/info block (5 cols) */}
                        <div className="md:col-span-5 space-y-6">
                            <div className="inline-flex items-center gap-2 mb-2">
                                <img src="/assets/Images/adms-symbol.png" alt="ADMS Symbol" className="h-12 object-contain" />
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                                Platform terpadu Marketplace Produk Digital, Multi-Vendor Merchant, dan Platform Pemasangan Iklan Gratis & Promosi Berbayar untuk mengembangkan bisnis Anda.
                            </p>
                            
                            {/* Social Media icons in rounded cards */}
                            <div className="flex items-center gap-3">
                                {/* Instagram */}
                                <a href="https://www.instagram.com/adms.group?igsh=MWVtdWZ6NGF5NWI2Ng==" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                                    </svg>
                                </a>
                                {/* Email */}
                                <a href="mailto:Info@armadadigitalmarketing.top" className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </a>
                                {/* WhatsApp */}
                                <a href="https://wa.me/6281121211933" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Link Columns (7 cols total: 2 + 2 + 3) */}
                        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {/* Col 1 */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Platform</h4>
                                <ul className="space-y-3.5 text-xs text-slate-400">
                                    <li><button onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Marketplace</button></li>
                                    <li><button onClick={() => onNavigate('products', 'digital')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Produk Digital</button></li>
                                    <li><button onClick={() => onNavigate('classifieds')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Iklan Gratis</button></li>
                                    <li><button onClick={() => onNavigate('merchants')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Merchant Vendor</button></li>
                                    <li><button onClick={() => onNavigate('create_ad')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Paket Iklan</button></li>
                                </ul>
                            </div>
                            
                            {/* Col 2 */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Bantuan</h4>
                                <ul className="space-y-3.5 text-xs text-slate-400">
                                    <li><button onClick={() => onNavigate('help_center')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Pusat Bantuan</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat'))} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Customer Support (AI Assistant)</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat', { detail: { query: 'buka katalog' } }))} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Cara Pembelian Produk</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat', { detail: { query: 'info legalitas' } }))} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Cara Menjadi Merchant</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat', { detail: { query: 'pasang iklan online' } }))} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Panduan Iklan Gratis</button></li>
                                </ul>
                            </div>
                            
                            {/* Col 3 */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Legal & Kebijakan</h4>
                                <ul className="space-y-3.5 text-xs text-slate-400">
                                    <li><button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Terms & Conditions</button></li>
                                    <li><button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Privacy Policy</button></li>
                                    <li><button onClick={() => onNavigate('refund')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Refund Policy</button></li>
                                    <li><button onClick={() => onNavigate('advertising')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Advertising Policy</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status bar (with divider line) */}
                    <div className="pt-8 border-t border-slate-900/60 flex flex-col items-center justify-center gap-4 text-xs text-slate-500 text-center">
                        <p>&copy; 2026 ADMS (PT. Armada Digital Marketing Syariah). All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Product Detail Modal Popup */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 dark:border-slate-800 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-all active:scale-95 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            {/* Product Image preview */}
                            <div className="aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                                <img 
                                    src={selectedProduct.image} 
                                    alt={selectedProduct.title} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            
                            {/* Product description & actions */}
                            <div className="flex flex-col justify-between">
                                <div className="space-y-3">
                                    <span className="inline-block bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider border border-teal-100 dark:border-teal-500/20">
                                        {selectedProduct.category}
                                    </span>
                                    <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 leading-snug">{selectedProduct.title}</h3>
                                    
                                    <div className="flex items-center gap-1 text-xs text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{selectedProduct.rating}</span>
                                        <span className="text-slate-400 dark:text-slate-500">({selectedProduct.reviewsCount} Ulasan)</span>
                                    </div>
                                    
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                                        {selectedProduct.description || 'Tidak ada deskripsi lengkap untuk produk digital ini.'}
                                    </p>
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl space-y-3 mt-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Harga Aset</span>
                                        <span className="font-black text-xl text-teal-600 dark:text-teal-400">Rp{numberFormat(selectedProduct.price)}</span>
                                    </div>
                                    
                                    {/* Store Details info */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                                        <div>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold">Penjual</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedProduct.merchantObj?.store_name || selectedProduct.merchant}</span>
                                        </div>
                                        {selectedProduct.merchantObj?.is_verified && (
                                            <span className="inline-flex bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider border border-blue-100 dark:border-blue-500/20">
                                                Terverifikasi
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            onClick={() => {
                                                handleAddToCart(selectedProduct.id);
                                                setSelectedProduct(null);
                                            }}
                                            className="flex-1 bg-gradient-to-r from-[#10B981] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>Tambah Keranjang</span>
                                        </button>
                                        
                                        {selectedProduct.merchantObj?.whatsapp && (
                                            <a 
                                                href={`https://wa.me/6281121211933?text=Halo%20${selectedProduct.merchantObj.store_name},%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(selectedProduct.title)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/30 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                                                title="Hubungi WhatsApp"
                                            >
                                                <Phone className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function numberFormat(val) {
    return new Intl.NumberFormat('id-ID').format(val);
}
