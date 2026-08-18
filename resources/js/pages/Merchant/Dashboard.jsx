import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

export default function MerchantDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode, cartCount, wishlistCount, notifications }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [ads, setAds] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [bankName, setBankName] = useState('BSI');
    const [accName, setAccName] = useState('');
    const [accNumber, setAccNumber] = useState('');
    const [payoutMsg, setPayoutMsg] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (activeTab === 'overview') fetchDashboardData();
        if (activeTab === 'products') fetchProducts();
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'ads') fetchAds();
    }, [activeTab]);

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
            console.error("Gagal mengambil dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/merchant/products', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setProducts(data.data.data || data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/merchant/orders', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setOrders(data.data.data || data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/merchant/ads', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setAds(data.data.data || data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`/api/merchant/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchOrders();
        } catch (err) { console.error(err); }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
        try {
            const res = await fetch(`/api/merchant/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchProducts();
        } catch (err) { console.error(err); }
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
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Header */}
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout} 
                onNavigate={onNavigate}
                currentView="merchant_dashboard"
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                notifications={notifications}
            />

            {/* Dashboard Contents */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-extrabold text-white mb-2">Dasbor Penjual</h1>
                <p className="text-slate-400 mb-8 text-sm">Kelola penjualan syariah, produk digital, dan penarikan dana hasil usaha Anda.</p>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-800 mb-8 overflow-x-auto">
                    {['overview', 'products', 'orders', 'ads'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                                activeTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {tab === 'overview' ? 'Ringkasan' : tab === 'products' ? 'Produk' : tab === 'orders' ? 'Pesanan' : 'Iklan'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-slate-500 text-sm italic py-4 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : activeTab === 'overview' && stats ? (
                    <div className="space-y-8">
                        {/* Stats Cards grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                                <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Total Pendapatan Bersih</span>
                                <span className="text-3xl font-black text-white">Rp{numberFormat(stats.total_revenue)}</span>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                                <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Produk Aktif</span>
                                <span className="text-3xl font-black text-teal-400">{stats.total_active_products} Produk</span>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                                <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Status Pesanan Masuk</span>
                                <div className="flex gap-4 mt-1">
                                    <span className="text-sm text-slate-400">
                                        Pending: <strong className="text-white">{stats.orders_stats.pending}</strong>
                                    </span>
                                    <span className="text-sm text-slate-400">
                                        Selesai: <strong className="text-emerald-400">{stats.orders_stats.completed}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* Payout Withdrawal Request Form */}
                            <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                                <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                                    💸 Tarik Dana Hasil Penjualan
                                </h2>

                                {payoutMsg && (
                                    <div className={`mb-6 p-4 rounded-lg text-sm border ${
                                        payoutMsg.type === 'success' 
                                            ? 'bg-emerald-950/50 border-emerald-800/40 text-emerald-400' 
                                            : 'bg-red-950/50 border-red-800/40 text-red-400'
                                    }`}>
                                        {payoutMsg.text}
                                    </div>
                                )}

                                <form onSubmit={handlePayoutRequest} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Nama Bank</label>
                                            <select 
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                                                <option value="Muamalat">Bank Muamalat</option>
                                                <option value="BCA Syariah">BCA Syariah</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Jumlah Tarik (Rp)</label>
                                            <input 
                                                type="number"
                                                required
                                                min="10000"
                                                placeholder="Contoh: 100000"
                                                value={payoutAmount}
                                                onChange={(e) => setPayoutAmount(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Nama Rekening</label>
                                            <input 
                                                type="text"
                                                required
                                                placeholder="Contoh: Haji Ahmad"
                                                value={accName}
                                                onChange={(e) => setAccName(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Nomor Rekening</label>
                                            <input 
                                                type="text"
                                                required
                                                placeholder="Contoh: 7001234567"
                                                value={accNumber}
                                                onChange={(e) => setAccNumber(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors active:scale-[0.98]"
                                    >
                                        {submitting ? 'Mengirim Pengajuan...' : 'Ajukan Penarikan Sekarang'}
                                    </button>
                                </form>
                            </div>

                            {/* Reviews list */}
                            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-slate-200 mb-4">Ulasan Pelanggan</h3>
                                {stats.recent_reviews.length === 0 ? (
                                    <div className="text-xs text-slate-500 italic">Belum ada ulasan untuk toko Anda.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {stats.recent_reviews.map((rev) => (
                                            <div key={rev.id} className="border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-center text-xs mb-1">
                                                    <span className="font-semibold text-slate-300">{rev.user.name}</span>
                                                    <span className="text-yellow-400">{'⭐'.repeat(rev.rating)}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 italic">"{rev.comment}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                ) : activeTab === 'products' ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Kelola Produk Digital</h2>
                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2 px-4 rounded-lg">
                                + Tambah Produk
                            </button>
                        </div>
                        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-950 text-slate-300 font-bold uppercase text-[10px]">
                                    <tr>
                                        <th className="px-6 py-4 border-b border-slate-800">Produk</th>
                                        <th className="px-6 py-4 border-b border-slate-800">Harga</th>
                                        <th className="px-6 py-4 border-b border-slate-800">Stok</th>
                                        <th className="px-6 py-4 border-b border-slate-800">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                            <td className="px-6 py-4 font-bold text-slate-200">{p.title}</td>
                                            <td className="px-6 py-4">Rp{p.price.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4">{p.stock}</td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <button className="text-indigo-400 hover:text-indigo-300">Edit</button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-300">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'orders' ? (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white mb-4">Pesanan Masuk</h2>
                        <div className="space-y-4">
                            {orders.map(o => (
                                <div key={o.id} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-slate-200">{o.order_number}</h4>
                                        <p className="text-xs text-slate-400 mt-1">Status: <span className="uppercase text-amber-400">{o.status}</span></p>
                                        <p className="text-sm mt-2 text-indigo-400 font-bold">Total: Rp{parseFloat(o.total_amount).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="space-x-2">
                                        {o.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleUpdateOrderStatus(o.id, 'completed')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg">Terima & Selesaikan</button>
                                                <button onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg">Tolak</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'ads' ? (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white mb-4">Iklan Baris Anda</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ads.map(ad => (
                                <div key={ad.id} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                                    <h4 className="font-bold text-slate-200 mb-2">{ad.title}</h4>
                                    <span className="inline-block px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 uppercase">{ad.status}</span>
                                    <div className="mt-4 flex gap-4 text-xs text-slate-400">
                                        <span>Views: <strong className="text-white">{ad.views_count}</strong></span>
                                        <span>Clicks: <strong className="text-white">{ad.clicks_count}</strong></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 text-sm italic py-4">Tidak ada data.</div>
                )}
            </main>
        </div>
    );
}

function numberFormat(val) {
    return new Intl.NumberFormat('id-ID').format(val);
}
