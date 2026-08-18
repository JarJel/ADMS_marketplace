import React, { useState } from 'react';
import { Search, Heart, Bell, ChevronDown, Sun, Moon, Menu, X, User, ShoppingCart, Store } from 'lucide-react';

export default function Navbar({ 
    user, 
    token, 
    darkMode, 
    setDarkMode, 
    onLogout, 
    onNavigate, 
    currentView,
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
            console.error(err);
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
            console.error(err);
        }
    };

    const unreadNotifCount = notifications ? notifications.filter(n => !n.is_read).length : 0;

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                
                {/* Sisi Kiri: Logo dan Burger */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowSidebar(true)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div 
                        onClick={() => onNavigate('homepage')} 
                        className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform select-none"
                    >
                        {/* ADMS Symbol - already transparent PNG */}
                        <img 
                            src="/assets/Images/adms-symbol.png" 
                            alt="ADMS" 
                            className="h-9 sm:h-11 w-auto object-contain drop-shadow-md" 
                        />
                        {/* Wordmark */}
                        <div className="hidden sm:flex flex-col leading-none gap-0.5">
                            <span className="font-black text-[15px] tracking-tight text-slate-900 dark:text-white leading-none">
                                ADM<span className="text-transparent bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text">S</span>
                            </span>
                            <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">Marketplace</span>
                        </div>
                    </div>
                </div>

                {/* Sisi Tengah: Menu Pilihan */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                    <button 
                        onClick={() => onNavigate('homepage')}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                            currentView === 'homepage' 
                                ? 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Home
                    </button>
                    <button 
                        onClick={() => onNavigate('products', 'digital')}
                        className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all ${
                            currentView === 'products' 
                                ? 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Produk Digital
                    </button>
                    <button 
                        onClick={() => onNavigate('merchants')}
                        className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all ${
                            currentView === 'merchants' 
                                ? 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Mitra Merchant
                    </button>
                    <button 
                        onClick={() => onNavigate('classifieds')}
                        className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all ${
                            currentView === 'classifieds' 
                                ? 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Iklan Gratis
                    </button>
                    <button 
                        onClick={() => onNavigate('help_center')} 
                        className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all ${
                            currentView === 'help_center' 
                                ? 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Bantuan
                    </button>
                </nav>

                {/* Sisi Kanan: Conditional render based on Auth status */}
                <div className="flex items-center gap-3">
                    {/* Daftar Mitra button for Customer */}
                    {token && user && user.role === 'customer' && (
                        <button 
                            onClick={() => onNavigate('merchant_registration')}
                            className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white text-[10px] font-black px-3.5 py-2 rounded-full shadow-md shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer mr-1"
                        >
                            <Store className="w-3.5 h-3.5" />
                            <span>Daftar Mitra</span>
                        </button>
                    )}

                    {/* Light/Dark Toggle (always visible) */}
                    <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors mr-1"
                    >
                        {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    </button>

                    {token ? (
                        <>
                            {/* Search Icon */}
                            <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                                <Search className="w-4 h-4" />
                            </button>

                            {/* Cart Icon */}
                            <div className="relative">
                                <button 
                                    onClick={() => onNavigate('cart')} 
                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 cursor-pointer relative"
                                    title="Keranjang Belanja"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900 pointer-events-none">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Wishlist Icon with red counter badge */}
                            <div className="relative">
                                <button 
                                    onClick={() => onNavigate('wishlist')} 
                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 cursor-pointer relative"
                                    title="Favorit Saya"
                                >
                                    <Heart className="w-4 h-4" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900 pointer-events-none">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Notification Bell Icon with red dot badge */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    <Bell className="w-4 h-4" />
                                </button>
                                {unreadNotifCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
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
                            <div className="relative">
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
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-50 text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <span className="block px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
                                            {user?.name || 'User'}
                                        </span>
                                        <button 
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                onNavigate('dashboard');
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
                                        >
                                            Buka Dashboard
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                onLogout();
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-rose-600 dark:text-rose-400 border-t border-slate-100 dark:border-slate-700 mt-1"
                                        >
                                            Keluar
                                        </button>
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
                    <div className="flex items-center gap-2">
                        <img 
                            src="/assets/Images/adms-symbol.png" 
                            alt="ADMS" 
                            className="h-9 w-auto object-contain drop-shadow-md" 
                        />
                        <div className="flex flex-col leading-none gap-0.5">
                            <span className="font-black text-[15px] tracking-tight text-slate-900 dark:text-white leading-none">
                                ADM<span className="text-transparent bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text">S</span>
                            </span>
                            <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">Marketplace</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowSidebar(false)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-70px)] bg-slate-50 dark:bg-slate-950 min-h-full">
                    {sidebarContent ? (
                        sidebarContent(() => setShowSidebar(false))
                    ) : (
                        <>
                            <button onClick={() => { setShowSidebar(false); onNavigate('homepage'); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Home</button>
                            <button onClick={() => { setShowSidebar(false); onNavigate('products', 'digital'); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Produk Digital</button>
                            <button onClick={() => { setShowSidebar(false); onNavigate('merchants'); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Mitra Merchant</button>
                            <button onClick={() => { setShowSidebar(false); onNavigate('classifieds'); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Iklan Gratis</button>
                            <button onClick={() => { setShowSidebar(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">Bantuan</button>
                            
                            {token && (
                                <>
                                    <div className="my-4 border-t border-slate-100 dark:border-slate-800"></div>
                                    <button onClick={() => { setShowSidebar(false); onNavigate('dashboard'); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">Dashboard Saya</button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
