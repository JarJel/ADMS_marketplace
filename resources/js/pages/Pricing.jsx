import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const Pricing = (props) => {
    const { 
        darkMode, setDarkMode, onNavigate, cartCount, wishlistCount, 
        user, token, notifications, onLogout, setNotifications 
    } = props;

    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleSelectPackage = (pkg) => {
        if (!token) {
            setShowAuthModal(true);
            return;
        }
        const pkgItem = {
            id: 'pkg_' + pkg.originalData.id,
            isPackage: true,
            product: {
                id: pkg.originalData.id,
                title: 'Paket Iklan Premium: ' + pkg.originalData.name,
                price: pkg.originalData.price,
                isPackage: true,
                duration: pkg.originalData.duration_days,
                benefits: pkg.originalData.benefits
            },
            quantity: 1,
            price: pkg.originalData.price
        };
        localStorage.setItem('adms_checkout_items', JSON.stringify([pkgItem]));
        localStorage.setItem('adms_checkout_discount', '0');
        onNavigate('checkout', '/checkout');
    };

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/public/packages')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const colors = [
                        'from-blue-500 to-cyan-400', 
                        'from-purple-600 to-indigo-500', 
                        'from-amber-400 to-orange-500'
                    ];
                    
                    const mappedPackages = data.data.map((pkg, index) => ({
                        id: pkg.id,
                        name: pkg.name,
                        price: 'Rp ' + Number(pkg.price).toLocaleString('id-ID'),
                        duration: pkg.duration_days + ' Hari',
                        description: pkg.description || `Paket langganan ${pkg.name} untuk meningkatkan penjualan Anda.`,
                        features: pkg.benefits || [],
                        recommended: index === 1 || data.data.length === 1,
                        color: colors[index % colors.length],
                        originalData: pkg
                    }));
                    setPackages(mappedPackages);
                }
            })
            .catch(err => console.error('Failed to fetch packages:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col font-sans">
            <Navbar 
                darkMode={darkMode} setDarkMode={setDarkMode}
                onNavigate={onNavigate}
                cartCount={cartCount} wishlistCount={wishlistCount}
                user={user} token={token} notifications={notifications}
                onLogout={onLogout}
                setNotifications={setNotifications}
                currentView="pricing"
            />

            <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-6 animate-pulse-slow">
                            Tingkatkan Penjualan Anda
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Pilih paket promosi yang sesuai dengan kebutuhan bisnis Anda. Jangkau lebih banyak pembeli potensial dan jadikan iklan Anda pusat perhatian.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className={`grid gap-8 max-w-6xl mx-auto items-center ${packages.length === 1 ? 'md:grid-cols-1 max-w-md' : packages.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3'}`}>
                            {packages.map((pkg) => (
                                <div 
                                    key={pkg.id} 
                                    className={`relative rounded-3xl p-1 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${pkg.recommended ? 'bg-gradient-to-br ' + pkg.color + ' md:-mt-8 md:mb-8 z-10' : 'bg-gray-200 dark:bg-gray-800'}`}
                                >
                                {pkg.recommended && (
                                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                                            Paling Laris
                                        </span>
                                    </div>
                                )}
                                
                                <div className="h-full rounded-[23px] bg-white dark:bg-gray-800 p-8 flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">{pkg.description}</p>
                                    
                                    <div className="mb-6">
                                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{pkg.price}</span>
                                        <span className="text-gray-500 dark:text-gray-400">/{pkg.duration}</span>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {pkg.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <svg className={`w-5 h-5 mr-3 shrink-0 ${pkg.recommended ? 'text-purple-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                </svg>
                                                <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button 
                                        className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ${pkg.recommended ? 'bg-gradient-to-r ' + pkg.color + ' text-white hover:opacity-90 shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                        onClick={() => handleSelectPackage(pkg)}
                                    >
                                        Pilih Paket
                                    </button>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Auth Required Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up text-center border-t-4 border-indigo-500">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Login Diperlukan</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Anda harus masuk ke akun Anda terlebih dahulu untuk membeli dan mengelola paket promosi iklan.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button 
                                onClick={() => { setShowAuthModal(false); onNavigate('login', '/login'); }}
                                className="flex-1 py-3 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                            >
                                Login Sekarang
                            </button>
                            <button 
                                onClick={() => { setShowAuthModal(false); onNavigate('register', '/register'); }}
                                className="flex-1 py-3 px-6 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-all active:scale-95"
                            >
                                Daftar Baru
                            </button>
                        </div>
                        <button 
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pricing;
