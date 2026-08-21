import React, { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ProductDetailModal from '../components/ProductDetailModal';
import { 
    Search, Palette, BookOpen, Code, Cpu, Megaphone, 
    Briefcase, Star, MessageSquare, Sun, Moon, ArrowRight, 
    Shield, CheckCircle, Smartphone, ExternalLink, HelpCircle,
    LayoutGrid, Share2, ShoppingBag, Store, Download, Zap, Users, Quote, ChevronDown,
    LayoutTemplate, Book, Globe, Video, Headphones, GraduationCap, TrendingUp, Wrench, Handshake, MoreHorizontal,
    Heart, ShoppingCart, X, Phone, ChevronLeft, ChevronRight, MapPin
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

export default function Homepage({ isLoggedIn, user, token, onNavigateToLogin, onNavigateToRegister, onNavigateToDashboard, onNavigateToCreateAd, onNavigateToClassifieds, onNavigateToProducts, onNavigate, onLogout, darkMode, setDarkMode, onAddToCart, onToggleWishlist, cartCount, wishlistCount, notifications, setNotifications }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [merchants, setMerchants] = useState([]);
    const [loadingMerchants, setLoadingMerchants] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
    const promoSlides = [
        {
            title: "ADMS Social Panel",
            desc: "Pusat Layanan SMM Termurah & Tercepat untuk Kebutuhan Sosial Media Anda.",
            image: "/images/banners/adms_social_panel.jpg",
            link: "https://panel.armadadigitalmarketing.top/",
            domain: "panel.armadadigitalmarketing.top"
        },
        {
            title: "ADMS Whatsapp Blast",
            desc: "Kirim pesan masal ke ribuan kontak dengan sekali klik. Solusi broadcast terbaik.",
            image: "/images/banners/adms_blast.jpg",
            link: "https://blast.armadadigitalmarketing.top/",
            domain: "blast.armadadigitalmarketing.top"
        },
        {
            title: "ADMS Marketplace",
            desc: "Jual beli produk digital dan jasa freelancer terpercaya dengan sistem rekening bersama.",
            image: "/images/banners/adms_marketplace.jpg",
            link: "https://adms-marketplace.armadadigitalmarketing.top/",
            domain: "adms-marketplace.armadadigitalmarketing.top"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPromoSlide((prev) => (prev + 1) % promoSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [promoSlides.length]);

    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        fetchMerchants();
        fetchRecommendedProducts();
        fetchAds();
        fetchPlatformStats();
    }, []);

    const fetchRecommendedProducts = async () => {
        try {
            const response = await fetch('/api/public/products/recommended?limit=4');
            const data = await response.json();
            if (response.ok && data.success) {
                setRecommendedProducts(data.data);
            }
        } catch (err) {
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/public/ads', { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            if (data.success) setVipAds(data.data);
        } catch (e) {}
    };

    const fetchPlatformStats = async () => {
        try {
            const res = await fetch('/api/public/stats', { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            if (data.success) setPlatformStats(data.data);
        } catch (e) {}
    };

    const fetchMerchants = async () => {
        try {
            const response = await fetch('/api/public/merchants');
            const data = await response.json();
            if (response.ok && data.success) {
                setMerchants(data.data);
            }
        } catch (err) {
        } finally {
            setLoadingMerchants(false);
        }
    };

    const handleAddToCart = async (prod) => {
        const productObj = typeof prod === 'object' ? prod : { id: prod, title: 'Produk Digital ADMS', price: 0 };
        if (onAddToCart) {
            onAddToCart(productObj);
        } else {
            const pId = productObj.id;
            const existingCart = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
            existingCart.push({ id: pId, product_id: pId, quantity: 1, product: productObj });
            localStorage.setItem('adms_guest_cart', JSON.stringify(existingCart));
        }
    };

    const [userWishlist, setUserWishlist] = useState(() => {
        return JSON.parse(localStorage.getItem('adms_guest_wishlist') || '[]');
    });

    useEffect(() => {
        const savedWishlist = JSON.parse(localStorage.getItem('adms_guest_wishlist') || '[]');
        setUserWishlist(savedWishlist);
    }, []);

    const toggleWishlist = async (productId) => {
        const pIdStr = productId?.toString();
        const isFavorited = userWishlist.some(id => id?.toString() === pIdStr);
        let updatedWishlist = [];
        if (isFavorited) {
            updatedWishlist = userWishlist.filter(id => id?.toString() !== pIdStr);
        } else {
            updatedWishlist = [...userWishlist, productId];
        }
        setUserWishlist(updatedWishlist);
        localStorage.setItem('adms_guest_wishlist', JSON.stringify(updatedWishlist));

        if (onToggleWishlist) {
            onToggleWishlist(productId);
        }
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

    const [vipAds, setVipAds] = useState([]);
    const [platformStats, setPlatformStats] = useState(null);

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
        <div className="min-h-screen bg-slate-100 dark:bg-[#071922] text-slate-900 dark:text-white font-sans transition-colors duration-300">
            {/* Global light sources */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FFBF00]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#174256]/40 rounded-full blur-[150px] pointer-events-none"></div>

            {/* A. Sticky Glassmorphic Header */}
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout} 
                onNavigate={onNavigate}
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                notifications={notifications}
                setNotifications={setNotifications}
                currentView="homepage"
            />

            {/* B. Hero Section */}
            <ScrollFadeIn>
            <section className="py-16 transition-colors duration-300 relative overflow-hidden bg-slate-50 dark:bg-[#071922] text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-[#174256]">
                {/* Background ambient glow effects */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/4 bg-amber-400/10 dark:bg-[#FFBF00]/10"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/4 bg-teal-500/10 dark:bg-[#174256]/50"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                    
                    {/* Copywriting (7 columns) */}
                    <div className="space-y-6 lg:col-span-7">

                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                            Temukan <span className="text-teal-600 dark:text-[#FFBF00] bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-amber-500 to-teal-600 dark:from-[#FFBF00] dark:via-[#ffcd33] dark:to-[#FFBF00]">Produk Digital</span>.<br />
                            <span className="text-amber-600 dark:text-[#FFBF00] bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-teal-600 dark:from-[#FFBF00] dark:to-[#e6ac00]">Pasang Iklan</span>. Kembangkan Bisnis.
                        </h1>

                        <p className="text-sm sm:text-base leading-relaxed max-w-xl text-slate-600 dark:text-slate-300">
                            ADMS adalah platform marketplace dan digital advertising terpadu yang membantu Anda menemukan produk digital terbaik, berjualan sebagai merchant, dan mempromosikan bisnis dalam satu ekosistem.
                        </p>

                        {/* Search Bar inside Hero */}
                        <div className="max-w-lg mt-8 relative flex items-center rounded-2xl p-1.5 pl-4 shadow-xl border-2 bg-white dark:bg-[#0F3040] border-slate-200 dark:border-[#174256] text-slate-900 dark:text-white">
                            <Search className="w-4 h-4 mr-2.5 flex-shrink-0 text-amber-500 dark:text-[#FFBF00]" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari produk digital, jasa, atau iklan..."
                                className="w-full min-w-0 flex-1 bg-transparent focus:outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 font-medium pr-2 truncate"
                            />
                            <button 
                                onClick={() => onNavigate('products', 'all', searchQuery)}
                                className="shrink-0 bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] text-xs font-black px-4 sm:px-5 py-2.5 rounded-xl active:scale-95 transition-all shadow-lg shadow-[#FFBF00]/20 cursor-pointer uppercase tracking-wider"
                            >
                                Cari
                            </button>
                        </div>

                        {/* Popular Tags */}
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Pencarian Populer: <span className="text-teal-600 dark:text-[#FFBF00] font-semibold">Template Canva &bull; Ebook Marketing &bull; Source Code Web</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <a 
                                href="#marketplace"
                                className="bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black py-3.5 px-7 rounded-xl text-xs shadow-xl shadow-[#FFBF00]/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                            >
                                Jelajahi Marketplace &rarr;
                            </a>
                            <button 
                                onClick={onNavigateToCreateAd}
                                className="font-bold py-3.5 px-6 rounded-xl text-xs flex items-center gap-1.5 border-2 border-slate-300 dark:border-[#174256] hover:border-amber-400 dark:hover:border-[#FFBF00] text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-100 dark:bg-[#0F3040] dark:hover:bg-[#0F3040]/80 transition-all cursor-pointer shadow-md"
                            >
                                <Megaphone className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFBF00]" />
                                Pasang Iklan Gratis
                            </button>
                        </div>

                        {/* Core benefits checklist */}
                        <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFBF00]" /> Instan Download
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFBF00]" /> Verified Merchant
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFBF00]" /> Iklan Gratis Rp0
                            </span>
                        </div>
                    </div>

                    {/* Visual Card Showcase (5 columns) */}
                    <div className="relative flex justify-center lg:justify-end lg:col-span-5 pt-8 lg:pt-0">
                        <div className="relative w-full max-w-[600px]">
                            {/* Ambient glow blobs behind card */}
                            <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/10 dark:bg-[#FFBF00]/10 rounded-full blur-[80px] pointer-events-none"></div>
                            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/10 dark:bg-[#174256]/50 rounded-full blur-[80px] pointer-events-none"></div>

                            {/* Main card */}
                            <div className="w-full rounded-3xl backdrop-blur-xl border-2 border-slate-200 dark:border-[#174256] p-5 relative overflow-hidden bg-white dark:bg-[#0F3040] shadow-2xl text-slate-900 dark:text-white">
                                {/* Top shimmer border */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFBF00] to-transparent"></div>

                                {/* Slider Image container */}
                                <div className="relative w-full rounded-2xl overflow-hidden shadow-lg group border border-slate-200 dark:border-[#174256]">
                                    <div className="block relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-[#071922]">
                                        <img 
                                            src={promoSlides[currentPromoSlide].image} 
                                            alt={promoSlides[currentPromoSlide].title}
                                            className="w-full h-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-30"
                                        />
                                        
                                        {/* Overlay Content */}
                                        <a href={promoSlides[currentPromoSlide].link} target="_blank" rel="noreferrer" className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center z-10 cursor-pointer">
                                            <span className="bg-[#FFBF00] text-[#0F3040] text-[9px] font-black tracking-widest px-3 py-1 rounded-full mb-3 shadow-lg uppercase">
                                                Featured Website
                                            </span>
                                            <h3 className="text-white font-black text-2xl md:text-3xl mb-1 shadow-sm drop-shadow-lg">
                                                {promoSlides[currentPromoSlide].title}
                                            </h3>
                                            <p className="text-[#FFBF00] font-medium text-xs md:text-sm mb-4 drop-shadow-md">
                                                {promoSlides[currentPromoSlide].desc}
                                            </p>
                                            
                                            {/* Domain badge */}
                                            <div className="flex items-center gap-1.5 bg-[#071922]/80 backdrop-blur-md border border-[#174256] hover:bg-[#071922] transition-colors px-4 py-2 rounded-xl shadow-2xl">
                                                <Globe className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="text-white text-[10px] md:text-xs font-semibold tracking-wide">
                                                    {promoSlides[currentPromoSlide].domain}
                                                </span>
                                                <ExternalLink className="w-3.5 h-3.5 text-[#FFBF00] ml-1" />
                                            </div>
                                        </a>

                                        {/* Manual Navigation Arrows */}
                                        <button 
                                            onClick={(e) => { e.preventDefault(); setCurrentPromoSlide((prev) => (prev === 0 ? promoSlides.length - 1 : prev - 1)); }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#071922]/60 hover:bg-[#071922] text-white backdrop-blur-sm border border-[#174256] transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); setCurrentPromoSlide((prev) => (prev + 1) % promoSlides.length); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#071922]/60 hover:bg-[#071922] text-white backdrop-blur-sm border border-[#174256] transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Pagination dots */}
                                <div className="flex items-center justify-center gap-2 mt-5">
                                    {promoSlides.map((_, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setCurrentPromoSlide(idx)}
                                            className={`transition-all duration-300 rounded-full ${
                                                idx === currentPromoSlide 
                                                    ? 'w-6 h-2 bg-[#FFBF00] shadow-md' 
                                                    : 'w-2 h-2 bg-[#174256] hover:bg-[#FFBF00]/50'
                                            }`}
                                            aria-label={`Go to slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Social Stats footer */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="p-6 border-2 border-[#174256] bg-[#0F3040] rounded-2xl shadow-lg text-center">
                        <span className="block text-3xl font-black text-[#FFBF00]">
                            {platformStats ? `${platformStats.activeAds.toLocaleString('id-ID')}` : '...'}
                        </span>
                        <span className="text-xs text-slate-300 uppercase font-bold mt-1">Iklan Baris Aktif</span>
                    </div>
                    <div className="p-6 border-2 border-[#174256] bg-[#0F3040] rounded-2xl shadow-lg text-center">
                        <span className="block text-3xl font-black text-[#FFBF00]">
                            {platformStats ? `${platformStats.totalProducts.toLocaleString('id-ID')}` : '...'}
                        </span>
                        <span className="text-xs text-slate-300 uppercase font-bold mt-1">Aset Digital Terverifikasi</span>
                    </div>
                    <div className="p-6 border-2 border-[#174256] bg-[#0F3040] rounded-2xl shadow-lg text-center">
                        <span className="block text-3xl font-black text-white">
                            {platformStats ? `${platformStats.totalUsers.toLocaleString('id-ID')}` : '...'}
                        </span>
                        <span className="text-xs text-slate-300 uppercase font-bold mt-1">Pengguna & Merchant Aktif</span>
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* C. Quick Categories Grid */}
            <ScrollFadeIn>
            <section className="py-20 bg-slate-50 dark:bg-[#071922] border-y-2 border-slate-300 dark:border-[#174256] relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[#FFBF00]/5 blur-[80px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#174256]/50 blur-[80px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFBF00]/20 border-2 border-[#FFBF00]/40 text-[10px] font-black uppercase tracking-wider text-[#FFBF00]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFBF00] animate-pulse"></span>
                            Kategori Pilihan
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F3040] dark:text-white leading-tight">
                            Jelajahi <span className="text-[#FFBF00]">Kategori Layanan</span>
                        </h2>
                        <div className="w-16 h-1 bg-[#FFBF00] rounded-full mx-auto"></div>
                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium pt-1">
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
                                    className="p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer text-left flex flex-col justify-between min-h-[140px] group relative overflow-hidden shadow-md dark:shadow-lg hover:border-[#FFBF00]"
                                >
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 text-[#0F3040] dark:text-[#FFBF00]">
                                            <IconComponent className="w-6 h-6 transition-transform duration-300" strokeWidth={2} />
                                        </div>
 
                                        <div>
                                            <h4 className="font-extrabold text-sm text-[#0F3040] dark:text-white leading-tight mb-1 group-hover:text-[#FFBF00] transition-colors duration-300">{cat.name}</h4>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold transition-all duration-300 flex items-center gap-1 group-hover:text-[#FFBF00]">
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

            {/* D. Marketplace Featured Products */}
            <ScrollFadeIn>
            <section id="marketplace" className="py-20 bg-slate-100 dark:bg-[#071922] border-b-2 border-slate-300 dark:border-[#174256] relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b-2 border-slate-300 dark:border-[#174256] pb-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFBF00]/20 border-2 border-[#FFBF00]/40 text-[10px] font-black uppercase tracking-wider text-[#FFBF00] mb-3">
                                <Star className="w-3 h-3 fill-current text-[#FFBF00] animate-pulse" />
                                Rekomendasi Utama
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-[#0F3040] dark:text-white leading-tight">
                                Produk Digital <span className="text-[#FFBF00]">Pilihan</span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 font-medium">
                                Aset digital terlaris dan berkualitas tinggi yang diverifikasi oleh tim ADMS.
                            </p>
                        </div>
                        <button 
                            onClick={onNavigateToProducts}
                            className="inline-flex items-center gap-2 text-xs font-black text-[#0F3040] bg-[#FFBF00] hover:bg-[#ffcd33] px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
                        >
                            <span>Lihat Semua Produk</span>
                            <span className="text-sm font-semibold">&rarr;</span>
                        </button>
                    </div>

                    {/* Products Grid / Mobile Horizontal Slider */}
                    {loadingProducts ? (
                        <div className="text-center py-10 text-slate-400">Memuat produk rekomendasi...</div>
                    ) : recommendedProducts.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">Belum ada produk digital pilihan saat ini.</div>
                    ) : (
                        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {(() => {
                                const filtered = searchQuery ? recommendedProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase())) : recommendedProducts;
                                if (filtered.length === 0) {
                                    return (
                                        <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                                            Tidak ada produk yang sesuai dengan pencarian &quot;{searchQuery}&quot;.
                                        </div>
                                    );
                                }
                                 return filtered.map((prod) => (
                                <div 
                                    key={prod.id}
                                    onClick={() => setSelectedProduct(prod)}
                                    className="min-w-[275px] sm:min-w-0 max-w-[310px] sm:max-w-none flex-shrink-0 sm:flex-shrink snap-start rounded-2xl border-2 border-slate-300 dark:border-[#174256] bg-white dark:bg-[#0F3040] text-slate-900 dark:text-white overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 shadow-md dark:shadow-xl hover:border-[#FFBF00] relative cursor-pointer"
                                >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                                    className="absolute top-3 right-3 z-10 p-2 bg-[#071922]/80 backdrop-blur-md rounded-full shadow-md border border-[#174256] text-slate-400 hover:text-[#FFBF00] hover:scale-110 active:scale-95 cursor-pointer"
                                >
                                    <Heart className="w-4 h-4" />
                                </button>
                                <div>
                                    {/* Product Image */}
                                    <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-[#071922] relative border-b border-slate-200 dark:border-[#174256]">
                                        <img 
                                            src={prod.image || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop'} 
                                            alt="" 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop';
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                                        />
                                        <span className="absolute top-3 left-3 bg-[#071922]/90 backdrop-blur-md text-[9px] font-black text-[#FFBF00] px-3 py-1 rounded-full border border-[#174256] shadow-sm uppercase tracking-wider">
                                            {prod.category}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        <h4 className="font-extrabold text-sm text-[#0F3040] dark:text-white leading-snug line-clamp-2 h-10 mb-3 group-hover:text-[#FFBF00] transition-colors duration-300">{prod.title}</h4>
                                        
                                        <div className="flex items-center gap-1 text-xs mb-3 text-[#FFBF00]">
                                            <Star className="w-3.5 h-3.5 fill-current text-[#FFBF00]" />
                                            <span className="font-bold text-[#0F3040] dark:text-white">{prod.rating}</span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400">({prod.reviewsCount} Ulasan)</span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                            <span>Toko:</span>
                                            <strong className="text-[#0F3040] dark:text-white font-bold">{prod.merchant}</strong>
                                            {prod.isSyariah && (
                                                <span className="inline-flex items-center bg-[#FFBF00]/20 text-[#FFBF00] font-black px-2 py-0.5 rounded-full border border-[#FFBF00]/40 text-[8px] uppercase tracking-wider">
                                                    Syariah Certified
                                                </span>
                                            )}
                                        </div>

                                    </div>
                                </div>

                                    {/* Buy action */}
                                    <div className="p-5 pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center justify-between">
                                        <span className="font-black text-base text-[#FFBF00]">Rp{prod.price.toLocaleString('id-ID')}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); }}
                                            className="bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black text-xs py-2.5 px-4 rounded-xl shadow-md shadow-[#FFBF00]/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5 text-[#0F3040]" />
                                            <span>Keranjang</span>
                                        </button>
                                    </div>
                                </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>
            </section>
            </ScrollFadeIn>

            {/* D.1 Premium Ads Section */}
            <ScrollFadeIn>
            <section className="py-20 bg-slate-50 dark:bg-[#071922] border-b-2 border-slate-300 dark:border-[#174256] relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b-2 border-slate-300 dark:border-[#174256] pb-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFBF00]/20 border-2 border-[#FFBF00]/40 text-[10px] font-black uppercase tracking-wider text-[#FFBF00] mb-3">
                                <Star className="w-3 h-3 fill-current text-[#FFBF00] animate-pulse" />
                                Eksklusif
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-[#0F3040] dark:text-white leading-tight">
                                Iklan Premium <span className="text-[#FFBF00]">Pilihan</span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 font-medium">
                                Penawaran istimewa dari para mitra dan pengguna premium ADMS.
                            </p>
                        </div>
                        <button 
                            onClick={onNavigateToClassifieds}
                            className="inline-flex items-center gap-2 text-xs font-black text-[#0F3040] bg-[#FFBF00] hover:bg-[#ffcd33] px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
                        >
                            <span>Lihat Semua Iklan</span>
                            <span className="text-sm font-semibold">&rarr;</span>
                        </button>
                    </div>

                    {/* Premium Ads Grid */}
                    {vipAds.filter(ad => ad.is_premium).length === 0 ? (
                        <div className="text-center py-10 text-slate-400">Belum ada iklan premium saat ini.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {vipAds.filter(ad => ad.is_premium).slice(0, 4).map((ad) => (
                                <div 
                                    key={ad.id}
                                    onClick={() => onNavigateToClassifieds()}
                                    className="bg-white dark:bg-[#0F3040] rounded-2xl overflow-hidden border-2 border-[#FFBF00]/50 dark:border-[#FFBF00]/30 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col hover:-translate-y-1 relative"
                                >
                                    <div className="absolute top-3 right-3 z-10 bg-[#FFBF00] text-[#0F3040] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                                        Premium
                                    </div>
                                    <div className="w-full h-40 sm:h-48 overflow-hidden relative bg-slate-100 dark:bg-[#071922]">
                                        <img 
                                            src={ad.image} 
                                            alt={ad.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/e2e8f0/475569?text=No+Image'; }}
                                        />
                                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-10">
                                            <span className="bg-[#071922]/70 backdrop-blur-md text-[#FFBF00] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#174256]">
                                                {ad.category}
                                            </span>
                                            <span className="bg-slate-900/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                {ad.condition}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                                        <div className="flex-grow">
                                            <h3 className="font-extrabold text-[#0F3040] dark:text-white text-sm sm:text-base leading-tight mb-2 group-hover:text-[#FFBF00] transition-colors line-clamp-2">
                                                {ad.title}
                                            </h3>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#174256] flex flex-col gap-1.5">
                                            <span className="font-black text-lg text-[#FFBF00]">
                                                {ad.price > 0 ? `Rp${ad.price.toLocaleString('id-ID')}` : 'Gratis'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                                                <MapPin className="w-3 h-3 text-[#FFBF00]" /> {ad.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            </ScrollFadeIn>

            {/* D.2 Merchant Terverifikasi Section */}
            <ScrollFadeIn>
            <section id="merchants" className="py-20 bg-slate-50 dark:bg-[#071922] border-b-2 border-slate-300 dark:border-[#174256] relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <div className="text-[#FFBF00] text-xs font-black uppercase tracking-wider mb-2">
                                Mitra Vendor
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-[#0F3040] dark:text-white">Merchant Terverifikasi</h2>
                            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
                                Daftar kreator dan penyedia aset digital terpercaya di ADMS.
                            </p>
                        </div>
                        <button 
                            onClick={() => onNavigate('merchants')}
                            className="text-xs font-black bg-[#FFBF00] hover:bg-[#ffcd33] text-[#0F3040] px-4.5 py-2.5 rounded-xl border-2 border-[#FFBF00] shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
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
                                    className="p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all flex flex-col justify-between min-h-[160px] group shadow-md dark:shadow-xl"
                                >
                                    <div>
                                        {/* Top profile row */}
                                        <div className="flex items-start gap-3.5 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <img
                                                    src={merchant.logo || merchant.owner?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(merchant.name)}&background=0F3040&color=FFBF00&bold=true&size=96`}
                                                    alt={merchant.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-sm text-[#0F3040] dark:text-white flex items-center gap-1 leading-snug group-hover:text-[#FFBF00]">
                                                    {merchant.name}
                                                    <CheckCircle className="w-3.5 h-3.5 text-[#FFBF00] fill-[#FFBF00]/20 flex-shrink-0" />
                                                </h4>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                                    <span className="text-[#FFBF00] font-bold">Verified</span>
                                                    <span>&bull;</span>
                                                    <span>{merchant.products?.length ?? 0} produk aktif</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-6 italic">
                                            &quot;{merchant.description || 'Penyedia aset digital profesional di platform ADMS.'}&quot;
                                        </p>
                                    </div>

                                    {/* Bottom Info Row */}
                                    <div className="pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center justify-between text-xs">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold uppercase tracking-wide">
                                            <Shield className="w-3.5 h-3.5 text-[#FFBF00]" />
                                            Official Merchant
                                        </span>
                                        <button
                                            onClick={isLoggedIn ? onNavigateToProducts : onNavigateToLogin}
                                            className="text-xs font-black text-[#FFBF00] hover:underline transition-colors flex items-center gap-0.5 uppercase tracking-wider"
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

            {/* F. How It Works Section */}
            <ScrollFadeIn>
            <section id="how" className="py-20 bg-slate-100 dark:bg-[#071922] border-b-2 border-slate-300 dark:border-[#174256] relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Section Header */}
                    <div className="text-center mb-10 space-y-3">
                        <span className="inline-block text-[10px] font-black text-[#FFBF00] bg-[#FFBF00]/20 border-2 border-[#FFBF00]/40 px-3 py-1 rounded-full uppercase tracking-wider">
                            Panduan Platform
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-[#0F3040] dark:text-white">Cara Kerja ADMS</h2>
                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Proses mudah dan transparan untuk Pembeli, Merchant, maupun Pengiklan.
                        </p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex justify-center mb-12 sm:mb-16 px-3 sm:px-0 w-full overflow-x-auto">
                        <div className="inline-flex max-w-full bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] p-1 sm:p-1.5 rounded-2xl gap-1 shadow-md overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setActiveTab('buyer')}
                                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                                    activeTab === 'buyer' 
                                        ? 'bg-[#FFBF00] text-[#0F3040] shadow-md' 
                                        : 'text-slate-600 dark:text-slate-300 hover:text-[#0F3040] dark:hover:text-[#FFBF00]'
                                }`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Untuk Pembeli</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('merchant')}
                                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                                    activeTab === 'merchant' 
                                        ? 'bg-[#FFBF00] text-[#0F3040] shadow-md' 
                                        : 'text-slate-600 dark:text-slate-300 hover:text-[#0F3040] dark:hover:text-[#FFBF00]'
                                }`}
                            >
                                <Store className="w-3.5 h-3.5" />
                                <span>Untuk Merchant</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('advertiser')}
                                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                                    activeTab === 'advertiser' 
                                        ? 'bg-[#FFBF00] text-[#0F3040] shadow-md' 
                                        : 'text-slate-600 dark:text-slate-300 hover:text-[#0F3040] dark:hover:text-[#FFBF00]'
                                }`}
                            >
                                <Megaphone className="w-3.5 h-3.5" />
                                <span>Untuk Pengiklan</span>
                            </button>
                        </div>
                    </div>

                    {/* Steps Showcase Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {stepsData[activeTab].map((step, idx) => (
                            <div 
                                key={`${activeTab}-${idx}`}
                                className="p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#FFBF00] relative overflow-hidden group shadow-md dark:shadow-xl"
                            >
                                <div className="absolute top-3 right-4 text-5xl font-black select-none opacity-20 group-hover:opacity-40 transition-all text-[#FFBF00]">
                                    {step.num}
                                </div>

                                <div className="relative z-10 space-y-3">
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border border-[#FFBF00]/40 bg-[#FFBF00]/20 text-[#FFBF00]">
                                        {step.step}
                                    </span>

                                    <h4 className="font-extrabold text-sm text-[#0F3040] dark:text-white leading-tight mb-2 pr-6 group-hover:text-[#FFBF00] transition-colors">
                                        {step.title}
                                    </h4>
                                    
                                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        {step.desc}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider relative z-10 mt-4">
                                    <span>Panduan</span>
                                    {step.arrow && (
                                        <span className="text-[#FFBF00] group-hover:translate-x-1.5 transition-transform duration-300">
                                            &rarr;
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* F.2 Why Choose ADMS */}
            <ScrollFadeIn>
            <section className="py-20 bg-slate-50 dark:bg-[#071922] border-b-2 border-slate-300 dark:border-[#174256] relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center mb-16 space-y-3">
                        <span className="inline-block text-[10px] font-black text-[#FFBF00] bg-[#FFBF00]/20 border-2 border-[#FFBF00]/40 px-3 py-1 rounded-full uppercase tracking-wider">
                            Keunggulan ADMS
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-[#0F3040] dark:text-white">Mengapa Memilih Platform ADMS?</h2>
                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Platform modern yang dirancang khusus untuk mempercepat pertumbuhan produk digital dan promosi bisnis Anda.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all text-left flex flex-col justify-between min-h-[220px] shadow-md dark:shadow-xl">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center text-[#FFBF00] mb-6">
                                    <Download className="w-5 h-5 text-[#FFBF00]" />
                                </div>
                                <h4 className="font-extrabold text-sm text-[#0F3040] dark:text-white leading-tight mb-3">Akses Instant Digital Download</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Setelah pembayaran berhasil terkonfirmasi, file digital langsung siap diunduh tanpa perlu menunggu konfirmasi manual.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all text-left flex flex-col justify-between min-h-[220px] shadow-md dark:shadow-xl">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center text-[#FFBF00] mb-6">
                                    <Zap className="w-5 h-5 text-[#FFBF00]" />
                                </div>
                                <h4 className="font-extrabold text-sm text-[#0F3040] dark:text-white leading-tight mb-3">Iklan Gratis & Promosi Berbayar</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Dukungan penuh untuk pelaku UMKM dan kreator memasang iklan gratis atau memilih paket boost posisi teratas.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all text-left flex flex-col justify-between min-h-[220px] shadow-md dark:shadow-xl">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center text-[#FFBF00] mb-6">
                                    <Shield className="w-5 h-5 text-[#FFBF00]" />
                                </div>
                                <h4 className="font-extrabold text-sm text-[#0F3040] dark:text-white leading-tight mb-3">Keamanan Transaksi Terjamin</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Sistem proteksi transaksi dan opsi Payment Gateway terintegrasi untuk menjamin keamanan dana pembeli dan merchant.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all text-left flex flex-col justify-between min-h-[220px] shadow-md dark:shadow-xl">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center text-[#FFBF00] mb-6">
                                    <Users className="w-5 h-5 text-[#FFBF00]" />
                                </div>
                                <h4 className="font-extrabold text-sm text-[#0F3040] dark:text-white leading-tight mb-3">Sistem Multi-Vendor Merchant</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Siapapun dapat membuka toko digital, mengunggah karya, serta mengelola pesanan dan laporan pendapatan secara mandiri.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* F.3 Testimonial Section */}
            <ScrollFadeIn>
            <section className="py-20 bg-slate-100 dark:bg-[#071922] border-b-2 border-slate-300 dark:border-[#174256] relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center mb-16 space-y-3">
                        <span className="inline-block text-[10px] font-black text-[#FFBF00] bg-[#FFBF00]/20 border-2 border-[#FFBF00]/40 px-3 py-1 rounded-full uppercase tracking-wider">
                            Testimoni Pengguna
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-[#0F3040] dark:text-white">Kata Mereka Tentang ADMS</h2>
                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                            Pengalaman nyata dari para pembeli, merchant, dan pengiklan di platform ADMS.
                        </p>
                    </div>

                    {/* Testimonials Grid / Mobile Horizontal Slider */}
                    <div className="flex md:grid md:grid-cols-3 gap-5 md:gap-8 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div className="min-w-[280px] md:min-w-0 max-w-[320px] md:max-w-none flex-shrink-0 md:flex-shrink snap-start p-6 sm:p-8 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all flex flex-col justify-between min-h-[240px] shadow-md dark:shadow-xl">
                            <div>
                                <Quote className="w-8 h-8 text-[#FFBF00] mb-4" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-[#FFBF00] fill-[#FFBF00]" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
                                    &quot;ADMS membantu agensi saya mendapatkan ratusan calon klien dari iklan promosi gratis dan berbayarnya. Konversinya tinggi banget!&quot;
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center gap-3">
                                <img
                                    src="https://ui-avatars.com/api/?name=Rian+Prasetya&background=071922&color=FFBF00&bold=true&size=80"
                                    alt="Rian Prasetya"
                                    className="w-10 h-10 rounded-full border border-slate-300 dark:border-[#174256] object-cover"
                                />
                                <div>
                                    <h5 className="font-extrabold text-xs text-[#0F3040] dark:text-white">Rian Prasetya</h5>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Digital Marketer & Agency Owner</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="min-w-[280px] md:min-w-0 max-w-[320px] md:max-w-none flex-shrink-0 md:flex-shrink snap-start p-6 sm:p-8 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all flex flex-col justify-between min-h-[240px] shadow-md dark:shadow-xl">
                            <div>
                                <Quote className="w-8 h-8 text-[#FFBF00] mb-4" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-[#FFBF00] fill-[#FFBF00]" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
                                    &quot;Sebagai merchant di ADMS, penjualan template Canva saya meningkat drastis. Penarikan dana cepat dan pembeli bisa download otomatis.&quot;
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center gap-3">
                                <img
                                    src="https://ui-avatars.com/api/?name=Siti+Rahmawati&background=071922&color=FFBF00&bold=true&size=80"
                                    alt="Siti Rahmawati"
                                    className="w-10 h-10 rounded-full border border-slate-300 dark:border-[#174256] object-cover"
                                />
                                <div>
                                    <h5 className="font-extrabold text-xs text-[#0F3040] dark:text-white">Siti Rahmawati</h5>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Merchant Template Canva</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="min-w-[280px] md:min-w-0 max-w-[320px] md:max-w-none flex-shrink-0 md:flex-shrink snap-start p-6 sm:p-8 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all flex flex-col justify-between min-h-[240px] shadow-md dark:shadow-xl">
                            <div>
                                <Quote className="w-8 h-8 text-[#FFBF00] mb-4" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-[#FFBF00] fill-[#FFBF00]" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
                                    &quot;Source code Next.js yang saya beli di marketplace ADMS sangat memuaskan. Lengkap dengan panduan dan penjual sangat responsif.&quot;
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center gap-3">
                                <img
                                    src="https://ui-avatars.com/api/?name=Deni+Kurniawan&background=071922&color=FFBF00&bold=true&size=80"
                                    alt="Deni Kurniawan"
                                    className="w-10 h-10 rounded-full border border-slate-300 dark:border-[#174256] object-cover"
                                />
                                <div>
                                    <h5 className="font-extrabold text-xs text-[#0F3040] dark:text-white">Deni Kurniawan</h5>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Pembeli Aset Web Developer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            </ScrollFadeIn>

            {/* F.4 FAQ Section */}
            <ScrollFadeIn>
            <section id="faq" className="py-20 bg-slate-50 dark:bg-[#071922] border-b-2 border-slate-300 dark:border-[#174256] relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
                {/* Decorative background shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center mb-12 space-y-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#FFBF00] bg-[#FFBF00]/20 border-2 border-[#FFBF00]/40 px-3 py-1 rounded-full uppercase tracking-wider">
                            <HelpCircle className="w-3.5 h-3.5 text-[#FFBF00]" />
                            Pertanyaan Umum
                        </span>
                        <h2 className="text-3xl font-black tracking-tight text-[#0F3040] dark:text-white">Frequently Asked Questions (FAQ)</h2>
                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
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
                                    className="border-2 border-slate-300 dark:border-[#174256] rounded-2xl bg-white dark:bg-[#0F3040] overflow-hidden transition-all duration-200 shadow-md"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(isOpen ? null : index)}
                                        className="w-full p-6 text-left flex items-center justify-between gap-4 font-black text-xs sm:text-sm text-[#0F3040] dark:text-white hover:bg-slate-50 dark:hover:bg-[#174256]/30 transition-colors cursor-pointer"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown 
                                            className={`w-4 h-4 text-[#FFBF00] flex-shrink-0 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180' : ''
                                            }`} 
                                        />
                                    </button>
                                    
                                    <div 
                                        className={`transition-all duration-200 ease-in-out overflow-hidden ${
                                            isOpen ? 'max-h-40 border-t border-slate-200 dark:border-[#174256]' : 'max-h-0'
                                        }`}
                                    >
                                        <div className="p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#071922]/50">
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
            <footer className={`pt-20 pb-10 border-t transition-colors ${
                darkMode ? 'bg-[#071324] text-slate-100 border-slate-900' : 'bg-white text-slate-800 border-slate-200'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Upper column links grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                        
                        {/* Company logo/info block (5 cols) */}
                        <div className="md:col-span-5 space-y-6">
                            <div className="inline-flex items-center gap-3 mb-2">
                                <img src="/assets/Images/adms-symbol.png" alt="ADMS Symbol" className="h-10 sm:h-11 w-auto object-contain drop-shadow-md" />
                                <img src="/assets/Images/adms-text.png" alt="ADMS Text" className="h-6 sm:h-7 w-auto object-contain invert mix-blend-screen" />
                            </div>
                            <p className={`text-xs leading-relaxed max-w-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Platform terpadu Marketplace Produk Digital, Multi-Vendor Merchant, dan Platform Pemasangan Iklan Gratis & Promosi Berbayar untuk mengembangkan bisnis Anda.
                            </p>
                            
                            {/* Social Media icons in rounded cards */}
                            <div className="flex items-center gap-3">
                                {/* Instagram */}
                                <a href="https://www.instagram.com/adms.group?igsh=MWVtdWZ6NGF5NWI2Ng==" target="_blank" rel="noopener noreferrer" className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                                    darkMode ? 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-500'
                                }`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                                    </svg>
                                </a>
                                {/* Email */}
                                <a href="mailto:Info@armadadigitalmarketing.top" className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                                    darkMode ? 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-500'
                                }`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </a>
                                {/* WhatsApp */}
                                <a href="https://wa.me/6281121211933" target="_blank" rel="noopener noreferrer" className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                                    darkMode ? 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-500'
                                }`}>
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
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Platform</h4>
                                <ul className={`space-y-3.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <li><button onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Marketplace</button></li>
                                    <li><button onClick={() => onNavigate('products', 'digital')} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Produk Digital</button></li>
                                    <li><button onClick={() => onNavigate('classifieds')} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Iklan Gratis</button></li>
                                    <li><button onClick={() => onNavigate('merchants')} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Merchant Vendor</button></li>
                                    <li><button onClick={() => onNavigate('create_ad')} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Paket Iklan</button></li>
                                </ul>
                            </div>
                            
                            {/* Col 2 */}
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Bantuan</h4>
                                <ul className={`space-y-3.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <li><button onClick={() => onNavigate('help_center')} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Pusat Bantuan</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat'))} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Customer Support (AI Assistant)</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat', { detail: { query: 'buka katalog' } }))} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Cara Pembelian Produk</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat', { detail: { query: 'info legalitas' } }))} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Cara Menjadi Merchant</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat', { detail: { query: 'pasang iklan online' } }))} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Panduan Iklan Gratis</button></li>
                                </ul>
                            </div>
                            
                            {/* Col 3 */}
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Legal & Kebijakan</h4>
                                <ul className={`space-y-3.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <li><button onClick={() => onNavigate('terms')} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Terms & Conditions</button></li>
                                    <li><button onClick={() => onNavigate('privacy')} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Privacy Policy</button></li>
                                    <li><button onClick={() => onNavigate('refund')} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Refund Policy</button></li>
                                    <li><button onClick={() => onNavigate('advertising')} className={`transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium ${darkMode ? 'hover:text-white' : 'hover:text-teal-600'}`}>Advertising Policy</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status bar (with divider line) */}
                    <div className={`pt-8 border-t flex flex-col items-center justify-center gap-4 text-xs text-center ${darkMode ? 'border-slate-900/60 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                        <p>&copy; 2026 ADMS (PT. Armada Digital Marketing Syariah). All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Product Detail Modal */}
            <ProductDetailModal 
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                darkMode={darkMode}
                onAddToCart={(prod) => {
                    if (onAddToCart) {
                        onAddToCart(prod);
                    } else {
                        handleAddToCart(prod.id);
                    }
                }}
            />
        </div>
    );
}

function numberFormat(val) {
    return new Intl.NumberFormat('id-ID').format(val);
}
