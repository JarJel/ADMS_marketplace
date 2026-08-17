import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, ShoppingBag, Download, Megaphone, Heart, Settings, 
    LogOut, CreditCard, Star, FileText, Upload, User, ShieldCheck, Check, Trash2, MapPin, Tag
} from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function CustomerDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [purchases, setPurchases] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [advertisements, setAdvertisements] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const recommendedProducts = [
        {
            id: 1,
            title: "Template Bundling Social Media Canva untuk UMKM 2026",
            category: "Template Canva",
            merchant: "Amanah Creative",
            isSyariah: true,
            rating: 4.9,
            reviewsCount: 142,
            price: 49000,
            image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Source Code Aplikasi Kasir Web Laravel 11 & React",
            category: "Source Code",
            merchant: "Afifah Tech",
            isSyariah: true,
            rating: 4.8,
            reviewsCount: 89,
            price: 199000,
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Ebook Panduan Sukses Jualan Produk Digital Dari Nol",
            category: "E-Book",
            merchant: "Deni Book Store",
            isSyariah: false,
            rating: 4.7,
            reviewsCount: 54,
            price: 89000,
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop"
        },
        {
            id: 4,
            title: "Landing Page Event Organizer Elementor Pro",
            category: "Template Web",
            merchant: "Berkah Desain",
            isSyariah: true,
            rating: 5.0,
            reviewsCount: 21,
            price: 129000,
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop"
        }
    ];

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch orders
                const ordersRes = await fetch('/api/customer/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const ordersData = await ordersRes.json();
                if (ordersData.success) {
                    const orders = ordersData.data.data || ordersData.data;
                    setPurchases(orders);
                    
                    // Extract downloads from paid orders
                    let downloadableItems = [];
                    orders.forEach(order => {
                        if (order.status === 'completed' || order.status === 'PAID') {
                            if (order.items) {
                                order.items.forEach(item => {
                                    if (item.product) {
                                        downloadableItems.push({
                                            order_item_id: item.id,
                                            id: item.product.id,
                                            title: item.product.title,
                                            merchant: order.merchant?.name || 'Merchant',
                                            size: 'Aset Digital', // Mocked size or fetch from product details
                                            image: item.product.thumbnail
                                        });
                                    }
                                });
                            }
                        }
                    });
                    setDownloads(downloadableItems);
                }

                // Fetch wishlist
                const wishlistRes = await fetch('/api/customer/wishlist', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const wishlistData = await wishlistRes.json();
                if (wishlistData.success) {
                    setWishlist(wishlistData.data);
                }

                // Fetch ads
                const adsRes = await fetch('/api/customer/ads', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const adsData = await adsRes.json();
                if (adsData.success) {
                    setAdvertisements(adsData.data);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

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

    const renderSidebar = (closeSidebar) => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-sm">
                <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <User className="w-10 h-10" />
                    </div>
                    <span className="absolute bottom-0 right-0 bg-teal-600 dark:bg-teal-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{profileName}</h3>
                <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full mt-1.5 uppercase tracking-wider">
                    Customer
                </span>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.id);
                            setSaveSuccess(false);
                            if (closeSidebar) closeSidebar();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === item.id 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                                : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800 hover:text-slate-800 dark:text-slate-100 dark:hover:text-slate-200'
                        }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </button>
                ))}

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 cursor-pointer"
                >
                    <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Keluar Akun</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans pb-16">
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout} 
                onNavigate={onNavigate}
                currentView="customer_dashboard"
                sidebarContent={renderSidebar}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="w-full">
                        
                        {/* 1. Tab Overview */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-left">
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                                        Halo, {profileName}! Selamat datang kembali.
                                    </h1>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">{today}</p>
                                </div>

                                {/* Mini stats widgets grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-center">
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5 text-left">
                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                            <ShoppingBag className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <span className="block text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Transaksi</span>
                                            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{purchases.length} <span className="text-sm font-medium text-slate-500">Pembelian</span></span>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5 text-left">
                                        <div className="p-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl text-teal-600 dark:text-teal-400">
                                            <Tag className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Iklan Aktif</p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{advertisements.filter(ad => ad.status === 'active' || ad.status === 'Published').length}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5 text-left">
                                        <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                                            <Heart className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Disimpan</p>
                                            <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{wishlist.length}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5 text-left">
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                                            <CreditCard className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <span className="block text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Pengeluaran</span>
                                            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(purchases.filter(p => p.status === 'completed' || p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.total_amount || p.total || 0), 0))}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommended Products */}
                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Rekomendasi Spesial Untuk Anda</h3>
                                        <button 
                                            onClick={() => onNavigate('classifieds')}
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                                        >
                                            Lihat Semua &rarr;
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                                        {recommendedProducts.map((prod) => (
                                            <div 
                                                key={prod.id}
                                                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between group transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30 relative"
                                            >
                                                <button 
                                                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-slate-400 dark:text-slate-500 hover:text-rose-500 shadow-sm transition-colors"
                                                >
                                                    <Heart className="w-4 h-4" />
                                                </button>
                                                <div>
                                                    <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                                                        <img 
                                                            src={prod.image} 
                                                            alt={prod.title} 
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <span className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-[10px] font-bold text-teal-600 dark:text-teal-400 px-2.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 shadow-sm">
                                                            {prod.category}
                                                        </span>
                                                    </div>
                                                    <div className="p-4 flex flex-col gap-2">
                                                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 min-h-[40px] group-hover:text-indigo-500 transition-colors">{prod.title}</h4>
                                                        
                                                        <div className="flex items-center gap-1.5 text-xs text-amber-500">
                                                            <Star className="w-3.5 h-3.5 fill-current" />
                                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{prod.rating}</span>
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">({prod.reviewsCount})</span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                                            <span>Toko:</span>
                                                            <strong className="text-slate-700 dark:text-slate-300 font-bold">{prod.merchant}</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 mt-2">
                                                    <span className="font-black text-sm text-teal-600 dark:text-teal-400">{formatCurrency(prod.price)}</span>
                                                    <button 
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg transition-colors shadow-md shadow-indigo-500/20"
                                                        title="Tambah ke Keranjang"
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Transactions Table */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left">
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <h3 className="font-extrabold text-base text-slate-800 dark:text-white">Transaksi Terbaru</h3>
                                        <button 
                                            onClick={() => setActiveTab('purchases')}
                                            className="text-sm text-indigo-600 font-bold hover:underline"
                                        >
                                            Lihat Semua
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                                                <tr>
                                                    <th className="px-6 py-5 text-left tracking-wider">ID Transaksi</th>
                                                    <th className="px-6 py-5 text-left tracking-wider">Merchant</th>
                                                    <th className="px-6 py-5 text-left tracking-wider">Tanggal</th>
                                                    <th className="px-6 py-5 text-left tracking-wider">Total</th>
                                                    <th className="px-6 py-5 text-left tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                                                {purchases.slice(0, 3).map((p) => (
                                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-5 font-bold text-slate-800 dark:text-slate-100">{p.order_number || p.id}</td>
                                                        <td className="px-6 py-5">{p.merchant?.name || 'Merchant'}</td>
                                                        <td className="px-6 py-5">{new Date(p.created_at || new Date()).toLocaleDateString('id-ID')}</td>
                                                        <td className="px-6 py-5 font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(p.total_amount || p.total || 0)}</td>
                                                        <td className="px-6 py-5">
                                                            <span className="inline-block bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 font-bold px-3 py-1 rounded-md text-xs uppercase tracking-wide">
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
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Daftar Transaksi Saya</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Riwayat lengkap pembelian produk digital Anda.</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 text-left">ID Transaksi</th>
                                                <th className="px-6 py-4 text-left">Merchant</th>
                                                <th className="px-6 py-4 text-left">Tanggal</th>
                                                <th className="px-6 py-4 text-left">Total</th>
                                                <th className="px-6 py-4 text-left">Status</th>
                                                <th className="px-6 py-4 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                                            {purchases.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{p.order_number || p.id}</td>
                                                    <td className="px-6 py-4">{p.merchant?.name || 'Merchant'}</td>
                                                    <td className="px-6 py-4">{new Date(p.created_at || new Date()).toLocaleDateString('id-ID')}</td>
                                                    <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(p.total_amount || p.total || 0)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                                                            (p.status === 'completed' || p.status === 'PAID') ? 'bg-emerald-100 text-emerald-800' :
                                                            (p.status === 'pending' || p.status === 'PENDING') ? 'bg-amber-100 text-amber-800' :
                                                            'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1">
                                                                <FileText className="w-3 h-3" />
                                                                Invoice
                                                            </button>
                                                            {(p.status === 'completed' || p.status === 'PAID') && (
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
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Aset Digital Siap Unduh</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Semua file produk yang telah Anda beli secara amanah.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {downloads.map((d) => (
                                        <div key={d.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                            <div className="aspect-[16/10] w-full bg-slate-100 relative">
                                                <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">{d.title}</h4>
                                                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">Oleh: <span className="font-semibold">{d.merchant}</span></span>
                                                    <span className="inline-block bg-indigo-50 text-[9px] font-bold text-indigo-600 px-2 py-0.5 rounded-md mt-1">{d.size}</span>
                                                </div>

                                                <a href={`/api/customer/orders/items/${d.order_item_id}/download`} target="_blank" rel="noreferrer" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer mt-4 shadow-sm">
                                                    <Download className="w-4 h-4" />
                                                    <span>Unduh File Sekarang</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. Tab Ads (Iklan Saya) */}
                        {activeTab === 'ads' && (
                            <div className="space-y-6 text-left">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
                                    <div>
                                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Iklan Baris Saya</h3>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Kelola semua listing iklan gratis dan premium Anda.</p>
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
                                        <div key={ad.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-slate-100 text-slate-600 dark:text-slate-300 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                                                        {ad.category?.name || ad.category}
                                                    </span>
                                                    <span className={`font-bold text-[9px] px-2 py-0.5 rounded uppercase ${
                                                        (ad.package?.name === 'VIP Premium' || ad.package === 'VIP Premium') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
                                                    }`}>
                                                        {ad.package?.name || ad.package || 'Gratis'}
                                                    </span>
                                                </div>
                                                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-snug">{ad.title}</h4>
                                                
                                                <div className="flex items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500">
                                                    <span>Views: <strong className="text-slate-600 dark:text-slate-300">{ad.views_count || ad.views || 0}</strong></span>
                                                    <span>Clicks: <strong className="text-slate-600 dark:text-slate-300">{ad.clicks_count || ad.clicks || 0}</strong></span>
                                                    <span className="flex items-center gap-1">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${ad.status === 'active' || ad.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        <span className="font-bold uppercase">{ad.status}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                                                    Edit Iklan
                                                </button>
                                                {(ad.package?.name !== 'VIP Premium' && ad.package !== 'VIP Premium') && (
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
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Favorit & Wishlist</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Produk dan iklan baris yang Anda simpan untuk dibeli nanti.</p>
                                </div>

                                {wishlist.length === 0 ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
                                        <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <h4 className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">Wishlist Anda Kosong</h4>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">Mulai cari produk halal pilihan dan tambahkan ke favorit Anda.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {wishlist.map((item) => {
                                            const product = item.product || item;
                                            return (
                                                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex items-center justify-between p-4 gap-4 relative group">
                                                    <div className="flex items-center gap-4">
                                                        <img src={product.thumbnail || product.image || 'https://via.placeholder.com/150'} alt={product.title} className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800" />
                                                        <div className="space-y-1">
                                                            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-snug line-clamp-1">{product.title}</h4>
                                                            <span className="block font-black text-sm text-teal-600">{formatCurrency(product.price)}</span>
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
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 6. Tab Settings (Pengaturan Akun) */}
                        {activeTab === 'settings' && (
                            <form onSubmit={handleProfileSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8 text-left">
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Pengaturan Profil</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Perbarui informasi pribadi dan keamanan kata sandi Anda.</p>
                                </div>

                                {saveSuccess && (
                                    <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 text-teal-600" />
                                        Profil Anda berhasil diperbarui dan disimpan!
                                    </div>
                                )}

                                {/* Profile Photo Upload UI */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                    <img 
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" 
                                        alt="Profile Preview" 
                                        className="w-16 h-16 rounded-full object-cover border border-slate-100 dark:border-slate-800 shadow-sm"
                                    />
                                    <div className="space-y-1 text-center sm:text-left">
                                        <button type="button" className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                                            <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-slate-500" />
                                            Unggah Foto Baru
                                        </button>
                                        <span className="block text-[10px] text-slate-400 dark:text-slate-500">JPG, PNG, atau WEBP. Maks 2MB.</span>
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">Detail Personal</h4>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Nama Lengkap</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Nomor Telepon</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={profilePhone}
                                                onChange={(e) => setProfilePhone(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Alamat Email</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={profileEmail}
                                                onChange={(e) => setProfileEmail(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">Ganti Kata Sandi</h4>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Kata Sandi Lama</label>
                                            <input 
                                                type="password" 
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Kata Sandi Baru</label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                                placeholder="Minimal 8 karakter"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Konfirmasi Kata Sandi Baru</label>
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                                placeholder="Ulangi sandi baru"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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
            </main>
        </div>
    );
}
