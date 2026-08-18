import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    BarChart3, 
    Package, 
    Tags, 
    ShoppingCart, 
    Megaphone, 
    Layers, 
    MousePointerClick, 
    Users, 
    Store, 
    Wallet, 
    Percent, 
    Settings, 
    Activity,
    LogOut,
    ShieldCheck
} from 'lucide-react';

// --- DATA MENU ---
const menuGroups = [
    {
        title: "OVERVIEW",
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
            { id: 'analytics', label: 'Analytics & Laporan', icon: BarChart3, href: '/admin/analytics' },
        ]
    },
    {
        title: "MARKETPLACE",
        items: [
            { id: 'products', label: 'Kelola Produk Digital', icon: Package, href: '/admin/products' },
            { id: 'categories', label: 'Kategori & Etalase', icon: Tags, href: '/admin/categories' },
            { id: 'transactions', label: 'Transaksi Marketplace', icon: ShoppingCart, href: '/admin/transactions', badge: '12', badgeColor: 'bg-rose-500' },
        ]
    },
    {
        title: "ADVERTISING",
        items: [
            { id: 'ads-moderation', label: 'Moderasi Iklan Masuk', icon: Megaphone, href: '/admin/ads/moderation', badge: '5', badgeColor: 'bg-amber-500' },
            { id: 'ads-packages', label: 'Kelola Paket Iklan', icon: Layers, href: '/admin/ads/packages' },
            { id: 'ads-reports', label: 'Laporan Klik & Tayang', icon: MousePointerClick, href: '/admin/ads/reports' },
        ]
    },
    {
        title: "PENGGUNA & VENDOR",
        items: [
            { id: 'customers', label: 'Kelola Customer', icon: Users, href: '/admin/customers' },
            { id: 'merchants', label: 'Verifikasi Merchant/Toko', icon: Store, href: '/admin/merchants', badge: '3', badgeColor: 'bg-amber-500' },
        ]
    },
    {
        title: "KEUANGAN",
        items: [
            { id: 'payouts', label: 'Penarikan Dana / Payouts', icon: Wallet, href: '/admin/finance/payouts' },
            { id: 'commissions', label: 'Komisi & Fee Platform', icon: Percent, href: '/admin/finance/commissions' },
        ]
    },
    {
        title: "SISTEM",
        items: [
            { id: 'settings', label: 'Pengaturan Web', icon: Settings, href: '/admin/settings' },
            { id: 'logs', label: 'Log Aktivitas', icon: Activity, href: '/admin/logs' },
        ]
    }
];

// --- 1. SidebarLogo ---
const SidebarLogo = () => (
    <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">ADMS</h1>
            <p className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mt-0.5">Superadmin</p>
        </div>
    </div>
);

// --- 2. SidebarMenuItem ---
const SidebarMenuItem = ({ item, isActive, onClick }) => {
    const Icon = item.icon;
    
    return (
        <button
            onClick={() => onClick(item.id)}
            className={`w-full flex items-center justify-between px-6 py-3 transition-all duration-200 group ${
                isActive 
                    ? 'bg-[#15132b] border-l-4 border-indigo-500 text-indigo-400' 
                    : 'border-l-4 border-transparent text-slate-200 hover:bg-slate-800/50 hover:text-white'
            }`}
        >
            <div className="flex items-center gap-4">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-sm ${isActive ? 'font-bold' : 'font-bold'}`}>
                    {item.label}
                </span>
            </div>
            
            {item.badge && (
                <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full ${item.badgeColor || 'bg-indigo-500'} shadow-sm`}>
                    {item.badge}
                </span>
            )}
        </button>
    );
};

// --- 3. SidebarMenuGroup ---
const SidebarMenuGroup = ({ group, activeItem, onNavigate }) => (
    <div className="mb-6">
        <h3 className="px-6 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {group.title}
        </h3>
        <div className="space-y-0.5">
            {group.items.map((item) => (
                <SidebarMenuItem 
                    key={item.id} 
                    item={item} 
                    isActive={activeItem === item.id} 
                    onClick={onNavigate} 
                />
            ))}
        </div>
    </div>
);

// --- 4. SidebarUserProfile ---
const SidebarUserProfile = ({ user, onLogout }) => {
    const userName = user?.name || 'Administrator';
    const userRole = user?.role === 'admin' ? 'System Admin' : (user?.role || 'User');
    const encodedName = encodeURIComponent(userName);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=4f46e5&color=fff&bold=true`;

    return (
        <div className="p-4 mt-auto border-t border-slate-800/60 bg-slate-900/30">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="relative">
                    <img 
                        src={avatarUrl} 
                        alt={`${userName} Avatar`} 
                        className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{userName}</p>
                    <p className="text-xs text-slate-400 truncate capitalize">{userRole}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-300 bg-slate-800/50 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700/50 transition-all duration-200"
            >
                <LogOut className="w-4 h-4" />
                <span>Keluar Sistem</span>
            </button>
        </div>
    );
};

// --- 5. AdminSidebar (Parent Component) ---
export default function AdminSidebar({ activeItem = 'dashboard', onNavigate, user, onLogout }) {
    const handleNavigate = (id) => {
        if (onNavigate) {
            onNavigate(id);
        }
    };

    return (
        <aside className="w-72 h-screen bg-slate-950 border-r border-slate-800/60 flex flex-col shrink-0">
            {/* Header / Logo */}
            <SidebarLogo />

            {/* Menu List dengan Custom Scrollbar Hiding tapi tetap bisa di-scroll */}
            <div className="flex-1 overflow-y-auto py-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {menuGroups.map((group, index) => (
                    <SidebarMenuGroup 
                        key={index} 
                        group={group} 
                        activeItem={activeItem} 
                        onNavigate={handleNavigate} 
                    />
                ))}
            </div>

            {/* User Profile Footer */}
            <SidebarUserProfile user={user} onLogout={onLogout} />

            {/* Global style untuk menyembunyikan scrollbar di webkit browser (opsional) */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </aside>
    );
}
