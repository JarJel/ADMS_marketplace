import React, { useState } from 'react';
import { 
    LayoutDashboard, ShoppingBag, Download, Megaphone, Heart, Settings, 
    LogOut, CreditCard, Star, FileText, Upload, User, ShieldCheck, Check, Trash2, MapPin
} from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function CustomerDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Mock Data representing state
    const [purchases, setPurchases] = useState([
        { id: 'ORD-98721', merchant: 'MuslimTech Indo', date: '2026-08-15', total: 125000, status: 'PAID' },
        { id: 'ORD-98443', merchant: 'ADMS Agency', date: '2026-08-12', total: 75000, status: 'PAID' },
        { id: 'ORD-97811', merchant: 'Hijrah Property', date: '2026-08-10', total: 48000, status: 'PAID' },
        { id: 'ORD-96102', merchant: 'Solo Qur\'an Center', date: '2026-08-05', total: 50000, status: 'PENDING' },
        { id: 'ORD-95304', merchant: 'Al-Barakah Bookstore', date: '2026-07-28', total: 110000, status: 'CANCELLED' }
    ]);

    const [downloads, setDownloads] = useState([
        { id: 1, title: 'Source Code Kasir Laravel', merchant: 'MuslimTech Indo', size: 'ZIP File - 45.2 MB', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=200&auto=format&fit=crop' },
        { id: 2, title: 'Template Landing Page Tailwind', merchant: 'ADMS Agency', size: 'ZIP File - 12.8 MB', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=200&auto=format&fit=crop' },
        { id: 3, title: 'E-Book Panduan Muamalah Syariah', merchant: 'Hijrah Property', size: 'PDF - 4.5 MB', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=200&auto=format&fit=crop' }
    ]);

    const [advertisements, setAdvertisements] = useState([
        { id: 1, title: 'Jasa Desain Website Syariah Bergaransi', category: 'Jasa', package: 'VIP Premium', views: 254, clicks: 42, status: 'Published' },
        { id: 2, title: 'Tanah Kavling Murah Dekat Masjid Solo', category: 'Properti', package: 'Gratis', views: 12, clicks: 2, status: 'Pending Review' }
    ]);

    const [wishlist, setWishlist] = useState([
        { id: 1, title: 'Sistem POS Kasir Premium', price: 350000, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=200&auto=format&fit=crop' },
        { id: 2, title: 'Iklan VIP Properti Jabodetabek', price: 150000, image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=200&auto=format&fit=crop' }
    ]);

    // Profile Settings States
    const [profileName, setProfileName] = useState(user?.name || 'Citra Kirana');
    const [profilePhone, setProfilePhone] = useState(user?.phone || '081234567890');
    const [profileEmail, setProfileEmail] = useState(user?.email || 'citra@example.com');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleProfileSave = (e) => {
        e.preventDefault();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleRemoveFromWishlist = (id) => {
        setWishlist(wishlist.filter(item => item.id !== id));
    };

    // Date formatting helper
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    const menuItems = [
        { id: 'overview', name: 'Ringkasan', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'purchases', name: 'Transaksi Saya', icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'downloads', name: 'Unduhan File', icon: <Download className="w-4 h-4" /> },
        { id: 'ads', name: 'Iklan Saya', icon: <Megaphone className="w-4 h-4" /> },
        { id: 'wishlist', name: 'Favorit / Wishlist', icon: <Heart className="w-4 h-4" /> },
        { id: 'settings', name: 'Pengaturan Akun', icon: <Settings className="w-4 h-4" /> }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout} 
                onNavigate={onNavigate}
                currentView="customer_dashboard"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    {/* A. Sidebar Kiri */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
                            <div className="relative w-20 h-20 mx-auto mb-4">
                                <img 
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" 
                                    alt="Profile Avatar" 
                                    className="w-full h-full rounded-full object-cover border border-slate-100 shadow-sm"
                                />
                                <span className="absolute bottom-0 right-0 bg-teal-600 text-white p-1 rounded-full border-2 border-white shadow-sm">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <h3 className="font-extrabold text-sm text-slate-800">{profileName}</h3>
                            <span className="inline-block bg-indigo-50 text-[10px] font-bold text-indigo-700 px-3 py-1 rounded-full mt-1.5 uppercase tracking-wider">
                                Customer
                            </span>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSaveSuccess(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        activeTab === item.id 
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </button>
                            ))}

                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all mt-4 border-t border-slate-100 pt-4 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 text-rose-600" />
                                <span>Keluar Akun</span>
                            </button>
                        </div>
                    </div>

                    {/* B. Area Konten Kanan */}
                    <div className="md:col-span-3">
                        
                        {/* 1. Tab Overview */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-left">
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                                        Halo, {profileName}! Selamat datang kembali.
                                    </h1>
                                    <p className="text-xs text-slate-400 mt-1">{today}</p>
                                </div>

                                {/* Mini stats widgets grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 text-left">
                                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Transaksi</span>
                                            <span className="text-sm font-black text-slate-800">5 Pembelian</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 text-left">
                                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pengeluaran</span>
                                            <span className="text-sm font-black text-slate-800">{formatCurrency(248000)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 text-left">
                                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                            <Download className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Siap Unduh</span>
                                            <span className="text-sm font-black text-slate-800">3 File</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 text-left">
                                        <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                                            <Megaphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Iklan Aktif</span>
                                            <span className="text-sm font-black text-slate-800">1 Iklan</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Transactions Table */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-extrabold text-sm text-slate-800">Transaksi Terbaru</h3>
                                        <button 
                                            onClick={() => setActiveTab('purchases')}
                                            className="text-xs text-indigo-600 font-bold hover:underline"
                                        >
                                            Lihat Semua
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-left">ID Transaksi</th>
                                                    <th className="px-6 py-4 text-left">Merchant</th>
                                                    <th className="px-6 py-4 text-left">Tanggal</th>
                                                    <th className="px-6 py-4 text-left">Total</th>
                                                    <th className="px-6 py-4 text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                                {purchases.slice(0, 3).map((p) => (
                                                    <tr key={p.id}>
                                                        <td className="px-6 py-4 font-bold text-slate-800">{p.id}</td>
                                                        <td className="px-6 py-4">{p.merchant}</td>
                                                        <td className="px-6 py-4">{p.date}</td>
                                                        <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(p.total)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Tab Purchases (Transaksi Saya) */}
                        {activeTab === 'purchases' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="font-extrabold text-sm text-slate-800">Daftar Transaksi Saya</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Riwayat lengkap pembelian produk digital Anda.</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left">ID Transaksi</th>
                                                <th className="px-6 py-4 text-left">Merchant</th>
                                                <th className="px-6 py-4 text-left">Tanggal</th>
                                                <th className="px-6 py-4 text-left">Total</th>
                                                <th className="px-6 py-4 text-left">Status</th>
                                                <th className="px-6 py-4 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                            {purchases.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="px-6 py-4 font-bold text-slate-800">{p.id}</td>
                                                    <td className="px-6 py-4">{p.merchant}</td>
                                                    <td className="px-6 py-4">{p.date}</td>
                                                    <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(p.total)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] ${
                                                            p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                                            p.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1">
                                                                <FileText className="w-3 h-3" />
                                                                Invoice
                                                            </button>
                                                            {p.status === 'PAID' && (
                                                                <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1">
                                                                    <Star className="w-3 h-3 text-indigo-600 fill-current" />
                                                                    Rating
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 3. Tab Downloads (Unduhan File) */}
                        {activeTab === 'downloads' && (
                            <div className="space-y-6 text-left">
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="font-extrabold text-sm text-slate-800">Aset Digital Siap Unduh</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Semua file produk yang telah Anda beli secara amanah.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {downloads.map((d) => (
                                        <div key={d.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                            <div className="aspect-[16/10] w-full bg-slate-100 relative">
                                                <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-extrabold text-xs text-slate-800 leading-snug line-clamp-2">{d.title}</h4>
                                                    <span className="block text-[10px] text-slate-400">Oleh: <span className="font-semibold">{d.merchant}</span></span>
                                                    <span className="inline-block bg-indigo-50 text-[9px] font-bold text-indigo-600 px-2 py-0.5 rounded-md mt-1">{d.size}</span>
                                                </div>

                                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer mt-4 shadow-sm">
                                                    <Download className="w-4 h-4" />
                                                    <span>Unduh File Sekarang</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. Tab Ads (Iklan Saya) */}
                        {activeTab === 'ads' && (
                            <div className="space-y-6 text-left">
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                                    <div>
                                        <h3 className="font-extrabold text-sm text-slate-800">Iklan Baris Saya</h3>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Kelola semua listing iklan gratis dan premium Anda.</p>
                                    </div>
                                    <button 
                                        onClick={() => onNavigate('create_ad')}
                                        className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Megaphone className="w-4 h-4" />
                                        Pasang Iklan Baru
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {advertisements.map((ad) => (
                                        <div key={ad.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                                                        {ad.category}
                                                    </span>
                                                    <span className={`font-bold text-[9px] px-2 py-0.5 rounded uppercase ${
                                                        ad.package === 'VIP Premium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
                                                    }`}>
                                                        {ad.package}
                                                    </span>
                                                </div>
                                                <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{ad.title}</h4>
                                                
                                                <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                                    <span>Views: <strong className="text-slate-600">{ad.views}</strong></span>
                                                    <span>Clicks: <strong className="text-slate-600">{ad.clicks}</strong></span>
                                                    <span className="flex items-center gap-1">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${ad.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        <span className="font-bold">{ad.status}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                                                    Edit Iklan
                                                </button>
                                                {ad.package !== 'VIP Premium' && (
                                                    <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-extrabold rounded-xl transition-colors shadow-sm cursor-pointer">
                                                        Upgrade ke VIP
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. Tab Wishlist */}
                        {activeTab === 'wishlist' && (
                            <div className="space-y-6 text-left">
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="font-extrabold text-sm text-slate-800">Favorit & Wishlist</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Produk dan iklan baris yang Anda simpan untuk dibeli nanti.</p>
                                </div>

                                {wishlist.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                                        <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <h4 className="font-extrabold text-slate-700 text-sm">Wishlist Anda Kosong</h4>
                                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Mulai cari produk halal pilihan dan tambahkan ke favorit Anda.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {wishlist.map((item) => (
                                            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex items-center justify-between p-4 gap-4 relative group">
                                                <div className="flex items-center gap-4">
                                                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                                                    <div className="space-y-1">
                                                        <h4 className="font-extrabold text-xs text-slate-800 leading-snug line-clamp-1">{item.title}</h4>
                                                        <span className="block font-black text-sm text-teal-600">{formatCurrency(item.price)}</span>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => handleRemoveFromWishlist(item.id)}
                                                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm cursor-pointer"
                                                    title="Hapus dari Favorit"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 6. Tab Settings (Pengaturan Akun) */}
                        {activeTab === 'settings' && (
                            <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 text-left">
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-800">Pengaturan Profil</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Perbarui informasi pribadi dan keamanan kata sandi Anda.</p>
                                </div>

                                {saveSuccess && (
                                    <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 text-teal-600" />
                                        Profil Anda berhasil diperbarui dan disimpan!
                                    </div>
                                )}

                                {/* Profile Photo Upload UI */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                                    <img 
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" 
                                        alt="Profile Preview" 
                                        className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm"
                                    />
                                    <div className="space-y-1 text-center sm:text-left">
                                        <button type="button" className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                                            <Upload className="w-4 h-4 text-slate-500" />
                                            Unggah Foto Baru
                                        </button>
                                        <span className="block text-[10px] text-slate-400">JPG, PNG, atau WEBP. Maks 2MB.</span>
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-extrabold text-xs text-slate-800 pb-2 border-b border-slate-100">Detail Personal</h4>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Nomor Telepon</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={profilePhone}
                                                onChange={(e) => setProfilePhone(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Alamat Email</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={profileEmail}
                                                onChange={(e) => setProfileEmail(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-extrabold text-xs text-slate-800 pb-2 border-b border-slate-100">Ganti Kata Sandi</h4>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Kata Sandi Lama</label>
                                            <input 
                                                type="password" 
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Kata Sandi Baru</label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                                placeholder="Minimal 8 karakter"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Konfirmasi Kata Sandi Baru</label>
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                                placeholder="Ulangi sandi baru"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <button 
                                        type="submit"
                                        className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                                    >
                                        <Check className="w-4 h-4" />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
