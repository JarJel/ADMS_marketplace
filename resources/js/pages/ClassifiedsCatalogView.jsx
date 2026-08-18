import React, { useState, useMemo, useEffect } from 'react';
import { 
    Search, MapPin, Zap, Filter, ArrowUpDown, LayoutGrid, List,
    Phone, ExternalLink, X, HelpCircle, Star, MessageSquare, AlertCircle,
    Rss, Clock, Tag, ChevronRight,
    Globe, Car, Bike, Smartphone, Monitor, Home, Map as MapIcon, Wrench, Briefcase, Shirt, Sofa
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Classifieds catalog view component with DB seeder data


export default function ClassifiedsCatalogView({ user, token, onNavigate, darkMode, setDarkMode, onLogout }) {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const response = await fetch('/api/public/ads');
            const data = await response.json();
            if (response.ok && data.success) {
                console.log("Classifieds API Response Data:", data.data);
                setAds(data.data);
            }
        } catch (err) {
            console.error("Gagal mengambil data iklan baris:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdClick = async (adId) => {
        try {
            await fetch(`/api/public/ads/${adId}/click`, { method: 'POST' });
        } catch (err) {
            console.error(err);
        }
    };

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [debouncedSearchLocation, setDebouncedSearchLocation] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchLocation(searchLocation);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchLocation]);

    const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');

    // Sidebar filter states
    const [filterCondition, setFilterCondition] = useState('Semua');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Catalog view & sorting states
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('Terbaru'); // 'Terbaru', 'Harga Terendah', 'Harga Tertinggi'

    // Modal state
    const [selectedAd, setSelectedAd] = useState(null);

    // Categories configurations
    const categories = [
        { name: 'Semua Kategori', icon: <Globe className="w-4 h-4" /> },
        { name: 'Mobil', icon: <Car className="w-4 h-4" /> },
        { name: 'Motor', icon: <Bike className="w-4 h-4" /> },
        { name: 'Handphone', icon: <Smartphone className="w-4 h-4" /> },
        { name: 'Elektronik', icon: <Monitor className="w-4 h-4" /> },
        { name: 'Properti', icon: <Home className="w-4 h-4" /> },
        { name: 'Tanah', icon: <MapIcon className="w-4 h-4" /> },
        { name: 'Jasa', icon: <Wrench className="w-4 h-4" /> },
        { name: 'Lowongan Kerja', icon: <Briefcase className="w-4 h-4" /> },
        { name: 'Fashion', icon: <Shirt className="w-4 h-4" /> },
        { name: 'Rumah Tangga', icon: <Sofa className="w-4 h-4" /> }
    ];



    // Reset all active filters
    const handleClearFilters = () => {
        setSearchQuery('');
        setSearchLocation('');
        setSelectedCategory('Semua Kategori');
        setFilterCondition('Semua');
        setMinPrice('');
        setMaxPrice('');
    };

    // Client-side filtering logic
    const filteredAds = useMemo(() => {
        return ads.filter(ad => {
            // Category Match (Case-Insensitive)
            if (selectedCategory !== 'Semua Kategori' && ad.category?.trim().toLowerCase() !== selectedCategory?.trim().toLowerCase()) {
                return false;
            }

            // Condition Match (Case-Insensitive)
            if (filterCondition !== 'Semua' && ad.condition?.trim().toLowerCase() !== filterCondition?.trim().toLowerCase()) {
                return false;
            }

            // Keyword Match
            if (debouncedSearchQuery.trim() !== '') {
                const keyword = debouncedSearchQuery.toLowerCase();
                const titleMatch = ad.title?.toLowerCase().includes(keyword);
                const descMatch = ad.desc?.toLowerCase().includes(keyword);
                if (!titleMatch && !descMatch) return false;
            }

            // Location Match
            if (debouncedSearchLocation.trim() !== '') {
                const loc = debouncedSearchLocation.toLowerCase();
                if (!ad.location?.toLowerCase().includes(loc)) return false;
            }

            // Min Price Match
            if (minPrice !== '' && ad.price < parseInt(minPrice)) {
                return false;
            }

            // Max Price Match
            if (maxPrice !== '' && ad.price > parseInt(maxPrice)) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === 'Harga Terendah') {
                return a.price - b.price;
            } else if (sortBy === 'Harga Tertinggi') {
                return b.price - a.price;
            } else {
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                return dateB - dateA;
            }
        });
    }, [ads, debouncedSearchQuery, debouncedSearchLocation, selectedCategory, filterCondition, minPrice, maxPrice, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, debouncedSearchLocation, selectedCategory, filterCondition, minPrice, maxPrice, sortBy]);

    const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
    
    const paginatedAds = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAds.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAds, currentPage]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans pb-20">
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

            {/* A. Hero Portal Banner (Navy Gelap) */}
            <section className="bg-[#071324] text-white py-16 relative overflow-hidden">
                {/* Glow effects decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                        🌐 Portal Iklan Baris Modern Indonesia
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
                        Cari Barang Bekas, Jasa & Properti Terdekat
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                        Temukan penawaran terbaik dari jutaan penjual terverifikasi. Pasang iklan Anda 100% gratis tanpa komisi.
                    </p>

                    {/* Floating Search Widget */}
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col md:flex-row gap-3 items-center mt-10">
                        {/* Keyword Input */}
                        <div className="w-full flex items-center bg-slate-50 border border-slate-200 rounded-xl p-3 pl-4">
                            <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari mobil bekas, handphone, laptop..."
                                className="w-full bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none text-xs sm:text-sm placeholder-slate-400"
                            />
                        </div>

                        {/* Location Input */}
                        <div className="w-full flex items-center bg-slate-50 border border-slate-200 rounded-xl p-3 pl-4">
                            <MapPin className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                            <input 
                                type="text"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                placeholder="Semua Lokasi / Kota..."
                                className="w-full bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none text-xs sm:text-sm placeholder-slate-400"
                            />
                        </div>

                        {/* Zap CTA Button */}
                        <button 
                            onClick={() => onNavigate('create_ad', '/pasang-iklan')}
                            className="w-full md:w-auto md:flex-shrink-0 bg-[#F59E0B] hover:bg-[#d97706] text-slate-900 dark:text-slate-100 font-extrabold text-xs sm:text-sm px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                        >
                            <Zap className="w-4 h-4 fill-current text-slate-900 dark:text-slate-100" />
                            <span>Pasang Iklan Gratis</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* B. Navigasi Kategori Cepat (Horizontal Scrollable Badges) */}
            <section className="py-6 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 shadow-sm dark:backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                    selectedCategory === cat.name 
                                        ? 'bg-[#071324] dark:bg-slate-700 text-white shadow-md' 
                                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* C. Layout Konten Utama: 2 Kolom */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Sidebar Filter (3 Kolom / lg:col-span-3) */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm space-y-6 text-left dark:backdrop-blur-md">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    Filter Pencarian
                                </span>
                                <button 
                                    onClick={handleClearFilters}
                                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                                >
                                    Bersihkan Filter
                                </button>
                            </div>

                            {/* Filter Kondisi */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Kondisi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Semua', 'Baru', 'Bekas', 'Jasa'].map((cond) => (
                                        <button
                                            key={cond}
                                            onClick={() => setFilterCondition(cond)}
                                            className={`text-xs py-2 px-3 rounded-lg border font-semibold transition-all ${
                                                filterCondition === cond 
                                                    ? 'bg-[#071324] dark:bg-slate-700 text-white border-transparent' 
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            {cond}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Rentang Harga */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Rentang Harga (Rp)</label>
                                <div className="space-y-2">
                                    <input 
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="Harga Minimum"
                                        className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-indigo-500"
                                    />
                                    <input 
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="Harga Maksimum"
                                        className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Security Information Info Box */}
                            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 flex gap-3 text-left">
                                <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Semua iklan gratis telah melalui moderasi tim keamanan untuk mencegah spam dan penipuan.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area (9 Kolom / lg:col-span-9) */}
                    <main className="lg:col-span-9 space-y-6">
                        
                        {/* Toolbar (Sort & View Options) */}
                        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 dark:backdrop-blur-md">
                            <div>
                                <h2 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                                    Menampilkan {filteredAds.length} Iklan Gratis
                                </h2>
                                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    Kategori aktif: <strong className="text-slate-600 dark:text-slate-300">{selectedCategory}</strong>
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {/* View toggles */}
                                <div className="flex bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                                    <button 
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {/* Sort dropdown */}
                                <div className="flex-1 sm:flex-none relative bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        <select 
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="bg-transparent text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold focus:outline-none appearance-none cursor-pointer pr-4"
                                        >
                                            <option>Terbaru</option>
                                            <option>Harga Terendah</option>
                                            <option>Harga Tertinggi</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List/Grid Container Wrapper */}
                        <div key="catalog-content-root">
                            {loading ? (
                                /* Loading skeleton loader cards grid */
                                <div key="loading-skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-4 animate-pulse">
                                            <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                                            <div className="flex justify-between items-center pt-2">
                                                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                                                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredAds.length > 0 ? (
                                <>
                                <div key={`results-${viewMode}`} className={
                                    viewMode === 'grid' 
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
                                        : "flex flex-col gap-4"
                                }>
                                    {paginatedAds.map((ad) => (
                                        <div 
                                            key={ad.id}
                                            onClick={() => { setSelectedAd(ad); handleAdClick(ad.id); }}
                                            className={`bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden flex cursor-pointer group hover:shadow-md transition-all ${
                                                viewMode === 'grid' 
                                                    ? 'flex-col justify-between'
                                                    : 'flex-row items-center gap-4 p-4'
                                            }`}
                                        >
                                            {/* Image */}
                                            <div className={`overflow-hidden bg-slate-100 dark:bg-slate-800 relative flex-shrink-0 ${
                                                viewMode === 'grid' 
                                                    ? 'aspect-[4/3] w-full'
                                                    : 'w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-slate-100 dark:border-slate-800'
                                            }`}>
                                                <img 
                                                    src={ad.image} 
                                                    alt={ad.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>

                                            {/* Card Info Body */}
                                            <div className="p-5 flex flex-col flex-1 justify-between text-left">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="inline-block bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                            {ad.category}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-semibold">{ad.date}</span>
                                                    </div>
                                                    
                                                    <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-snug mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                                                        {ad.title}
                                                    </h3>
                                                    
                                                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                                        <span className="font-semibold text-slate-500 dark:text-slate-400">{ad.advertiser}</span>
                                                        <span className="flex items-center gap-0.5">
                                                            <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                            {ad.location}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Pricing & WA button wrapper */}
                                                <div className={`flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-4 ${
                                                    viewMode === 'grid' ? 'flex-row' : 'flex-row gap-4'
                                                }`}>
                                                    <div className="text-left">
                                                        <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">Harga</span>
                                                        <span className="font-black text-sm text-amber-600 dark:text-amber-400">
                                                            {ad.price > 0 ? `Rp${new Intl.NumberFormat('id-ID').format(ad.price)}` : 'Hubungi Kontak'}
                                                        </span>
                                                    </div>

                                                    <a 
                                                        href={`https://wa.me/6281121211933`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => { e.stopPropagation(); handleAdClick(ad.id); }} // Stop modal popup trigger
                                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-2 px-3.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                                                    >
                                                        <Phone className="w-3.5 h-3.5" />
                                                        <span>WhatsApp</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center items-center gap-2">
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold disabled:opacity-50"
                                        >
                                            Sebelumnya
                                        </button>
                                        <div className="text-sm font-bold px-4 py-2">
                                            Halaman {currentPage} dari {totalPages}
                                        </div>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold disabled:opacity-50"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                )}
                                </>
                            ) : (
                                /* Empty State */
                                <div key="empty-state" className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800/80 p-12 text-center shadow-sm space-y-4 dark:backdrop-blur-md">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                                        <HelpCircle className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Iklan Tidak Ditemukan</h4>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                                            Maaf, tidak ada penawaran iklan yang cocok dengan filter atau kata kunci pencarian Anda.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleClearFilters}
                                        className="px-5 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                                    >
                                        Atur Ulang Semua Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </section>

            {/* C-2. Blog Section */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/80">
                <div className="mb-8 flex items-center gap-3">
                    <div className="bg-sky-500/10 p-2.5 rounded-lg border border-sky-500/20">
                        <Rss className="w-6 h-6 text-sky-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Artikel Blog Terbaru</h2>
                </div>

                <div className="space-y-6">
                    {recentBlogs.map((blog) => (
                        <div key={blog.id} className="bg-white dark:bg-slate-900/60 dark:backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-shadow">
                            <div className="md:w-64 flex-shrink-0 relative overflow-hidden">
                                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover min-h-[160px] group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden"></div>
                            </div>
                            <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                                <h3 className="text-lg md:text-xl font-extrabold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer mb-2 transition-colors">
                                    {blog.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {blog.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5" />
                                        {blog.category}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
                                    {blog.excerpt}
                                </p>
                                <div>
                                    <button className="inline-flex items-center gap-1 text-sm font-bold text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors">
                                        Selengkapnya
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* D. ClassifiedDetailModal Popup */}
            {selectedAd && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left border border-slate-100 dark:border-slate-800">
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedAd(null)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-colors z-10 cursor-pointer shadow-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Image banner */}
                        <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 relative">
                            <img src={selectedAd.image} alt={selectedAd.title} className="w-full h-full object-cover" />
                            <span className="absolute top-4 left-4 bg-amber-500 text-xs font-black text-slate-900 dark:text-slate-100 px-3 py-1 rounded-full shadow">
                                {selectedAd.category}
                            </span>
                        </div>

                        {/* Modal Body content */}
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="space-y-2">
                                <span className="inline-block bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-md">
                                    Kondisi: {selectedAd.condition}
                                </span>
                                <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-200 leading-snug">
                                    {selectedAd.title}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">Pengiklan: {selectedAd.advertiser}</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                        {selectedAd.location}
                                    </span>
                                </div>
                            </div>

                            {/* Price block */}
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-800 dark:text-amber-500">Harga Penawaran:</span>
                                <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                                    {selectedAd.price > 0 ? `Rp${new Intl.NumberFormat('id-ID').format(selectedAd.price)}` : 'Hubungi Kontak'}
                                </span>
                            </div>

                            {/* Description block */}
                            <div className="space-y-2">
                                <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Deskripsi Lengkap</h5>
                                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                                    {selectedAd.desc}
                                </p>
                            </div>

                            {/* Action block */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">Dipublikasikan pada: {selectedAd.date}</span>
                                
                                <a 
                                    href={`https://wa.me/6281121211933`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>Hubungi Pengiklan via WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
