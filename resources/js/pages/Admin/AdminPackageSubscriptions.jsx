import React, { useState, useEffect } from 'react';

export const AdminPackageSubscriptions = ({ token }) => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/package-subscriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSubscriptions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [token]);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Yakin ingin ${action === 'approve' ? 'menyetujui' : 'menolak'} langganan ini?`)) return;
        
        try {
            const res = await fetch(`/api/admin/package-subscriptions/${id}/${action}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchSubscriptions();
            } else {
                alert(data.message || 'Terjadi kesalahan.');
            }
        } catch (error) {
            console.error('Action failed:', error);
            alert('Koneksi bermasalah.');
        }
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-6">
                <span className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
                Verifikasi Langganan Paket
            </h2>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : subscriptions.length === 0 ? (
                <div className="text-center py-16 text-slate-500">Belum ada data langganan paket.</div>
            ) : (
                <div className="overflow-x-auto bg-slate-950/40 rounded-xl border border-slate-800/50">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800/60 text-slate-400 bg-slate-900/50">
                                <th className="py-3 px-5 font-semibold">User</th>
                                <th className="py-3 px-5 font-semibold">Paket</th>
                                <th className="py-3 px-5 font-semibold text-right">Total</th>
                                <th className="py-3 px-5 font-semibold">Status</th>
                                <th className="py-3 px-5 font-semibold">Pembayaran</th>
                                <th className="py-3 px-5 font-semibold">Waktu Pesan</th>
                                <th className="py-3 px-5 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map(sub => (
                                <tr key={sub.id} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 px-5 font-semibold text-slate-200">
                                        {sub.user?.name || 'User Terhapus'}
                                        <div className="text-xs text-slate-400 font-normal">{sub.user?.email}</div>
                                    </td>
                                    <td className="py-3 px-5 text-slate-300">
                                        <div className="font-semibold text-emerald-400">{sub.package?.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">{sub.package?.duration_days} Hari</div>
                                    </td>
                                    <td className="py-3 px-5 text-right font-bold text-amber-400">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(sub.total_amount)}
                                    </td>
                                    <td className="py-3 px-5">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                            sub.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                            sub.status === 'expired' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-5 text-slate-400 text-xs font-mono">
                                        {sub.payment_method === 'bank_transfer' ? 'Transfer Bank' : sub.payment_method === 'ewallet' ? 'E-Wallet' : sub.payment_method}
                                    </td>
                                    <td className="py-3 px-5 text-slate-400 text-xs font-mono">
                                        {new Date(sub.created_at).toLocaleString('id-ID')}
                                    </td>
                                    <td className="py-3 px-5 text-right space-x-2">
                                        {sub.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleAction(sub.id, 'approve')}
                                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(sub.id, 'reject')}
                                                    className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all"
                                                >
                                                    Tolak
                                                </button>
                                            </>
                                        )}
                                        {sub.status === 'active' && (
                                            <span className="text-emerald-500 text-xs font-semibold">✓ Aktif s/d {new Date(sub.expires_at).toLocaleDateString('id-ID')}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
