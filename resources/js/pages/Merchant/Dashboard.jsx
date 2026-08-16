import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

export default function MerchantDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [bankName, setBankName] = useState('BSI');
    const [accName, setAccName] = useState('');
    const [accNumber, setAccNumber] = useState('');
    const [payoutMsg, setPayoutMsg] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDashboardData();
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
            console.error("Gagal mengambil dashboard data:", err);
        } finally {
            setLoading(false);
        }
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
            />

            {/* Dashboard Contents */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-extrabold text-white mb-2">Dasbor Penjual</h1>
                <p className="text-slate-400 mb-8 text-sm">Kelola penjualan syariah, produk digital, dan penarikan dana hasil usaha Anda.</p>

                {loading ? (
                    <div className="text-slate-500 text-sm italic py-4">Memuat data dasbor merchant...</div>
                ) : stats ? (
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
                ) : (
                    <div className="text-red-400">Gagal memproses data toko.</div>
                )}
            </main>
        </div>
    );
}

function numberFormat(val) {
    return new Intl.NumberFormat('id-ID').format(val);
}
