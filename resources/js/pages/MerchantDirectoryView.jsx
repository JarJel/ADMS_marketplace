import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, Store, AlertCircle, Phone, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function MerchantDirectoryView({ user, token, onNavigate, darkMode, setDarkMode, onLogout }) {
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery]);

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
        } finally {
            setLoading(false);
        }
    };

    const filteredMerchants = merchants.filter(merchant => {
        if (!debouncedSearchQuery.trim()) return true;
        const q = debouncedSearchQuery.toLowerCase();
        return (merchant.store_name || merchant.name || '').toLowerCase().includes(q) || 
               (merchant.description || '').toLowerCase().includes(q) || 
               (merchant.location || '').toLowerCase().includes(q);
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070E1A] font-sans relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
            
            {/* Dotted Matrix Background Grid */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute inset-0 opacity-[0.12] dark:opacity-[0.04] bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:20px_20px]"></div>
            </div>

            <Navbar 
                user={user} 
                token={token}
                onLogout={onLogout} 
                onNavigate={onNavigate} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                currentView="merchants"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Back button */}
                <button 
                    onClick={() => onNavigate('homepage')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6 group cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Kembali ke Beranda</span>
                </button>

                {/* Header & Search */}
                <div className="mb-12 text-center space-y-4">
                    <span className="inline-block text-[10px] font-bold text-[#0284c7] dark:text-[#38bdf8] bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                        Mitra Vendor ADMS
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Direktori Toko & Penjual
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                        Temukan berbagai produk digital dan jasa dari penjual terpercaya kami yang telah diverifikasi sesuai syariat dan memiliki reputasi terbaik.
                    </p>

                    <div className="max-w-xl mx-auto pt-4">
                        <div className="relative shadow-sm rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 dark:backdrop-blur-md overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama toko, deskripsi, atau lokasi..."
                                className="block w-full pl-10 pr-4 py-3 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 border-0 focus:outline-none focus:ring-0 font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Directory Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-800/80 p-6 shadow-sm animate-pulse space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredMerchants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMerchants.map((merchant) => (
                                <div 
                                    key={merchant.id} 
                                    className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-800/80 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1.5 transition-all duration-300 dark:backdrop-blur-md group"
                                >
                                    <div>
                                        {/* Top Profile Card */}
                                        <div className="flex items-start gap-4 mb-5">
                                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                                <img 
                                                    src={merchant.logo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop'} 
                                                    alt={merchant.store_name || merchant.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base truncate flex items-center gap-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {merchant.store_name || merchant.name}
                                                    {merchant.is_verified && (
                                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 fill-emerald-500/10" title="Toko Terverifikasi" />
                                                    )}
                                                </h3>
                                                
                                                {merchant.is_verified ? (
                                                    <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 text-[8px] uppercase tracking-wider mt-1.5">
                                                        Syariah Certified
                                                    </span>
                                                ) : (
                                                    <span className="inline-block text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-1">Penjual Terdaftar</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="mb-4">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                {merchant.description || 'Belum ada deskripsi lengkap untuk merchant mitra ini.'}
                                            </p>
                                        </div>

                                        {/* Mini Product Showcase */}
                                        {merchant.products && merchant.products.length > 0 && (
                                            <div className="mb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">Produk Unggulan</p>
                                                <div className="flex gap-2 overflow-hidden">
                                                    {merchant.products.map(product => (
                                                        <div key={product.id} className="relative group/prod flex-shrink-0 w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                            <img 
                                                                src={product.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop'} 
                                                                alt={product.title} 
                                                                className="w-full h-full object-cover group-hover/prod:scale-110 transition-transform"
                                                            />
                                                        </div>
                                                    ))}
                                                    {merchant.products.length >= 3 && (
                                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 border-dashed flex items-center justify-center text-slate-400 text-xs font-bold">
                                                            +
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Info Bar */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-auto flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 min-w-0">
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                                            <span className="truncate">{merchant.location || 'Indonesia'}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {merchant.contact_whatsapp && (
                                                <a 
                                                    href={`https://wa.me/${merchant.contact_whatsapp}?text=Halo%20${encodeURIComponent(merchant.store_name || merchant.name)},%20saya%2520menemukan%20toko%20Anda%20di%20ADMS%20Marketplace`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-250/30 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                                                    title="Hubungi Penjual"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    onNavigate('products', 'semua', '', merchant.id);
                                                }}
                                                className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] px-3.5 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20 transition-all active:scale-95"
                                            >
                                                Kunjungi &rarr;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-800/80 p-16 text-center shadow-sm max-w-md mx-auto space-y-4 dark:backdrop-blur-md">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">Toko Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Maaf, kami tidak dapat menemukan merchant dengan kata kunci pencarian Anda saat ini.
                        </p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                        >
                            Reset Pencarian
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
