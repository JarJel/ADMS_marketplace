import React, { useState } from 'react';
import { 
    LayoutDashboard, ShoppingBag, Download, Megaphone, Heart, Settings
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from './components/Sidebar';
import OverviewTab from './components/OverviewTab';
import PurchasesTab from './components/PurchasesTab';
import DownloadsTab from './components/DownloadsTab';
import AdsTab from './components/AdsTab';
import WishlistTab from './components/WishlistTab';
import SettingsTab from './components/SettingsTab';

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
                    
                    <Sidebar 
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onLogout={onLogout}
                        profileName={profileName}
                        setSaveSuccess={setSaveSuccess}
                        menuItems={menuItems}
                    />

                    {/* B. Area Konten Kanan */}
                    <div className="md:col-span-3">
                        
                        {activeTab === 'overview' && (
                            <OverviewTab 
                                profileName={profileName}
                                today={today}
                                purchases={purchases}
                                setActiveTab={setActiveTab}
                                formatCurrency={formatCurrency}
                            />
                        )}

                        {activeTab === 'purchases' && (
                            <PurchasesTab 
                                purchases={purchases}
                                formatCurrency={formatCurrency}
                            />
                        )}

                        {activeTab === 'downloads' && (
                            <DownloadsTab 
                                downloads={downloads}
                            />
                        )}

                        {activeTab === 'ads' && (
                            <AdsTab 
                                advertisements={advertisements}
                                onNavigate={onNavigate}
                            />
                        )}

                        {activeTab === 'wishlist' && (
                            <WishlistTab 
                                wishlist={wishlist}
                                formatCurrency={formatCurrency}
                                handleRemoveFromWishlist={handleRemoveFromWishlist}
                            />
                        )}

                        {activeTab === 'settings' && (
                            <SettingsTab 
                                profileName={profileName}
                                setProfileName={setProfileName}
                                profilePhone={profilePhone}
                                setProfilePhone={setProfilePhone}
                                profileEmail={profileEmail}
                                setProfileEmail={setProfileEmail}
                                oldPassword={oldPassword}
                                setOldPassword={setOldPassword}
                                newPassword={newPassword}
                                setNewPassword={setNewPassword}
                                confirmPassword={confirmPassword}
                                setConfirmPassword={setConfirmPassword}
                                saveSuccess={saveSuccess}
                                handleProfileSave={handleProfileSave}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
