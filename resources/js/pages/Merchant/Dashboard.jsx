import React, { useEffect, useState } from 'react';
import MerchantLayout from '../../components/MerchantDashboard/MerchantLayout';
import OverviewTab from '../../components/MerchantDashboard/OverviewTab';
import ProductsTab from '../../components/MerchantDashboard/ProductsTab';
import OrdersTab from '../../components/MerchantDashboard/OrdersTab';
import OrderHistoryTab from '../../components/MerchantDashboard/OrderHistoryTab';
import AdsTab from '../../components/MerchantDashboard/AdsTab';

export default function MerchantDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode }) {
    const getInitialTab = () => {
        const path = window.location.pathname;
        if (path === '/merchant/products') return 'products';
        if (path === '/merchant/orders') return 'orders';
        if (path === '/merchant/history') return 'history';
        if (path === '/merchant/ads') return 'ads';
        return 'overview';
    };

    const [activeTab, setActiveTabState] = useState(getInitialTab());

    useEffect(() => {
        const handlePopState = () => {
            setActiveTabState(getInitialTab());
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        const newPath = tab === 'overview' ? '/merchant' : `/merchant/${tab}`;
        window.history.pushState(null, '', newPath);
    };
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [ads, setAds] = useState([]);
    const [packageSubscriptions, setPackageSubscriptions] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [bankName, setBankName] = useState('BSI');
    const [accName, setAccName] = useState('');
    const [accNumber, setAccNumber] = useState('');
    const [payoutMsg, setPayoutMsg] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchDashboardData();
            fetchPackageSubscriptions();
        }
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'history') fetchHistoryOrders();
        if (activeTab === 'ads') {
            fetchAds();
            fetchPackageSubscriptions();
        }
    }, [activeTab]);

    // Fetch incoming orders on initial load for notifications
    useEffect(() => {
        if (activeTab !== 'orders') fetchOrders();
        fetchPackageSubscriptions();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/merchant/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setStats(data.data);
            }
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const fetchPackageSubscriptions = async () => {
        try {
            const res = await fetch('/api/customer/package-subscriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPackageSubscriptions(data.data);
            }
        } catch (err) {}
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/merchant/products', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setProducts(data.data.data || data.data);
        } catch { } finally { setLoading(false); }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/merchant/orders', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) {
                // Only show active orders in OrdersTab (exclude completed/cancelled if desired, or let it show all non-completed)
                const activeOrders = (data.data.data || data.data).filter(o => o.status !== 'completed');
                setOrders(activeOrders);
            }
        } catch { } finally { setLoading(false); }
    };

    const fetchHistoryOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/merchant/orders?status=completed', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setHistoryOrders(data.data.data || data.data);
        } catch { } finally { setLoading(false); }
    };

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/merchant/ads', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setAds(data.data.data || data.data);
        } catch { } finally { setLoading(false); }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`/api/merchant/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchOrders();
        } catch { }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
        try {
            const res = await fetch(`/api/merchant/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchProducts();
        } catch { }
    };

    const handlePayoutRequest = async (e) => {
        e.preventDefault();
        setPayoutMsg(null);
        setSubmitting(true);

        try {
            const response = await fetch('/api/merchant/withdrawals', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseFloat(payoutAmount),
                    bank_name: bankName,
                    bank_account_name: accName,
                    bank_account_number: accNumber
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setPayoutMsg({ type: 'success', text: 'Permohonan penarikan dana berhasil diajukan!' });
                setPayoutAmount('');
                setAccName('');
                setAccNumber('');
                fetchDashboardData(); // Refresh balance stats
            } else {
                setPayoutMsg({ type: 'error', text: data.message || 'Gagal mengajukan penarikan dana.' });
            }
        } catch (err) {
            setPayoutMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MerchantLayout 
            user={user} 
            onLogout={onLogout} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            pendingOrders={orders}
            onNavigate={onNavigate}
        >
            {loading ? (
                <div className="flex justify-center items-center h-64 text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && (
                        <OverviewTab 
                            stats={stats}
                            payoutAmount={payoutAmount} setPayoutAmount={setPayoutAmount}
                            bankName={bankName} setBankName={setBankName}
                            accName={accName} setAccName={setAccName}
                            accNumber={accNumber} setAccNumber={setAccNumber}
                            payoutMsg={payoutMsg} submitting={submitting}
                            handlePayoutRequest={handlePayoutRequest}
                            packageSubscriptions={packageSubscriptions}
                        />
                    )}
                    
                    {activeTab === 'products' && (
                        <ProductsTab 
                            products={products}
                            handleDeleteProduct={handleDeleteProduct}
                            fetchProducts={fetchProducts}
                            token={token}
                        />
                    )}
                    
                    {activeTab === 'orders' && (
                        <OrdersTab 
                            orders={orders}
                            handleUpdateOrderStatus={handleUpdateOrderStatus}
                        />
                    )}

                    {activeTab === 'history' && (
                        <OrderHistoryTab 
                            historyOrders={historyOrders}
                        />
                    )}

                    {activeTab === 'ads' && (
                        <AdsTab 
                            ads={ads}
                            fetchAds={fetchAds}
                            token={token}
                            packageSubscriptions={packageSubscriptions}
                        />
                    )}
                </>
            )}
        </MerchantLayout>
    );
}
