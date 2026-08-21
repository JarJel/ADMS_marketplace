import React, { useState } from 'react';
import { 
    Search, Heart, Bell, ChevronDown, Sun, Moon, Menu, X, User, ShoppingCart, Store,
    LayoutDashboard, ShoppingBag, Download, Megaphone, ShieldCheck, LogOut
} from 'lucide-react';

export default function Navbar({ 
    user, 
    token, 
    darkMode, 
    setDarkMode, 
    onLogout, 
    onNavigate, 
    currentView,
    currentFilter,
    sidebarContent,
    cartCount = 0,
    wishlistCount = 0,
    notifications = [],
    setNotifications
}) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showNotifMenu, setShowNotifMenu] = useState(false);

    const handleMarkNotifRead = async (id) => {
        try {
            const res = await fetch(`/api/customer/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && setNotifications) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            }
        } catch (err) {
        }
    };

    const handleMarkAllNotificationsRead = async () => {
        try {
            const res = await fetch('/api/customer/notifications/read-all', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && setNotifications) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            }
        } catch (err) {
        }
    };

    const unreadNotifCount = notifications ? notifications.filter(n => !n.is_read).length : 0;

    const isHomeActive = currentView === 'homepage';
    const isDigitalActive = (currentView === 'products' && currentFilter !== 'vendor') || currentView === 'products_digital';
    const isVendorActive = currentView === 'merchants' || (currentView === 'products' && currentFilter === 'vendor');
    const isClassifiedsActive = currentView === 'classifieds' || currentView === 'create_ad';
    const isHelpActive = currentView === 'help_center' || currentView === 'help';

    return (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0F3040] border-b border-slate-200 dark:border-[#174256] text-slate-800 dark:text-white shadow-md font-sans backdrop-blur-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                
                {/* Sisi Kiri: Logo dan Burger */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                    <button 
                        onClick={() => setShowSidebar(true)}
                        className="md:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-[#071922] text-amber-600 dark:text-[#FFBF00] border border-slate-200 dark:border-[#174256] hover:border-amber-400 dark:hover:border-[#FFBF00] transition-colors cursor-pointer shrink-0"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div 
                        onClick={() => onNavigate('homepage')} 
                        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-98 transition-transform shrink-0"
                    >
                        <img 
                            src="/assets/Images/adms-symbol.png" 
                            alt="ADMS Symbol" 
                            className="h-7 sm:h-9 w-auto object-contain transition-all duration-300 drop-shadow-md shrink-0" 
                        />
                        <img 
                            src="/assets/Images/adms-text.png" 
                            alt="ADMS Text" 
                            className="h-4.5 sm:h-6 w-auto object-contain dark:invert dark:mix-blend-screen shrink-0" 
                        />
                    </div>
                </div>

                {/* Sisi Tengah: Menu Pilihan */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-[#071922]/80 p-1.5 rounded-full border border-slate-200 dark:border-[#174256]">
                    <button 
                        onClick={() => onNavigate('homepage')}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer ${
                            isHomeActive 
                                ? 'bg-[#FFBF00] text-[#0F3040] font-black shadow-md' 
                                : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-[#FFBF00]'
                        }`}
                    >
                        Home
                    </button>
                    <button 
                        onClick={() => onNavigate('products', 'digital')}
                        className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all ${
                            isDigitalActive 
                                ? 'bg-[#FFBF00] text-[#0F3040] font-black shadow-md' 
                                : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-[#FFBF00]'
                        }`}
                    >
                        Produk Digital
                    </button>
                    <button 
                        onClick={() => onNavigate('merchants')}
                        className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all ${
                            isVendorActive 
                                ? 'bg-[#FFBF00] text-[#0F3040] font-black shadow-md' 
                                : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-[#FFBF00]'
                        }`}
                    >
                        Merchant Vendor
                    </button>
                    <button 
                        onClick={() => onNavigate('classifieds')}
                        className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all ${
                            isClassifiedsActive 
                                ? 'bg-[#FFBF00] text-[#0F3040] font-black shadow-md' 
                                : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-[#FFBF00]'
                        }`}
                    >
                        Iklan Gratis
                    </button>
                    <button 
                        onClick={() => onNavigate('help_center')} 
                        className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all ${
                            isHelpActive 
                                ? 'bg-[#FFBF00] text-[#0F3040] font-black shadow-md' 
                                : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-[#FFBF00]'
                        }`}
                    >
                        Bantuan
                    </button>
                </nav>

                {/* Sisi Kanan: Conditional render based on Auth status */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">


                    {token ? (
                        <>
                            {/* Search Icon */}
                            <button className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-[#071922] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#174256] hover:text-amber-600 dark:hover:text-[#FFBF00] transition-colors">
                                <Search className="w-4 h-4" />
                            </button>

                            {/* Cart Icon */}
                            <div className="relative">
                                <button 
                                    onClick={() => onNavigate('cart')} 
                                    className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-[#071922] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#174256] hover:text-amber-600 dark:hover:text-[#FFBF00] transition-all active:scale-95 cursor-pointer relative"
                                    title="Keranjang Belanja"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#FFBF00] text-[#0F3040] text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#0F3040] pointer-events-none">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Wishlist Icon */}
                            <div className="relative">
                                <button 
                                    onClick={() => onNavigate('wishlist')} 
                                    className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-[#071922] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#174256] hover:text-amber-600 dark:hover:text-[#FFBF00] transition-all active:scale-95 cursor-pointer relative"
                                    title="Favorit Saya"
                                >
                                    <Heart className="w-4 h-4" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#0F3040] pointer-events-none">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Notification Bell Icon */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                                    className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-[#071922] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#174256] hover:text-amber-600 dark:hover:text-[#FFBF00] transition-colors"
                                >
                                    <Bell className="w-4 h-4" />
                                </button>
                                {unreadNotifCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FFBF00] rounded-full border-2 border-white dark:border-[#0F3040]"></span>
                                )}

                                {showNotifMenu && (
                                    <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl py-3 z-50 text-slate-700 dark:text-slate-200 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                            <span className="text-xs font-black">Notifikasi</span>
                                            {unreadNotifCount > 0 && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAllNotificationsRead(); }}
                                                    className="text-[10px] text-indigo-500 hover:underline font-bold"
                                                >
                                                    Tandai Semua Dibaca
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                                            {notifications && notifications.length > 0 ? (
                                                notifications.map(notif => (
                                                    <div 
                                                        key={notif.id}
                                                        onClick={() => handleMarkNotifRead(notif.id)}
                                                        className={`p-3 text-[11px] leading-snug cursor-pointer transition-colors ${!notif.is_read ? 'bg-indigo-50/40 dark:bg-indigo-900/10 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                                    >
                                                        <span className="block text-slate-800 dark:text-slate-100 font-bold mb-0.5">{notif.title}</span>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">{notif.message}</p>
                                                        <span className="block text-[9px] text-slate-400 mt-1">{new Date(notif.created_at).toLocaleDateString('id-ID')}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center text-slate-400 text-[11px] font-bold">
                                                    Tidak ada notifikasi baru
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile Avatar Dropdown */}
                            <div className="relative hidden sm:block">
                                <div 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-1.5 cursor-pointer pl-1 py-0.5 pr-2 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                </div>

                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0F3040] border border-slate-200 dark:border-[#174256] shadow-2xl py-2 z-50 text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-[#174256] mb-1">
                                            <span className="block text-xs font-black text-slate-900 dark:text-white truncate">
                                                {user?.name || 'Pelanggan'}
                                            </span>
                                            <span className="block text-[10px] text-slate-400 dark:text-slate-400 truncate">
                                                {user?.email || 'Akun Customer'}
                                            </span>
                                        </div>

                                        <div className="space-y-0.5 px-1.5">
                                            <button 
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('customer_dashboard', 'overview');
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-[#174256] text-slate-700 dark:text-slate-200 transition-colors"
                                            >
                                                <LayoutDashboard className="w-4 h-4 text-[#FFBF00]" />
                                                <span>Dashboard</span>
                                            </button>

                                            {(user?.role === 'merchant' || user?.role === 'admin') && (
                                                <button 
                                                    onClick={() => {
                                                        setShowProfileMenu(false);
                                                        onNavigate('merchant_dashboard');
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 transition-colors my-1 cursor-pointer"
                                                >
                                                    <Store className="w-4 h-4 text-teal-500" />
                                                    <span>Dashboard Merchant</span>
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('customer_dashboard', 'purchases');
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-[#174256] text-slate-700 dark:text-slate-200 transition-colors"
                                            >
                                                <ShoppingBag className="w-4 h-4 text-teal-500" />
                                                <span>Transaksi Saya</span>
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('customer_dashboard', 'downloads');
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-[#174256] text-slate-700 dark:text-slate-200 transition-colors"
                                            >
                                                <Download className="w-4 h-4 text-emerald-500" />
                                                <span>Unduhan File</span>
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('customer_dashboard', 'ads');
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-[#174256] text-slate-700 dark:text-slate-200 transition-colors"
                                            >
                                                <Megaphone className="w-4 h-4 text-amber-500" />
                                                <span>Iklan Saya</span>
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('customer_dashboard', 'package-subscriptions');
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-[#174256] text-slate-700 dark:text-slate-200 transition-colors"
                                            >
                                                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                                <span>Paket & Langganan</span>
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('customer_dashboard', 'wishlist');
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-[#174256] text-slate-700 dark:text-slate-200 transition-colors"
                                            >
                                                <Heart className="w-4 h-4 text-rose-500" />
                                                <span>Favorit / Wishlist</span>
                                            </button>

                                            {user?.role === 'user' && (
                                                <button 
                                                    onClick={() => {
                                                        setShowProfileMenu(false);
                                                        onNavigate('merchant_registration');
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black rounded-xl bg-[#FFBF00]/15 hover:bg-[#FFBF00]/25 text-amber-700 dark:text-[#FFBF00] border border-[#FFBF00]/30 transition-colors my-1 cursor-pointer"
                                                >
                                                    <Store className="w-4 h-4 text-[#FFBF00]" />
                                                    <span>Daftar Mitra Vendor</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="pt-1 mt-1 border-t border-slate-100 dark:border-[#174256] px-1.5 space-y-0.5">
                                            <button 
                                                onClick={() => setDarkMode(!darkMode)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-[#174256] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                            >
                                                {darkMode ? <Sun className="w-4 h-4 text-[#FFBF00]" /> : <Moon className="w-4 h-4 text-slate-500" />}
                                                <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onLogout();
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4 text-rose-500" />
                                                <span>Keluar</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onNavigate('login')}
                                className="text-xs font-bold py-2 px-4 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                                Masuk
                            </button>
                            <button 
                                onClick={() => onNavigate('register')}
                                className="bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold py-2 px-4 rounded-full shadow-md shadow-teal-500/10 transition-colors"
                            >
                                Daftar
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Sidebar Overlay */}
            {showSidebar && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-[60] transition-opacity"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Sidebar Content */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 z-[70] transform transition-transform duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 shadow-2xl ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div 
                        onClick={() => {
                            setShowSidebar(false);
                            onNavigate('homepage');
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <img 
                            src="/assets/Images/adms-symbol.png" 
                            alt="ADMS Symbol" 
                            className="h-8 w-auto object-contain drop-shadow-md" 
                        />
                        <img 
                            src="/assets/Images/adms-text.png" 
                            alt="ADMS Text" 
                            className="h-5 w-auto object-contain dark:invert dark:mix-blend-screen" 
                        />
                    </div>
                    <button 
                        onClick={() => setShowSidebar(false)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-70px)] bg-slate-50 dark:bg-[#071922] min-h-full text-left">
                    {sidebarContent ? (
                        sidebarContent(() => setShowSidebar(false))
                    ) : (
                        <>
                            {/* User Profile Card if logged in */}
                            {token && user && (
                                <div className="bg-white dark:bg-[#0F3040] rounded-2xl p-3.5 border border-slate-200 dark:border-[#174256] shadow-sm mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#174256] flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold shrink-0">
                                            <User className="w-4.5 h-4.5 text-[#FFBF00]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                                {user.name || 'User'}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                                                {user.email || 'Customer'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Section Header */}
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pt-1">
                                Navigasi Utama
                            </p>

                            <button onClick={() => { setShowSidebar(false); onNavigate('homepage'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer">
                                <span>Home</span>
                            </button>
                            <button onClick={() => { setShowSidebar(false); onNavigate('products', 'digital'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer">
                                <span>Produk Digital</span>
                            </button>
                            <button onClick={() => { setShowSidebar(false); onNavigate('merchants'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer">
                                <span>Merchant Vendor</span>
                            </button>
                            <button onClick={() => { setShowSidebar(false); onNavigate('classifieds'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer">
                                <span>Iklan Gratis</span>
                            </button>
                            <button onClick={() => { setShowSidebar(false); onNavigate('help_center'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer">
                                <span>Bantuan</span>
                            </button>

                            {/* Customer Dashboard Quick Links if logged in */}
                            {token && user && (
                                <>
                                    <div className="my-2 border-t border-slate-200 dark:border-[#174256]"></div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pt-1">
                                        Dashboard Saya
                                    </p>

                                    <button 
                                        onClick={() => {
                                            setShowSidebar(false);
                                            onNavigate('customer_dashboard', 'overview');
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer"
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-[#FFBF00]" />
                                        <span>Ringkasan</span>
                                    </button>

                                    {(user.role === 'merchant' || user.role === 'admin') && (
                                        <button 
                                            onClick={() => {
                                                setShowSidebar(false);
                                                onNavigate('merchant_dashboard');
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 transition-colors my-1 cursor-pointer"
                                        >
                                            <Store className="w-4 h-4 text-teal-500" />
                                            <span>Dashboard Merchant</span>
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => {
                                            setShowSidebar(false);
                                            onNavigate('customer_dashboard', 'purchases');
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer"
                                    >
                                        <ShoppingBag className="w-4 h-4 text-teal-500" />
                                        <span>Transaksi Saya</span>
                                    </button>

                                    <button 
                                        onClick={() => {
                                            setShowSidebar(false);
                                            onNavigate('customer_dashboard', 'downloads');
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer"
                                    >
                                        <Download className="w-4 h-4 text-emerald-500" />
                                        <span>Unduhan File</span>
                                    </button>

                                    <button 
                                        onClick={() => {
                                            setShowSidebar(false);
                                            onNavigate('customer_dashboard', 'ads');
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer"
                                    >
                                        <Megaphone className="w-4 h-4 text-amber-500" />
                                        <span>Iklan Saya</span>
                                    </button>

                                    <button 
                                        onClick={() => {
                                            setShowSidebar(false);
                                            onNavigate('customer_dashboard', 'package-subscriptions');
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer"
                                    >
                                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                        <span>Paket & Langganan</span>
                                    </button>

                                    <button 
                                        onClick={() => {
                                            setShowSidebar(false);
                                            onNavigate('customer_dashboard', 'wishlist');
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer"
                                    >
                                        <Heart className="w-4 h-4 text-rose-500" />
                                        <span>Favorit / Wishlist</span>
                                    </button>

                                    {user.role === 'user' && (
                                        <button 
                                            onClick={() => {
                                                setShowSidebar(false);
                                                onNavigate('merchant_registration');
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black bg-[#FFBF00]/15 hover:bg-[#FFBF00]/25 text-amber-700 dark:text-[#FFBF00] border border-[#FFBF00]/30 transition-colors my-1 cursor-pointer"
                                        >
                                            <Store className="w-4 h-4 text-[#FFBF00]" />
                                            <span>Daftar Mitra Vendor</span>
                                        </button>
                                    )}
                                </>
                            )}

                            <div className="my-2 border-t border-slate-200 dark:border-[#174256]"></div>

                            {/* Theme Toggle */}
                            <button 
                                onClick={() => setDarkMode(!darkMode)}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0F3040] transition-colors cursor-pointer"
                            >
                                {darkMode ? <Sun className="w-4 h-4 text-[#FFBF00]" /> : <Moon className="w-4 h-4 text-slate-500" />}
                                <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
                            </button>

                            {/* Logout Button if logged in */}
                            {token && (
                                <button 
                                    onClick={() => {
                                        setShowSidebar(false);
                                        onLogout();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer mt-1"
                                >
                                    <LogOut className="w-4 h-4 text-rose-500" />
                                    <span>Keluar</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
