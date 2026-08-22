import React, { useState, useEffect, useRef } from 'react';
import { 
    LayoutDashboard, ShoppingBag, ShoppingCart, Download, Megaphone, Heart, Settings, 
    LogOut, CreditCard, Star, FileText, Upload, User, ShieldCheck, Check, Trash2, MapPin, Tag, Store,
    ChevronLeft, ChevronRight, Clock, RefreshCw, Sun, Moon, Search
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ProductDetailModal from '../../components/ProductDetailModal';

export default function CustomerDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode, initialTab = 'overview', refreshSession, onAddToCart, onToggleWishlist, cartCount, wishlistCount, notifications }) {
    const [activeTab, setActiveTab] = useState(initialTab);

    const handleTabChange = (tabId) => {
        if (onNavigate) {
            onNavigate('customer_dashboard', tabId);
        } else {
            setActiveTab(tabId);
            window.history.pushState(null, '', `/customer/${tabId}`);
        }
    };
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
    const [wishlistSearchQuery, setWishlistSearchQuery] = useState('');
    const [packageSubscriptions, setPackageSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let timer;
        if (activeTab === 'ads') {
            timer = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % 3);
            }, 5000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [activeTab]);

    const bannerSlides = [
        {
            image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80",
            title: "Beriklan Lebih Mudah\ndan Cepat!",
            subtitle: "Manfaatkan fitur premium kami untuk menjangkau jutaan calon pembeli setiap harinya. Desain profesional dan SEO friendly.",
            ctaText: "Pasang Iklan Baru",
        },
        {
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
            title: "Tingkatkan Penjualan\nAnda Hari Ini",
            subtitle: "Dapatkan eksposur maksimal dengan layanan iklan VIP kami. Jangkau target audiens Anda dengan lebih tepat.",
            ctaText: "Mulai Beriklan",
        },
        {
            image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=80",
            title: "Platform Terpercaya\nJutaan Pengguna",
            subtitle: "Bergabunglah dengan komunitas seller terbaik. Platform aman, cepat, dan mudah digunakan.",
            ctaText: "Gabung Sekarang",
        }
    ];

    const [editingAd, setEditingAd] = useState(null);
    const [viewingAd, setViewingAd] = useState(null);
    const [selectedAdImage, setSelectedAdImage] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
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

    // Fetch public recommended products immediately without waiting for auth
    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const recRes = await fetch('/api/public/products/recommended');
                const recData = await recRes.json();
                if (recData.success && recData.data && recData.data.length > 0) {
                    setRecommendedProducts(recData.data);
                }
            } catch (err) {}
        };
        fetchRecommended();
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch all endpoints concurrently in parallel
                const [ordersRes, wishlistRes, adsRes, subsRes] = await Promise.allSettled([
                    fetch('/api/customer/orders', { headers }),
                    fetch('/api/customer/wishlist', { headers }),
                    fetch('/api/customer/ads', { headers }),
                    fetch('/api/customer/package-subscriptions', { headers })
                ]);

                if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
                    const ordersData = await ordersRes.value.json();
                    if (ordersData.success) {
                        const orders = ordersData.data.data || ordersData.data;
                        setPurchases(orders);
                        
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
                                                size: 'Aset Digital',
                                                image: item.product.thumbnail
                                            });
                                        }
                                    });
                                }
                            }
                        });
                        setDownloads(downloadableItems);
                    }
                }

                if (wishlistRes.status === 'fulfilled' && wishlistRes.value.ok) {
                    const wishlistData = await wishlistRes.value.json();
                    if (wishlistData.success) setWishlist(wishlistData.data);
                }

                if (adsRes.status === 'fulfilled' && adsRes.value.ok) {
                    const adsData = await adsRes.value.json();
                    if (adsData.success) setAdvertisements(adsData.data);
                }

                if (subsRes.status === 'fulfilled' && subsRes.value.ok) {
                    const subsData = await subsRes.value.json();
                    if (subsData.success) setPackageSubscriptions(subsData.data);
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
        { id: 'package-subscriptions', name: 'Paket & Langganan', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'wishlist', name: 'Favorit / Wishlist', icon: <Heart className="w-4 h-4" /> },
        { id: 'settings', name: 'Pengaturan Akun', icon: <Settings className="w-4 h-4" /> }
    ];

    if (user && user.role === 'user') {
        menuItems.push({ id: 'merchant_registration', name: 'Daftar Mitra Merchant', icon: <Store className="w-4 h-4" /> });
    }

    const renderSidebar = (closeSidebar) => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-6 text-center shadow-sm">
                <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="w-full h-full rounded-full bg-slate-200 dark:bg-navy-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-navy-700 shadow-sm">
                        <User className="w-10 h-10" />
                    </div>
                    <span className="absolute bottom-0 right-0 bg-gold-500 text-navy-950 p-1 rounded-full border-2 border-white dark:border-navy-900 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{profileName}</h3>
                <div className="mt-1.5 flex flex-col items-center gap-1">
                    <span className="inline-block bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Customer
                    </span>
                    {packageSubscriptions.some(sub => sub.status === 'active') && (
                        <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Premium: {packageSubscriptions.find(sub => sub.status === 'active').package?.name || 'Aktif'}
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-3 shadow-sm space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            handleTabChange(item.id);
                            setSaveSuccess(false);
                            if (closeSidebar) closeSidebar();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === item.id 
                                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-extrabold shadow-md shadow-gold-500/20' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-gold-400'
                        }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-all mt-4 border-t border-slate-100 dark:border-navy-800 pt-4 cursor-pointer"
                >
                    {darkMode ? <Sun className="w-4 h-4 text-[#FFBF00]" /> : <Moon className="w-4 h-4 text-slate-500" />}
                    <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
                </button>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all mt-1 cursor-pointer"
                >
                    <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Keluar Akun</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 font-sans pb-16">
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
                                <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-3xl border border-navy-800 p-8 sm:p-10 shadow-xl text-left">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-10 w-36 h-36 bg-gold-400/5 rounded-full blur-2xl pointer-events-none"></div>
                                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest bg-gold-500/15 px-3.5 py-1.5 rounded-full border border-gold-500/20">
                                                Dashboard Pelanggan
                                            </span>
                                            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight mt-2">
                                                Halo, <span className="text-transparent bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 bg-clip-text font-black">{profileName}</span>! Selamat datang kembali.
                                            </h1>
                                            <p className="text-xs text-slate-300 font-semibold">{today}</p>
                                        </div>
                                        <button 
                                            onClick={() => onNavigate('create_ad')}
                                            className="w-full sm:w-auto bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                                        >
                                            <Megaphone className="w-5 h-5" />
                                            Pasang Iklan Baru
                                        </button>
                                    </div>
                                </div>

                                {/* Mini stats widgets grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8 text-left">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleTabChange('purchases');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="group relative overflow-hidden bg-white dark:bg-navy-900 rounded-2xl border border-slate-300 dark:border-navy-800 p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex items-center gap-3 cursor-pointer active:scale-95 w-full focus:outline-none"
                                    >
                                        <div className="p-2.5 sm:p-3 bg-gold-500/10 dark:bg-navy-800 rounded-xl text-gold-500 dark:text-gold-400 border border-gold-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0 pointer-events-none">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 pointer-events-none">
                                            <span className="block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate mb-0.5">Total Transaksi</span>
                                            <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 truncate block">
                                                {purchases.length} <span className="text-xs font-normal text-slate-400">Pembelian</span>
                                            </span>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleTabChange('ads');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="group relative overflow-hidden bg-white dark:bg-navy-900 rounded-2xl border border-slate-300 dark:border-navy-800 p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex items-center gap-3 cursor-pointer active:scale-95 w-full focus:outline-none"
                                    >
                                        <div className="p-2.5 sm:p-3 bg-gold-500/10 dark:bg-navy-800 rounded-xl text-gold-500 dark:text-gold-400 border border-gold-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0 pointer-events-none">
                                            <Tag className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 pointer-events-none">
                                            <span className="block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate mb-0.5">Iklan Aktif</span>
                                            <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 truncate block">
                                                {advertisements.filter(ad => ad.status === 'active' || ad.status === 'Published' || ad.status === 'approved').length} <span className="text-xs font-normal text-slate-400">Unit</span>
                                            </span>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleTabChange('wishlist');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="group relative overflow-hidden bg-white dark:bg-navy-900 rounded-2xl border border-slate-300 dark:border-navy-800 p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-rose-500/40 transition-all duration-300 flex items-center gap-3 cursor-pointer active:scale-95 w-full focus:outline-none"
                                    >
                                        <div className="p-2.5 sm:p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0 pointer-events-none">
                                            <Heart className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 pointer-events-none">
                                            <span className="block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate mb-0.5">Disimpan</span>
                                            <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 truncate block">
                                                {wishlist.length} <span className="text-xs font-normal text-slate-400">Favorit</span>
                                            </span>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleTabChange('purchases');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="group relative overflow-hidden bg-white dark:bg-navy-900 rounded-2xl border border-slate-300 dark:border-navy-800 p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-gold-500/40 transition-all duration-300 flex items-center gap-3 cursor-pointer active:scale-95 w-full focus:outline-none"
                                    >
                                        <div className="p-2.5 sm:p-3 bg-gold-500/10 dark:bg-navy-800 rounded-xl text-gold-500 dark:text-gold-400 border border-gold-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0 pointer-events-none">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 pointer-events-none">
                                            <span className="block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate mb-0.5">Pengeluaran</span>
                                            <span className="text-sm sm:text-base lg:text-lg font-black text-gold-500 dark:text-gold-400 truncate block" title={formatCurrency(purchases.filter(p => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'paid').reduce((sum, p) => sum + parseFloat(p.total_amount || p.total || 0), 0))}>
                                                {formatCurrency(purchases.filter(p => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'paid').reduce((sum, p) => sum + parseFloat(p.total_amount || p.total || 0), 0))}
                                            </span>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleTabChange('package-subscriptions');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="group relative overflow-hidden bg-white dark:bg-navy-900 rounded-2xl border border-slate-300 dark:border-navy-800 p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 flex items-center gap-3 cursor-pointer active:scale-95 w-full focus:outline-none"
                                    >
                                        <div className="p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0 pointer-events-none">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 pointer-events-none">
                                            <span className="block text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate mb-0.5">Paket Langganan</span>
                                            <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 truncate block">
                                                {packageSubscriptions.length} <span className="text-xs font-normal text-slate-400">Paket</span>
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                {/* 1. Recent Transactions Table */}
                                <div className="bg-white dark:bg-navy-900 rounded-3xl border-2 border-slate-300 dark:border-navy-800 shadow-md shadow-slate-200/70 dark:shadow-none overflow-hidden text-left mb-10">
                                    <div className="p-6 sm:p-7 border-b-2 border-slate-300 dark:border-navy-800 flex items-center justify-between bg-slate-50/70 dark:bg-navy-950/50">
                                        <div>
                                            <h3 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100">Transaksi Terbaru</h3>
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Riwayat 3 transaksi terakhir pembelian produk digital Anda.</p>
                                        </div>
                                        <button 
                                            onClick={() => handleTabChange('purchases')}
                                            className="text-xs sm:text-sm text-gold-500 dark:text-gold-400 font-bold px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 dark:bg-navy-800 dark:hover:bg-navy-700 rounded-xl border border-gold-500/20 transition-colors cursor-pointer"
                                        >
                                            Lihat Semua
                                        </button>
                                    </div>
                                    <div>
                                        {purchases && purchases.length > 0 ? (
                                            <>
                                                {/* Mobile View: Stacked Cards */}
                                                <div className="block sm:hidden divide-y divide-slate-200 dark:divide-navy-800">
                                                    {purchases.slice(0, 3).map((p) => (
                                                        <div key={p.id} className="p-4 space-y-2.5 hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                                                                    {p.order_number || (p.id ? (p.id.length > 12 ? `${p.id.substring(0, 8)}...` : p.id) : '-')}
                                                                </span>
                                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                                    (p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'verified') 
                                                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                                                                        : (p.status?.toLowerCase() === 'failed' || p.status?.toLowerCase() === 'cancelled')
                                                                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                                                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                                                }`}>
                                                                    {p.status}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex items-center justify-between text-xs pt-0.5">
                                                                <div className="space-y-0.5">
                                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{p.merchant?.name || 'Merchant'}</p>
                                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{new Date(p.created_at || new Date()).toLocaleDateString('id-ID')}</p>
                                                                </div>
                                                                <div className="text-right font-bold text-sm text-gold-500 dark:text-gold-400">
                                                                    {formatCurrency(p.total_amount || p.total || 0)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Desktop View: Table */}
                                                <div className="hidden sm:block overflow-x-auto w-full">
                                                    <table className="w-full text-sm border-collapse">
                                                        <thead className="bg-slate-200/80 dark:bg-navy-950 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase border-b-2 border-slate-300 dark:border-navy-800">
                                                            <tr>
                                                                <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-navy-800 last:border-r-0 whitespace-nowrap">ID Transaksi</th>
                                                                <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-navy-800 last:border-r-0 whitespace-nowrap">Merchant</th>
                                                                <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-navy-800 last:border-r-0 whitespace-nowrap">Tanggal</th>
                                                                <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-navy-800 last:border-r-0 whitespace-nowrap">Total</th>
                                                                <th className="px-4 sm:px-6 py-4 text-left tracking-wider whitespace-nowrap">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-200 font-medium text-sm">
                                                            {purchases.slice(0, 3).map((p) => (
                                                                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors">
                                                                    <td className="px-4 sm:px-6 py-4.5 font-medium font-mono text-slate-900 dark:text-slate-100 text-sm border-r border-slate-200/70 dark:border-navy-800 last:border-r-0 whitespace-nowrap">
                                                                        {p.order_number || (p.id ? (p.id.length > 12 ? `${p.id.substring(0, 8)}...` : p.id) : '-')}
                                                                    </td>
                                                                    <td className="px-4 sm:px-6 py-4.5 font-medium text-slate-900 dark:text-slate-100 text-sm border-r border-slate-200/70 dark:border-navy-800 last:border-r-0 whitespace-nowrap">{p.merchant?.name || 'Merchant'}</td>
                                                                    <td className="px-4 sm:px-6 py-4.5 text-slate-600 dark:text-slate-400 text-sm border-r border-slate-200/70 dark:border-navy-800 last:border-r-0 whitespace-nowrap">{new Date(p.created_at || new Date()).toLocaleDateString('id-ID')}</td>
                                                                    <td className="px-4 sm:px-6 py-4.5 font-bold text-gold-500 dark:text-gold-400 text-sm sm:text-base border-r border-slate-200/70 dark:border-navy-800 last:border-r-0 whitespace-nowrap">{formatCurrency(p.total_amount || p.total || 0)}</td>
                                                                    <td className="px-4 sm:px-6 py-4.5 whitespace-nowrap">
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
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-12 text-center text-slate-400 text-sm font-medium bg-slate-50/50 dark:bg-navy-950/20">
                                                Belum ada riwayat transaksi
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Recommended Products Horizontal Carousel */}
                                <div className="mb-10 text-left">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100">Rekomendasi Spesial Untuk Anda</h3>
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Geser untuk melihat opsi produk digital unggulan.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => scrollRecommended('left')}
                                                className="p-2 rounded-xl border border-slate-300 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-gold-500/10 dark:hover:bg-navy-800 hover:text-gold-500 transition-colors shadow-sm cursor-pointer"
                                                title="Geser Kiri"
                                            >
                                                <ChevronLeft className="w-4.5 h-4.5" />
                                            </button>
                                            <button 
                                                onClick={() => scrollRecommended('right')}
                                                className="p-2 rounded-xl border border-slate-300 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-gold-500/10 dark:hover:bg-navy-800 hover:text-gold-500 transition-colors shadow-sm cursor-pointer"
                                                title="Geser Kanan"
                                            >
                                                <ChevronRight className="w-4.5 h-4.5" />
                                            </button>
                                            <button 
                                                onClick={() => onNavigate('classifieds')}
                                                className="text-xs sm:text-sm font-bold text-gold-500 hover:text-gold-400 dark:text-gold-400 transition-colors ml-2 cursor-pointer"
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
                                                className="min-w-[280px] sm:min-w-[300px] max-w-[320px] flex-shrink-0 snap-start rounded-2xl border border-slate-300 dark:border-navy-800 bg-white dark:bg-navy-900 overflow-hidden flex flex-col justify-between group transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gold-500/10 hover:border-gold-500/40 relative cursor-pointer"
                                            >
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist(prod);
                                                    }}
                                                    className={`absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-navy-900/90 backdrop-blur-sm rounded-full shadow-sm transition-all cursor-pointer ${
                                                        wishlist.some(item => item.id === prod.id || item.product_id === prod.id)
                                                            ? 'text-rose-500 fill-rose-500 scale-110'
                                                            : 'text-slate-400 dark:text-slate-500 hover:text-rose-500'
                                                    }`}
                                                    title={wishlist.some(item => item.id === prod.id || item.product_id === prod.id) ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
                                                >
                                                    <Heart className={`w-4 h-4 ${wishlist.some(item => item.id === prod.id || item.product_id === prod.id) ? 'fill-current text-rose-500' : ''}`} />
                                                </button>
                                                <div>
                                                    <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-navy-950 relative">
                                                        <img 
                                                            src={prod.image || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop'} 
                                                            alt=""
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop';
                                                            }}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <span className="absolute top-3 left-3 bg-white/95 dark:bg-navy-950/95 backdrop-blur text-xs font-semibold text-gold-600 dark:text-gold-400 px-2.5 py-0.5 rounded-lg border border-gold-200 dark:border-gold-500/30 shadow-sm">
                                                            {prod.category}
                                                        </span>
                                                    </div>
                                                    <div className="p-4.5 flex flex-col gap-2">
                                                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 min-h-[44px] group-hover:text-gold-500 transition-colors">{prod.title}</h4>
                                                        
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

                                                <div className="p-4.5 pt-2.5 flex items-center justify-between border-t border-slate-200 dark:border-navy-800/50 mt-2">
                                                    <span className="font-bold text-sm sm:text-base text-gold-500 dark:text-gold-400">{formatCurrency(prod.price)}</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProduct(prod);
                                                            setIsDetailModalOpen(true);
                                                        }}
                                                        className="bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-extrabold text-xs py-2 px-3.5 sm:px-4 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
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
                            <div className="space-y-4 text-left">
                                <button 
                                    type="button"
                                    onClick={() => handleTabChange('overview')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-200/80 hover:bg-slate-300 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-300 dark:border-navy-700 shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Kembali</span>
                                </button>

                                <div className="bg-white dark:bg-navy-900 rounded-3xl border-2 border-slate-300 dark:border-navy-800 shadow-md shadow-slate-200/70 dark:shadow-none overflow-hidden">
                                    <div className="p-6 sm:p-7 border-b-2 border-slate-300 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/50">
                                        <h3 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100">Daftar Transaksi Saya</h3>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Riwayat lengkap pembelian produk digital Anda.</p>
                                    </div>
                                    <div>
                                        {/* Mobile View: Stacked Cards */}
                                        <div className="block sm:hidden divide-y divide-slate-200 dark:divide-navy-800">
                                            {purchases.map((p) => (
                                                <div key={p.id} className="p-4 space-y-3 hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                                                            {p.order_number || (p.id ? (p.id.length > 12 ? `${p.id.substring(0, 8)}...` : p.id) : '-')}
                                                        </span>
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                            (p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'verified') 
                                                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                                                                : (p.status?.toLowerCase() === 'failed' || p.status?.toLowerCase() === 'cancelled')
                                                                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-xs pt-0.5">
                                                        <div className="space-y-0.5">
                                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{p.merchant?.name || 'Merchant'}</p>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{new Date(p.created_at || new Date()).toLocaleDateString('id-ID')}</p>
                                                        </div>
                                                        <div className="text-right font-bold text-sm text-gold-500 dark:text-gold-400">
                                                            {formatCurrency(p.total_amount || p.total || 0)}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-navy-800/60">
                                                        <button className="flex-1 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm border border-slate-300 dark:border-navy-700">
                                                            <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                            Invoice
                                                        </button>
                                                        {(p.status === 'completed' || p.status === 'PAID') && (
                                                            <button className="flex-1 py-1.5 bg-gold-500/10 dark:bg-navy-800 hover:bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm border border-gold-500/30">
                                                                <Star className="w-3.5 h-3.5 text-gold-500 dark:text-gold-400 fill-current" />
                                                                Rating
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop View: Table */}
                                        <div className="hidden sm:block overflow-x-auto w-full">
                                            <table className="w-full text-sm border-collapse">
                                                <thead className="bg-slate-200/80 dark:bg-navy-950 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase border-b-2 border-slate-300 dark:border-navy-800">
                                                    <tr>
                                                        <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-navy-800 last:border-r-0 whitespace-nowrap">ID Transaksi</th>
                                                        <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-navy-800 last:border-r-0 whitespace-nowrap">Merchant</th>
                                                        <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-navy-800 last:border-r-0 whitespace-nowrap">Tanggal</th>
                                                        <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-navy-800 last:border-r-0 whitespace-nowrap">Total</th>
                                                        <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 dark:border-navy-800 last:border-r-0 whitespace-nowrap">Status</th>
                                                        <th className="px-4 sm:px-6 py-4 text-center tracking-wider whitespace-nowrap">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-800 dark:text-slate-200 font-medium text-sm">
                                                    {purchases.map((p) => (
                                                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors">
                                                            <td className="px-4 sm:px-6 py-4.5 font-medium font-mono text-slate-900 dark:text-slate-100 text-sm border-r border-slate-200/70 dark:border-navy-800 last:border-r-0 whitespace-nowrap">
                                                                {p.order_number || (p.id ? (p.id.length > 12 ? `${p.id.substring(0, 8)}...` : p.id) : '-')}
                                                            </td>
                                                            <td className="px-4 sm:px-6 py-4.5 font-medium text-slate-900 dark:text-slate-100 text-sm border-r border-slate-200/70 dark:border-navy-800 last:border-r-0 whitespace-nowrap">{p.merchant?.name || 'Merchant'}</td>
                                                            <td className="px-4 sm:px-6 py-4.5 text-slate-600 dark:text-slate-400 text-sm border-r border-slate-200/70 dark:border-navy-800 last:border-r-0 whitespace-nowrap">{new Date(p.created_at || new Date()).toLocaleDateString('id-ID')}</td>
                                                            <td className="px-4 sm:px-6 py-4.5 font-bold text-gold-500 dark:text-gold-400 text-sm sm:text-base border-r border-slate-200/70 dark:border-navy-800 last:border-r-0 whitespace-nowrap">{formatCurrency(p.total_amount || p.total || 0)}</td>
                                                            <td className="px-4 sm:px-6 py-4.5 border-r border-slate-200/70 dark:border-navy-800 last:border-r-0 whitespace-nowrap">
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
                                                            <td className="px-4 sm:px-6 py-4.5 text-center whitespace-nowrap">
                                                                <div className="flex justify-center gap-2">
                                                                    <button className="px-3.5 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm border border-slate-300 dark:border-navy-700">
                                                                        <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                                        Invoice
                                                                    </button>
                                                                    {(p.status === 'completed' || p.status === 'PAID') && (
                                                                        <button className="px-3.5 py-1.5 bg-gold-500/10 dark:bg-navy-800 hover:bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm border border-gold-500/30">
                                                                            <Star className="w-3.5 h-3.5 text-gold-500 dark:text-gold-400 fill-current" />
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
                            </div>
                        </div>
                    )}

                        {/* 3. Tab Downloads (Unduhan File) */}
                        {activeTab === 'downloads' && (
                            <div className="space-y-6 text-left">
                                <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-6 shadow-sm">
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Aset Digital Siap Unduh</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Semua file produk yang telah Anda beli secara amanah.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {downloads.map((d) => (
                                        <div key={d.id} className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                            <div className="aspect-[16/10] w-full bg-slate-100 dark:bg-navy-950 relative">
                                                <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">{d.title}</h4>
                                                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">Oleh: <span className="font-semibold">{d.merchant}</span></span>
                                                    <span className="inline-block bg-gold-500/10 text-[9px] font-bold text-gold-500 px-2 py-0.5 rounded-md mt-1 border border-gold-500/20">{d.size}</span>
                                                </div>

                                                <a href={`/api/customer/orders/items/${d.order_item_id}/download`} target="_blank" rel="noreferrer" className="w-full bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-4 shadow-md shadow-gold-500/20">
                                                    <Download className="w-4 h-4 text-navy-950" />
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
                            <div className="text-left grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Banner & Ads List */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Hero Section / Banner */}
                                <div className="mb-6 relative w-full h-[140px] sm:h-[180px] md:h-[240px] rounded-lg overflow-hidden shadow-sm group">
                                    <img 
                                        src={bannerSlides[currentSlide].image} 
                                        alt="Banner Iklan" 
                                        className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-transparent flex flex-col justify-center p-6 sm:p-10 transition-all duration-500">
                                        <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-1 sm:mb-2 leading-tight">
                                            {bannerSlides[currentSlide].title.split('\n').map((line, i) => (
                                                <React.Fragment key={i}>
                                                    {line}<br className="hidden sm:block"/>
                                                </React.Fragment>
                                            ))}
                                        </h2>
                                        <p className="text-slate-300 text-[10px] sm:text-xs max-w-sm hidden sm:block mb-4 line-clamp-2">
                                            {bannerSlides[currentSlide].subtitle}
                                        </p>
                                        <div className="w-fit mt-2 sm:mt-0">
                                            <button 
                                                onClick={() => onNavigate('create_ad')}
                                                className="bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-extrabold text-xs py-2 px-5 rounded shadow-md shadow-gold-500/20 transition-all cursor-pointer"
                                            >
                                                {bannerSlides[currentSlide].ctaText}
                                            </button>
                                        </div>
                                    </div>
                                    {/* Slider Dots */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                                        {bannerSlides.map((_, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => setCurrentSlide(idx)}
                                                className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${currentSlide === idx ? 'w-4 bg-gold-400' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                {editingAd && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-2xl w-full max-w-lg">
                                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-navy-800">
                                                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Edit Iklan</h3>
                                                <button onClick={() => setEditingAd(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold leading-none">&times;</button>
                                            </div>
                                            <form onSubmit={handleSaveEditAd} className="p-6 space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Judul Iklan</label>
                                                    <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} required className="w-full border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Harga (Rp)</label>
                                                        <input type="number" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} className="w-full border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Kondisi</label>
                                                        <select value={editForm.condition} onChange={e => setEditForm(p => ({ ...p, condition: e.target.value }))} className="w-full border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500">
                                                            <option value="baru">Baru</option>
                                                            <option value="bekas">Bekas</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Lokasi</label>
                                                    <input type="text" value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} required className="w-full border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nama Kontak</label>
                                                        <input type="text" value={editForm.contact_name} onChange={e => setEditForm(p => ({ ...p, contact_name: e.target.value }))} required className="w-full border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">WhatsApp</label>
                                                        <input type="text" value={editForm.whatsapp} onChange={e => setEditForm(p => ({ ...p, whatsapp: e.target.value }))} required className="w-full border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Deskripsi</label>
                                                    <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} required className="w-full border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none" />
                                                </div>
                                                {editMsg && <p className="text-red-500 text-xs font-semibold">{editMsg}</p>}
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button type="button" onClick={() => setEditingAd(null)} className="px-5 py-2.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors">Batal</button>
                                                    <button type="submit" disabled={editSaving} className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 text-xs font-extrabold rounded-xl transition-all shadow-md shadow-gold-500/20">{editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {viewingAd && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
                                            <div className="bg-white dark:bg-navy-900 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-navy-800 shrink-0 rounded-t-2xl">
                                                <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Detail Iklan</h3>
                                                <button onClick={() => { setViewingAd(null); setSelectedAdImage(0); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl font-bold leading-none cursor-pointer">&times;</button>
                                            </div>
                                            <div className="p-6 overflow-y-auto">
                                                {(() => {
                                                    const adImages = viewingAd.media?.length > 0 
                                                        ? viewingAd.media.map(m => m.url) 
                                                        : (viewingAd.images?.length > 0 
                                                            ? viewingAd.images.map(img => img.url)
                                                            : [viewingAd.image_url || viewingAd.image || viewingAd.thumbnail || `https://picsum.photos/seed/ad-${viewingAd.id}/600/400`].filter(Boolean));
                                                            
                                                    return (
                                                        <>
                                                            <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                                                                <img 
                                                                    src={adImages[selectedAdImage] || adImages[0]} 
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/e2e8f0/475569?text=No+Image`; }}
                                                                    alt={viewingAd.title} 
                                                                    className="w-full h-full object-contain transition-all duration-300"
                                                                />
                                                            </div>
                                                            {adImages.length > 1 && (
                                                                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-navy-800">
                                                                    {adImages.map((img, idx) => (
                                                                        <div 
                                                                            key={idx}
                                                                            onClick={() => setSelectedAdImage(idx)}
                                                                            className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${selectedAdImage === idx ? 'border-gold-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                                                        >
                                                                            <img src={img} onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/e2e8f0/475569?text=Img`; }} alt={`${viewingAd.title} ${idx + 1}`} className="w-full h-full object-cover" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">{viewingAd.title}</h2>
                                                {viewingAd.price && (
                                                    <div className="text-xl font-bold text-gold-500 dark:text-gold-400 mb-4">
                                                        Rp {Number(viewingAd.price).toLocaleString('id-ID')}
                                                    </div>
                                                )}
                                                
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-navy-800">
                                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold-500" /> {viewingAd.created_at ? new Date(viewingAd.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : 'Hari ini'}</span>
                                                    <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-gold-500" /> {viewingAd.category?.name || viewingAd.category}</span>
                                                    <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-gold-500" /> {viewingAd.contact_name || viewingAd.merchant?.name || user?.name || 'Pengiklan'}</span>
                                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold-500" /> {viewingAd.location || 'Lokasi tidak diketahui'}</span>
                                                </div>

                                                <div className="mb-4">
                                                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-lg">Deskripsi Iklan</h4>
                                                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                        {viewingAd.description || 'Tidak ada deskripsi yang tersedia untuk iklan ini.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 dark:bg-navy-950 p-4 sm:p-6 border-t border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 rounded-b-2xl">
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    Penjual: <span className="font-bold text-slate-800 dark:text-white">{viewingAd.contact_name || viewingAd.merchant?.name || user?.name || 'Pengiklan'}</span>
                                                </div>
                                                <a 
                                                    href={`https://wa.me/${(viewingAd.whatsapp || viewingAd.merchant?.contact_whatsapp || '')?.replace(/[^0-9]/g, '')}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                                                >
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                                    Konsultasi Chat WA
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 dark:bg-navy-950 p-4 border-b border-slate-200 dark:border-navy-800 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-gold-500 dark:text-gold-400" />
                                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Iklan Baris Saya</h3>
                                    </div>
                                    <div className="divide-y divide-slate-200 dark:divide-navy-800">
                                        {advertisements.map((ad) => (
                                            <div key={ad.id} className="p-4 flex flex-col sm:flex-row gap-4">
                                                <div className="w-full sm:w-[130px] h-[100px] shrink-0 border border-slate-200 dark:border-navy-800 p-1 bg-white dark:bg-navy-950 rounded-xl overflow-hidden">
                                                    <img 
                                                        src={ad.media?.[0]?.url || ad.images?.[0]?.url || ad.image_url || ad.image || ad.thumbnail || `https://picsum.photos/seed/ad-${ad.id || Math.random()}/200/150`} 
                                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/200x150/e2e8f0/475569?text=No+Image`; }}
                                                        alt={ad.title} 
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-[15px] text-gold-500 dark:text-gold-400 hover:underline cursor-pointer leading-tight truncate">{ad.title}</h4>
                                                        {ad.status === 'approved' && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">Tayang</span>}
                                                        {ad.status === 'rejected' && <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">Ditolak / Takedown</span>}
                                                        {ad.status === 'pending' && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">Pending</span>}
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ad.created_at ? new Date(ad.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : 'Hari ini'}</span>
                                                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> <span className="text-gold-500 dark:text-gold-400">{ad.category?.name || ad.category}</span></span>
                                                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ad.contact_name || ad.merchant?.name || user?.name || 'Pengiklan'}</span>
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ad.location || 'Lokasi tidak diketahui'}</span>
                                                    </div>
                                                    
                                                    <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                                                        {ad.description || 'Tidak ada deskripsi yang tersedia untuk iklan ini.'} <span onClick={() => setViewingAd(ad)} className="text-gold-500 dark:text-gold-400 font-semibold cursor-pointer whitespace-nowrap hover:underline">Selengkapnya &gt;</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Column: Blog / Tips Sidebar */}
                            <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-5 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText className="w-5 h-5 text-gold-500 dark:text-gold-400" />
                                            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Artikel & Tips Bisnis</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {/* Blog Card 1 */}
                                            <a href="#" className="block group">
                                                <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-navy-950">
                                                    <img src="https://images.unsplash.com/photo-1432828684209-661664157b85?w=600&auto=format&fit=crop&q=80" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Tips+Bisnis'; }} alt="Blog" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gold-500 mb-1 block uppercase tracking-wider">Strategi Jualan</span>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight group-hover:text-gold-500 dark:group-hover:text-gold-400 transition-colors">5 Cara Membuat Deskripsi Iklan yang Menarik Pembeli</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Pelajari teknik copywriting sederhana untuk meningkatkan konversi penjualan Anda secara drastis.</p>
                                            </a>
                                            <hr className="border-slate-100 dark:border-navy-800" />
                                            {/* Blog Card 2 */}
                                            <a href="#" className="block group">
                                                <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-navy-950">
                                                    <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop&q=80" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Panduan'; }} alt="Blog" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gold-500 mb-1 block uppercase tracking-wider">Panduan</span>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight group-hover:text-gold-500 dark:group-hover:text-gold-400 transition-colors">Cara Memfoto Produk Hanya Bermodal Smartphone</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Tidak perlu kamera mahal. Gunakan teknik pencahayaan ini untuk hasil foto produk profesional.</p>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Info Panel Mini */}
                                    <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 border border-navy-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl"></div>
                                        <h4 className="font-extrabold text-lg mb-2 text-white">Butuh Bantuan?</h4>
                                        <p className="text-slate-300 text-xs mb-4">Tim support kami siap membantu kendala Anda 24/7. Jangan ragu untuk menghubungi kami.</p>
                                        <a href="https://wa.me/6281121211933" target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-extrabold text-xs rounded-xl transition-all shadow-md shadow-gold-500/20">Hubungi CS Sekarang</a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. Tab Wishlist */}
                        {activeTab === 'wishlist' && (
                            <div className="space-y-6 text-left">
                                <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                                            <span>Favorit & Wishlist</span>
                                        </h3>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Produk dan iklan baris yang Anda simpan untuk dibeli nanti.</p>
                                    </div>

                                    {/* Search Input Box */}
                                    <div className="relative w-full sm:w-72 shrink-0">
                                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                        <input 
                                            type="text"
                                            value={wishlistSearchQuery}
                                            onChange={(e) => setWishlistSearchQuery(e.target.value)}
                                            placeholder="Cari di favorit..."
                                            className="w-full text-xs pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-gold-500 font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
                                        />
                                        {wishlistSearchQuery && (
                                            <button 
                                                type="button"
                                                onClick={() => setWishlistSearchQuery('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {wishlist.length === 0 ? (
                                    <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-16 text-center shadow-sm">
                                        <Heart className="w-12 h-12 text-slate-300 dark:text-navy-700 mx-auto mb-3" />
                                        <h4 className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">Wishlist Anda Kosong</h4>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">Mulai cari produk halal pilihan dan tambahkan ke favorit Anda.</p>
                                    </div>
                                ) : (() => {
                                    const filteredWishlist = wishlist.filter(item => {
                                        const product = item.product || item;
                                        const query = wishlistSearchQuery.toLowerCase().trim();
                                        if (!query) return true;
                                        const title = (product.title || product.name || '').toLowerCase();
                                        const merchant = (product.merchant || '').toLowerCase();
                                        const category = (product.category || '').toLowerCase();
                                        return title.includes(query) || merchant.includes(query) || category.includes(query);
                                    });

                                    if (filteredWishlist.length === 0) {
                                        return (
                                            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-12 text-center shadow-sm">
                                                <Search className="w-10 h-10 text-slate-300 dark:text-navy-700 mx-auto mb-3" />
                                                <h4 className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">Tidak Ditemukan</h4>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Tidak ada produk favorit yang cocok dengan kata kunci &quot;{wishlistSearchQuery}&quot;</p>
                                                <button 
                                                    onClick={() => setWishlistSearchQuery('')}
                                                    className="mt-4 text-xs font-bold text-amber-600 dark:text-gold-400 hover:underline"
                                                >
                                                    Bersihkan Pencarian
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            {filteredWishlist.map((item) => {
                                                const product = item.product || item;
                                                return (
                                                    <div key={item.id} className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 overflow-hidden shadow-sm flex items-center justify-between p-4 gap-4 relative group hover:border-gold-500/50 transition-all">
                                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                                            <img 
                                                                src={product.thumbnail || product.image || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop'} 
                                                                alt=""
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop';
                                                                }}
                                                                className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-navy-800 shrink-0" 
                                                            />
                                                            <div className="space-y-1 min-w-0 flex-1">
                                                                <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-snug truncate">{product.title || product.name}</h4>
                                                                <span className="block font-black text-sm text-gold-500 dark:text-gold-400">{formatCurrency(product.price)}</span>
                                                            </div>
                                                        </div>

                                                        <button 
                                                            onClick={() => handleRemoveFromWishlist(item.id)}
                                                            className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-colors shadow-sm cursor-pointer border border-rose-500/20 shrink-0"
                                                            title="Hapus dari Favorit"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* 6. Tab Settings (Pengaturan Akun) */}
                        {activeTab === 'settings' && (
                            <form onSubmit={handleProfileSave} className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm p-6 sm:p-8 space-y-8 text-left">
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Pengaturan Profil</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Perbarui informasi pribadi dan keamanan kata sandi Anda.</p>
                                </div>

                                {saveSuccess && (
                                    <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 text-xs font-bold flex items-center gap-2">
                                        <Check className="w-4 h-4 text-gold-500" />
                                        Profil Anda berhasil diperbarui dan disimpan!
                                    </div>
                                )}
                                {saveError && (
                                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold">
                                        {saveError}
                                    </div>
                                )}

                                {/* Profile Photo Upload UI */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-navy-800">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover border border-gold-500/40 shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center border border-slate-200 dark:border-navy-700">
                                            <User className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="space-y-1 text-center sm:text-left">
                                        <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
                                        <button type="button" onClick={() => avatarInputRef.current?.click()} className="px-4 py-2 border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                                            <Upload className="w-4 h-4 text-gold-500" />
                                            Unggah Foto Baru
                                        </button>
                                        <span className="block text-[10px] text-slate-400 dark:text-slate-500">JPG, PNG, atau WEBP. Maks 2MB.</span>
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-navy-800">Detail Personal</h4>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Nama Lengkap</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Nomor Telepon</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={profilePhone}
                                                onChange={(e) => setProfilePhone(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Alamat Email</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={profileEmail}
                                                onChange={(e) => setProfileEmail(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-navy-800">Ganti Kata Sandi</h4>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Kata Sandi Lama</label>
                                            <input 
                                                type="password" 
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Kata Sandi Baru</label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                                                placeholder="Minimal 8 karakter"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Konfirmasi Kata Sandi Baru</label>
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                                                placeholder="Ulangi sandi baru"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-navy-800 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-extrabold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-gold-500/20 cursor-pointer disabled:opacity-60"
                                    >
                                        {isSaving ? (
                                            <><span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin"></span><span>Menyimpan...</span></>
                                        ) : (
                                            <><Check className="w-4 h-4" /><span>Simpan Perubahan</span></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Package Subscriptions Tab */}
                        {activeTab === 'package-subscriptions' && (
                            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-navy-800">
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Riwayat Langganan Paket</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Pantau status paket iklan yang Anda pesan.</p>
                                </div>
                                
                                {isLoading ? (
                                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div></div>
                                ) : packageSubscriptions.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Langganan</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Anda belum pernah membeli paket langganan iklan.</p>
                                        <button 
                                            onClick={() => onNavigate('pricing', '/pricing')}
                                            className="mt-6 text-xs font-bold bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950 px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                                        >
                                            Lihat Paket Tersedia
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-navy-800">
                                        {packageSubscriptions.map((sub) => (
                                            <div key={sub.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                            {sub.package?.name}
                                                        </h4>
                                                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${
                                                            sub.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 
                                                            sub.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' : 
                                                            'bg-slate-50 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20'
                                                        }`}>
                                                            {sub.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(sub.total_amount)} &bull; {sub.payment_method}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                                        Dipesan pada {new Date(sub.created_at).toLocaleDateString('id-ID')}
                                                        {sub.status === 'active' && sub.expires_at && ` - Aktif s/d ${new Date(sub.expires_at).toLocaleDateString('id-ID')}`}
                                                    </p>
                                                </div>
                                                
                                                {sub.status === 'active' && (
                                                    <button 
                                                        onClick={() => onNavigate('create_ad', '/pasang-iklan')}
                                                        className="text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 px-5 py-2.5 rounded-lg shadow-sm shadow-gold-500/20 transition-all flex items-center gap-2 whitespace-nowrap"
                                                    >
                                                        <Megaphone className="w-3.5 h-3.5" />
                                                        Pasang Iklan Premium
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 7. Tab Merchant Registration */}
                        {activeTab === 'merchant_registration' && (
                            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm p-6 sm:p-8 space-y-6 text-left">
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Pendaftaran Mitra Merchant</h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Gabung menjadi Merchant resmi ADMS untuk menjual produk digital dan jasa Anda sesuai syariat.</p>
                                </div>

                                {user?.merchant ? (
                                    <div className="p-8 text-center space-y-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800">
                                        <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto text-gold-500 border border-gold-500/20">
                                            <Store className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Status Pendaftaran: Menunggu Verifikasi</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                                Toko Anda <strong>"{user.merchant.name}"</strong> sedang ditinjau oleh Tim Admin ADMS. Proses moderasi ini memakan waktu maksimal 24 jam untuk memverifikasi kepatuhan syariah dan dokumen Anda.
                                            </p>
                                        </div>
                                        <div className="inline-block bg-gold-500/10 text-gold-500 dark:text-gold-400 text-[10px] font-black px-4 py-2 rounded-full border border-gold-500/20 uppercase tracking-wider">
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
                                                    className="w-full text-xs p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-50 dark:bg-navy-950 focus:bg-white dark:focus:bg-navy-950 focus:border-gold-500 outline-none text-slate-800 dark:text-slate-100"
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
                                                    className="w-full text-xs p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-100 dark:bg-navy-950 focus:bg-white dark:focus:bg-navy-950 focus:border-gold-500 outline-none font-mono text-slate-800 dark:text-slate-100"
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
                                                className="w-full text-xs p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-50 dark:bg-navy-950 focus:bg-white dark:focus:bg-navy-950 focus:border-gold-500 outline-none resize-none text-slate-800 dark:text-slate-100"
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
                                                    className="w-full text-xs p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-50 dark:bg-navy-950 focus:bg-white dark:focus:bg-navy-950 focus:border-gold-500 outline-none text-slate-800 dark:text-slate-100"
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
                                                    className="w-full text-xs p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-50 dark:bg-navy-950 focus:bg-white dark:focus:bg-navy-950 focus:border-gold-500 outline-none text-slate-800 dark:text-slate-100"
                                                />
                                                {regErrors.contact_whatsapp && <span className="text-[10px] text-rose-500 font-bold">{regErrors.contact_whatsapp[0]}</span>}
                                            </div>
                                        </div>

                                        {/* Sertifikasi Syariah Checkbox */}
                                        <div className="border-t border-slate-100 dark:border-navy-800 pt-6 space-y-4">
                                            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={regSyariahCertified}
                                                    onChange={(e) => setRegSyariahCertified(e.target.checked)}
                                                    className="w-4 h-4 text-gold-500 focus:ring-gold-500 border-slate-300 rounded"
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
                                                            className="w-full text-xs p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-50 dark:bg-navy-950 focus:bg-white dark:focus:bg-navy-950 focus:border-gold-500 outline-none text-slate-800 dark:text-slate-100"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Lembaga Penerbit Sertifikat</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="BPJPH Kemenag / MUI"
                                                            value={regSyariahCertBody}
                                                            onChange={(e) => setRegSyariahCertBody(e.target.value)}
                                                            className="w-full text-xs p-3.5 border border-slate-200 dark:border-navy-800 rounded-xl bg-slate-50 dark:bg-navy-950 focus:bg-white dark:focus:bg-navy-950 focus:border-gold-500 outline-none text-slate-800 dark:text-slate-100"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={regLoading}
                                            className="w-full bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-navy-950 font-extrabold py-3.5 px-4 rounded-xl shadow-md shadow-gold-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {regLoading ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin"></span>
                                                    <span>Memproses Pendaftaran...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Store className="w-4 h-4 text-navy-950" />
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
