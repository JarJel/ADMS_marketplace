import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, Store, AlertCircle, Phone, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function MerchantDirectoryView({ user, token, onNavigate, darkMode, setDarkMode, onLogout, cartCount = 0, wishlistCount = 0, notifications = [], setNotifications }) {
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
        <div className="min-h-screen bg-slate-100 dark:bg-[#071922] font-sans relative overflow-hidden transition-colors duration-300 text-slate-900 dark:text-white">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFBF00]/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#174256]/50 rounded-full blur-[140px] pointer-events-none z-0"></div>
            
            {/* Dotted Matrix Background Grid */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:20px_20px]"></div>
            </div>

            <Navbar 
                user={user} 
                token={token}
                onLogout={onLogout} 
                onNavigate={onNavigate} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                currentView="merchants"
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                notifications={notifications}
                setNotifications={setNotifications}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Back button */}
                <button 
                    onClick={() => onNavigate('homepage')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#FFBF00] transition-colors mb-6 group cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Kembali ke Beranda</span>
                </button>

                {/* Header & Search */}
                <div className="mb-12 text-center space-y-4">
                    <span className="inline-block text-[10px] font-black text-[#FFBF00] bg-[#FFBF00]/20 border border-[#FFBF00]/40 px-3.5 py-1 rounded-full uppercase tracking-wider">
                        Mitra Vendor ADMS
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-[#0F3040] dark:text-white tracking-tight">
                        Direktori Toko & Penjual
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
                        Temukan berbagai produk digital dan jasa dari penjual terpercaya kami yang telah diverifikasi sesuai syariat dan memiliki reputasi terbaik.
                    </p>

                    <div className="max-w-xl mx-auto pt-4">
                        <div className="relative shadow-xl rounded-2xl border-2 border-slate-300 dark:border-[#174256] bg-white dark:bg-[#0F3040] overflow-hidden focus-within:ring-2 focus-within:ring-[#FFBF00] focus-within:border-[#FFBF00] transition-all">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-[#FFBF00]" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama toko, deskripsi, atau lokasi..."
                                className="block w-full pl-10 pr-4 py-3 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 border-0 focus:outline-none focus:ring-0 font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Directory Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-[#0F3040] rounded-2xl border-2 border-slate-300 dark:border-[#174256] p-6 shadow-md animate-pulse space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-100 dark:bg-[#071922] rounded-xl"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-100 dark:bg-[#071922] rounded w-2/3"></div>
                                        <div className="h-3 bg-slate-100 dark:bg-[#071922] rounded w-1/3"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-100 dark:bg-[#071922] rounded w-full"></div>
                                    <div className="h-3 bg-slate-100 dark:bg-[#071922] rounded w-4/5"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredMerchants.length > 0 ? (
                    (() => {
                        const renderMerchantCard = (merchant, isRightCol = false) => (
                            <div 
                                key={merchant.id} 
                                className="bg-white dark:bg-[#0F3040] rounded-2xl border-2 border-slate-300 dark:border-[#174256] p-2.5 sm:p-6 flex flex-col justify-between hover:border-[#FFBF00] hover:-translate-y-1.5 transition-all duration-300 group shadow-md dark:shadow-xl relative"
                            >
                                <div>
                                    {/* Top Profile Card */}
                                    <div className="flex items-start gap-2 sm:gap-4 mb-2.5 sm:mb-5">
                                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] flex items-center justify-center overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                            <img 
                                                src={merchant.logo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop'} 
                                                alt={merchant.store_name || merchant.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-[#0F3040] dark:text-[#FFBF00] text-xs sm:text-base truncate flex items-center gap-1 transition-colors">
                                                <span className="truncate">{merchant.store_name || merchant.name}</span>
                                                {merchant.is_verified && (
                                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFBF00] flex-shrink-0 fill-[#FFBF00]/20" title="Toko Terverifikasi" />
                                                )}
                                            </h3>
                                            
                                            {merchant.is_verified ? (
                                                <span className="inline-flex items-center bg-[#FFBF00]/20 text-[#FFBF00] font-black px-1.5 py-0.5 rounded-full border border-[#FFBF00]/40 text-[7px] sm:text-[8px] uppercase tracking-wider mt-0.5 sm:mt-1.5">
                                                    Syariah Certified
                                                </span>
                                            ) : (
                                                <span className="inline-block text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mt-0.5">Penjual Terdaftar</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-2 sm:mb-4">
                                        <p className={`text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug sm:leading-relaxed ${
                                            isRightCol ? 'line-clamp-3 sm:line-clamp-2' : 'line-clamp-2'
                                        }`}>
                                            {merchant.description || 'Belum ada deskripsi lengkap untuk merchant mitra ini.'}
                                        </p>
                                    </div>

                                    {/* Mini Product Showcase */}
                                    {merchant.products && merchant.products.length > 0 && (
                                        <div className="mb-2 sm:mb-5 pt-2 sm:pt-3 border-t border-slate-200 dark:border-[#174256]">
                                            <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Produk Unggulan</p>
                                            <div className="flex gap-1.5 overflow-hidden">
                                                {merchant.products.map(product => (
                                                    <div key={product.id} className="relative group/prod flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-md sm:rounded-lg bg-slate-100 dark:bg-[#071922] overflow-hidden border border-slate-300 dark:border-[#174256]">
                                                        <img 
                                                            src={product.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop'} 
                                                            alt={product.title} 
                                                            className="w-full h-full object-cover group-hover/prod:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                ))}
                                                {merchant.products.length >= 3 && (
                                                    <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-md sm:rounded-lg bg-slate-100 dark:bg-[#071922] border border-slate-300 dark:border-[#174256] border-dashed flex items-center justify-center text-slate-400 text-[10px] sm:text-xs font-bold">
                                                        +
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Info Bar */}
                                <div className="pt-2 sm:pt-4 border-t border-slate-200 dark:border-[#174256] mt-auto flex items-center justify-between gap-1 sm:gap-4">
                                    <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400 min-w-0">
                                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 text-[#FFBF00]" />
                                        <span className="truncate">{merchant.location || 'Indonesia'}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                        {merchant.contact_whatsapp && (
                                            <a 
                                                href={`https://wa.me/${merchant.contact_whatsapp}?text=Halo%20${encodeURIComponent(merchant.store_name || merchant.name)},%20saya%2520menemukan%20toko%20Anda%20di%20ADMS%20Marketplace`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 sm:p-2 bg-slate-100 dark:bg-[#071922] hover:bg-slate-200 dark:hover:bg-[#174256] text-[#FFBF00] border border-slate-300 dark:border-[#174256] rounded-lg sm:rounded-xl transition-all active:scale-95 flex items-center justify-center"
                                                title="Hubungi Penjual"
                                            >
                                                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => {
                                                onNavigate('products', 'semua', '', merchant.id);
                                            }}
                                            className="bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black text-[9px] sm:text-[10px] px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                                        >
                                            Kunjungi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );

                        return (
                            <>
                                {/* True 2-Column Masonry Layout for Mobile (< sm) */}
                                <div className="flex sm:hidden gap-1.5 items-start">
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        {filteredMerchants.filter((_, idx) => idx % 2 === 0).map(m => renderMerchantCard(m, false))}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        {filteredMerchants.filter((_, idx) => idx % 2 === 1).map(m => renderMerchantCard(m, true))}
                                    </div>
                                </div>

                                {/* Standard Grid Layout for Tablet/Desktop (>= sm) */}
                                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                    {filteredMerchants.map(m => renderMerchantCard(m, false))}
                                </div>
                            </>
                        );
                    })()
                ) : (
                    <div className="bg-[#0F3040] rounded-2xl border border-[#174256] p-16 text-center shadow-sm max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-[#071922] rounded-full flex items-center justify-center mx-auto text-[#FFBF00]">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="font-extrabold text-white text-base">Toko Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                            Maaf, kami tidak dapat menemukan merchant dengan kata kunci pencarian Anda saat ini.
                        </p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="bg-[#FFBF00] hover:bg-[#ffcd33] text-[#0F3040] font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
                        >
                            Reset Pencarian
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
