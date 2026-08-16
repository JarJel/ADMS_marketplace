import React, { useState, useMemo, useEffect } from 'react';
import { 
    Search, MapPin, Zap, Filter, ArrowUpDown, LayoutGrid, List,
    Phone, ExternalLink, X, HelpCircle, Star, MessageSquare, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Classifieds catalog view component with DB seeder data


export default function ClassifiedsCatalogView({ user, token, onNavigate, darkMode, setDarkMode, onLogout }) {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

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
    const [searchLocation, setSearchLocation] = useState('');
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
        { name: 'Semua Kategori', icon: '🌐' },
        { name: 'Mobil', icon: '🚗' },
        { name: 'Motor', icon: '🏍' },
        { name: 'Handphone', icon: '📱' },
        { name: 'Elektronik', icon: '💻' },
        { name: 'Properti', icon: '🏠' },
        { name: 'Tanah', icon: '🏷' },
        { name: 'Jasa', icon: '🛠' },
        { name: 'Lowongan Kerja', icon: '💼' },
        { name: 'Fashion', icon: '👕' },
        { name: 'Rumah Tangga', icon: '🛋' }
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
            if (searchQuery.trim() !== '') {
                const keyword = searchQuery.toLowerCase();
                const titleMatch = ad.title?.toLowerCase().includes(keyword);
                const descMatch = ad.desc?.toLowerCase().includes(keyword);
                if (!titleMatch && !descMatch) return false;
            }

            // Location Match
            if (searchLocation.trim() !== '') {
                const loc = searchLocation.toLowerCase();
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
    }, [ads, searchQuery, searchLocation, selectedCategory, filterCondition, minPrice, maxPrice, sortBy]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 transition-colors duration-300 font-sans pb-20">
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
                                className="w-full bg-transparent text-slate-800 focus:outline-none text-xs sm:text-sm placeholder-slate-400"
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
                                className="w-full bg-transparent text-slate-800 focus:outline-none text-xs sm:text-sm placeholder-slate-400"
                            />
                        </div>

                        {/* Zap CTA Button */}
                        <button 
                            onClick={() => onNavigate('create_ad', '/pasang-iklan')}
                            className="w-full md:w-auto md:flex-shrink-0 bg-[#F59E0B] hover:bg-[#d97706] text-slate-900 font-extrabold text-xs sm:text-sm px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                        >
                            <Zap className="w-4 h-4 fill-current text-slate-900" />
                            <span>Pasang Iklan Gratis</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* B. Navigasi Kategori Cepat (Horizontal Scrollable Badges) */}
            <section className="py-6 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                    selectedCategory === cat.name 
                                        ? 'bg-[#071324] text-white shadow-md' 
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
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
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-left">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                    <Filter className="w-4 h-4 text-slate-500" />
                                    Filter Pencarian
                                </span>
                                <button 
                                    onClick={handleClearFilters}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Bersihkan Filter
                                </button>
                            </div>

                            {/* Filter Kondisi */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-bold text-slate-700">Kondisi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Semua', 'Baru', 'Bekas', 'Jasa'].map((cond) => (
                                        <button
                                            key={cond}
                                            onClick={() => setFilterCondition(cond)}
                                            className={`p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                                                filterCondition === cond 
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            {cond}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Rentang Harga */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-bold text-slate-700">Rentang Harga (Rp)</label>
                                <div className="space-y-2">
                                    <input 
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="Harga Minimum"
                                        className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                                    />
                                    <input 
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="Harga Maksimum"
                                        className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Pemberitahuan Proteksi */}
                            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex gap-2">
                                <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                    Semua iklan gratis telah melalui moderasi tim keamanan untuk mencegah spam dan penipuan.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Area Hasil Iklan (9 Kolom / lg:col-span-9) */}
                    <main className="lg:col-span-9 space-y-6">
                        {/* Header List */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="text-left">
                                <h3 className="font-extrabold text-sm text-slate-800">
                                    Menampilkan {filteredAds.length} Iklan Gratis
                                </h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    Kategori aktif: <span className="font-bold text-slate-600">{selectedCategory}</span>
                                </p>
                            </div>

                            {/* Sorting & Layout Grid Toggle */}
                            <div className="flex items-center gap-3 justify-end">
                                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                    <button 
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="text-xs bg-transparent text-slate-700 outline-none pr-4 cursor-pointer"
                                    >
                                        <option value="Terbaru">Terbaru</option>
                                        <option value="Harga Terendah">Harga Terendah</option>
                                        <option value="Harga Tertinggi">Harga Tertinggi</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* List/Grid Container Wrapper */}
                        <div key="catalog-content-root">
                            {loading ? (
                                /* Loading skeleton loader cards grid */
                                <div key="loading-skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
                                            <div className="aspect-[4/3] w-full bg-slate-100 rounded-xl"></div>
                                            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                            <div className="flex justify-between items-center pt-2">
                                                <div className="h-5 bg-slate-100 rounded w-1/3"></div>
                                                <div className="h-8 bg-slate-100 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredAds.length > 0 ? (
                                <div key={`results-${viewMode}`} className={
                                    viewMode === 'grid' 
                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                        : 'space-y-4'
                                }>
                                    {filteredAds.map((ad) => (
                                        <div 
                                            key={ad.id}
                                            onClick={() => { setSelectedAd(ad); handleAdClick(ad.id); }}
                                            className={`bg-white rounded-2xl border border-slate-200 overflow-hidden flex cursor-pointer group hover:shadow-md transition-all ${
                                                viewMode === 'grid' 
                                                    ? 'flex-col justify-between'
                                                    : 'flex-row items-center gap-4 p-4'
                                            }`}
                                        >
                                            {/* Image */}
                                            <div className={`overflow-hidden bg-slate-100 relative flex-shrink-0 ${
                                                viewMode === 'grid' 
                                                    ? 'aspect-[4/3] w-full'
                                                    : 'w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-slate-100'
                                            }`}>
                                                <img 
                                                    src={ad.image} 
                                                    alt={ad.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {/* Category Badge on image (only in Grid) */}
                                                {viewMode === 'grid' && (
                                                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200/50 text-[9px] font-bold text-slate-700 px-2.5 py-1 rounded-full shadow-sm">
                                                        {ad.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Card Info Body */}
                                            <div className={`p-5 flex-1 flex flex-col justify-between ${
                                                viewMode === 'grid' ? '' : 'text-left'
                                            }`}>
                                                <div className="space-y-2 text-left">
                                                    {viewMode === 'list' && (
                                                        <span className="inline-block bg-slate-100 text-[8px] font-extrabold uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded">
                                                            {ad.category} &bull; {ad.condition}
                                                        </span>
                                                    )}
                                                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 leading-snug line-clamp-2 h-10 group-hover:text-indigo-600 transition-colors">
                                                        {ad.title}
                                                    </h4>
                                                    
                                                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                                        <span className="font-semibold text-slate-500">{ad.advertiser}</span>
                                                        <span className="flex items-center gap-0.5">
                                                            <MapPin className="w-3 h-3 text-slate-400" />
                                                            {ad.location}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Pricing & WA button wrapper */}
                                                <div className={`flex items-center justify-between pt-4 border-t border-slate-100 mt-4 ${
                                                    viewMode === 'grid' ? 'flex-row' : 'flex-row gap-4'
                                                }`}>
                                                    <div className="text-left">
                                                        <span className="block text-[8px] text-slate-400 font-bold uppercase">Harga</span>
                                                        <span className="font-black text-sm text-amber-600">
                                                            {ad.price > 0 ? `Rp${new Intl.NumberFormat('id-ID').format(ad.price)}` : 'Hubungi Kontak'}
                                                        </span>
                                                    </div>

                                                    <a 
                                                        href={`https://wa.me/${ad.whatsapp}`}
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
                            ) : (
                                /* Empty State */
                                <div key="empty-state" className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                        <HelpCircle className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-slate-800">Iklan Tidak Ditemukan</h4>
                                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                            Maaf, tidak ada penawaran iklan yang cocok dengan filter atau kata kunci pencarian Anda.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleClearFilters}
                                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                                    >
                                        Atur Ulang Semua Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </section>

            {/* D. ClassifiedDetailModal Popup */}
            {selectedAd && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left">
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedAd(null)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Image banner */}
                        <div className="aspect-[16/9] w-full bg-slate-100 relative">
                            <img src={selectedAd.image} alt={selectedAd.title} className="w-full h-full object-cover" />
                            <span className="absolute top-4 left-4 bg-amber-500 text-xs font-black text-slate-900 px-3 py-1 rounded-full shadow">
                                {selectedAd.category}
                            </span>
                        </div>

                        {/* Modal Body content */}
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="space-y-2">
                                <span className="inline-block bg-slate-100 text-[10px] font-extrabold uppercase text-slate-500 px-2.5 py-1 rounded-md">
                                    Kondisi: {selectedAd.condition}
                                </span>
                                <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-snug">
                                    {selectedAd.title}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                                    <span className="font-semibold text-slate-600">Pengiklan: {selectedAd.advertiser}</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {selectedAd.location}
                                    </span>
                                </div>
                            </div>

                            {/* Price block */}
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-800">Harga Penawaran:</span>
                                <span className="text-xl font-black text-amber-600">
                                    {selectedAd.price > 0 ? `Rp${new Intl.NumberFormat('id-ID').format(selectedAd.price)}` : 'Hubungi Kontak'}
                                </span>
                            </div>

                            {/* Description block */}
                            <div className="space-y-2">
                                <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Deskripsi Lengkap</h5>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                                    {selectedAd.desc}
                                </p>
                            </div>

                            {/* Action block */}
                            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <span className="text-[10px] text-slate-400">Dipublikasikan pada: {selectedAd.date}</span>
                                
                                <a 
                                    href={`https://wa.me/${selectedAd.whatsapp}`}
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
