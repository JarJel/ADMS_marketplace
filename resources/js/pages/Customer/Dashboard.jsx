import React, { useState, useEffect, useRef } from 'react';
import { 
    LayoutDashboard, ShoppingBag, ShoppingCart, Download, Megaphone, Heart, Settings, 
    LogOut, CreditCard, Star, FileText, Upload, User, ShieldCheck, Check, Trash2, MapPin, Tag, Store,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ProductDetailModal from '../../components/ProductDetailModal';

export default function CustomerDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode, initialTab = 'overview', refreshSession, onAddToCart, onToggleWishlist, cartCount, wishlistCount, notifications }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const recommendedRef = useRef(null);

    const scrollRecommended = (direction) => {
        if (recommendedRef.current) {
            const { scrollLeft, clientWidth } = recommendedRef.current;
            const scrollAmount = clientWidth * 0.75;
            recommendedRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null);
    const avatarInputRef = useRef(null);

    const [purchases, setPurchases] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [advertisements, setAdvertisements] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [editingAd, setEditingAd] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editSaving, setEditSaving] = useState(false);
    const [editMsg, setEditMsg] = useState(null);

    const toggleWishlist = async (prod) => {
        if (!prod) return;
        const prodId = prod.id;
        const exists = wishlist.some(item => item.id === prodId || item.product_id === prodId);
        
        let newWishlist = [];
        if (exists) {
            newWishlist = wishlist.filter(item => item.id !== prodId && item.product_id !== prodId);
        } else {
            newWishlist = [...wishlist, prod];
        }
        setWishlist(newWishlist);

        if (onToggleWishlist) {
            onToggleWishlist(prodId);
        }
    };

    const [recommendedProducts, setRecommendedProducts] = useState([]);

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

                // Fetch recommended products from database
                const recRes = await fetch('/api/public/products/recommended');
                const recData = await recRes.json();
                if (recData.success && recData.data && recData.data.length > 0) {
                    setRecommendedProducts(recData.data);
                }
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    // Profile Settings States
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profilePhone, setProfilePhone] = useState(user?.phone || '');
    const [profileEmail, setProfileEmail] = useState(user?.email || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSaveError('');

        if (newPassword && newPassword !== confirmPassword) {
            setSaveError('Konfirmasi kata sandi tidak cocok.');
            return;
        }

        setIsSaving(true);
        try {
            const body = { name: profileName, phone: profilePhone };
            if (newPassword) {
                body.password = newPassword;
                body.password_confirmation = confirmPassword;
                if (oldPassword) body.current_password = oldPassword;
            }

            const res = await fetch('/api/customer/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setSaveSuccess(true);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                if (refreshSession) refreshSession();
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                setSaveError(data.message || 'Gagal menyimpan profil.');
            }
        } catch (err) {
            setSaveError('Terjadi kesalahan jaringan.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch('/api/customer/profile/avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAvatarUrl(data.data.avatar_url);
                if (refreshSession) refreshSession();
            } else {
                alert(data.message || 'Gagal mengunggah foto.');
            }
        } catch (err) {
            alert('Terjadi kesalahan saat mengunggah foto.');
        }
    };

    const handleRemoveFromWishlist = async (id) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
        try {
            await fetch('/api/customer/wishlist/toggle', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ product_id: id }),
            });
        } catch { /* state sudah diupdate optimistik */ }
    };

    const handleOpenEditAd = (ad) => {
        setEditingAd(ad);
        setEditForm({
            title: ad.title || '',
            description: ad.description || '',
            price: ad.price || '',
            location: ad.location || '',
            whatsapp: ad.whatsapp || '',
            contact_name: ad.contact_name || '',
            condition: ad.condition || 'bekas',
        });
        setEditMsg(null);
    };

    const handleSaveEditAd = async (e) => {
        e.preventDefault();
        setEditSaving(true);
        setEditMsg(null);
        try {
            const res = await fetch(`/api/customer/ads/${editingAd.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (data.success) {
                setAdvertisements(prev => prev.map(a => a.id === editingAd.id ? data.data : a));
                setEditingAd(null);
            } else {
                setEditMsg(data.message || 'Gagal memperbarui iklan.');
            }
        } catch {
            setEditMsg('Terjadi kesalahan. Coba lagi.');
        } finally {
            setEditSaving(false);
        }
    };

    const handleUpgradeAd = async (adId) => {
        try {
            const res = await fetch(`/api/customer/ads/${adId}/upgrade`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAdvertisements(prev => prev.map(ad => ad.id === adId ? { ...ad, ...data.data } : ad));
            } else {
                alert(data.message || 'Gagal upgrade iklan.');
            }
        } catch {
            alert('Terjadi kesalahan jaringan.');
        }
    };

    // Date formatting helper
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    // Merchant registration states
    const [regStoreName, setRegStoreName] = useState('');
    const [regStoreSlug, setRegStoreSlug] = useState('');
    const [regDescription, setRegDescription] = useState('');
    const [regLocation, setRegLocation] = useState('');
    const [regWhatsapp, setRegWhatsapp] = useState(user?.phone || '');
    const [regSyariahCertified, setRegSyariahCertified] = useState(false);
    const [regSyariahCertNumber, setRegSyariahCertNumber] = useState('');
    const [regSyariahCertBody, setRegSyariahCertBody] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [regSuccess, setRegSuccess] = useState(false);
    const [regErrors, setRegErrors] = useState({});

    const handleStoreNameChange = (val) => {
        setRegStoreName(val);
        setRegStoreSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    };

    const handleMerchantRegister = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        setRegErrors({});

        try {
            const res = await fetch('/api/customer/merchant/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: regStoreName,
                    slug: regStoreSlug,
                    description: regDescription,
                    location: regLocation,
                    contact_whatsapp: regWhatsapp,
                    syariah_certified: regSyariahCertified,
                    syariah_cert_number: regSyariahCertified ? regSyariahCertNumber : null,
                    syariah_cert_body: regSyariahCertified ? regSyariahCertBody : null
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setRegSuccess(true);
                if (refreshSession) refreshSession();
            } else {
                alert(data.message || 'Pendaftaran merchant gagal.');
                if (data.errors) setRegErrors(data.errors);
            }
        } catch (err) {
            alert("Terjadi kesalahan jaringan.");
        } finally {
            setRegLoading(false);
        }
    };

    const menuItems = [
        { id: 'overview', name: 'Ringkasan', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'purchases', name: 'Transaksi Saya', icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'downloads', name: 'Unduhan File', icon: <Download className="w-4 h-4" /> },
        { id: 'ads', name: 'Iklan Saya', icon: <Megaphone className="w-4 h-4" /> },
        { id: 'wishlist', name: 'Favorit / Wishlist', icon: <Heart className="w-4 h-4" /> },
        { id: 'settings', name: 'Pengaturan Akun', icon: <Settings className="w-4 h-4" /> }
    ];

    if (user && user.role === 'customer') {
        menuItems.push({ id: 'merchant_registration', name: 'Daftar Mitra Merchant', icon: <Store className="w-4 h-4" /> });
    }

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
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                notifications={notifications}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="w-full">
                        
                        {/* 1. Tab Overview */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-950/50 p-8 sm:p-10 shadow-xl text-left">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-10 w-36 h-36 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
                                    <div className="relative z-10 space-y-2">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-3.5 py-1.5 rounded-full border border-indigo-400/20">
                                            Dashboard Pelanggan
                                        </span>
                                        <h1 className="text-xl sm:text-3xl font-black text-white leading-tight mt-2">
                                            Halo, <span className="text-transparent bg-gradient-to-r from-indigo-400 to-teal-300 bg-clip-text font-black">{profileName}</span>! Selamat datang kembali.
                                        </h1>
                                        <p className="text-xs text-slate-300 font-semibold">{today}</p>
                                    </div>
                                </div>

                                {/* Mini stats widgets grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-center">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveTab('purchases');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-6 shadow-sm shadow-slate-200/60 dark:shadow-none hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/40 transition-all duration-300 flex items-center gap-5 text-left cursor-pointer active:scale-95 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                        <div className="pointer-events-none">
                                            <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Transaksi</span>
                                            <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{purchases.length} <span className="text-sm font-normal text-slate-400">Pembelian</span></span>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveTab('ads');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-6 shadow-sm shadow-slate-200/60 dark:shadow-none hover:shadow-lg hover:shadow-teal-500/10 hover:border-teal-500/40 transition-all duration-300 flex items-center gap-5 text-left cursor-pointer active:scale-95 w-full focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                    >
                                        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                                            <Tag className="w-6 h-6" />
                                        </div>
                                        <div className="pointer-events-none">
                                            <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Iklan Aktif</span>
                                            <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{advertisements.filter(ad => ad.status === 'active' || ad.status === 'Published' || ad.status === 'approved').length} <span className="text-sm font-normal text-slate-400">Unit</span></span>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveTab('wishlist');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-6 shadow-sm shadow-slate-200/60 dark:shadow-none hover:shadow-lg hover:shadow-rose-500/10 hover:border-rose-500/40 transition-all duration-300 flex items-center gap-5 text-left cursor-pointer active:scale-95 w-full focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                                    >
                                        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <div className="pointer-events-none">
                                            <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Disimpan</span>
                                            <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{wishlist.length} <span className="text-sm font-normal text-slate-400">Favorit</span></span>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveTab('purchases');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-6 shadow-sm shadow-slate-200/60 dark:shadow-none hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-500/40 transition-all duration-300 flex items-center gap-5 text-left cursor-pointer active:scale-95 w-full focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    >
                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div className="pointer-events-none">
                                            <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Pengeluaran</span>
                                            <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(purchases.filter(p => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'paid').reduce((sum, p) => sum + parseFloat(p.total_amount || p.total || 0), 0))}</span>
                                        </div>
                                    </button>
                                </div>

                                {/* 1. Recent Transactions Table (Transaksinya di atas) */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-300 dark:border-slate-800 shadow-md shadow-slate-200/70 dark:shadow-none overflow-hidden text-left mb-10">
                                    <div className="p-6 sm:p-7 border-b-2 border-slate-300 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
                                        <div>
                                            <h3 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100">Transaksi Terbaru</h3>
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Riwayat 3 transaksi terakhir pembelian produk digital Anda.</p>
                                        </div>
                                        <button 
                                            onClick={() => setActiveTab('purchases')}
                                            className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/50 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                                        >
                                            Lihat Semua
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        {purchases && purchases.length > 0 ? (
                                            <table className="w-full text-sm border-collapse">
                                                <thead className="bg-slate-200/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase border-b-2 border-slate-300 dark:border-slate-700">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-slate-700/60 last:border-r-0">ID Transaksi</th>
                                                        <th className="px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-slate-700/60 last:border-r-0">Merchant</th>
                                                        <th className="px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-slate-700/60 last:border-r-0">Tanggal</th>
                                                        <th className="px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-slate-700/60 last:border-r-0">Total</th>
                                                        <th className="px-6 py-4 text-left tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium text-sm">
                                                    {purchases.slice(0, 3).map((p) => (
                                                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                                            <td className="px-6 py-4.5 font-medium font-mono text-slate-900 dark:text-slate-100 text-sm border-r border-slate-200/70 dark:border-slate-800/50 last:border-r-0">
                                                                {p.order_number || (p.id ? (p.id.length > 12 ? `${p.id.substring(0, 8)}...` : p.id) : '-')}
                                                            </td>
                                                            <td className="px-6 py-4.5 font-medium text-slate-900 dark:text-slate-100 text-sm border-r border-slate-200/70 dark:border-slate-800/50 last:border-r-0">{p.merchant?.name || 'Merchant'}</td>
                                                            <td className="px-6 py-4.5 text-slate-600 dark:text-slate-400 text-sm border-r border-slate-200/70 dark:border-slate-800/50 last:border-r-0">{new Date(p.created_at || new Date()).toLocaleDateString('id-ID')}</td>
                                                            <td className="px-6 py-4.5 font-bold text-teal-600 dark:text-teal-400 text-sm sm:text-base border-r border-slate-200/70 dark:border-slate-800/50 last:border-r-0">{formatCurrency(p.total_amount || p.total || 0)}</td>
                                                            <td className="px-6 py-4.5">
                                                                <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                                    (p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'verified') 
                                                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                                                                        : (p.status?.toLowerCase() === 'failed' || p.status?.toLowerCase() === 'cancelled')
                                                                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                                                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                                                }`}>
                                                                    {p.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="py-12 text-center text-slate-400 text-sm font-medium bg-slate-50/50 dark:bg-slate-900/20">
                                                Belum ada riwayat transaksi
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Recommended Products Horizontal Carousel (Bergeser dari Kanan ke Kiri / Kiri ke Kanan) */}
                                <div className="mb-10 text-left">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100">Rekomendasi Spesial Untuk Anda</h3>
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Geser untuk melihat opsi produk digital unggulan.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => scrollRecommended('left')}
                                                className="p-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer"
                                                title="Geser Kiri"
                                            >
                                                <ChevronLeft className="w-4.5 h-4.5" />
                                            </button>
                                            <button 
                                                onClick={() => scrollRecommended('right')}
                                                className="p-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer"
                                                title="Geser Kanan"
                                            >
                                                <ChevronRight className="w-4.5 h-4.5" />
                                            </button>
                                            <button 
                                                onClick={() => onNavigate('classifieds')}
                                                className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors ml-2 cursor-pointer"
                                            >
                                                Lihat Semua &rarr;
                                            </button>
                                        </div>
                                    </div>

                                    <div 
                                        ref={recommendedRef}
                                        className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth no-scrollbar"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {recommendedProducts.map((prod) => (
                                            <div 
                                                key={prod.id}
                                                onClick={() => {
                                                    setSelectedProduct(prod);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                className="min-w-[280px] sm:min-w-[300px] max-w-[320px] flex-shrink-0 snap-start rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between group transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30 relative cursor-pointer"
                                            >
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist(prod);
                                                    }}
                                                    className={`absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-sm transition-all cursor-pointer ${
                                                        wishlist.some(item => item.id === prod.id || item.product_id === prod.id)
                                                            ? 'text-rose-500 fill-rose-500 scale-110'
                                                            : 'text-slate-400 dark:text-slate-500 hover:text-rose-500'
                                                    }`}
                                                    title={wishlist.some(item => item.id === prod.id || item.product_id === prod.id) ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
                                                >
                                                    <Heart className={`w-4 h-4 ${wishlist.some(item => item.id === prod.id || item.product_id === prod.id) ? 'fill-current text-rose-500' : ''}`} />
                                                </button>
                                                <div>
                                                    <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                                                        <img 
                                                            src={prod.image} 
                                                            alt={prod.title} 
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <span className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-xs font-semibold text-teal-600 dark:text-teal-400 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                            {prod.category}
                                                        </span>
                                                    </div>
                                                    <div className="p-4.5 flex flex-col gap-2">
                                                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 min-h-[44px] group-hover:text-indigo-500 transition-colors">{prod.title}</h4>
                                                        
                                                        <div className="flex items-center gap-1.5 text-xs text-amber-500">
                                                            <Star className="w-3.5 h-3.5 fill-current" />
                                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{prod.rating}</span>
                                                            <span className="text-xs text-slate-400 dark:text-slate-500">({prod.reviewsCount})</span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                            <span>Toko:</span>
                                                            <strong className="text-slate-700 dark:text-slate-300 font-semibold">{prod.merchant}</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4.5 pt-2.5 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/50 mt-2">
                                                    <span className="font-bold text-sm sm:text-base text-teal-600 dark:text-teal-400">{formatCurrency(prod.price)}</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProduct(prod);
                                                            setIsDetailModalOpen(true);
                                                        }}
                                                        className="bg-gradient-to-r from-[#10B981] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs py-2 px-3.5 sm:px-4 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                                                        title="Buka Detail & Tambah ke Keranjang"
                                                    >
                                                        <ShoppingCart className="w-3.5 h-3.5" />
                                                        <span>Keranjang</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Tab Purchases (Transaksi Saya) */}
                        {activeTab === 'purchases' && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-300 dark:border-slate-800 shadow-md shadow-slate-200/70 dark:shadow-none overflow-hidden text-left">
                                <div className="p-6 sm:p-7 border-b-2 border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                                    <h3 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100">Daftar Transaksi Saya</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Riwayat lengkap pembelian produk digital Anda.</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-slate-200/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase border-b-2 border-slate-300 dark:border-slate-700">
                                            <tr>
                                                <th className="px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-slate-700/60 last:border-r-0">ID Transaksi</th>
                                                <th className="px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-slate-700/60 last:border-r-0">Merchant</th>
                                                <th className="px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-slate-700/60 last:border-r-0">Tanggal</th>
                                                <th className="px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-slate-700/60 last:border-r-0">Total</th>
                                                <th className="px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-slate-700/60 last:border-r-0">Status</th>
                                                <th className="px-6 py-4 text-center tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium text-sm">
                                            {purchases.map((p) => (
                                                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="px-6 py-4.5 font-medium font-mono text-slate-900 dark:text-slate-100 text-sm border-r border-slate-200/70 dark:border-slate-800/50 last:border-r-0">
                                                        {p.order_number || (p.id ? (p.id.length > 12 ? `${p.id.substring(0, 8)}...` : p.id) : '-')}
                                                    </td>
                                                    <td className="px-6 py-4.5 font-medium text-slate-900 dark:text-slate-100 text-sm border-r border-slate-200/70 dark:border-slate-800/50 last:border-r-0">{p.merchant?.name || 'Merchant'}</td>
                                                    <td className="px-6 py-4.5 text-slate-600 dark:text-slate-400 text-sm border-r border-slate-200/70 dark:border-slate-800/50 last:border-r-0">{new Date(p.created_at || new Date()).toLocaleDateString('id-ID')}</td>
                                                    <td className="px-6 py-4.5 font-bold text-teal-600 dark:text-teal-400 text-sm sm:text-base border-r border-slate-200/70 dark:border-slate-800/50 last:border-r-0">{formatCurrency(p.total_amount || p.total || 0)}</td>
                                                    <td className="px-6 py-4.5 border-r border-slate-200/70 dark:border-slate-800/50 last:border-r-0">
                                                        <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                            (p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'verified') 
                                                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                                                                : (p.status?.toLowerCase() === 'failed' || p.status?.toLowerCase() === 'cancelled')
                                                                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4.5 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm border border-slate-300 dark:border-slate-700">
                                                                <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                                Invoice
                                                            </button>
                                                            {(p.status === 'completed' || p.status === 'PAID') && (
                                                                <button className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm border border-indigo-300 dark:border-indigo-800">
                                                                    <Star className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-current" />
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

                                {editingAd && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg">
                                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Edit Iklan</h3>
                                                <button onClick={() => setEditingAd(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold leading-none">&times;</button>
                                            </div>
                                            <form onSubmit={handleSaveEditAd} className="p-6 space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Judul Iklan</label>
                                                    <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} required className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Harga (Rp)</label>
                                                        <input type="number" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Kondisi</label>
                                                        <select value={editForm.condition} onChange={e => setEditForm(p => ({ ...p, condition: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                                                            <option value="baru">Baru</option>
                                                            <option value="bekas">Bekas</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Lokasi</label>
                                                    <input type="text" value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} required className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nama Kontak</label>
                                                        <input type="text" value={editForm.contact_name} onChange={e => setEditForm(p => ({ ...p, contact_name: e.target.value }))} required className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">WhatsApp</label>
                                                        <input type="text" value={editForm.whatsapp} onChange={e => setEditForm(p => ({ ...p, whatsapp: e.target.value }))} required className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Deskripsi</label>
                                                    <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} required className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                                                </div>
                                                {editMsg && <p className="text-red-500 text-xs font-semibold">{editMsg}</p>}
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button type="button" onClick={() => setEditingAd(null)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors">Batal</button>
                                                    <button type="submit" disabled={editSaving} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors">{editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

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
                                                <button onClick={() => handleOpenEditAd(ad)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                                                    Edit Iklan
                                                </button>
                                                {(ad.package?.name !== 'VIP Premium' && ad.package !== 'VIP Premium') && (
                                                    <button onClick={() => handleUpgradeAd(ad.id)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-extrabold rounded-xl transition-colors shadow-sm cursor-pointer">
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
                                {saveError && (
                                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold">
                                        {saveError}
                                    </div>
                                )}

                                {/* Profile Photo Upload UI */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover border border-slate-100 dark:border-slate-800 shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                            <User className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="space-y-1 text-center sm:text-left">
                                        <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
                                        <button type="button" onClick={() => avatarInputRef.current?.click()} className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                                            <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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
                                        disabled={isSaving}
                                        className="bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-extrabold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                                    >
                                        {isSaving ? (
                                            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span>Menyimpan...</span></>
                                        ) : (
                                            <><Check className="w-4 h-4" /><span>Simpan Perubahan</span></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* 7. Tab Merchant Registration */}
                        {activeTab === 'merchant_registration' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 text-left">
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Pendaftaran Mitra Merchant</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Gabung menjadi Merchant resmi ADMS untuk menjual produk digital dan jasa Anda sesuai syariat.</p>
                                </div>

                                {user?.merchant ? (
                                    <div className="p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center mx-auto text-amber-500">
                                            <Store className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Status Pendaftaran: Menunggu Verifikasi</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                                Toko Anda <strong>"{user.merchant.name}"</strong> sedang ditinjau oleh Tim Admin ADMS. Proses moderasi ini memakan waktu maksimal 24 jam untuk memverifikasi kepatuhan syariah dan dokumen Anda.
                                            </p>
                                        </div>
                                        <div className="inline-block bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-4 py-2 rounded-full border border-amber-500/20 uppercase tracking-wider">
                                            Sedang Ditinjau Admin
                                        </div>
                                    </div>
                                ) : regSuccess ? (
                                    <div className="p-8 text-center space-y-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                            <Check className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-extrabold text-lg">Pendaftaran Berhasil Diajukan!</h4>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-500 max-w-md mx-auto leading-relaxed">
                                                Terima kasih atas pengajuan Anda. Tim Admin ADMS akan segera meninjau profil toko Anda. Notifikasi akan dikirimkan ke akun Anda segera setelah toko disetujui.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleMerchantRegister} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Nama Toko / Merchant <span className="text-rose-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    placeholder="Nama Toko Anda"
                                                    value={regStoreName}
                                                    onChange={(e) => handleStoreNameChange(e.target.value)}
                                                    className="w-full text-xs p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 outline-none"
                                                />
                                                {regErrors.name && <span className="text-[10px] text-rose-500 font-bold">{regErrors.name[0]}</span>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Slug Link Toko <span className="text-rose-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    placeholder="nama-toko-anda"
                                                    value={regStoreSlug}
                                                    onChange={(e) => setRegStoreSlug(e.target.value)}
                                                    className="w-full text-xs p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 outline-none font-mono"
                                                />
                                                {regErrors.slug && <span className="text-[10px] text-rose-500 font-bold">{regErrors.slug[0]}</span>}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Deskripsi Bisnis / Toko <span className="text-rose-500">*</span></label>
                                            <textarea 
                                                rows={4}
                                                required
                                                placeholder="Jelaskan produk atau jasa halal yang Anda tawarkan..."
                                                value={regDescription}
                                                onChange={(e) => setRegDescription(e.target.value)}
                                                className="w-full text-xs p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 outline-none resize-none"
                                            />
                                            {regErrors.description && <span className="text-[10px] text-rose-500 font-bold">{regErrors.description[0]}</span>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Lokasi / Kota Asal <span className="text-rose-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    placeholder="Sleman, Yogyakarta"
                                                    value={regLocation}
                                                    onChange={(e) => setRegLocation(e.target.value)}
                                                    className="w-full text-xs p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 outline-none"
                                                />
                                                {regErrors.location && <span className="text-[10px] text-rose-500 font-bold">{regErrors.location[0]}</span>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Nomor WhatsApp Toko <span className="text-rose-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    placeholder="0812345678"
                                                    value={regWhatsapp}
                                                    onChange={(e) => setRegWhatsapp(e.target.value)}
                                                    className="w-full text-xs p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 outline-none"
                                                />
                                                {regErrors.contact_whatsapp && <span className="text-[10px] text-rose-500 font-bold">{regErrors.contact_whatsapp[0]}</span>}
                                            </div>
                                        </div>

                                        {/* Sertifikasi Syariah Checkbox */}
                                        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                                            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={regSyariahCertified}
                                                    onChange={(e) => setRegSyariahCertified(e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                                />
                                                <span>Toko Kami Memiliki Sertifikasi Syariah / Halal (Opsional)</span>
                                            </label>

                                            {regSyariahCertified && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Nomor Sertifikat Halal / Syariah</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="ID3411000123456"
                                                            value={regSyariahCertNumber}
                                                            onChange={(e) => setRegSyariahCertNumber(e.target.value)}
                                                            className="w-full text-xs p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 outline-none"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Lembaga Penerbit Sertifikat</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="BPJPH Kemenag / MUI"
                                                            value={regSyariahCertBody}
                                                            onChange={(e) => setRegSyariahCertBody(e.target.value)}
                                                            className="w-full text-xs p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={regLoading}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {regLoading ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                    <span>Memproses Pendaftaran...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Store className="w-4 h-4" />
                                                    <span>Ajukan Pendaftaran Merchant</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                </div>
            </main>

            {/* Product Detail Modal Popup */}
            <ProductDetailModal 
                product={selectedProduct}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                darkMode={darkMode}
                onAddToCart={onAddToCart}
            />
        </div>
    );
}
