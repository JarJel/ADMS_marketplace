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
import Checkout from './pages/Customer/Checkout';
import AdmsChatWidget from './components/Chatbot/AdmsChatWidget';
import LegalPage from './pages/LegalPage';
import Pricing from './pages/Pricing';

function App() {
    const [token, setToken] = useState(localStorage.getItem('auth_token'));
    const [user, setUser] = useState(null);
    const [view, setView] = useState('homepage'); 
    const [productFilter, setProductFilter] = useState('all');
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [merchantFilterId, setMerchantFilterId] = useState('');
    const [dashboardTab, setDashboardTab] = useState('overview');
    
    // Counts and lists for dynamic Navbar
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Fetch counts and notifications dynamically
    useEffect(() => {
        if (!token) {
            const guestCart = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
            const guestWishlist = JSON.parse(localStorage.getItem('adms_guest_wishlist') || '[]');
            setCartCount(guestCart.length);
            setWishlistCount(guestWishlist.length);
            setNotifications([]);
            return;
        }

        const fetchNavbarCounts = async () => {
            try {
                const guestCart = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
                const guestWishlist = JSON.parse(localStorage.getItem('adms_guest_wishlist') || '[]');

                // Fetch Cart
                const cartRes = await fetch('/api/customer/cart', { headers: { 'Authorization': `Bearer ${token}` } });
                const cartData = await cartRes.json();
                if (cartData.success && Array.isArray(cartData.data)) {
                    setCartCount(Math.max(cartData.data.length, guestCart.length));
                } else {
                    setCartCount(guestCart.length);
                }

                // Fetch Wishlist
                const wishlistRes = await fetch('/api/customer/wishlist', { headers: { 'Authorization': `Bearer ${token}` } });
                const wishlistData = await wishlistRes.json();
                if (wishlistData.success && Array.isArray(wishlistData.data)) {
                    setWishlistCount(Math.max(wishlistData.data.length, guestWishlist.length));
                } else {
                    setWishlistCount(guestWishlist.length);
                }

                // Fetch Notifications
                const notifRes = await fetch('/api/customer/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
                const notifData = await notifRes.json();
                if (notifData.success) setNotifications(notifData.data);
            } catch (err) {
            }
        };

        fetchNavbarCounts();
    }, [token, view]);

    const handleAddToCart = async (product) => {
        if (!product) return;
        const productId = product.id || product.product_id || Date.now();

        // 1. Always save product details to adms_guest_cart so title, price, thumbnail & merchant are always guaranteed
        const existingCart = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
        const existingIndex = existingCart.findIndex(item => (
            item.product_id === productId || 
            item.id === productId || 
            item.product?.id === productId
        ));

        const prodTitle = product.title || product.name || 'Produk Digital ADMS';
        const prodPrice = product.price || product.price_num || 0;
        const prodImg = product.image || product.thumbnail || product.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop';
        const merchantName = product.merchant?.name || product.merchant?.store_name || product.merchant || 'Merchant Verified ADMS';

        if (existingIndex > -1) {
            existingCart[existingIndex].quantity = (existingCart[existingIndex].quantity || 1) + 1;
        } else {
            existingCart.push({
                id: productId,
                product_id: productId,
                quantity: 1,
                product: {
                    id: productId,
                    title: prodTitle,
                    price: prodPrice,
                    thumbnail: prodImg,
                    image: prodImg,
                    merchant: { name: merchantName, store_name: merchantName }
                }
            });
        }
        localStorage.setItem('adms_guest_cart', JSON.stringify(existingCart));

        let apiCartCount = 0;
        if (token) {
            try {
                await fetch('/api/customer/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        quantity: 1
                    })
                });
                const cartRes = await fetch('/api/customer/cart', { headers: { 'Authorization': `Bearer ${token}` } });
                const cartData = await cartRes.json();
                if (cartData.success && Array.isArray(cartData.data)) {
                    apiCartCount = cartData.data.length;
                }
            } catch (err) {
            }
        }

        setCartCount(Math.max(apiCartCount, existingCart.length));
    };

    const handleToggleWishlist = async (productOrId) => {
        if (!productOrId) return;
        const prodId = typeof productOrId === 'object' ? (productOrId.id || productOrId.product_id) : productOrId;
        const guestWishlist = JSON.parse(localStorage.getItem('adms_guest_wishlist') || '[]');
        
        let updated = [];
        if (guestWishlist.includes(prodId)) {
            updated = guestWishlist.filter(id => id !== prodId);
        } else {
            updated = [...guestWishlist, prodId];
        }
        localStorage.setItem('adms_guest_wishlist', JSON.stringify(updated));

        let apiWishlistCount = 0;
        if (token) {
            try {
                await fetch('/api/customer/wishlist/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ product_id: prodId })
                });
                const wishlistRes = await fetch('/api/customer/wishlist', { headers: { 'Authorization': `Bearer ${token}` } });
                const wishlistData = await wishlistRes.json();
                if (wishlistData.success && Array.isArray(wishlistData.data)) {
                    apiWishlistCount = wishlistData.data.length;
                }
            } catch (err) {
            }
        }

        setWishlistCount(Math.max(apiWishlistCount, updated.length));
    };
    
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

    const routeByPath = (path, currentUser = user) => {
        if (path === '/login') {
            setView('login');
        } else if (path === '/register') {
            setView('register');
        } else if (path === '/customer' || path.startsWith('/customer/')) {
            const parts = path.split('/');
            if (parts.length > 2 && parts[2]) {
                setDashboardTab(parts[2]);
            } else {
                setDashboardTab('overview');
            }
            setView('customer_dashboard');
        } else if (path === '/merchant' || path.startsWith('/merchant/')) {
            setView('merchant_dashboard');
        } else if (path === '/admin' || path.startsWith('/admin/')) {
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
        } else if (path === '/checkout') {
            setView('checkout');
        } else if (path === '/pricing') {
            setView('pricing');
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
                    routeByPath(currentPath, data.data.user);
                }
            } else {
                localStorage.removeItem('auth_token');
                setToken(null);
                setUser(null);
                routeByPath(currentPath, null);
            }
        } catch (err) {
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
            routeByPath(currentPath, null);
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

    const handleNavigation = (targetView, filter = 'all', searchQuery = '', merchantId = '') => {
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
            setGlobalSearchQuery(searchQuery);
            setMerchantFilterId(merchantId);
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
        } else if (targetView === 'cart') {
            navigateTo('cart', '/cart');
        } else if (targetView === 'checkout') {
            navigateTo('checkout', '/checkout');
        } else if (targetView === 'package_checkout') {
            navigateTo('package_checkout', '/package-checkout');
        } else if (targetView === 'pricing') {
            navigateTo('pricing', '/pricing');
        } else if (targetView === 'wishlist') {
            setDashboardTab('wishlist');
            navigateTo('customer_dashboard', '/customer');
        } else if (targetView === 'dashboard') {
            setDashboardTab('overview');
            routeUser(user);
        } else if (targetView === 'customer_dashboard') {
            const tab = filter && filter !== 'all' ? filter : 'overview';
            setDashboardTab(tab);
            navigateTo('customer_dashboard', `/customer/${tab}`);
        } else if (targetView === 'merchant_dashboard') {
            setDashboardTab('overview');
            navigateTo('merchant_dashboard', '/merchant');
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
        setDarkMode,
        cartCount,
        wishlistCount,
        notifications,
        setNotifications,
        initialTab: dashboardTab,
        onAddToCart: handleAddToCart,
        onToggleWishlist: handleToggleWishlist,
        refreshSession: () => {
            if (token) checkSession(token, window.location.pathname);
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'customer_dashboard':
                return user ? <CustomerDashboard {...dashboardProps} /> : <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => navigateTo('register', '/register')} />;
            case 'merchant_dashboard':
                return user ? <MerchantDashboard {...dashboardProps} /> : <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => navigateTo('register', '/register')} />;
            case 'admin_dashboard':
                return user ? <AdminDashboard {...dashboardProps} /> : <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => navigateTo('register', '/register')} />;
            case 'create_ad':
                return <CreateAd {...dashboardProps} />;
            case 'help_center':
                return <HelpCenter {...dashboardProps} />;
            case 'classifieds':
                return <ClassifiedsCatalogView {...dashboardProps} />;
            case 'products':
                return <ProductsCatalogView {...dashboardProps} initialFilter={productFilter} initialSearchQuery={globalSearchQuery} initialMerchantId={merchantFilterId} />;
            case 'merchants':
                return <MerchantDirectoryView {...dashboardProps} />;
            case 'terms':
            case 'privacy':
            case 'refund':
            case 'advertising':
                return <LegalPage type={view} {...dashboardProps} />;
            case 'cart':
                return <Cart {...dashboardProps} />;
            case 'checkout':
                return <Checkout {...dashboardProps} />;
            case 'pricing':
                return <Pricing {...dashboardProps} />;
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
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        cartCount={cartCount}
                        wishlistCount={wishlistCount}
                        notifications={notifications}
                        setNotifications={setNotifications}
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
