import React, { useState } from 'react';
import { Search, Heart, Bell, ChevronDown, Sun, Moon } from 'lucide-react';

export default function Navbar({ 
    user, 
    token, 
    darkMode, 
    setDarkMode, 
    onLogout, 
    onNavigate, 
    currentView 
}) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 text-slate-800 shadow-sm font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                
                {/* Sisi Kiri: Logo */}
                <div 
                    onClick={() => onNavigate('homepage')} 
                    className="flex items-center gap-2 cursor-pointer active:scale-98 transition-transform"
                >
                    <img src="/assets/Images/adms-logo.png" alt="ADMS Logo" className="h-10" />
                </div>

                {/* Sisi Tengah: Menu Pilihan */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1 rounded-full border border-slate-200/50">
                    <button 
                        onClick={() => onNavigate('homepage')}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                            currentView === 'homepage' 
                                ? 'bg-slate-200/80 text-slate-900 shadow-sm' 
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Home
                    </button>
                    <button 
                        onClick={() => onNavigate('classifieds')}
                        className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all ${
                            currentView === 'classifieds' 
                                ? 'bg-slate-200/80 text-slate-900 shadow-sm' 
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Iklan Gratis
                    </button>
                    <a 
                        href="#how" 
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full transition-colors"
                    >
                        Bantuan
                    </a>
                </nav>

                {/* Sisi Kanan: Conditional render based on Auth status */}
                <div className="flex items-center gap-3">
                    {/* Light/Dark Toggle (always visible) */}
                    <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors mr-1"
                    >
                        {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    </button>

                    {token ? (
                        <>
                            {/* Search Icon */}
                            <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                                <Search className="w-4 h-4" />
                            </button>

                            {/* Wishlist Icon with red counter badge */}
                            <div className="relative">
                                <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                                    <Heart className="w-4 h-4" />
                                </button>
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white scale-90">
                                    1
                                </span>
                            </div>

                            {/* Notification Bell Icon with red dot badge */}
                            <div className="relative">
                                <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                                    <Bell className="w-4 h-4" />
                                </button>
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                            </div>

                            {/* User Profile Avatar Dropdown */}
                            <div className="relative">
                                <div 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-1.5 cursor-pointer pl-1 py-0.5 pr-2 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <img 
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" 
                                        alt="User Profile" 
                                        className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                                    />
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                </div>

                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <span className="block px-4 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 mb-1">
                                            {user?.name || 'User'}
                                        </span>
                                        <button 
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                onNavigate('dashboard');
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 font-medium"
                                        >
                                            Buka Dashboard
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                onLogout();
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 font-medium text-rose-600 border-t border-slate-100 mt-1"
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
                                className="text-xs font-bold py-2 px-4 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
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
        </header>
    );
}
