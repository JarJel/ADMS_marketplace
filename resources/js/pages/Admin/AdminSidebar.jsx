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
    ChevronDown,
    Menu
} from 'lucide-react';

/**
 * Komponen: SidebarLogo
 * Fungsi: Menampilkan logo/nama aplikasi di pojok kiri atas
 */
const SidebarLogo = () => (
    <div className="h-16 flex items-center px-6 border-b border-slate-800/50 shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-lg leading-none">A</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">ADMS Admin</span>
        </div>
    </div>
);

/**
 * Komponen: SidebarMenuItem
 * Fungsi: Menampilkan individual link menu dengan support icon, badge, dan active state
 */
const SidebarMenuItem = ({ icon: Icon, label, isActive, badgeCount, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg mb-1 transition-all duration-200 group ${
                isActive 
                    ? 'bg-indigo-600/10 border-l-4 border-indigo-500 text-indigo-400' 
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent'
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badgeCount && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-500/20 text-pink-400 rounded-full border border-pink-500/20">
                    {badgeCount}
                </span>
            )}
        </button>
    );
};

/**
 * Komponen: SidebarMenuGroup
 * Fungsi: Mengelompokkan menu berdasarkan label kategori
 */
const SidebarMenuGroup = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            {title}
        </h3>
        <div className="px-3">
            {children}
        </div>
    </div>
);

/**
 * Komponen: SidebarUserProfile
 * Fungsi: Menampilkan profil superadmin dan tombol logout di bagian bawah sidebar
 */
const SidebarUserProfile = () => (
    <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <div className="relative">
                <img 
                    src="https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff" 
                    alt="Superadmin" 
                    className="w-10 h-10 rounded-full border-2 border-slate-700 group-hover:border-indigo-500 transition-colors"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Super Admin</p>
                <p className="text-xs text-slate-400 truncate">System Administrator</p>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
            </button>
        </div>
    </div>
);

/**
 * Komponen Induk: AdminSidebar
 */
export default function AdminSidebar({ isMobileOpen, setMobileOpen }) {
    // State untuk demo active menu
    const [activeMenu, setActiveMenu] = useState('Dashboard');

    // Data konfigurasi Menu (Array of Objects)
    const menuData = [
        {
            groupName: "Overview",
            items: [
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "analytics", label: "Analytics & Laporan", icon: BarChart3 }
            ]
        },
        {
            groupName: "Marketplace",
            items: [
                { id: "kelola_produk", label: "Kelola Produk Digital", icon: Package },
                { id: "kategori", label: "Kategori & Etalase", icon: Tags },
                { id: "transaksi", label: "Transaksi Marketplace", icon: ShoppingCart, badgeCount: "12" }
            ]
        },
        {
            groupName: "Advertising",
            items: [
                { id: "moderasi_iklan", label: "Moderasi Iklan Masuk", icon: Megaphone, badgeCount: "5" },
                { id: "paket_iklan", label: "Kelola Paket Iklan", icon: Layers },
                { id: "laporan_iklan", label: "Laporan Klik & Tayang", icon: MousePointerClick }
            ]
        },
        {
            groupName: "Pengguna & Vendor",
            items: [
                { id: "customers", label: "Kelola Customer", icon: Users },
                { id: "verifikasi", label: "Verifikasi Merchant", icon: Store, badgeCount: "3" }
            ]
        },
        {
            groupName: "Keuangan",
            items: [
                { id: "payouts", label: "Penarikan Dana", icon: Wallet },
                { id: "fee", label: "Komisi & Fee Platform", icon: Percent }
            ]
        },
        {
            groupName: "Sistem",
            items: [
                { id: "settings", label: "Pengaturan Web", icon: Settings },
                { id: "log", label: "Log Aktivitas", icon: Activity }
            ]
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside 
                className={`fixed top-0 left-0 z-50 h-screen w-72 bg-slate-950 border-r border-slate-800/60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <SidebarLogo />

                {/* Menu Scroll Area - hide scrollbar but allow scrolling */}
                <div className="flex-1 overflow-y-auto py-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`
                        .flex-1.overflow-y-auto::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    
                    {menuData.map((group, index) => (
                        <SidebarMenuGroup key={index} title={group.groupName}>
                            {group.items.map((item) => (
                                <SidebarMenuItem
                                    key={item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    badgeCount={item.badgeCount}
                                    isActive={activeMenu === item.label}
                                    onClick={() => setActiveMenu(item.label)}
                                />
                            ))}
                        </SidebarMenuGroup>
                    ))}
                </div>

                <SidebarUserProfile />
            </aside>
        </>
    );
}
