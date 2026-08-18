import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminProducts } from './AdminProducts';

export default function AdminDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode, cartCount, wishlistCount, notifications }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pendingMerchants, setPendingMerchants] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [pendingAds, setPendingAds] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState(null);

    useEffect(() => {
        if (activeTab === 'dashboard' || activeTab === 'overview') {
            fetchAuditLogs();
            fetchPendingMerchants();
        } else if (activeTab === 'merchants') {
            fetchPendingMerchants();
        } else if (activeTab === 'products') {
            fetchPendingProducts();
        } else if (activeTab === 'ads' || activeTab === 'ads-moderation') {
            fetchPendingAds();
        } else if (activeTab === 'withdrawals' || activeTab === 'payouts') {
            fetchPendingWithdrawals();
        }
    }, [activeTab]);

    const fetchPendingMerchants = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/merchants/pending', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setPendingMerchants(data.data.data || data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchPendingProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/products/pending', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setPendingProducts(data.data.data || data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchPendingAds = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/ads/pending', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setPendingAds(data.data.data || data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchPendingWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/withdrawals/pending', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setPendingWithdrawals(data.data.data || data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/audit-logs', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setAuditLogs(data.data.data || data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleVerifyMerchant = async (id, approve) => {
        setActionMsg(null);
        try {
            const response = await fetch(`/api/admin/merchants/${id}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    status: approve ? 'VERIFIED' : 'REJECTED',
                    notes: approve ? 'Verifikasi disetujui via panel admin.' : 'Dokumen tidak valid.'
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setActionMsg({ type: 'success', text: `Toko "${data.data.name}" berhasil diverifikasi.` });
                fetchPendingMerchants();
                fetchAuditLogs();
            } else {
                setActionMsg({ type: 'error', text: data.message || 'Gagal memverifikasi toko.' });
            }
        } catch (err) {
            setActionMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
        }
    };

    const handleVerifyProduct = async (id, approve) => {
        setActionMsg(null);
        try {
            const response = await fetch(`/api/admin/products/${id}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    status: approve ? 'active' : 'rejected',
                    reason: approve ? 'Sesuai dengan kriteria produk halal.' : 'Tidak sesuai syariat.'
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setActionMsg({ type: 'success', text: `Produk "${data.data.title}" berhasil dimoderasi.` });
                fetchPendingProducts();
                fetchAuditLogs();
            } else {
                setActionMsg({ type: 'error', text: data.message || 'Gagal memoderasi produk.' });
            }
        } catch (err) {
            setActionMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
        }
    };

    const handleVerifyAd = async (id, approve) => {
        setActionMsg(null);
        try {
            const res = await fetch(`/api/admin/ads/${id}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: approve ? 'active' : 'rejected' })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setActionMsg({ type: 'success', text: `Iklan berhasil ${approve ? 'diaktifkan' : 'ditolak'}.` });
                fetchPendingAds();
                fetchAuditLogs();
            } else {
                setActionMsg({ type: 'error', text: data.message || 'Gagal memverifikasi iklan.' });
            }
        } catch (err) {
            setActionMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
        }
    };

    const handleVerifyWithdrawal = async (id, approve) => {
        setActionMsg(null);
        try {
            const res = await fetch(`/api/admin/withdrawals/${id}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: approve ? 'COMPLETED' : 'REJECTED',
                    notes: approve ? 'Dana telah ditransfer ke rekening merchant.' : 'Informasi rekening tidak valid atau mencurigakan.'
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setActionMsg({ type: 'success', text: `Penarikan dana berhasil ${approve ? 'disetujui' : 'ditolak'}.` });
                fetchPendingWithdrawals();
                fetchAuditLogs();
            } else {
                setActionMsg({ type: 'error', text: data.message || 'Gagal memverifikasi penarikan dana.' });
            }
        } catch (err) {
            setActionMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
        }
    };

    return (
        <div className="h-screen bg-slate-950 text-slate-100 font-sans flex overflow-hidden">
            {/* Sidebar Baru */}
            <AdminSidebar activeItem={activeTab} onNavigate={setActiveTab} user={user} onLogout={onLogout} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Dashboard Contents */}
                <main className="flex-1 overflow-y-auto px-6 py-10 bg-slate-50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Dasbor Administrator</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola verifikasi merchant, moderasi produk, dan audit sistem secara terpusat.</p>
                        </div>

                        {actionMsg && (
                            <div className={`mb-6 p-4 rounded-lg text-sm border ${
                                actionMsg.type === 'success' 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400' 
                                    : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400'
                            }`}>
                                {actionMsg.text}
                            </div>
                        )}

                        {/* Rendering Content Berdasarkan activeTab */}
                        {activeTab === 'dashboard' || activeTab === 'overview' ? (
                            <AdminOverview onNavigate={setActiveTab} />
                        ) : activeTab === 'analytics' ? (
                            <AdminAnalytics />
                        ) : activeTab === 'merchants' ? (
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                            🏪 Pengajuan Toko Baru (Pending)
                        </h2>
                        {loading ? (
                            <div className="text-xs text-slate-500 italic">Memuat pengajuan merchant...</div>
                        ) : pendingMerchants.length === 0 ? (
                            <div className="text-xs text-slate-500">Tidak ada permohonan pendaftaran toko baru.</div>
                        ) : (
                            <div className="space-y-4">
                                {pendingMerchants.map((merchant) => (
                                    <div key={merchant.id} className="flex justify-between items-center p-4 bg-slate-950/60 border border-slate-800/50 rounded-lg">
                                        <div>
                                            <span className="block text-sm font-semibold">{merchant.name}</span>
                                            <span className="block text-[10px] text-slate-500 mt-0.5">Pemilik: {merchant.owner?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleVerifyMerchant(merchant.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-[11px]">Approve</button>
                                            <button onClick={() => handleVerifyMerchant(merchant.id, false)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded text-[11px]">Tolak</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'products' ? (
                    <AdminProducts />
                        ) : activeTab === 'ads' || activeTab === 'ads-moderation' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <span className="p-2 bg-amber-500/20 rounded-xl text-amber-400 shadow-inner">📢</span> 
                                    Moderasi Iklan Baris (Pending)
                                </h2>
                                <p className="text-sm text-slate-400 mt-2">Tinjau dan setujui iklan baru yang diajukan oleh pengguna sebelum tayang.</p>
                            </div>
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-4 py-2 rounded-xl text-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                {pendingAds.length} Menunggu Review
                            </span>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center py-20 relative z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                            </div>
                        ) : pendingAds.length === 0 ? (
                            <div className="text-center py-16 bg-slate-950/40 rounded-xl border border-slate-800/50 relative z-10">
                                <div className="text-5xl mb-4 opacity-50">✨</div>
                                <h3 className="text-lg font-bold text-slate-300 mb-1">Semua Iklan Sudah Direview</h3>
                                <p className="text-sm text-slate-500">Tidak ada pengajuan iklan baru yang menunggu persetujuan.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 relative z-10">
                                {pendingAds.map((ad) => (
                                    <div key={ad.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-slate-950/80 backdrop-blur border border-slate-700/50 hover:border-amber-500/50 rounded-xl shadow-lg transition-colors duration-300 gap-4">
                                        <div>
                                            <span className="block text-base font-bold text-slate-200">{ad.title}</span>
                                            <span className="block text-xs text-slate-400 mt-1">Pemilik: <span className="text-slate-300">{ad.user?.name || 'User'}</span> &bull; Paket: <span className="text-indigo-400 font-semibold">{ad.ad_package?.name || '-'}</span></span>
                                        </div>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            <button onClick={() => handleVerifyAd(ad.id, true)} className="flex-1 sm:flex-none bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold py-2 px-5 rounded-lg text-xs transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                                Approve Iklan
                                            </button>
                                            <button onClick={() => handleVerifyAd(ad.id, false)} className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-2 px-5 rounded-lg text-xs transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                                Tolak Iklan
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                        ) : activeTab === 'withdrawals' || activeTab === 'payouts' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <span className="p-2 bg-teal-500/20 rounded-xl text-teal-400 shadow-inner">💸</span> 
                                    Moderasi Penarikan Dana
                                </h2>
                                <p className="text-sm text-slate-400 mt-2">Periksa dan proses permintaan pencairan saldo (withdraw) dari para merchant.</p>
                            </div>
                            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 font-bold px-4 py-2 rounded-xl text-sm shadow-[0_0_15px_rgba(20,184,166,0.15)] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                                {pendingWithdrawals.length} Pending
                            </span>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center py-20 relative z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                            </div>
                        ) : pendingWithdrawals.length === 0 ? (
                            <div className="text-center py-16 bg-slate-950/40 rounded-xl border border-slate-800/50 relative z-10">
                                <div className="text-5xl mb-4 opacity-50">💳</div>
                                <h3 className="text-lg font-bold text-slate-300 mb-1">Tidak Ada Permintaan</h3>
                                <p className="text-sm text-slate-500">Semua penarikan dana merchant sudah diproses.</p>
                            </div>
                        ) : (
                            <div className="space-y-5 relative z-10">
                                {pendingWithdrawals.map((w) => (
                                    <div key={w.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-950/80 backdrop-blur border border-slate-700/50 hover:border-teal-500/40 rounded-xl shadow-lg transition-all duration-300 gap-5">
                                        <div>
                                            <div className="flex items-baseline gap-3 mb-1">
                                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Rp {numberFormat(w.amount)}</span>
                                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase tracking-wider">Withdrawal</span>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Merchant: <span className="text-slate-200 font-semibold">{w.merchant?.name || '-'}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                <span className="text-indigo-300">{w.bank_name}</span> &bull; {w.bank_account_number} (a.n {w.bank_account_name})
                                            </p>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button onClick={() => handleVerifyWithdrawal(w.id, true)} className="flex-1 md:flex-none bg-teal-500 hover:bg-teal-400 text-slate-900 border border-teal-400 font-black py-2.5 px-6 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transform hover:-translate-y-0.5">
                                                Transfer & Selesaikan
                                            </button>
                                            <button onClick={() => handleVerifyWithdrawal(w.id, false)} className="flex-1 md:flex-none bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 font-bold py-2.5 px-6 rounded-xl text-sm transition-all">
                                                Tolak
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'customers' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-3">
                                    <span className="text-indigo-400">👥</span> Kelola Pengguna
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">Atur dan pantau semua pengguna yang terdaftar di sistem.</p>
                            </div>
                            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-1">
                                + Tambah User
                            </button>
                        </div>
                        <div className="overflow-x-auto relative z-10 bg-slate-950/40 rounded-xl border border-slate-800/50">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800/60 text-slate-400 bg-slate-900/50">
                                        <th className="py-4 px-5 font-semibold">Nama Pengguna</th>
                                        <th className="py-4 px-5 font-semibold">Email</th>
                                        <th className="py-4 px-5 font-semibold">Terdaftar</th>
                                        <th className="py-4 px-5 font-semibold">Status</th>
                                        <th className="py-4 px-5 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-800/30 hover:bg-indigo-900/20 transition-colors duration-200 group">
                                        <td className="py-4 px-5 font-bold text-slate-200">Budi Santoso</td>
                                        <td className="py-4 px-5 text-slate-400">budi.s@example.com</td>
                                        <td className="py-4 px-5 text-slate-400">12 Agt 2026</td>
                                        <td className="py-4 px-5">
                                            <div className="relative inline-block w-28 group">
                                                <select className="appearance-none w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-colors group-hover:bg-emerald-500/20 shadow-sm">
                                                    <option value="aktif" className="bg-slate-800 text-emerald-400 font-semibold">Aktif</option>
                                                    <option value="suspend" className="bg-slate-800 text-amber-400 font-semibold">Suspend</option>
                                                    <option value="banned" className="bg-slate-800 text-red-400 font-semibold">Blokir</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-500">
                                                    <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 text-right space-x-2">
                                            <button className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-bold py-1.5 px-3 rounded-lg text-xs transition-all hover:shadow-[0_0_10px_rgba(79,70,229,0.2)]">Edit</button>
                                            <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-1.5 px-3 rounded-lg text-xs transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]">Hapus</button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-slate-800/30 hover:bg-indigo-900/20 transition-colors duration-200 group">
                                        <td className="py-4 px-5 font-bold text-slate-200">Siti Aminah</td>
                                        <td className="py-4 px-5 text-slate-400">siti99@example.com</td>
                                        <td className="py-4 px-5 text-slate-400">10 Agt 2026</td>
                                        <td className="py-4 px-5">
                                            <div className="relative inline-block w-28 group">
                                                <select className="appearance-none w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-colors group-hover:bg-emerald-500/20 shadow-sm">
                                                    <option value="aktif" className="bg-slate-800 text-emerald-400 font-semibold">Aktif</option>
                                                    <option value="suspend" className="bg-slate-800 text-amber-400 font-semibold">Suspend</option>
                                                    <option value="banned" className="bg-slate-800 text-red-400 font-semibold">Blokir</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-500">
                                                    <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 text-right space-x-2">
                                            <button className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-bold py-1.5 px-3 rounded-lg text-xs transition-all hover:shadow-[0_0_10px_rgba(79,70,229,0.2)]">Edit</button>
                                            <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-1.5 px-3 rounded-lg text-xs transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]">Hapus</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'commissions' ? (
                    <div className="space-y-8">
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-900/10 to-emerald-900/5 pointer-events-none"></div>
                            
                            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
                                <span className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shadow-inner">💰</span> 
                                Pengaturan Komisi & Fee Platform
                            </h2>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                                <div className="bg-slate-950/80 backdrop-blur p-8 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-colors duration-300 shadow-lg">
                                    <h3 className="text-base font-bold text-slate-200 mb-6 flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                        Fee Transaksi Marketplace
                                    </h3>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <input type="number" defaultValue="5" className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-5 py-3.5 text-xl font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">%</span>
                                        </div>
                                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all duration-300">
                                            Simpan
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-5 leading-relaxed">
                                        Persentase potongan otomatis yang masuk ke dompet Admin untuk setiap transaksi produk digital yang berhasil diselesaikan oleh pembeli.
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-2xl border border-indigo-500/30 relative overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.15)] group">
                                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-all duration-500"></div>
                                    <h3 className="text-sm font-bold text-indigo-200 mb-3 uppercase tracking-wider">Total Pendapatan Fee</h3>
                                    <p className="text-4xl lg:text-5xl font-black text-white drop-shadow-md tracking-tight">Rp 2.450.000</p>
                                    <div className="mt-6 flex items-center gap-2 inline-flex bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5">
                                        <span className="text-emerald-400 font-black">↗ +12.5%</span>
                                        <span className="text-indigo-200 text-xs font-medium">dibanding bulan lalu</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl max-w-4xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                        
                        <div className="mb-10">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <span className="p-2 bg-slate-800 rounded-xl text-slate-300 shadow-inner">⚙️</span> 
                                Pengaturan Konfigurasi Web
                            </h2>
                            <p className="text-slate-400 mt-2 text-sm">Sesuaikan informasi utama dan status operasional sistem secara keseluruhan.</p>
                        </div>
                        
                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300 ml-1">Nama Website</label>
                                    <div className="relative">
                                        <input type="text" defaultValue="ADMS Marketplace" className="w-full bg-slate-950/50 border-2 border-slate-700/50 rounded-xl px-5 py-3 text-white font-medium focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-colors shadow-inner" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300 ml-1">Email Kontak Resmi</label>
                                    <div className="relative">
                                        <input type="email" defaultValue="support@adms.id" className="w-full bg-slate-950/50 border-2 border-slate-700/50 rounded-xl px-5 py-3 text-white font-medium focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-colors shadow-inner" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-6 flex items-start gap-5 hover:bg-amber-950/30 transition-colors">
                                <div className="mt-1">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-800/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                                    </label>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-amber-500 mb-1">Mode Maintenance (Perbaikan Server)</h4>
                                    <p className="text-sm text-slate-400">Jika diaktifkan, semua pengguna reguler akan melihat halaman "Sedang Perbaikan". Hanya Superadmin yang tetap bisa mengakses dan menguji sistem.</p>
                                </div>
                            </div>
                            
                            <div className="pt-6 mt-8 border-t border-slate-800/60 flex justify-end">
                                <button type="button" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-0.5">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                ) : activeTab === 'logs' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <span className="p-2 bg-slate-800 rounded-xl text-slate-300 shadow-inner">🛡️</span> 
                                    Log Audit Keamanan & Moderasi
                                </h2>
                                <p className="text-sm text-slate-400 mt-2">Rekam jejak seluruh aktivitas krusial yang dilakukan oleh jajaran Administrator.</p>
                            </div>
                            <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-5 rounded-xl text-sm border border-slate-700 transition-colors shadow-sm">
                                Export CSV
                            </button>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="text-center py-16 bg-slate-950/40 rounded-xl border border-slate-800/50">
                                <div className="text-5xl mb-4 opacity-50">📂</div>
                                <h3 className="text-lg font-bold text-slate-300 mb-1">Belum Ada Aktivitas</h3>
                                <p className="text-sm text-slate-500">Sistem belum mencatat log audit apapun saat ini.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto relative z-10 bg-slate-950/40 rounded-xl border border-slate-800/50">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800/60 text-slate-400 bg-slate-900/50">
                                            <th className="py-4 px-5 font-semibold">Waktu Kejadian</th>
                                            <th className="py-4 px-5 font-semibold">Pelaku Admin</th>
                                            <th className="py-4 px-5 font-semibold">Aksi / Tindakan</th>
                                            <th className="py-4 px-5 font-semibold">Kategori</th>
                                            <th className="py-4 px-5 font-semibold">Alasan / Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.map((log) => (
                                            <tr key={log.id} className="border-b border-slate-800/30 hover:bg-slate-800/40 transition-colors duration-150">
                                                <td className="py-4 px-5 text-slate-400 text-xs font-mono">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                                <td className="py-4 px-5 font-bold text-slate-200">{log.admin ? log.admin.name : 'System Admin'}</td>
                                                <td className="py-4 px-5">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${
                                                        log.action.includes('REJECT') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                        log.action.includes('APPROVE') || log.action.includes('COMPLETED') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                                        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                    }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-slate-300 font-medium">{log.target_type}</td>
                                                <td className="py-4 px-5 text-slate-400 italic">"{log.reason}"</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <div className="text-4xl mb-4 opacity-50">🚧</div>
                        <p className="font-semibold text-slate-400 text-lg">Halaman sedang dalam tahap pengembangan</p>
                        <p className="text-sm mt-2">Pilih menu lain di sidebar sebelah kiri.</p>
                    </div>
                )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function numberFormat(val) {
    return new Intl.NumberFormat('id-ID').format(val);
}
