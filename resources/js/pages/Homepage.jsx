import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { 
    Search, Palette, BookOpen, Code, Cpu, Megaphone, 
    Briefcase, Star, MessageSquare, Sun, Moon, ArrowRight, 
    Shield, CheckCircle, Smartphone, ExternalLink, HelpCircle,
    LayoutGrid, Share2, ShoppingBag, Store, Download, Zap, Users, Quote, ChevronDown,
    LayoutTemplate, Book, Globe, Video, Headphones, GraduationCap, TrendingUp, Wrench, Handshake, MoreHorizontal,
    Heart, ShoppingCart
} from 'lucide-react';

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

export default function Homepage({ isLoggedIn, user, token, onNavigateToLogin, onNavigateToRegister, onNavigateToDashboard, onNavigateToCreateAd, onNavigateToClassifieds, onLogout, darkMode, setDarkMode }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [showAssistant, setShowAssistant] = useState(false);
    const [assistantResponse, setAssistantResponse] = useState(null);
    const [merchants, setMerchants] = useState([]);
    const [loadingMerchants, setLoadingMerchants] = useState(true);

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
            isSyariah: true,
            rating: 4.9,
            reviewsCount: 142,
            price: 49000,
            image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Source Code Aplikasi Kasir Web Laravel 11 & React",
            category: "Source Code",
            merchant: "Afifah Tech",
            isSyariah: true,
            rating: 4.8,
            reviewsCount: 89,
            price: 199000,
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Ebook Panduan Sukses Jualan Produk Digital Dari Nol",
            category: "E-Book",
            merchant: "Deni Book Store",
            isSyariah: false,
            rating: 4.7,
            reviewsCount: 54,
            price: 29000,
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 4,
            title: "Mega Prompt Generator ChatGPT untuk Copywriting Iklan",
            category: "AI Prompt",
            merchant: "AI Studio Bandung",
            isSyariah: true,
            rating: 5.0,
            reviewsCount: 30,
            price: 15000,
            image: "https://images.unsplash.com/photo-1675557009875-436f09780264?q=80&w=600&auto=format&fit=crop"
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
            whatsapp: "6281234567890",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Jual Laptop Asus ROG Zephyrus G14 Bekas Mulus Nominus",
            advertiser: "Budi Santoso",
            price: "Rp14.500.000",
            location: "Jakarta Selatan",
            whatsapp: "6281299998888",
            image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Jasa Service & Kustomisasi Database MySQL Syariah Selesai Cepat",
            advertiser: "Citra Solusindo",
            price: "Hubungi Kami",
            location: "Surabaya, Jawa Timur",
            whatsapp: "6281277776666",
            image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 4,
            title: "Sewa Coworking Space Premium & Ruang Rapat Murah Bandung",
            advertiser: "Deni Workspace",
            price: "Rp50.000/Hari",
            location: "Bandung, Jawa Barat",
            whatsapp: "6281255554444",
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

    const handleAssistantQuery = (query) => {
        if (query === 'merchant') {
            setAssistantResponse("Untuk mendaftar menjadi merchant resmi, masuk ke akun Anda, klik 'Daftar Toko/Merchant', lalu lengkapi informasi toko dan sertifikasi halal (jika ada). Pendaftaran akan ditinjau dalam 24 jam.");
        } else if (query === 'ad') {
            setAssistantResponse("Pasang iklan gratis sangat mudah! Buka bagian Iklan Baris, buat postingan iklan dengan paket 'Berkah' (Gratis), masukkan deskripsi, harga, dan nomor WhatsApp Anda.");
        } else if (query === 'package') {
            setAssistantResponse("Kami menyediakan 3 paket: Paket Berkah (Gratis, aktif 7 hari), Paket Amanah (Premium, aktif 30 hari + lencana syariah + headline), dan Paket Muamalah (Pro, aktif 90 hari + WA Broadcast).");
        }
    };

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
                onNavigate={(v) => {
                    if (v === 'dashboard') onNavigateToDashboard();
                    else if (v === 'login') onNavigateToLogin();
                    else if (v === 'register') onNavigateToRegister();
                    else if (v === 'create_ad') onNavigateToCreateAd();
                    else if (v === 'classifieds') onNavigateToClassifieds();
                }}
                currentView="homepage"
            />

            {/* B. Hero Section with dark blue background wrapper */}
            <ScrollFadeIn>
            <section className="bg-[#0A1B33] text-slate-100 py-16 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Copywriting (7 columns) */}
                    <div className="space-y-6 lg:col-span-7">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                            <Star className="w-3.5 h-3.5 fill-current text-emerald-400" />
                            Platform #1 Digital Marketplace & Ad Exchange
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                            Temukan <span className="text-[#10B981]">Produk Digital</span>.<br />
                            <span className="text-[#F59E0B]">Pasang Iklan</span>. Kembangkan Bisnis.
                        </h1>

                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                            ADMS adalah platform marketplace dan digital advertising terpadu yang membantu Anda menemukan produk digital terbaik, berjualan sebagai merchant, dan mempromosikan bisnis dalam satu ekosistem.
                        </p>

                        {/* Search Bar inside Hero */}
                        <div className="max-w-lg mt-8 relative flex items-center bg-[#112240] border border-slate-700/60 rounded-xl p-1.5 pl-4 shadow-xl">
                            <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                            <input 
                                type="text"
                                placeholder="Cari produk digital, jasa, atau iklan promosi..."
                                className="w-full bg-transparent focus:outline-none text-xs sm:text-sm text-slate-100 placeholder-slate-500"
                            />
                            <button className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold px-5 py-2.5 rounded-lg active:scale-95 transition-all">
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
                                className="bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3.5 px-6 rounded-lg text-xs shadow-lg active:scale-[0.98] transition-all flex items-center gap-1.5"
                            >
                                Jelajahi Marketplace &rarr;
                            </a>
                            <button 
                                onClick={onNavigateToClassifieds}
                                className="border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900 font-bold py-3.5 px-6 rounded-lg text-xs cursor-pointer active:scale-[0.98] transition-all flex items-center gap-1.5"
                            >
                                <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
                                Pasang Iklan Gratis
                            </button>
                        </div>

                        {/* Core benefits checklist */}
                        <div className="flex flex-wrap items-center gap-6 pt-6 text-xs font-bold text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <span className="text-[#10B981]">&bull;</span> Instan Download
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="text-[#10B981]">&bull;</span> Verified Merchant
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="text-[#10B981]">&bull;</span> Iklan Gratis Rp0
                            </span>
                        </div>
                    </div>

                    {/* Visual Card Showcase (5 columns) */}
                    <div className="relative flex justify-center lg:justify-end lg:col-span-5 pt-8 lg:pt-0">
                        {/* Main dark card */}
                        <div className="w-full max-w-[430px] rounded-2xl bg-[#112240] border border-slate-700/50 p-5 shadow-2xl relative">
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20 text-indigo-300 text-sm font-bold">
                                        %
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-100">Promo Spesial Member</span>
                                        <span className="block text-[9px] text-slate-400">Cashback & Diskon Terbatas</span>
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/25">
                                    Promo Merchant
                                </span>
                            </div>

                            {/* Inner Green Display Box */}
                            <div className="bg-[#072522] border border-emerald-500/20 rounded-xl p-5 flex flex-col items-center text-center mb-5">
                                <span className="bg-emerald-500 text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                                    DISKON 50%
                                </span>
                                <h4 className="font-extrabold text-sm text-slate-100 mb-1">Source Code & Canva Kit</h4>
                                <p className="text-[10px] text-slate-400 leading-normal max-w-[240px]">
                                    Dapatkan diskon potongan langsung untuk pembelian produk pertama dengan kode promo: <strong className="text-emerald-400">ADMSBARU</strong>
                                </p>
                            </div>

                            {/* Bottom row block */}
                            <div className="flex items-center gap-3 bg-[#0B1B33]/50 border border-slate-700/30 rounded-xl p-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <Megaphone className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div className="flex-grow">
                                    <span className="block text-xs font-bold text-slate-200">Paket Premium Ads Exchange</span>
                                    <span className="block text-[9px] text-slate-400 mt-0.5">Tayang 30 hari di Homepage & prioritas teratas pencarian.</span>
                                </div>
                            </div>

                            {/* Pagination indicator dots */}
                            <div className="flex items-center justify-center gap-1.5 mt-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                <span className="w-3 h-1.5 rounded-full bg-emerald-400"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                            </div>

                            {/* Floating Stats Card (Overlays bottom left) */}
                            <div className="bg-slate-950/95 backdrop-blur border border-slate-800 rounded-xl p-3.5 absolute bottom-8 -left-10 w-52 shadow-2xl flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
                                    &uarr;
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-200">Iklan Premium Baru</span>
                                    <span className="block text-[8px] text-slate-500 mt-0.5">Impression: 12.5K &bull; Ctr: 5.4%</span>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[8px] font-semibold text-emerald-400">&bull; Aktif</span>
                                        <span className="text-[8px] font-semibold text-indigo-400">VIP Boost</span>
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
            <section className="py-20 bg-white border-y border-slate-200 text-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="text-center mb-16 space-y-3">
                        <span className="inline-block text-[10px] font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Kategori Pilihan
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Jelajahi Kategori Layanan</h2>
                        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Temukan berbagai kebutuhan digital marketing, website, pembuatan legalitas usaha, hingga layanan offline dalam satu platform.
                        </p>
                    </div>
                    
                    {/* 5-column grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {categories.map((cat, idx) => {
                            const IconComponent = cat.icon;
                            return (
                                <div 
                                    key={idx}
                                    className="p-6 bg-white border border-slate-200 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer text-left flex flex-col justify-between min-h-[140px] group relative overflow-hidden"
                                >
                                    {/* Hover overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    <div className="relative z-10">
                                        {/* Icon container top left */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${
                                            cat.isBlueIcon 
                                                ? 'bg-sky-100 text-sky-600' 
                                                : 'bg-slate-100 text-slate-700 group-hover:text-sky-600 group-hover:bg-sky-50'
                                        }`}>
                                            <IconComponent className="w-6 h-6 transition-transform duration-300" strokeWidth={2} />
                                        </div>

                                        {/* Left-aligned titles and count */}
                                        <div>
                                            <h4 className="font-extrabold text-sm text-slate-800 leading-tight mb-1 group-hover:text-sky-700 transition-colors duration-300">{cat.name}</h4>
                                            <span className="text-[10px] text-slate-400 font-semibold group-hover:text-sky-500 transition-all duration-300 flex items-center gap-1">
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
            <section id="marketplace" className="py-20 bg-white border-b border-slate-200 text-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-1.5 text-sky-600 text-xs font-bold uppercase tracking-wider mb-2">
                                <Star className="w-3.5 h-3.5 fill-current text-sky-500" />
                                Rekomendasi Utama
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Produk Digital Pilihan</h2>
                            <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                Aset digital terlaris dan berkualitas tinggi yang diverifikasi oleh tim ADMS.
                            </p>
                        </div>
                        <a 
                            href="#marketplace" 
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1.5"
                        >
                            <span>Lihat Semua Produk</span>
                            <span className="text-sm font-semibold">&rarr;</span>
                        </a>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((prod) => (
                            <div 
                                key={prod.id}
                                className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden flex flex-col justify-between group transition-all hover:translate-y-[-4px] hover:shadow-md relative"
                            >
                                <button 
                                    onClick={() => toggleWishlist(prod.id)}
                                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-rose-500 shadow-sm transition-colors"
                                >
                                    <Heart className="w-4 h-4" />
                                </button>
                                <div>
                                    {/* Product Image */}
                                    <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 relative">
                                        <img 
                                            src={prod.image} 
                                            alt={prod.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-[10px] font-bold text-teal-600 px-2.5 py-0.5 rounded border border-slate-100 shadow-sm">
                                            {prod.category}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        <h4 className="font-extrabold text-sm text-slate-800 leading-snug line-clamp-2 h-10 mb-3">{prod.title}</h4>
                                        
                                        <div className="flex items-center gap-1.5 text-xs mb-3 text-amber-500">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="font-semibold text-slate-700">{prod.rating}</span>
                                            <span className="text-[10px] text-slate-400">({prod.reviewsCount} Ulasan)</span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                            <span>Toko:</span>
                                            <strong className="text-slate-700 font-bold">{prod.merchant}</strong>
                                            {prod.isSyariah && (
                                                <span className="inline-flex items-center bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-100 text-[9px] uppercase tracking-wide">
                                                    Syariah Certified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Buy action */}
                                <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                                    <span className="font-extrabold text-base text-teal-600">Rp{numberFormat(prod.price)}</span>
                                    <button 
                                        onClick={() => handleAddToCart(prod.id)}
                                        className="bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                        <span>Keranjang</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* D.2 Merchant Terverifikasi Section with light theme */}
            <ScrollFadeIn>
            <section id="merchants" className="py-20 bg-slate-50 border-b border-slate-200 text-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <div className="text-sky-600 text-xs font-bold uppercase tracking-wider mb-2">
                                Mitra Vendor
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Merchant Terverifikasi</h2>
                            <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                Daftar kreator dan penyedia aset digital terpercaya di ADMS.
                            </p>
                        </div>
                        <a 
                            href="#merchants" 
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1.5"
                        >
                            <span>Lihat Semua Merchant</span>
                            <span className="text-sm font-semibold">&rarr;</span>
                        </a>
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
                                    className="p-6 bg-white border border-slate-200/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[160px] group"
                                >
                                    <div>
                                        {/* Top profile row */}
                                        <div className="flex items-start gap-3.5 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <img 
                                                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop" 
                                                    alt={merchant.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1 leading-snug">
                                                    {merchant.name}
                                                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 flex-shrink-0" />
                                                </h4>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                    <span className="font-semibold text-slate-600">5.0</span>
                                                    <span>&bull;</span>
                                                    <span className="text-emerald-600 font-bold">Verified</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-6 italic">
                                            "{merchant.slug || 'Penyedia aset digital profesional di platform ADMS.'}"
                                        </p>
                                    </div>

                                    {/* Bottom Info Row */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase tracking-wide">
                                            <Shield className="w-3.5 h-3.5 text-slate-300" />
                                            Official Merchant
                                        </span>
                                        <button 
                                            onClick={onNavigateToLogin}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-0.5"
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
            <section id="how" className="py-20 bg-white border-b border-slate-200 text-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Section Header */}
                    <div className="text-center mb-10 space-y-3">
                        <span className="inline-block text-[10px] font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Panduan Platform
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Cara Kerja ADMS</h2>
                        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Proses mudah dan transparan untuk Pembeli, Merchant, maupun Pengiklan.
                        </p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex justify-center mb-16">
                        <div className="inline-flex bg-slate-100/80 border border-slate-200/50 p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setActiveTab('buyer')}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    activeTab === 'buyer' 
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Untuk Pembeli
                            </button>
                            <button
                                onClick={() => setActiveTab('merchant')}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    activeTab === 'merchant' 
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <Store className="w-3.5 h-3.5" />
                                Untuk Merchant
                            </button>
                            <button
                                onClick={() => setActiveTab('advertiser')}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                    activeTab === 'advertiser' 
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <Megaphone className="w-3.5 h-3.5" />
                                Untuk Pengiklan
                            </button>
                        </div>
                    </div>

                    {/* Steps Showcase Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {stepsData[activeTab].map((step, idx) => (
                            <div 
                                key={`${activeTab}-${idx}`}
                                className="p-6 bg-white border border-slate-400/80 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]"
                            >
                                <div>
                                    <span className={`block text-xl font-bold mb-4 ${
                                        activeTab === 'buyer' 
                                            ? 'text-amber-500' 
                                            : activeTab === 'merchant' 
                                                ? 'text-indigo-500' 
                                                : 'text-sky-500'
                                    }`}>{step.num}</span>
                                    <h4 className="font-extrabold text-sm text-slate-800 leading-tight mb-2">{step.title}</h4>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                                    <span>{step.step}</span>
                                    {step.arrow && <span className="text-slate-400">&rarr;</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* F.2 Why Choose ADMS (Keunggulan ADMS) */}
            <ScrollFadeIn>
            <section className="py-20 bg-white border-b border-slate-200 text-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="text-center mb-16 space-y-3">
                        <span className="inline-block text-[10px] font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Keunggulan ADMS
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Mengapa Memilih Platform ADMS?</h2>
                        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Platform modern yang dirancang khusus untuk mempercepat pertumbuhan produk digital dan promosi bisnis Anda.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Card 1 */}
                        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] text-left flex flex-col justify-between min-h-[220px]">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6">
                                    <Download className="w-5 h-5" />
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 leading-tight mb-3">Akses Instant Digital Download</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Setelah pembayaran berhasil terkonfirmasi, file digital langsung siap diunduh tanpa perlu menunggu konfirmasi manual.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] text-left flex flex-col justify-between min-h-[220px]">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-6">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 leading-tight mb-3">Iklan Gratis & Promosi Berbayar</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Dukungan penuh untuk pelaku UMKM dan kreator memasang iklan gratis atau memilih paket boost posisi teratas.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] text-left flex flex-col justify-between min-h-[220px]">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-6">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 leading-tight mb-3">Keamanan Transaksi Terjamin</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Sistem proteksi transaksi dan opsi Payment Gateway terintegrasi untuk menjamin keamanan dana pembeli dan merchant.
                                </p>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] text-left flex flex-col justify-between min-h-[220px]">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-6">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 leading-tight mb-3">Sistem Multi-Vendor Merchant</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
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
            <section className="py-20 bg-slate-50 border-b border-slate-200 text-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="text-center mb-16 space-y-3">
                        <span className="inline-block text-[10px] font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Testiomoni Pengguna
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Kata Mereka Tentang ADMS</h2>
                        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Pengalaman nyata dari para pembeli, merchant, dan pengiklan di platform ADMS.
                        </p>
                    </div>

                    {/* Testimonials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="p-8 bg-white border border-slate-200/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[240px]">
                            <div>
                                <Quote className="w-8 h-8 text-slate-300 mb-4" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed italic mb-6">
                                    "ADMS membantu agensi saya mendapatkan ratusan calon klien dari iklan promosi gratis dan berbayarnya. Konversinya tinggi banget!"
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                                <img 
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" 
                                    alt="Rian Prasetya" 
                                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                                />
                                <div>
                                    <h5 className="font-extrabold text-xs text-slate-800">Rian Prasetya</h5>
                                    <span className="text-[10px] text-slate-400">Digital Marketer & Agency Owner</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-8 bg-white border border-slate-200/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[240px]">
                            <div>
                                <Quote className="w-8 h-8 text-slate-300 mb-4" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed italic mb-6">
                                    "Sebagai merchant di ADMS, penjualan template Canva saya meningkat drastis. Penarikan dana cepat dan pembeli bisa download otomatis."
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                                <img 
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" 
                                    alt="Siti Rahmawati" 
                                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                                />
                                <div>
                                    <h5 className="font-extrabold text-xs text-slate-800">Siti Rahmawati</h5>
                                    <span className="text-[10px] text-slate-400">Merchant Template Canva</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-8 bg-white border border-slate-200/80 rounded-2xl hover:shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between min-h-[240px]">
                            <div>
                                <Quote className="w-8 h-8 text-slate-300 mb-4" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed italic mb-6">
                                    "Source code Next.js yang saya beli di marketplace ADMS sangat memuaskan. Lengkap dengan panduan dan penjual sangat responsif."
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                                <img 
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" 
                                    alt="Deni Kurniawan" 
                                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                                />
                                <div>
                                    <h5 className="font-extrabold text-xs text-slate-800">Deni Kurniawan</h5>
                                    <span className="text-[10px] text-slate-400">Pembeli Aset Web Developer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* F.4 FAQ Section (Frequently Asked Questions) with light theme */}
            <ScrollFadeIn>
            <section className="py-20 bg-white border-b border-slate-200 text-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="text-center mb-12 space-y-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
                            Pertanyaan Umum
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Frequently Asked Questions (FAQ)</h2>
                        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
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
                                    className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all duration-200"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(isOpen ? null : index)}
                                        className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 hover:bg-slate-50/50 transition-colors"
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
                                            isOpen ? 'max-h-40 border-t border-slate-100' : 'max-h-0'
                                        }`}
                                    >
                                        <div className="p-6 text-xs sm:text-sm text-slate-500 leading-relaxed bg-white">
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

            {/* G. Floating AI Chatbot Widget */}
            <div className="fixed bottom-6 right-6 z-40">
                {/* Floating Action Button */}
                <button 
                    onClick={() => setShowAssistant(!showAssistant)}
                    className="bg-[#0A1B33] hover:bg-[#071324] border border-slate-700/60 text-white text-xs font-bold py-3.5 px-6 rounded-full flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                    <MessageSquare className="w-4 h-4 text-teal-400" />
                    <span>Bantuan ADMS</span>
                </button>

                {/* Pop-up Mini Chatbox */}
                {showAssistant && (
                    <div className={`absolute bottom-16 right-0 w-80 rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
                        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white">
                            <span className="block font-bold text-sm">ADMS Assistant</span>
                            <span className="block text-[10px] opacity-80 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                Online &bull; Siap Membantu
                            </span>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-4 max-h-72 overflow-y-auto">
                            <div className={`p-3 rounded-lg text-xs ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                                Halo! Saya ADMS Assistant. Ada yang bisa saya bantu terkait platform digital syariah kami?
                            </div>

                            {assistantResponse && (
                                <div className="p-3 rounded-lg text-xs bg-teal-500/10 border border-teal-500/20 text-teal-400">
                                    {assistantResponse}
                                </div>
                            )}

                            <div className="space-y-2 pt-2">
                                <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Pertanyaan Cepat:</span>
                                <button 
                                    onClick={() => handleAssistantQuery('merchant')}
                                    className={`w-full text-left p-2 rounded-lg text-[10px] border transition-colors ${
                                        darkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                    }`}
                                >
                                    Bagaimana cara daftar merchant?
                                </button>
                                <button 
                                    onClick={() => handleAssistantQuery('ad')}
                                    className={`w-full text-left p-2 rounded-lg text-[10px] border transition-colors ${
                                        darkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                    }`}
                                >
                                    Bagaimana pasang iklan gratis?
                                </button>
                                <button 
                                    onClick={() => handleAssistantQuery('package')}
                                    className={`w-full text-left p-2 rounded-lg text-[10px] border transition-colors ${
                                        darkMode ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                    }`}
                                >
                                    Daftar paket promosi iklan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* G. CTA Banner Section (Sebelum Footer) */}
            <ScrollFadeIn>
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#0A1B33] rounded-3xl p-8 sm:p-12 md:p-16 text-left relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-6 max-w-3xl">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                                <Star className="w-3.5 h-3.5 fill-current text-sky-400" />
                                Siap Mengembangkan Bisnis Anda?
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                                Mulai Temukan Produk Digital & Pasang Iklan Anda Hari Ini!
                            </h2>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Bergabunglah bersama ribuan pengguna, merchant, dan advertiser di ADMS (PT. Armada Digital Marketing Syariah).
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                <button 
                                    onClick={() => onNavigateToDashboard ? onNavigateToDashboard() : onNavigateToLogin()}
                                    className="bg-[#0EA5E9] hover:bg-[#0284c7] text-white text-xs font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 group"
                                >
                                    <span>Jelajahi Marketplace</span>
                                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                </button>
                                <button 
                                    onClick={onNavigateToClassifieds}
                                    className="bg-transparent border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-emerald-400 text-xs font-bold py-3.5 px-6 rounded-xl cursor-pointer transition-all flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span>Pasang Iklan Gratis Rp0</span>
                                </button>
                            </div>
                        </div>
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
                            <div className="inline-block bg-white p-2.5 rounded-xl border border-slate-800 max-w-[160px]">
                                <img src="/assets/Images/adms-logo.png" alt="ADMS Logo" className="h-9 object-contain" />
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                                Platform terpadu Marketplace Produk Digital, Multi-Vendor Merchant, dan Platform Pemasangan Iklan Gratis & Promosi Berbayar untuk mengembangkan bisnis Anda.
                            </p>
                            
                            {/* Social Media icons in rounded cards */}
                            <div className="flex items-center gap-3">
                                <a href="#" className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M9 8H7v3h2v9h3v-9h2.72l.42-3H12V6.5c0-.82.18-1 1-1h1.5V2H12c-2.3 0-3 1.2-3 3.5V8z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Link Columns (7 cols total: 2 + 2 + 3) */}
                        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {/* Col 1 */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Platform</h4>
                                <ul className="space-y-3.5 text-xs text-slate-400">
                                    <li><a href="#marketplace" className="hover:text-white transition-colors">Marketplace</a></li>
                                    <li><a href="#marketplace" className="hover:text-white transition-colors">Produk Digital</a></li>
                                    <li><a href="#ads" className="hover:text-white transition-colors">Iklan & Promosi</a></li>
                                    <li><a href="#merchants" className="hover:text-white transition-colors">Merchant Vendor</a></li>
                                    <li><a href="#ads" className="hover:text-white transition-colors">Paket Iklan</a></li>
                                </ul>
                            </div>
                            
                            {/* Col 2 */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Bantuan</h4>
                                <ul className="space-y-3.5 text-xs text-slate-400">
                                    <li><a href="#faq" className="hover:text-white transition-colors">FAQ & Pertanyaan</a></li>
                                    <li><a href="#how" className="hover:text-white transition-colors">Customer Support (AI Assistant)</a></li>
                                    <li><a href="#how" className="hover:text-white transition-colors">Cara Pembelian Produk</a></li>
                                    <li><a href="#how" className="hover:text-white transition-colors">Cara Menjadi Merchant</a></li>
                                    <li><a href="#how" className="hover:text-white transition-colors">Panduan Iklan Gratis</a></li>
                                </ul>
                            </div>
                            
                            {/* Col 3 */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Legal & Kebijakan</h4>
                                <ul className="space-y-3.5 text-xs text-slate-400">
                                    <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Advertising Policy</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status bar (with divider line) */}
                    <div className="pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <p>&copy; 2026 ADMS (PT. Armada Digital Marketing Syariah). All rights reserved.</p>
                        <p className="flex items-center gap-1.5 font-medium text-slate-400">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                            Platform Status: <span className="text-emerald-500 font-bold">Operational & Verified</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function numberFormat(val) {
    return new Intl.NumberFormat('id-ID').format(val);
}
