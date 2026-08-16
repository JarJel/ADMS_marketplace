import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, Store, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function MerchantDirectoryView({ user, token, onNavigate, darkMode, setDarkMode, onLogout }) {
    const [merchants, setMerchants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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
            setLoading(false);
        }
    };

    const filteredMerchants = merchants.filter(merchant => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return merchant.name?.toLowerCase().includes(q) || 
               merchant.description?.toLowerCase().includes(q) || 
               merchant.location?.toLowerCase().includes(q);
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar 
                user={user} 
                onLogout={onLogout} 
                onNavigate={onNavigate} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                currentView="merchants"
            />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Header & Search */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-4">Direktori Toko & Penjual</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto mb-8">
                        Temukan berbagai produk digital dan jasa dari penjual terpercaya kami yang telah diverifikasi.
                    </p>

                    <div className="max-w-xl mx-auto relative shadow-sm rounded-xl overflow-hidden">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama toko, deskripsi, atau lokasi..."
                            className="block w-full pl-11 pr-4 py-3 border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 text-slate-800"
                        />
                    </div>
                </div>

                {/* Directory Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                                    <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredMerchants.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMerchants.map((merchant) => (
                            <div key={merchant.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-lg truncate flex items-center gap-1.5">
                                            {merchant.name}
                                            {merchant.is_verified && (
                                                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" title="Toko Terverifikasi" />
                                            )}
                                        </h3>
                                        {merchant.syariah_certified ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 mt-1">
                                                Certified Halal
                                            </span>
                                        ) : (
                                            <span className="block text-xs text-slate-500 mt-0.5">Penjual Terdaftar</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 mb-4">
                                    <p className="text-sm text-slate-600 line-clamp-3">
                                        {merchant.description || 'Belum ada deskripsi untuk toko ini.'}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[120px]">{merchant.location || 'Lokasi tidak diketahui'}</span>
                                    </div>
                                    <button 
                                        className="text-indigo-600 font-semibold text-xs hover:text-indigo-800 transition-colors"
                                    >
                                        Kunjungi Toko &rarr;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">Toko Tidak Ditemukan</h4>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Maaf, tidak ada merchant yang cocok dengan pencarian Anda.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
