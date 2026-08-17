import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, Filter, ArrowUpDown, LayoutGrid, List,
    Phone, X, Star, ShoppingCart, Heart, ChevronLeft, ChevronRight,
    ArrowRight, Sparkles, BookOpen, Code, GraduationCap, LayoutTemplate,
    Globe, Palette, Video, Headphones, Share2, TrendingUp, Briefcase,
    SlidersHorizontal, PackageOpen
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Shimmer Skeleton Loader Card for loading state
const SkeletonCard = () => (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 animate-pulse overflow-hidden flex flex-col justify-between min-h-[380px] p-5">
        <div>
            <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800 rounded-xl mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-4"></div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        </div>
    </div>
);

export default function ProductsCatalogView({ user, token, onNavigate, darkMode, setDarkMode, onLogout }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const isLoggedIn = !!token;

    // Filters and pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortOption, setSortOption] = useState('latest'); // 'latest', 'oldest', 'price_asc', 'price_desc'
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState(null);

    // Temp price inputs (to apply on button click)
    const [tempMinPrice, setTempMinPrice] = useState('');
    const [tempMaxPrice, setTempMaxPrice] = useState('');

    // Catalog view mode
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Selected product for detail modal
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Fetch categories and initial products
    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategoryId, sortOption, currentPage]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await fetch('/api/public/categories?type=product');
            const data = await response.json();
            if (response.ok && data.success) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error("Gagal mengambil kategori:", err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = `/api/public/products?page=${currentPage}&sort=${sortOption}`;
            
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            if (selectedCategoryId) {
                url += `&category_id=${selectedCategoryId}`;
            }
            if (minPrice) {
                url += `&min_price=${minPrice}`;
            }
            if (maxPrice) {
                url += `&max_price=${maxPrice}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            if (response.ok && data.success) {
                setProducts(data.data.data || []);
                setPaginationData(data.data);
            }
        } catch (err) {
            console.error("Gagal mengambil produk:", err);
        } finally {
            setLoading(false);
        }
    };

    // Triggered on Search Form Submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts();
    };

    // Apply Price Filters
    const handleApplyPriceFilter = (e) => {
        e.preventDefault();
        setMinPrice(tempMinPrice);
        setMaxPrice(tempMaxPrice);
        setCurrentPage(1);
        // fetchProducts will trigger via useEffect if values change
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategoryId('');
        setMinPrice('');
        setMaxPrice('');
        setTempMinPrice('');
        setTempMaxPrice('');
        setSortOption('latest');
        setCurrentPage(1);
        // This will trigger re-fetch naturally
    };

    // Add to Cart
    const handleAddToCart = async (productId) => {
        if (!isLoggedIn) {
            alert('Silakan login terlebih dahulu untuk menambah ke keranjang');
            onNavigate('login');
            return;
        }
        try {
            const res = await fetch('/api/customer/cart', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ product_id: productId, quantity: 1 })
            });
            const data = await res.json();
            if (data.success) {
                alert('Berhasil ditambahkan ke keranjang!');
            } else {
                alert(data.message || 'Gagal menambahkan ke keranjang');
            }
        } catch (error) { 
            console.error("Gagal menambah ke keranjang:", error); 
        }
    };

    // Toggle Wishlist
    const toggleWishlist = async (productId) => {
        if (!isLoggedIn) {
            alert('Silakan login terlebih dahulu untuk menyimpan wishlist');
            onNavigate('login');
            return;
        }
        try {
            const res = await fetch('/api/customer/wishlist/toggle', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ product_id: productId })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
            }
        } catch (error) { 
            console.error("Gagal menyimpan wishlist:", error); 
        }
    };

    // Helper to format currency
    const numberFormat = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

    // Map Category Icon based on name
    const getCategoryIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('template')) return <LayoutTemplate className="w-4 h-4" />;
        if (lowerName.includes('ebook') || lowerName.includes('buku')) return <BookOpen className="w-4 h-4" />;
        if (lowerName.includes('software') || lowerName.includes('aplikasi') || lowerName.includes('code')) return <Code className="w-4 h-4" />;
        if (lowerName.includes('website')) return <Globe className="w-4 h-4" />;
        if (lowerName.includes('design') || lowerName.includes('desain')) return <Palette className="w-4 h-4" />;
        if (lowerName.includes('video')) return <Video className="w-4 h-4" />;
        if (lowerName.includes('audio') || lowerName.includes('musik')) return <Headphones className="w-4 h-4" />;
        if (lowerName.includes('course') || lowerName.includes('kursus') || lowerName.includes('belajar')) return <GraduationCap className="w-4 h-4" />;
        if (lowerName.includes('social') || lowerName.includes('sosial')) return <Share2 className="w-4 h-4" />;
        if (lowerName.includes('marketing') || lowerName.includes('pemasaran')) return <TrendingUp className="w-4 h-4" />;
        if (lowerName.includes('business') || lowerName.includes('bisnis')) return <Briefcase className="w-4 h-4" />;
        return <Sparkles className="w-4 h-4" />;
    };

    // Get color themes for category buttons
    const getCategoryColors = (idx) => {
        const colors = [
            { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100', active: 'bg-emerald-600 text-white border-emerald-600' },
            { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100', active: 'bg-indigo-600 text-white border-indigo-600' },
            { bg: 'bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100', active: 'bg-sky-600 text-white border-sky-600' },
            { bg: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100', active: 'bg-blue-600 text-white border-blue-600' },
            { bg: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100', active: 'bg-purple-600 text-white border-purple-600' },
            { bg: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100', active: 'bg-rose-600 text-white border-rose-600' },
            { bg: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100', active: 'bg-cyan-600 text-white border-cyan-600' },
            { bg: 'bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100', active: 'bg-teal-600 text-white border-teal-600' }
        ];
        return colors[idx % colors.length];
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 font-sans pb-16 relative overflow-hidden ${
            darkMode ? 'bg-[#070E1A] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
        }`}>
            {/* Background decorative patterns */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Dotted matrix pattern */}
                <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]"></div>
                
                {/* Soft colored mesh gradient glowing circles */}
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-[120px]"></div>
                <div className="absolute top-[60%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-[150px]"></div>
            </div>

            {/* Top Navbar */}
            <Navbar 
                user={user} 
                token={token} 
                onNavigate={onNavigate} 
                onLogout={onLogout} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
            />

            {/* A. Hero Banner Header */}
            <div className="bg-[#0A1B33] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden z-10">
                {/* Decorative background grid and circles */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-400 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live Marketplace
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
                        Katalog <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">Produk Digital</span>
                    </h1>
                    <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full mx-auto my-2"></div>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                        Temukan ratusan aset digital premium mulai dari Source Code aplikasi, E-book bisnis, template Canva/desain, hingga AI Prompt untuk melipatgandakan produktivitas Anda.
                    </p>
                </div>
            </div>

            {/* B. Main Catalog Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-6 relative z-10">
                
                {/* Horizontal Category Filter Pills - Placed above the search bar */}
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-800/80 shadow-sm p-4 space-y-3 dark:backdrop-blur-md">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Kategori Pilihan</label>
                    {loadingCategories ? (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full w-24 flex-shrink-0"></div>
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full w-28 flex-shrink-0"></div>
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full w-20 flex-shrink-0"></div>
                            <div className="h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full w-24 flex-shrink-0"></div>
                        </div>
                    ) : (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            <button
                                onClick={() => { setSelectedCategoryId(''); setCurrentPage(1); }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all active:scale-95 cursor-pointer ${
                                    selectedCategoryId === '' 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10' 
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-700/80'
                                }`}
                            >
                                <Globe className="w-3.5 h-3.5" />
                                <span>Semua Kategori</span>
                            </button>
                            
                            {categories.map((cat, idx) => {
                                const isSelected = selectedCategoryId === cat.id.toString();
                                const colors = getCategoryColors(idx);
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setSelectedCategoryId(cat.id.toString()); setCurrentPage(1); }}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all active:scale-95 cursor-pointer ${
                                            isSelected 
                                                ? colors.active + ' shadow-md shadow-indigo-600/10' 
                                                : `${colors.bg} border-transparent`
                                        }`}
                                    >
                                        {getCategoryIcon(cat.name)}
                                        <span>{cat.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Unified Search, Price Filter, Sort, View Controls */}
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-800/80 shadow-sm p-4 flex flex-col xl:flex-row gap-4 items-center justify-between dark:backdrop-blur-md">
                    
                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full xl:w-[32%]">
                        <input 
                            type="text" 
                            placeholder="Cari produk, template, code..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-slate-800 dark:text-slate-100"
                        />
                        <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                            <Search className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Price Range inline filter form */}
                    <form onSubmit={handleApplyPriceFilter} className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-700/65 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-800 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap px-1">Harga (Rp):</span>
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value={tempMinPrice}
                            onChange={(e) => setTempMinPrice(e.target.value)}
                            className="w-20 text-xs border-0 bg-transparent focus:outline-none focus:ring-0 font-bold p-0 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                        />
                        <span className="text-slate-300 text-xs">-</span>
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value={tempMaxPrice}
                            onChange={(e) => setTempMaxPrice(e.target.value)}
                            className="w-20 text-xs border-0 bg-transparent focus:outline-none focus:ring-0 font-bold p-0 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                        />
                        <button 
                            type="submit" 
                            className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95 uppercase tracking-wider"
                        >
                            Set
                        </button>
                    </form>

                    {/* Action Controls (Sort, View Mode, Reset) */}
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                            <select 
                                value={sortOption}
                                onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                                className="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-slate-700 dark:text-slate-200"
                            >
                                <option value="latest">Terbaru</option>
                                <option value="oldest">Terlama</option>
                                <option value="price_asc">Harga Terendah</option>
                                <option value="price_desc">Harga Tertinggi</option>
                            </select>
                        </div>

                        {/* Layout View Mode Toggle */}
                        <div className="flex border border-slate-300 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800 gap-0.5">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-all ${
                                    viewMode === 'grid' 
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-600/30' 
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition-all ${
                                    viewMode === 'list' 
                                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Reset Filter Button */}
                        <button 
                            onClick={handleClearFilters}
                            className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-200 px-3 py-2 rounded-xl transition-all uppercase tracking-wider"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Active Filters Display Tag List */}
                {(selectedCategoryId || minPrice || maxPrice || searchQuery) && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aktif:</span>
                        {searchQuery && (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60 font-bold">
                                Cari: "{searchQuery}"
                                <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="hover:text-indigo-800 dark:hover:text-indigo-300"><X className="w-3 h-3" /></button>
                            </span>
                        )}
                        {selectedCategoryId && (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60 font-bold">
                                Kategori: {categories.find(c => c.id?.toString() === selectedCategoryId?.toString())?.name || 'Kategori'}
                                <button onClick={() => { setSelectedCategoryId(''); setCurrentPage(1); }} className="hover:text-indigo-800 dark:hover:text-indigo-300"><X className="w-3 h-3" /></button>
                            </span>
                        )}
                        {(minPrice || maxPrice) && (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60 font-bold">
                                Harga: {minPrice ? `Rp${numberFormat(minPrice)}` : '0'} - {maxPrice ? `Rp${numberFormat(maxPrice)}` : 'Limitless'}
                                <button onClick={() => { setMinPrice(''); setTempMinPrice(''); setMaxPrice(''); setTempMaxPrice(''); setCurrentPage(1); }} className="hover:text-indigo-800 dark:hover:text-indigo-300"><X className="w-3 h-3" /></button>
                            </span>
                        )}
                    </div>
                )}

                {/* Products Content Area */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 rounded-2xl p-16 text-center shadow-sm space-y-4 dark:backdrop-blur-md">
                        <PackageOpen className="w-16 h-16 text-slate-300 mx-auto" />
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Tidak ada produk ditemukan</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Maaf, kami tidak dapat menemukan produk digital yang cocok dengan filter atau kata kunci pencarian Anda saat ini.
                        </p>
                        <button 
                            onClick={handleClearFilters}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                        >
                            Bersihkan Semua Filter
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid Layout Display */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((prod) => (
                                    <div 
                                        key={prod.id}
                                        onClick={() => setSelectedProduct(prod)}
                                        className="rounded-2xl border border-slate-300 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-500/5 relative cursor-pointer dark:backdrop-blur-md"
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
                                                    src={prod.image || 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop'} 
                                                    alt={prod.title} 
                                                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                                                />
                                                <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[9px] font-bold text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full border border-white/50 dark:border-slate-700 shadow-sm uppercase tracking-wider">
                                                    {prod.category?.name || 'Kategori'}
                                                </span>
                                            </div>

                                            {/* Body */}
                                            <div className="p-5">
                                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 h-10 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{prod.title}</h4>
                                                
                                                <div className="flex items-center gap-1 text-xs mb-3 text-amber-500">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{prod.average_rating || 5.0}</span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">({prod.reviews_count || 0} Ulasan)</span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                    <span>Toko:</span>
                                                    <strong className="text-slate-700 dark:text-slate-300 font-bold">{prod.merchant?.store_name || 'ADMS Store'}</strong>
                                                    {prod.merchant?.is_verified && (
                                                        <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 text-[8px] uppercase tracking-wider">
                                                            Syariah Certified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Buy action */}
                                        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
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
                                ))}
                            </div>
                        ) : (
                            /* List Layout Display */
                            <div className="flex flex-col gap-4">
                                {products.map((prod) => (
                                    <div 
                                        key={prod.id}
                                        onClick={() => setSelectedProduct(prod)}
                                        className="rounded-2xl border border-slate-300 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col sm:flex-row justify-between group transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg hover:shadow-indigo-500/5 relative cursor-pointer p-4 gap-4 dark:backdrop-blur-md"
                                    >
                                        {/* Left Side: Product Image */}
                                        <div className="w-full sm:w-[200px] aspect-[16/10] sm:aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-xl relative flex-shrink-0">
                                            <img 
                                                src={prod.image || 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop'} 
                                                alt={prod.title} 
                                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                                            />
                                            <span className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[8px] font-bold text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full border border-white/50 dark:border-slate-700 shadow-sm uppercase tracking-wider">
                                                {prod.category?.name || 'Kategori'}
                                            </span>
                                        </div>

                                        {/* Center: Info Body */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="space-y-2">
                                                <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 leading-snug">{prod.title}</h4>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{prod.description || 'Tidak ada deskripsi singkat untuk aset digital ini.'}</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                                                <div className="flex items-center gap-1 text-xs text-amber-500">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{prod.average_rating || 5.0}</span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">({prod.reviews_count || 0} Ulasan)</span>
                                                </div>

                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <span>Toko:</span>
                                                    <strong className="text-slate-700 dark:text-slate-300 font-bold">{prod.merchant?.store_name || 'ADMS Store'}</strong>
                                                    {prod.merchant?.is_verified && (
                                                        <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20 text-[8px] uppercase tracking-wider ml-1">
                                                            Syariah Certified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Buy Action Box */}
                                        <div className="w-full sm:w-[150px] border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 pt-4 sm:pt-0 sm:pl-4 flex sm:flex-col justify-between sm:justify-center items-center sm:items-stretch gap-3 flex-shrink-0">
                                            <div className="sm:text-center">
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">Harga Aset</span>
                                                <span className="font-black text-lg text-teal-600 dark:text-teal-400 block mt-0.5">Rp{numberFormat(prod.price)}</span>
                                            </div>
                                            <div className="flex gap-2 w-auto sm:w-full">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                                                    className="p-2 border border-slate-200 dark:border-slate-700 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 dark:text-slate-500 hover:text-rose-505 rounded-xl transition-all active:scale-95"
                                                    title="Simpan Wishlist"
                                                >
                                                    <Heart className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAddToCart(prod.id); }}
                                                    className="flex-1 bg-gradient-to-r from-[#10B981] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                                                >
                                                    <ShoppingCart className="w-3.5 h-3.5" />
                                                    <span className="sm:hidden lg:inline">Keranjang</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 3. Pagination Controls */}
                        {paginationData && paginationData.last_page > 1 && (
                            <div className="flex justify-center items-center gap-1.5 mt-8">
                                {/* Previous Page button */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {/* Page Numbers */}
                                {Array.from({ length: paginationData.last_page }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                                            currentPage === pageNum
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                {/* Next Page button */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationData.last_page))}
                                    disabled={currentPage === paginationData.last_page}
                                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
            </div>

            {/* C. Detail Modal Pop-up */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 dark:border-slate-800 p-6 flex flex-col">
                        <button 
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-all active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            {/* Product Image preview */}
                            <div className="aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                                <img 
                                    src={selectedProduct.image || 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d'} 
                                    alt={selectedProduct.title} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            
                            {/* Product description & actions */}
                            <div className="flex flex-col justify-between">
                                <div className="space-y-3">
                                    <span className="inline-block bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider border border-teal-100 dark:border-teal-500/20">
                                        {selectedProduct.category?.name || 'Kategori'}
                                    </span>
                                    <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 leading-snug">{selectedProduct.title}</h3>
                                    
                                    <div className="flex items-center gap-1 text-xs text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{selectedProduct.average_rating || 5.0}</span>
                                        <span className="text-slate-400 dark:text-slate-500">({selectedProduct.reviews_count || 0} Ulasan)</span>
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
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedProduct.merchant?.store_name || 'ADMS Store'}</span>
                                        </div>
                                        {selectedProduct.merchant?.is_verified && (
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
                                        
                                        {selectedProduct.merchant?.whatsapp && (
                                            <a 
                                                href={`https://wa.me/${selectedProduct.merchant.whatsapp}?text=Halo%20${selectedProduct.merchant.store_name},%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(selectedProduct.title)}`}
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
