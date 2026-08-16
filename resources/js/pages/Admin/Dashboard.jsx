import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

export default function AdminDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode }) {
    const [pendingMerchants, setPendingMerchants] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loadingMerchants, setLoadingMerchants] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [actionMsg, setActionMsg] = useState(null);

    useEffect(() => {
        fetchPendingMerchants();
        fetchPendingProducts();
        fetchAuditLogs();
    }, []);

    const fetchPendingMerchants = async () => {
        try {
            const response = await fetch('/api/admin/merchants/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setPendingMerchants(data.data);
            }
        } catch (err) {
            console.error("Gagal mengambil data merchant:", err);
        } finally {
            setLoadingMerchants(false);
        }
    };

    const fetchPendingProducts = async () => {
        try {
            const response = await fetch('/api/admin/products/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setPendingProducts(data.data);
            }
        } catch (err) {
            console.error("Gagal mengambil data produk:", err);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const response = await fetch('/api/admin/audit-logs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setAuditLogs(data.data.data || []);
            }
        } catch (err) {
            console.error("Gagal mengambil data audit log:", err);
        } finally {
            setLoadingLogs(false);
        }
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
                currentView="admin_dashboard"
            />

            {/* Main Area */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-extrabold text-white mb-2">Panel Moderasi & Kebijakan</h1>
                <p className="text-slate-400 mb-8 text-sm">Menyetujui pendaftaran toko, memoderasi konten produk digital, dan memeriksa riwayat log audit admin.</p>

                {actionMsg && (
                    <div className={`mb-6 p-4 rounded-lg text-sm border ${
                        actionMsg.type === 'success' 
                            ? 'bg-emerald-950/50 border-emerald-800/40 text-emerald-400' 
                            : 'bg-red-950/50 border-red-800/40 text-red-400'
                    }`}>
                        {actionMsg.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    
                    {/* Pending Merchant List */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                            🏪 Pengajuan Toko Baru (Pending)
                        </h2>

                        {loadingMerchants ? (
                            <div className="text-xs text-slate-500 italic">Memuat pengajuan merchant...</div>
                        ) : pendingMerchants.length === 0 ? (
                            <div className="text-xs text-slate-500">Tidak ada permohonan pendaftaran toko baru.</div>
                        ) : (
                            <div className="space-y-4">
                                {pendingMerchants.map((merchant) => (
                                    <div key={merchant.id} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800/50 rounded-lg">
                                        <div>
                                            <span className="block text-sm font-semibold">{merchant.name}</span>
                                            <span className="block text-[10px] text-slate-500 mt-0.5">Pemilik: {merchant.owner ? merchant.owner.name : 'Unknown'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleVerifyMerchant(merchant.id, true)}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-[11px] transition-colors"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Products List */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                            📦 Moderasi Produk Baru (Pending)
                        </h2>

                        {loadingProducts ? (
                            <div className="text-xs text-slate-500 italic">Memuat pengajuan produk...</div>
                        ) : pendingProducts.length === 0 ? (
                            <div className="text-xs text-slate-500">Tidak ada produk baru menunggu review.</div>
                        ) : (
                            <div className="space-y-4">
                                {pendingProducts.map((prod) => (
                                    <div key={prod.id} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800/50 rounded-lg">
                                        <div>
                                            <span className="block text-sm font-semibold">{prod.title}</span>
                                            <span className="block text-[10px] text-slate-500 mt-0.5">
                                                Toko: {prod.merchant ? prod.merchant.name : 'Toko'} &bull; Rp{numberFormat(prod.price)}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleVerifyProduct(prod.id, true)}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-[11px] transition-colors"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Audit Logs list */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-slate-200 mb-4">
                        🛡️ Log Audit Keamanan & Moderasi Admin
                    </h2>

                    {loadingLogs ? (
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

            </main>
        </div>
    );
}

function numberFormat(val) {
    return new Intl.NumberFormat('id-ID').format(val);
}
