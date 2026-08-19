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
    const recentBlogs = [];

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const response = await fetch('/api/public/ads');
            const data = await response.json();
            if (response.ok && data.success) {
                setAds(data.data);
            }
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const handleAdClick = async (adId) => {
        try {
            await fetch(`/api/public/ads/${adId}/click`, { method: 'POST' });
        } catch (err) {
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
        <div className="min-h-screen bg-[#071922] text-white transition-colors duration-300 font-sans pb-20">
            {/* Header Navbar */}
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout}
                onNavigate={onNavigate} 
                currentView="classifieds"
            />

            {/* A. Hero Portal Banner */}
            <section className="bg-[#0F3040] text-white py-16 relative overflow-hidden border-b-2 border-[#174256]">
                {/* Glow effects decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFBF00]/10 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#174256]/50 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto text-white">
                        Cari Barang Bekas, Jasa & Properti Terdekat
                    </h1>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                        Temukan penawaran terbaik dari jutaan penjual terverifikasi. Pasang iklan Anda 100% gratis tanpa komisi.
                    </p>

                    {/* Floating Search Widget */}
                    <div className="max-w-4xl mx-auto bg-[#071922] border-2 border-[#174256] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col md:flex-row gap-3 items-center mt-10">
                        {/* Keyword Input */}
                        <div className="w-full flex items-center bg-[#05131b] border-2 border-[#174256] rounded-xl p-3 pl-4">
                            <Search className="w-4 h-4 text-[#FFBF00] mr-2.5 flex-shrink-0" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari mobil bekas, handphone, laptop..."
                                className="w-full bg-transparent text-white focus:outline-none text-xs sm:text-sm placeholder-slate-400 font-medium"
                            />
                        </div>

                        {/* Location Input */}
                        <div className="w-full flex items-center bg-[#05131b] border-2 border-[#174256] rounded-xl p-3 pl-4">
                            <MapPin className="w-4 h-4 text-[#FFBF00] mr-2.5 flex-shrink-0" />
                            <input 
                                type="text"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                placeholder="Semua Lokasi / Kota..."
                                className="w-full bg-transparent text-white focus:outline-none text-xs sm:text-sm placeholder-slate-400 font-medium"
                            />
                        </div>

                        {/* Zap CTA Button */}
                        <button 
                            onClick={() => onNavigate('create_ad', '/pasang-iklan')}
                            className="w-full md:w-auto md:flex-shrink-0 bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black text-xs sm:text-sm px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FFBF00]/20 active:scale-95 cursor-pointer uppercase tracking-wider"
                        >
                            <Zap className="w-4 h-4 fill-current text-[#0F3040]" />
                            <span>Pasang Iklan Gratis</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* B. Navigasi Kategori Cepat */}
            <section className="py-6 bg-[#071922] border-b-2 border-[#174256]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer border ${
                                    selectedCategory === cat.name 
                                        ? 'bg-[#FFBF00] text-[#0F3040] border-[#FFBF00] shadow-md shadow-[#FFBF00]/20' 
                                        : 'bg-[#0F3040] text-slate-300 border-[#174256] hover:text-[#FFBF00]'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* C. Layout Konten Utama: Filter di Atas & Grid Full-Width */}
            <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Horizontal Filter Box (Top Filter) */}
                <div className="bg-[#0F3040] rounded-2xl border-2 border-[#174256] p-5 sm:p-6 shadow-xl space-y-5 text-left">
                    <div className="flex items-center justify-between border-b-2 border-[#174256] pb-3">
                        <span className="font-black text-xs uppercase tracking-wider text-[#FFBF00] flex items-center gap-1.5">
                            <Filter className="w-4 h-4 text-[#FFBF00]" />
                            Filter Pencarian Iklan
                        </span>
                        <button 
                            onClick={handleClearFilters}
                            className="text-xs font-black text-[#FFBF00] hover:underline transition-colors cursor-pointer uppercase tracking-wider"
                        >
                            Bersihkan Filter
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                        {/* Filter Kondisi */}
                        <div className="lg:col-span-6 space-y-2">
                            <label className="block text-xs font-black text-white uppercase tracking-wider">Kondisi Barang / Jasa</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {['Semua', 'Baru', 'Bekas', 'Jasa'].map((cond) => (
                                    <button
                                        key={cond}
                                        onClick={() => setFilterCondition(cond)}
                                        className={`text-xs py-2.5 px-3 rounded-xl border-2 font-black transition-all cursor-pointer ${
                                            filterCondition === cond 
                                                ? 'bg-[#FFBF00] text-[#0F3040] border-[#FFBF00] shadow-md' 
                                                : 'bg-[#071922] text-slate-300 border-[#174256] hover:text-[#FFBF00]'
                                        }`}
                                    >
                                        {cond}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Rentang Harga */}
                        <div className="lg:col-span-6 space-y-2">
                            <label className="block text-xs font-black text-white uppercase tracking-wider">Rentang Harga (Rp)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input 
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="Harga Minimum"
                                    className="w-full text-xs p-2.5 border-2 border-[#174256] bg-[#071922] text-white rounded-xl outline-none focus:border-[#FFBF00] placeholder-slate-400 font-medium"
                                />
                                <input 
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="Harga Maksimum"
                                    className="w-full text-xs p-2.5 border-2 border-[#174256] bg-[#071922] text-white rounded-xl outline-none focus:border-[#FFBF00] placeholder-slate-400 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Information Info Box */}
                    <div className="bg-[#071922] border border-[#174256] rounded-xl p-3.5 flex items-center gap-3 text-left">
                        <AlertCircle className="w-4 h-4 text-[#FFBF00] flex-shrink-0" />
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                            Semua iklan gratis telah melalui moderasi tim keamanan untuk mencegah spam dan penipuan.
                        </p>
                    </div>
                </div>

                {/* Toolbar (Sort & View Options) */}
                <div className="bg-[#0F3040] rounded-2xl border-2 border-[#174256] p-4 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
                    <div>
                        <h2 className="font-black text-white text-sm sm:text-base">
                            Menampilkan {filteredAds.length} Iklan Gratis
                        </h2>
                        <p className="text-[10px] sm:text-xs text-slate-300 mt-1 font-medium">
                            Kategori aktif: <strong className="text-[#FFBF00] font-black">{selectedCategory}</strong>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* View toggles */}
                        <div className="flex bg-[#071922] border-2 border-[#174256] rounded-lg p-1">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 sm:p-2 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#FFBF00] text-[#0F3040] font-black' : 'text-slate-300'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 sm:p-2 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#FFBF00] text-[#0F3040] font-black' : 'text-slate-300'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Sort dropdown */}
                        <div className="flex-1 sm:flex-none relative bg-[#071922] border-2 border-[#174256] rounded-lg px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#FFBF00]" />
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-xs sm:text-sm text-white font-bold focus:outline-none appearance-none cursor-pointer pr-4"
                                >
                                    <option value="Terbaru" className="bg-[#0F3040] text-white">Terbaru</option>
                                    <option value="Harga Terendah" className="bg-[#0F3040] text-white">Harga Terendah</option>
                                    <option value="Harga Tertinggi" className="bg-[#0F3040] text-white">Harga Tertinggi</option>
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
                                <div key={i} className="bg-[#0F3040] rounded-2xl border-2 border-[#174256] p-5 space-y-4 animate-pulse">
                                    <div className="aspect-[4/3] w-full bg-[#071922] rounded-xl"></div>
                                    <div className="h-4 bg-[#071922] rounded w-3/4"></div>
                                    <div className="h-3 bg-[#071922] rounded w-1/2"></div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="h-5 bg-[#071922] rounded w-1/3"></div>
                                        <div className="h-8 bg-[#071922] rounded w-1/4"></div>
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
                                    className={`bg-[#0F3040] text-white rounded-2xl border-2 border-[#174256] overflow-hidden flex cursor-pointer group hover:border-[#FFBF00] transition-all shadow-xl ${
                                        viewMode === 'grid' 
                                            ? 'flex-col justify-between'
                                            : 'flex-row items-center gap-4 p-4'
                                    }`}
                                >
                                    {/* Image */}
                                    <div className={`overflow-hidden bg-[#071922] relative flex-shrink-0 border-b border-[#174256] ${
                                        viewMode === 'grid' 
                                            ? 'aspect-[4/3] w-full'
                                            : 'w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-[#174256]'
                                    }`}>
                                        <img 
                                            src={ad.image} 
                                            alt={ad.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <span className="absolute top-2.5 left-2.5 bg-[#071922]/90 backdrop-blur-md text-[9px] font-black text-[#FFBF00] px-2.5 py-0.5 rounded-full border border-[#174256] shadow uppercase">
                                            {ad.category}
                                        </span>
                                    </div>

                                    {/* Content info */}
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] text-slate-400">
                                                <span className="bg-[#071922] px-2 py-0.5 rounded-md border border-[#174256] text-[#FFBF00] font-black uppercase">
                                                    {ad.condition}
                                                </span>
                                                <span>{ad.date}</span>
                                            </div>
                                            <h3 className="font-extrabold text-sm sm:text-base text-white leading-snug line-clamp-2 group-hover:text-[#FFBF00] transition-colors">
                                                {ad.title}
                                            </h3>
                                        </div>

                                        <div>
                                            <div className="text-base sm:text-lg font-black text-[#FFBF00] mb-2">
                                                {ad.price > 0 ? `Rp${new Intl.NumberFormat('id-ID').format(ad.price)}` : 'Hubungi Kontak'}
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-[#174256] pt-2.5">
                                                <span className="font-bold text-white truncate max-w-[120px]">{ad.advertiser}</span>
                                                <span className="flex items-center gap-1 text-slate-300">
                                                    <MapPin className="w-3 h-3 text-[#FFBF00]" />
                                                    {ad.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl bg-[#0F3040] border-2 border-[#174256] text-white disabled:opacity-40 hover:border-[#FFBF00] transition-all cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-9 h-9 rounded-xl font-black text-xs border-2 transition-all cursor-pointer ${
                                            currentPage === i + 1
                                                ? 'bg-[#FFBF00] text-[#0F3040] border-[#FFBF00] shadow-md'
                                                : 'bg-[#0F3040] text-white border-[#174256] hover:border-[#FFBF00]'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl bg-[#0F3040] border-2 border-[#174256] text-white disabled:opacity-40 hover:border-[#FFBF00] transition-all cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        </>
                    ) : (
                        <div className="bg-[#0F3040] border-2 border-[#174256] rounded-2xl p-12 text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#071922] border border-[#174256] text-[#FFBF00]">
                                <Search className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-white text-base">Iklan Tidak Ditemukan</h4>
                                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                                    Maaf, tidak ada penawaran iklan yang cocok dengan filter atau kata kunci pencarian Anda.
                                </p>
                            </div>
                            <button 
                                onClick={handleClearFilters}
                                className="px-5 py-2.5 bg-[#FFBF00] text-[#0F3040] hover:bg-[#ffcd33] text-xs font-black rounded-xl transition-all shadow-md cursor-pointer uppercase tracking-wider"
                            >
                                Atur Ulang Semua Filter
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* C-2. Blog Section */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-2 border-[#174256]">
                <div className="mb-8 flex items-center gap-3">
                    <div className="bg-[#FFBF00]/20 p-2.5 rounded-xl border border-[#FFBF00]/40">
                        <Rss className="w-6 h-6 text-[#FFBF00]" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Artikel Blog Terbaru</h2>
                </div>

                <div className="space-y-6">
                    {recentBlogs.map((blog) => (
                        <div key={blog.id} className="bg-[#0F3040] rounded-2xl border-2 border-[#174256] shadow-xl overflow-hidden flex flex-col md:flex-row group hover:border-[#FFBF00] transition-all">
                            <div className="md:w-64 flex-shrink-0 relative overflow-hidden bg-[#071922] border-b md:border-b-0 md:border-r border-[#174256]">
                                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover min-h-[160px] group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-6 md:p-8 flex flex-col justify-center flex-1 text-left">
                                <h3 className="text-lg md:text-xl font-black text-[#FFBF00] hover:underline cursor-pointer mb-2 transition-colors">
                                    {blog.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-[#FFBF00]" />
                                        {blog.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-[#FFBF00]" />
                                        {blog.category}
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">
                                    {blog.excerpt}
                                </p>
                                <div>
                                    <button className="inline-flex items-center gap-1 text-xs font-black text-[#FFBF00] hover:underline transition-colors uppercase tracking-wider cursor-pointer">
                                        <span>Selengkapnya</span>
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
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0F3040] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left border-2 border-[#174256] text-white">
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedAd(null)}
                            className="absolute top-4 right-4 p-2 bg-[#071922] hover:bg-[#174256] text-[#FFBF00] border border-[#174256] rounded-full transition-colors z-10 cursor-pointer shadow-md"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Image banner */}
                        <div className="aspect-[16/9] w-full bg-[#071922] relative border-b-2 border-[#174256]">
                            <img src={selectedAd.image} alt={selectedAd.title} className="w-full h-full object-cover" />
                            <span className="absolute top-4 left-4 bg-[#071922]/90 backdrop-blur-md border border-[#174256] text-xs font-black text-[#FFBF00] px-3.5 py-1 rounded-full shadow uppercase">
                                {selectedAd.category}
                            </span>
                        </div>

                        {/* Modal Body content */}
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="space-y-2">
                                <span className="inline-block bg-[#071922] border border-[#174256] text-[10px] font-black uppercase text-[#FFBF00] px-2.5 py-1 rounded-md">
                                    Kondisi: {selectedAd.condition}
                                </span>
                                <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                                    {selectedAd.title}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
                                    <span className="font-bold text-white">Pengiklan: {selectedAd.advertiser}</span>
                                    <span className="flex items-center gap-1 text-slate-300">
                                        <MapPin className="w-3.5 h-3.5 text-[#FFBF00]" />
                                        {selectedAd.location}
                                    </span>
                                </div>
                            </div>

                            {/* Price block */}
                            <div className="p-4 rounded-2xl bg-[#071922] border-2 border-[#174256] flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300">Harga Penawaran:</span>
                                <span className="text-xl font-black text-[#FFBF00]">
                                    {selectedAd.price > 0 ? `Rp${new Intl.NumberFormat('id-ID').format(selectedAd.price)}` : 'Hubungi Kontak'}
                                </span>
                            </div>

                            {/* Description block */}
                            <div className="space-y-2">
                                <h5 className="font-black text-xs uppercase tracking-wider text-[#FFBF00]">Deskripsi Lengkap</h5>
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                                    {selectedAd.desc}
                                </p>
                            </div>

                            {/* Action block */}
                            <div className="pt-6 border-t border-[#174256] flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <span className="text-[10px] text-slate-400">Dipublikasikan pada: {selectedAd.date}</span>
                                
                                <a 
                                    href={`https://wa.me/${selectedAd.whatsapp ? String(selectedAd.whatsapp).replace(/[^0-9]/g, '') : '6281121211933'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto bg-[#FFBF00] hover:bg-[#ffcd33] text-[#0F3040] font-black text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                                >
                                    <Phone className="w-4 h-4 text-[#0F3040]" />
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
