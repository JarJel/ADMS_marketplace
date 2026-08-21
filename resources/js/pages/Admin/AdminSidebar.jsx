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
    ShieldCheck,
    X
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
            { id: 'package-subscriptions', label: 'Verifikasi Berlangganan', icon: ShieldCheck, href: '/admin/ads/subscriptions' },
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
    <div className="flex flex-col px-6 py-5 border-b border-[#174256]/80 bg-[#071922]/50">
        <div className="flex items-center gap-2.5">
            <img 
                src="/assets/Images/adms-symbol.png" 
                alt="ADMS Symbol" 
                className="h-9 w-auto object-contain drop-shadow-md"
            />
            <img 
                src="/assets/Images/adms-text.png" 
                alt="ADMS Text" 
                className="h-6 w-auto object-contain invert mix-blend-screen"
            />
        </div>
        <p className="text-[10px] font-black text-[#FFBF00] tracking-widest uppercase mt-1.5 pl-0.5">
            SUPERADMIN PANEL
        </p>
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
                    ? 'bg-[#071922] border-l-4 border-[#FFBF00] text-[#FFBF00] font-bold shadow-inner' 
                    : 'border-l-4 border-transparent text-slate-200 hover:bg-[#174256]/50 hover:text-[#FFBF00]'
            }`}
        >
            <div className="flex items-center gap-4">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FFBF00]' : 'text-slate-300 group-hover:text-[#FFBF00]'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-sm ${isActive ? 'font-black' : 'font-semibold'}`}>
                    {item.label}
                </span>
            </div>
            
            {item.badge && (
                <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-black rounded-full bg-[#FFBF00] text-[#0F3040] shadow-sm`}>
                    {item.badge}
                </span>
            )}
        </button>
    );
};

// --- 3. SidebarMenuGroup ---
const SidebarMenuGroup = ({ group, activeItem, onNavigate }) => (
    <div className="mb-6">
        <h3 className="px-6 mb-2 text-[10px] font-black text-[#FFBF00]/80 uppercase tracking-widest">
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
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=FFBF00&color=0F3040&bold=true`;

    return (
        <div className="p-4 mt-auto border-t border-[#174256]/80 bg-[#071922]/80">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="relative">
                    <img 
                        src={avatarUrl} 
                        alt={`${userName} Avatar`} 
                        className="w-10 h-10 rounded-full border-2 border-[#FFBF00] object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0F3040] rounded-full"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{userName}</p>
                    <p className="text-xs text-[#FFBF00]/80 truncate font-semibold capitalize">{userRole}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#071922] hover:bg-[#FFBF00] hover:text-[#0F3040] border border-[#174256] transition-all duration-200"
            >
                <LogOut className="w-4 h-4" />
                <span>Keluar Sistem</span>
            </button>
        </div>
    );
};

// --- 5. AdminSidebar (Parent Component) ---
export default function AdminSidebar({ activeItem = 'dashboard', onNavigate, user, onLogout, pendingCounts = {}, isMobileOpen = false, onCloseMobile }) {
    const handleNavigate = (id) => {
        if (onNavigate) onNavigate(id);
        if (onCloseMobile) onCloseMobile();
    };

    const dynamicGroups = menuGroups.map(group => ({
        ...group,
        items: group.items.map(item => {
            const countMap = {
                merchants: pendingCounts.pendingMerchants,
                'ads-moderation': pendingCounts.pendingAds,
                transactions: pendingCounts.pendingTransactions,
            };
            const count = countMap[item.id];
            return count != null
                ? { ...item, badge: count > 0 ? String(count) : undefined }
                : item;
        }),
    }));

    return (
        <>
            {/* Desktop Sidebar (visible on lg screens) */}
            <aside className="hidden lg:flex w-72 h-screen bg-[#0F3040] border-r border-[#174256]/80 flex-col shrink-0 text-white shadow-2xl">
                <SidebarLogo />
                <div className="flex-1 overflow-y-auto py-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {dynamicGroups.map((group, index) => (
                        <SidebarMenuGroup
                            key={index}
                            group={group}
                            activeItem={activeItem}
                            onNavigate={handleNavigate}
                        />
                    ))}
                </div>
                <SidebarUserProfile user={user} onLogout={onLogout} />
            </aside>

            {/* Mobile Sidebar Overlay & Drawer */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" onClick={onCloseMobile} />
                    <aside className="relative w-80 max-w-[85vw] h-full bg-[#0F3040] border-r border-[#174256] flex flex-col text-white shadow-2xl z-10">
                        <div className="flex items-center justify-between pr-4">
                            <SidebarLogo />
                            <button 
                                onClick={onCloseMobile} 
                                className="p-2 rounded-xl text-slate-300 hover:text-white bg-[#071922] hover:bg-[#174256] border border-[#174256] transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {dynamicGroups.map((group, index) => (
                                <SidebarMenuGroup
                                    key={index}
                                    group={group}
                                    activeItem={activeItem}
                                    onNavigate={handleNavigate}
                                />
                            ))}
                        </div>
                        <SidebarUserProfile user={user} onLogout={onLogout} />
                    </aside>
                </div>
            )}
        </>
    );
}
