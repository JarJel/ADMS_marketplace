import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { AdminOverview } from './AdminOverview';

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
            <AdminSidebar activeItem={activeTab} onNavigate={setActiveTab} />

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
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                            📦 Moderasi Produk Baru (Pending)
                        </h2>
                        {loading ? (
                            <div className="text-xs text-slate-500 italic">Memuat pengajuan produk...</div>
                        ) : pendingProducts.length === 0 ? (
                            <div className="text-xs text-slate-500">Tidak ada produk baru menunggu review.</div>
                        ) : (
                            <div className="space-y-4">
                                {pendingProducts.map((prod) => (
                                    <div key={prod.id} className="flex justify-between items-center p-4 bg-slate-950/60 border border-slate-800/50 rounded-lg">
                                        <div>
                                            <span className="block text-sm font-semibold">{prod.title}</span>
                                            <span className="block text-[10px] text-slate-500 mt-0.5">Toko: {prod.merchant?.name || 'Toko'} &bull; Rp{numberFormat(prod.price)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleVerifyProduct(prod.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-[11px]">Approve</button>
                                            <button onClick={() => handleVerifyProduct(prod.id, false)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded text-[11px]">Tolak</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                        ) : activeTab === 'ads' || activeTab === 'ads-moderation' ? (
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                            📢 Moderasi Iklan Baris (Pending)
                        </h2>
                        {loading ? (
                            <div className="text-xs text-slate-500 italic">Memuat pengajuan iklan...</div>
                        ) : pendingAds.length === 0 ? (
                            <div className="text-xs text-slate-500">Tidak ada iklan baru menunggu review.</div>
                        ) : (
                            <div className="space-y-4">
                                {pendingAds.map((ad) => (
                                    <div key={ad.id} className="flex justify-between items-center p-4 bg-slate-950/60 border border-slate-800/50 rounded-lg">
                                        <div>
                                            <span className="block text-sm font-semibold">{ad.title}</span>
                                            <span className="block text-[10px] text-slate-500 mt-0.5">Pemilik: {ad.user?.name || 'User'} &bull; Paket: {ad.ad_package?.name || '-'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleVerifyAd(ad.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-[11px]">Approve</button>
                                            <button onClick={() => handleVerifyAd(ad.id, false)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded text-[11px]">Tolak</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                        ) : activeTab === 'withdrawals' || activeTab === 'payouts' ? (
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                            💸 Moderasi Penarikan Dana (Pending)
                        </h2>
                        {loading ? (
                            <div className="text-xs text-slate-500 italic">Memuat pengajuan penarikan...</div>
                        ) : pendingWithdrawals.length === 0 ? (
                            <div className="text-xs text-slate-500">Tidak ada permohonan penarikan dana.</div>
                        ) : (
                            <div className="space-y-4">
                                {pendingWithdrawals.map((w) => (
                                    <div key={w.id} className="flex justify-between items-center p-4 bg-slate-950/60 border border-slate-800/50 rounded-lg">
                                        <div>
                                            <span className="block text-sm font-semibold text-teal-400">Rp{numberFormat(w.amount)}</span>
                                            <span className="block text-[10px] text-slate-500 mt-0.5">Merchant: {w.merchant?.name || '-'} &bull; {w.bank_name} - {w.bank_account_number} ({w.bank_account_name})</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleVerifyWithdrawal(w.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-[11px]">Setujui & Selesaikan</button>
                                            <button onClick={() => handleVerifyWithdrawal(w.id, false)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded text-[11px]">Tolak</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-slate-200 mb-4">
                            🛡️ Log Audit Keamanan & Moderasi Admin
                        </h2>
                        {loading ? (
                            <div className="text-xs text-slate-500 italic">Memuat log audit...</div>
                        ) : auditLogs.length === 0 ? (
                            <div className="text-xs text-slate-500">Log audit kosong.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800/60 text-slate-400">
                                            <th className="py-2">Waktu</th>
                                            <th className="py-2">Pelaku Admin</th>
                                            <th className="py-2">Aksi</th>
                                            <th className="py-2">Kategori</th>
                                            <th className="py-2">Alasan / Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.map((log) => (
                                            <tr key={log.id} className="border-b border-slate-800/30 hover:bg-slate-950/20">
                                                <td className="py-2 text-slate-500">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                                <td className="py-2 font-medium text-slate-300">{log.admin ? log.admin.name : 'Admin'}</td>
                                                <td className="py-2 text-purple-400 font-semibold">{log.action}</td>
                                                <td className="py-2 text-slate-400">{log.target_type}</td>
                                                <td className="py-2 text-slate-400 italic">"{log.reason}"</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
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
