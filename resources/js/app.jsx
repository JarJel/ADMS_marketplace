import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../css/app.css';
import Homepage from './pages/Homepage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import CustomerDashboard from './pages/Customer/Dashboard';
import MerchantDashboard from './pages/Merchant/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import CreateAd from './pages/CreateAd';
import ClassifiedsCatalogView from './pages/ClassifiedsCatalogView';
import ProductsCatalogView from './pages/ProductsCatalogView';
import MerchantDirectoryView from './pages/MerchantDirectoryView';
import Toast from './components/Toast';
import HelpCenter from './pages/HelpCenter';
import Cart from './pages/Customer/Cart';
import AdmsChatWidget from './components/Chatbot/AdmsChatWidget';
import LegalPage from './pages/LegalPage';

function App() {
    const [token, setToken] = useState(localStorage.getItem('auth_token'));
    const [user, setUser] = useState(null);
    const [view, setView] = useState('homepage'); 
    const [productFilter, setProductFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    
    // Toast notification state
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    // Sync dark mode state with HTML element
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Initial routing based on browser path on load
    useEffect(() => {
        const path = window.location.pathname;
        if (token) {
            checkSession(token, path);
        } else {
            routeByPath(path);
            setLoading(false);
        }
    }, [token]);

    // History API popstate listener (for back/forward buttons)
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            routeByPath(path);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const routeByPath = (path) => {
        if (path === '/login') {
            setView('login');
        } else if (path === '/register') {
            setView('register');
        } else if (path === '/customer') {
            setView('customer_dashboard');
        } else if (path === '/merchant') {
            setView('merchant_dashboard');
        } else if (path === '/admin') {
            setView('admin_dashboard');
        } else if (path === '/pasang-iklan') {
            setView('create_ad');
        } else if (path === '/iklan-gratis') {
            setView('classifieds');
        } else if (path === '/produk' || path === '/products') {
            setView('products');
        } else if (path === '/merchants') {
            setView('merchants');
        } else if (path === '/cart') {
            setView('cart');
        } else if (path === '/terms-and-conditions') {
            setView('terms');
        } else if (path === '/privacy-policy') {
            setView('privacy');
        } else if (path === '/refund-policy') {
            setView('refund');
        } else if (path === '/advertising-policy') {
            setView('advertising');
        } else if (path === '/help' || path === '/bantuan') {
            setView('help_center');
        } else {
            setView('homepage');
        }
    };

    const navigateTo = (newView, path) => {
        window.history.pushState(null, '', path);
        setView(newView);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const checkSession = async (authToken, currentPath) => {
        try {
            const response = await fetch('/api/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data.user);
                
                // If on home/login page, route them to dashboard, otherwise let them stay on their current deep path
                if (currentPath === '/' || currentPath === '/login') {
                    routeUser(data.data.user);
                } else {
                    routeByPath(currentPath);
                }
            } else {
                handleLogout();
            }
        } catch (err) {
            console.error("Gagal memeriksa sesi login:", err);
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const routeUser = (userRecord) => {
        if (!userRecord) return;
        if (userRecord.role === 'admin') {
            navigateTo('admin_dashboard', '/admin');
        } else if (userRecord.role === 'merchant') {
            navigateTo('merchant_dashboard', '/merchant');
        } else {
            navigateTo('customer_dashboard', '/customer');
        }
    };

    const handleNavigation = (targetView, filter = 'all') => {
        if (targetView === 'homepage') {
            navigateTo('homepage', '/');
        } else if (targetView === 'login') {
            navigateTo('login', '/login');
        } else if (targetView === 'register') {
            navigateTo('register', '/register');
        } else if (targetView === 'classifieds') {
            navigateTo('classifieds', '/iklan-gratis');
        } else if (targetView === 'products') {
            setProductFilter(filter);
            navigateTo('products', '/produk');
        } else if (targetView === 'merchants') {
            navigateTo('merchants', '/merchants');
        } else if (targetView === 'create_ad') {
            navigateTo('create_ad', '/pasang-iklan');
        } else if (targetView === 'help_center') {
            navigateTo('help_center', '/bantuan');
        } else if (targetView === 'terms') {
            navigateTo('terms', '/terms-and-conditions');
        } else if (targetView === 'privacy') {
            navigateTo('privacy', '/privacy-policy');
        } else if (targetView === 'refund') {
            navigateTo('refund', '/refund-policy');
        } else if (targetView === 'advertising') {
            navigateTo('advertising', '/advertising-policy');
        } else if (targetView === 'dashboard') {
            routeUser(user);
        }
    };

    const handleLoginSuccess = (authToken, userRecord) => {
        setToken(authToken);
        setUser(userRecord);
        navigateTo('homepage', '/');
        setToastMessage('Login Berhasil!');
        setToastType('success');
    };

    const handleLogout = async () => {
        if (token) {
            try {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            } catch (err) {
                console.error("Logout request failed:", err);
            }
        }
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        navigateTo('homepage', '/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
                <div className="text-center">
                    <span className="block w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></span>
                    <p className="text-sm">Menghubungkan ke platform ADMS...</p>
                </div>
            </div>
        );
    }

    // Common props for dashboards
    const dashboardProps = {
        user,
        token,
        onLogout: handleLogout,
        onNavigate: handleNavigation,
        darkMode,
        setDarkMode
    };

    const renderContent = () => {
        switch (view) {
            case 'customer_dashboard':
                return <CustomerDashboard {...dashboardProps} />;
            case 'merchant_dashboard':
                return <MerchantDashboard {...dashboardProps} />;
            case 'admin_dashboard':
                return <AdminDashboard {...dashboardProps} />;
            case 'create_ad':
                return <CreateAd {...dashboardProps} />;
            case 'help_center':
                return <HelpCenter {...dashboardProps} />;
            case 'classifieds':
                return <ClassifiedsCatalogView {...dashboardProps} />;
            case 'products':
                return <ProductsCatalogView {...dashboardProps} initialFilter={productFilter} />;
            case 'merchants':
                return <MerchantDirectoryView {...dashboardProps} />;
            case 'terms':
            case 'privacy':
            case 'refund':
            case 'advertising':
                return <LegalPage type={view} {...dashboardProps} />;
            case 'login':
                return (
                    <Login 
                        onLoginSuccess={handleLoginSuccess} 
                        onNavigateToRegister={() => navigateTo('register', '/register')}
                    />
                );
            case 'register':
                return (
                    <Register 
                        onRegisterSuccess={() => {
                            setToastMessage('Registrasi Berhasil! Silakan masuk.');
                            setToastType('success');
                            navigateTo('login', '/login');
                        }}
                        onNavigateToLogin={() => navigateTo('login', '/login')}
                    />
                );
            case 'homepage':
            default:
                return (
                    <Homepage 
                        isLoggedIn={!!token} 
                        user={user} 
                        token={token}
                        onNavigateToLogin={() => navigateTo('login', '/login')} 
                        onNavigateToRegister={() => navigateTo('register', '/register')} 
                        onNavigateToDashboard={() => routeUser(user)} 
                        onNavigateToCreateAd={() => navigateTo('create_ad', '/pasang-iklan')}
                        onNavigateToClassifieds={() => navigateTo('classifieds', '/iklan-gratis')}
                        onNavigateToProducts={() => navigateTo('products', '/produk')}
                        onNavigate={handleNavigation}
                        onLogout={handleLogout}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                    />
                );
        }
    };

    return (
        <>
            <Toast 
                message={toastMessage} 
                type={toastType} 
                onClose={() => setToastMessage('')} 
            />
            {renderContent()}
            <AdmsChatWidget darkMode={darkMode} />
        </>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
