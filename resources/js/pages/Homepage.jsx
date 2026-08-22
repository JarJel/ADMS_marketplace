import React, { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ProductDetailModal from '../components/ProductDetailModal';
import SearchBar from '../components/SearchBar';
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

// Komponen untuk animasi angka menghitung naik (CountUp)
function AnimatedNumber({ value }) {
    const [count, setCount] = useState(0);
    const domRef = useRef();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        });
        if (domRef.current) observer.observe(domRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let start = 0;
        const end = parseInt(value, 10);
        if (isNaN(end) || end === 0) return;
        
        const duration = 2000;
        const steps = 60;
        const stepTime = Math.abs(Math.floor(duration / steps));
        const increment = end / steps;
        
        let timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.ceil(start));
            }
        }, stepTime);
        
        return () => clearInterval(timer);
    }, [value, isVisible]);

    return <span ref={domRef}>{count.toLocaleString('id-ID')}</span>;
}

export default function Homepage({ isLoggedIn, user, token, onNavigateToLogin, onNavigateToRegister, onNavigateToDashboard, onNavigateToCreateAd, onNavigateToClassifieds, onNavigateToProducts, onNavigate, onLogout, darkMode, setDarkMode, onAddToCart, onToggleWishlist, cartCount, wishlistCount, notifications, setNotifications }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [merchants, setMerchants] = useState([]);
    const [loadingMerchants, setLoadingMerchants] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Live Search Debounce Logic
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            setIsSearching(true);

            try {
                const res = await fetch(`/api/public/products?search=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.success) {
                    const items = Array.isArray(data.data) ? data.data : (data.data?.data || []);
                    setSearchResults(items.slice(0, 5));
                } else {
                    setSearchResults([]);
                }
            } catch (err) {
                console.error("Error fetching search results:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            fetchSearchResults();
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Click Outside Dropdown Logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
    const promoSlides = [
        {
            title: "ADMS Social Panel",
            desc: "Pusat Layanan SMM Termurah & Tercepat untuk Kebutuhan Sosial Media Anda.",
            image: "/images/banners/adms_social_panel.jpg",
            link: "https://admsgroup.my.id/",
            domain: "admsgroup.my.id"
        },
        {
            title: "ADMS Whatsapp Blast",
            desc: "Kirim pesan masal ke ribuan kontak dengan sekali klik. Solusi broadcast terbaik.",
            image: "/images/banners/adms_blast.jpg",
            link: "https://armadadigitalmarketing.icu/",
            domain: "armadadigitalmarketing.icu"
        },
        {
            title: "ADMS Marketplace",
            desc: "Jual beli produk digital dan jasa freelancer terpercaya dengan sistem rekening bersama.",
            image: "/images/banners/adms_marketplace.jpg",
            link: "https://admsmarketplace.my.id/",
            domain: "admsmarketplace.my.id"
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
        { name: "Template", count: "42+ Layanan", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&auto=format&fit=crop" },
        { name: "Ebook", count: "28+ Layanan", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop" },
        { name: "Software", count: "19+ Layanan", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop" },
        { name: "Website", count: "35+ Layanan", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop" },
        { name: "Design", count: "54+ Layanan", image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop" },
        { name: "Video", count: "22+ Layanan", image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=400&auto=format&fit=crop" },
        { name: "Audio", count: "15+ Layanan", image: "https://images.unsplash.com/photo-1516280440502-869d511197c4?q=80&w=400&auto=format&fit=crop" },
        { name: "Course", count: "31+ Layanan", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=400&auto=format&fit=crop" },
        { name: "Social Media", count: "48+ Layanan", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop" },
        { name: "Digital Marketing", count: "39+ Layanan", image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=400&auto=format&fit=crop" },
        { name: "Business", count: "26+ Layanan", image: "https://images.unsplash.com/photo-1507679622792-5d454dfd60e6?q=80&w=400&auto=format&fit=crop" },
        { name: "Education", count: "18+ Layanan", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop" },
        { name: "Tools", count: "45+ Layanan", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop" },
        { name: "Jasa", count: "29+ Layanan", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=400&auto=format&fit=crop" },
        { name: "Lainnya", count: "12+ Layanan", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop" }
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
                            <div className="flex-1 min-w-0 pr-2">
                                <SearchBar 
                                    onSelect={(item) => {
                                        if (item.type === 'ad') {
                                            // Pass to global window object so ClassifiedsCatalogView can pick it up if needed, or just let them find it
                                            window.initialAdSlug = item.slug;
                                            onNavigate('classifieds');
                                        } else {
                                            onNavigate('products', 'all', item.title);
                                        }
                                    }}
                                    placeholder="Cari produk digital, jasa, atau iklan..."
                                    apiEndpoint="/api/public/search-all"
                                    queryParam="q"
                                    onSearchChange={(val) => setSearchQuery(val)}
                                    containerClassName="flex items-center w-full"
                                    inputClassName="w-full bg-transparent text-slate-900 dark:text-white focus:outline-none text-xs sm:text-sm placeholder-slate-400 font-medium truncate"
                                />
                            </div>
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
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                            <a 
                                href="#marketplace"
                                className="bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black py-3.5 px-6 rounded-xl text-xs shadow-xl shadow-[#FFBF00]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-center"
                            >
                                Jelajahi Marketplace &rarr;
                            </a>
                            <button 
                                onClick={onNavigateToCreateAd}
                                className="font-bold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-1.5 border-2 border-slate-300 dark:border-[#174256] hover:border-amber-400 dark:hover:border-[#FFBF00] text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-100 dark:bg-[#0F3040] dark:hover:bg-[#0F3040]/80 transition-all cursor-pointer shadow-md text-center"
                            >
                                <Megaphone className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFBF00]" />
                                Pasang Iklan Gratis
                            </button>
                        </div>

                        {/* Core benefits checklist */}
                        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 pt-3 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <CheckCircle className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFBF00] shrink-0" /> Instan Download
                            </span>
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <CheckCircle className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFBF00] shrink-0" /> Verified Merchant
                            </span>
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <CheckCircle className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFBF00] shrink-0" /> Iklan Gratis Rp0
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
                    <div className="p-6 border-2 border-[#174256] bg-[#0F3040] rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#FFBF00]/50 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FFBF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="block text-4xl font-black text-[#FFBF00] mb-2 drop-shadow-md">
                            <AnimatedNumber value={platformStats ? platformStats.activeAds + 1250 : 1250} />+
                        </span>
                        <div className="h-1 w-12 bg-[#174256] group-hover:bg-[#FFBF00] rounded-full mx-auto mb-3 transition-colors duration-300"></div>
                        <span className="text-xs text-slate-300 uppercase font-bold tracking-widest group-hover:text-white transition-colors duration-300">Iklan Baris Aktif</span>
                    </div>
                    <div className="p-6 border-2 border-[#174256] bg-[#0F3040] rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#FFBF00]/50 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FFBF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="block text-4xl font-black text-[#FFBF00] mb-2 drop-shadow-md">
                            <AnimatedNumber value={platformStats ? platformStats.totalProducts + 3420 : 3420} />+
                        </span>
                        <div className="h-1 w-12 bg-[#174256] group-hover:bg-[#FFBF00] rounded-full mx-auto mb-3 transition-colors duration-300"></div>
                        <span className="text-xs text-slate-300 uppercase font-bold tracking-widest group-hover:text-white transition-colors duration-300">Aset Digital Terverifikasi</span>
                    </div>
                    <div className="p-6 border-2 border-[#174256] bg-[#0F3040] rounded-2xl shadow-lg text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-teal-500/50 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="block text-4xl font-black text-white mb-2 drop-shadow-md">
                            <AnimatedNumber value={platformStats ? platformStats.totalUsers + platformStats.totalMerchants + 8500 : 8500} />+
                        </span>
                        <div className="h-1 w-12 bg-[#174256] group-hover:bg-teal-400 rounded-full mx-auto mb-3 transition-colors duration-300"></div>
                        <span className="text-xs text-slate-300 uppercase font-bold tracking-widest group-hover:text-white transition-colors duration-300">Pengguna & Merchant Aktif</span>
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
                    
                    {/* 4-column grid (changed from 5 to accommodate images better) */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat, idx) => {
                            return (
                                <div 
                                    key={idx}
                                    className="relative rounded-2xl overflow-hidden min-h-[160px] sm:min-h-[180px] shadow-sm dark:shadow-md group"
                                >
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${cat.image}')` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                                    
                                    <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-10">
                                        <h4 className="font-extrabold text-base text-white leading-tight mb-1">{cat.name}</h4>
                                        <span className="text-[11px] text-slate-300 font-medium block">
                                            {cat.count} 
                                        </span>
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

                    {/* Products Grid: Mobile 2-Column Masonry + Desktop Grid */}
                    {loadingProducts ? (
                        <div className="text-center py-10 text-slate-400">Memuat produk rekomendasi...</div>
                    ) : recommendedProducts.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">Belum ada produk digital pilihan saat ini.</div>
                    ) : (
                        (() => {
                            const filtered = recommendedProducts;

                            const renderCard = (prod, isRightCol = false) => (
                                <div 
                                    key={prod.id}
                                    onClick={() => setSelectedProduct(prod)}
                                    className="rounded-2xl border-2 border-slate-300 dark:border-[#174256] bg-white dark:bg-[#0F3040] text-slate-900 dark:text-white overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 shadow-md dark:shadow-xl hover:border-[#FFBF00] relative cursor-pointer"
                                >
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                                        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-500 hover:scale-110 active:scale-95 shadow-md border border-slate-100/50 dark:border-slate-800/50 transition-all duration-300"
                                    >
                                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${userWishlist.some(id => id?.toString() === prod.id?.toString()) ? 'fill-rose-500 text-rose-500' : ''}`} />
                                    </button>
                                    <div>
                                        {/* Product Image */}
                                        <div className={`w-full overflow-hidden bg-slate-100 dark:bg-[#071922] relative border-b border-slate-200 dark:border-[#174256] ${
                                            isRightCol ? 'aspect-[4/3] sm:aspect-[16/9]' : 'aspect-[16/10] sm:aspect-[16/9]'
                                        }`}>
                                            <img 
                                                src={prod.image || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop'} 
                                                alt={prod.title || prod.name} 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop';
                                                }}
                                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                                            />
                                            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#071922]/90 backdrop-blur-md text-[8px] sm:text-[9px] font-black text-[#FFBF00] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#174256] shadow-sm uppercase tracking-wider">
                                                {prod.category}
                                            </span>
                                        </div>

                                        {/* Body */}
                                        <div className="p-2.5 sm:p-5">
                                            <h4 className="font-extrabold text-xs sm:text-sm text-[#0F3040] dark:text-white leading-snug line-clamp-2 h-7 sm:h-10 mb-1.5 sm:mb-3 group-hover:text-[#FFBF00] transition-colors duration-300">{prod.title}</h4>
                                            
                                            <div className="flex items-center gap-1 text-[10px] sm:text-xs mb-1.5 sm:mb-3 text-[#FFBF00]">
                                                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-[#FFBF00]" />
                                                <span className="font-bold text-[#0F3040] dark:text-white">{prod.rating}</span>
                                                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">({prod.reviewsCount} Ulasan)</span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                                                <span className="hidden sm:inline">Toko:</span>
                                                <strong className="text-[#0F3040] dark:text-white font-bold truncate max-w-[85px] sm:max-w-none">{prod.merchant}</strong>
                                                {prod.isSyariah && (
                                                    <span className="inline-flex items-center bg-[#FFBF00]/20 text-[#FFBF00] font-black px-1.5 py-0.5 rounded-full border border-[#FFBF00]/40 text-[7px] sm:text-[8px] uppercase tracking-wider">
                                                        Syariah Certified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buy action */}
                                    <div className="p-2.5 sm:p-5 pt-1.5 sm:pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center justify-between gap-1">
                                        <span className="font-black text-xs sm:text-base text-[#FFBF00] truncate">Rp{prod.price.toLocaleString('id-ID')}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); }}
                                            className="bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black text-[10px] sm:text-xs py-1.5 px-2.5 sm:py-2.5 sm:px-4 rounded-lg sm:rounded-xl shadow-md shadow-[#FFBF00]/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider shrink-0"
                                        >
                                            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0F3040]" />
                                            <span className="hidden xs:inline sm:inline">Keranjang</span>
                                        </button>
                                    </div>
                                </div>
                            );

                            return (
                                <>
                                    {/* True 2-Column Masonry Layout for Mobile (< sm) */}
                                    <div className="flex sm:hidden gap-1.5 items-start">
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            {filtered.filter((_, idx) => idx % 2 === 0).map((prod) => renderCard(prod, false))}
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            {filtered.filter((_, idx) => idx % 2 === 1).map((prod) => renderCard(prod, true))}
                                        </div>
                                    </div>

                                    {/* Standard Grid Layout for Tablet/Desktop (>= sm) */}
                                    <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {filtered.map((prod) => renderCard(prod, false))}
                                    </div>
                                </>
                            );
                        })()
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
                    <div className="max-w-xl mx-auto mb-10 sm:mb-16 w-full">
                        <div className="grid grid-cols-3 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] p-1 sm:p-1.5 rounded-2xl gap-1 shadow-md">
                            <button
                                onClick={() => setActiveTab('buyer')}
                                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer truncate ${
                                    activeTab === 'buyer' 
                                        ? 'bg-[#FFBF00] text-[#0F3040] shadow-md' 
                                        : 'text-slate-600 dark:text-slate-300 hover:text-[#0F3040] dark:hover:text-[#FFBF00]'
                                }`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Pembeli</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('merchant')}
                                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer truncate ${
                                    activeTab === 'merchant' 
                                        ? 'bg-[#FFBF00] text-[#0F3040] shadow-md' 
                                        : 'text-slate-600 dark:text-slate-300 hover:text-[#0F3040] dark:hover:text-[#FFBF00]'
                                }`}
                            >
                                <Store className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Merchant</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('advertiser')}
                                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer truncate ${
                                    activeTab === 'advertiser' 
                                        ? 'bg-[#FFBF00] text-[#0F3040] shadow-md' 
                                        : 'text-slate-600 dark:text-slate-300 hover:text-[#0F3040] dark:hover:text-[#FFBF00]'
                                }`}
                            >
                                <Megaphone className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Pengiklan</span>
                            </button>
                        </div>
                    </div>

                    {/* Steps Showcase Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-6">
                        {stepsData[activeTab].map((step, idx) => (
                            <div 
                                key={`${activeTab}-${idx}`}
                                className="p-3.5 sm:p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl flex flex-col justify-between min-h-[170px] sm:min-h-[220px] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#FFBF00] relative overflow-hidden group shadow-md dark:shadow-xl"
                            >
                                <div className="absolute top-2 right-2.5 sm:top-3 sm:right-4 text-3xl sm:text-5xl font-black select-none opacity-20 group-hover:opacity-40 transition-all text-[#FFBF00]">
                                    {step.num}
                                </div>

                                <div className="relative z-10 space-y-2 sm:space-y-3">
                                    <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-wider border border-[#FFBF00]/40 bg-[#FFBF00]/20 text-[#FFBF00]">
                                        {step.step}
                                    </span>

                                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0F3040] dark:text-white leading-tight mb-1 sm:mb-2 pr-4 sm:pr-6 group-hover:text-[#FFBF00] transition-colors line-clamp-2">
                                        {step.title}
                                    </h4>
                                    
                                    <p className="text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-300 leading-snug font-medium line-clamp-3 sm:line-clamp-none">
                                        {step.desc}
                                    </p>
                                </div>

                                <div className="pt-2 sm:pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center justify-between text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider relative z-10 mt-2 sm:mt-4">
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-8">
                        <div className="p-3.5 sm:p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all text-left flex flex-col justify-between min-h-[170px] sm:min-h-[220px] shadow-md dark:shadow-xl">
                            <div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center text-[#FFBF00] mb-3 sm:mb-6">
                                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFBF00]" />
                                </div>
                                <h4 className="font-extrabold text-xs sm:text-sm text-[#0F3040] dark:text-white leading-snug sm:leading-tight mb-1.5 sm:mb-3">Akses Instant Digital Download</h4>
                                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed">
                                    Setelah pembayaran berhasil terkonfirmasi, file digital langsung siap diunduh tanpa perlu menunggu konfirmasi manual.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 sm:p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all text-left flex flex-col justify-between min-h-[170px] sm:min-h-[220px] shadow-md dark:shadow-xl">
                            <div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center text-[#FFBF00] mb-3 sm:mb-6">
                                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFBF00]" />
                                </div>
                                <h4 className="font-extrabold text-xs sm:text-sm text-[#0F3040] dark:text-white leading-snug sm:leading-tight mb-1.5 sm:mb-3">Iklan Gratis & Promosi Berbayar</h4>
                                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed">
                                    Dukungan penuh untuk pelaku UMKM dan kreator memasang iklan gratis atau memilih paket boost posisi teratas.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 sm:p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all text-left flex flex-col justify-between min-h-[170px] sm:min-h-[220px] shadow-md dark:shadow-xl">
                            <div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center text-[#FFBF00] mb-3 sm:mb-6">
                                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFBF00]" />
                                </div>
                                <h4 className="font-extrabold text-xs sm:text-sm text-[#0F3040] dark:text-white leading-snug sm:leading-tight mb-1.5 sm:mb-3">Keamanan Transaksi Terjamin</h4>
                                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed">
                                    Sistem proteksi transaksi dan opsi Payment Gateway terintegrasi untuk menjamin keamanan dana pembeli dan merchant.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 sm:p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all text-left flex flex-col justify-between min-h-[170px] sm:min-h-[220px] shadow-md dark:shadow-xl">
                            <div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center text-[#FFBF00] mb-3 sm:mb-6">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFBF00]" />
                                </div>
                                <h4 className="font-extrabold text-xs sm:text-sm text-[#0F3040] dark:text-white leading-snug sm:leading-tight mb-1.5 sm:mb-3">Sistem Multi-Vendor Merchant</h4>
                                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed">
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

                    {/* Testimonials Grid: 2 Columns Level Grid on Mobile */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6 md:gap-8">
                        {/* Card 1 */}
                        <div className="p-3.5 sm:p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all flex flex-col justify-between shadow-md dark:shadow-xl">
                            <div>
                                <Quote className="w-5 h-5 sm:w-8 sm:h-8 text-[#FFBF00] mb-2 sm:mb-4" />
                                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFBF00] fill-[#FFBF00]" />
                                    ))}
                                </div>
                                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed italic mb-3 sm:mb-6">
                                    &quot;ADMS membantu agensi saya mendapatkan ratusan calon klien dari iklan promosi gratis dan berbayarnya. Konversinya tinggi banget!&quot;
                                </p>
                            </div>
                            <div className="pt-2.5 sm:pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center gap-2 sm:gap-3">
                                <img
                                    src="https://ui-avatars.com/api/?name=Rian+Prasetya&background=071922&color=FFBF00&bold=true&size=80"
                                    alt="Rian Prasetya"
                                    className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-slate-300 dark:border-[#174256] object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <h5 className="font-extrabold text-[11px] sm:text-xs text-[#0F3040] dark:text-white truncate">Rian Prasetya</h5>
                                    <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">Digital Marketer</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-3.5 sm:p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all flex flex-col justify-between shadow-md dark:shadow-xl">
                            <div>
                                <Quote className="w-5 h-5 sm:w-8 sm:h-8 text-[#FFBF00] mb-2 sm:mb-4" />
                                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFBF00] fill-[#FFBF00]" />
                                    ))}
                                </div>
                                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed italic mb-3 sm:mb-6">
                                    &quot;Sebagai merchant di ADMS, penjualan template Canva saya meningkat drastis. Penarikan dana cepat dan pembeli bisa download otomatis.&quot;
                                </p>
                            </div>
                            <div className="pt-2.5 sm:pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center gap-2 sm:gap-3">
                                <img
                                    src="https://ui-avatars.com/api/?name=Siti+Rahmawati&background=071922&color=FFBF00&bold=true&size=80"
                                    alt="Siti Rahmawati"
                                    className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-slate-300 dark:border-[#174256] object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <h5 className="font-extrabold text-[11px] sm:text-xs text-[#0F3040] dark:text-white truncate">Siti Rahmawati</h5>
                                    <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">Merchant Template</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="col-span-2 md:col-span-1 p-3.5 sm:p-6 bg-white dark:bg-[#0F3040] border-2 border-slate-300 dark:border-[#174256] rounded-2xl hover:border-[#FFBF00] transition-all flex flex-col justify-between shadow-md dark:shadow-xl">
                            <div>
                                <Quote className="w-5 h-5 sm:w-8 sm:h-8 text-[#FFBF00] mb-2 sm:mb-4" />
                                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFBF00] fill-[#FFBF00]" />
                                    ))}
                                </div>
                                <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed italic mb-3 sm:mb-6">
                                    &quot;Source code Next.js yang saya beli di marketplace ADMS sangat memuaskan. Lengkap dengan panduan dan penjual sangat responsif.&quot;
                                </p>
                            </div>
                            <div className="pt-2.5 sm:pt-4 border-t border-slate-200 dark:border-[#174256] flex items-center gap-2 sm:gap-3">
                                <img
                                    src="https://ui-avatars.com/api/?name=Deni+Kurniawan&background=071922&color=FFBF00&bold=true&size=80"
                                    alt="Deni Kurniawan"
                                    className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-slate-300 dark:border-[#174256] object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <h5 className="font-extrabold text-[11px] sm:text-xs text-[#0F3040] dark:text-white truncate">Deni Kurniawan</h5>
                                    <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">Pembeli Aset Web</span>
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
