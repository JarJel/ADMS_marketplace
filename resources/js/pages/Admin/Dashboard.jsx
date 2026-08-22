import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminProducts } from './AdminProducts';
import { AdminAds } from './AdminAds';
import { AdminPackageSubscriptions } from './AdminPackageSubscriptions';
import { CheckCircle2, Clock, Users, Store, Package, ReceiptText, BarChart3, TrendingUp, Percent, Save, Info, HandCoins, Megaphone, Sparkles, Banknote, CreditCard, Settings, Shield, FolderOpen, Tag, Wrench, Check, X, Download } from 'lucide-react';

export default function AdminDashboard({ user, token, onLogout, onNavigate, darkMode, setDarkMode, cartCount, wishlistCount, notifications }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pendingMerchants, setPendingMerchants] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [pendingAds, setPendingAds] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState(null);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [adminStats, setAdminStats] = useState(null);

    const [siteSettings, setSiteSettings] = useState({ site_name: 'ADMS Marketplace', contact_email: 'support@adms.id', maintenance_mode: false });
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState(null);

    const [feePercent, setFeePercent] = useState(5);
    const [feeSaving, setFeeSaving] = useState(false);
    const [feeMsg, setFeeMsg] = useState(null);

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [packages, setPackages] = useState([]);
    const [packagesLoading, setPackagesLoading] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [savingPackage, setSavingPackage] = useState(false);

    useEffect(() => {
        if (activeTab === 'dashboard' || activeTab === 'overview') {
            fetchAuditLogs();
            fetchPendingMerchants();
            fetchAdminStats();
        } else if (activeTab === 'merchants') {
            fetchPendingMerchants();
        } else if (activeTab === 'ads') {
            fetchPendingAds();
        } else if (activeTab === 'withdrawals' || activeTab === 'payouts') {
            fetchPendingWithdrawals();
        } else if (activeTab === 'customers') {
            fetchUsers();
        } else if (activeTab === 'commissions') {
            fetchAdminStats();
            fetchCommission();
        } else if (activeTab === 'settings') {
            fetchSettings();
        } else if (activeTab === 'categories') {
            fetchCategories();
        } else if (activeTab === 'transactions') {
            fetchTransactions();
        } else if (activeTab === 'ads-packages') {
            fetchPackages();
        } else if (activeTab === 'ads-reports') {
            fetchAdminStats();
        }
    }, [activeTab]);

    const fetchAdminStats = async () => {
        try {
            const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setAdminStats(data.data);
        } catch { }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setSiteSettings(data.data);
        } catch { }
    };

    const fetchCommission = async () => {
        try {
            const res = await fetch('/api/admin/commission', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setFeePercent(data.data.fee_percent ?? 5);
        } catch { }
    };

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const res = await fetch('/api/admin/categories', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch { } finally { setCategoriesLoading(false); }
    };

    const fetchTransactions = async () => {
        setTransactionsLoading(true);
        try {
            const res = await fetch('/api/admin/transactions', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setTransactions(data.data);
        } catch { } finally { setTransactionsLoading(false); }
    };

    const fetchPackages = async () => {
        setPackagesLoading(true);
        try {
            const res = await fetch('/api/admin/packages', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setPackages(data.data);
        } catch { } finally { setPackagesLoading(false); }
    };

    const saveCommission = async () => {
        setFeeSaving(true);
        setFeeMsg(null);
        try {
            const res = await fetch('/api/admin/commission', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ fee_percent: feePercent }),
            });
            const data = await res.json();
            setFeeMsg({ type: data.success ? 'success' : 'error', text: data.message });
            setTimeout(() => setFeeMsg(null), 3000);
        } catch {
            setFeeMsg({ type: 'error', text: 'Gagal menyimpan fee.' });
        } finally {
            setFeeSaving(false);
        }
    };

    const handleExportCsv = () => {
        if (!auditLogs.length) return;
        const headers = ['Waktu', 'Admin', 'Aksi', 'Kategori', 'Alasan'];
        const rows = auditLogs.map(log => [
            new Date(log.created_at).toLocaleString('id-ID'),
            log.admin?.name ?? 'System Admin',
            log.action,
            log.target_type,
            `"${(log.reason ?? '').replace(/"/g, '""')}"`,
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleExportTransactionsCsv = () => {
        if (!transactions.length) return;
        const headers = ['ID', 'Pembeli', 'Email', 'Total (IDR)', 'Status', 'Pembayaran', 'Waktu'];
        const rows = transactions.map(tx => [
            tx.id,
            `"${(tx.buyer ?? '').replace(/"/g, '""')}"`,
            tx.email,
            tx.total,
            tx.status,
            tx.payment_status,
            tx.created_at,
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `riwayat_transaksi_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        setSettingsSaving(true);
        setSettingsMsg(null);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(siteSettings),
            });
            const data = await res.json();
            setSettingsMsg({ type: data.success ? 'success' : 'error', text: data.message });
        } catch (err) {
            setSettingsMsg({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
        } finally {
            setSettingsSaving(false);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setUsers(data.data.data || data.data);
        } catch { } finally { setUsersLoading(false); }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            const reason = currentStatus === 'active' ? 'Disuspend oleh admin' : 'Diaktifkan kembali oleh admin';
            const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: data.data.status } : u));
            } else {
                alert(data.message || 'Gagal mengubah status user.');
            }
        } catch { }
    };

    const fetchPendingMerchants = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/merchants/pending', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setPendingMerchants(data.data.data || data.data);
        } catch { } finally { setLoading(false); }
    };

    const fetchPendingProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/products/pending', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setPendingProducts(data.data.data || data.data);
        } catch { } finally { setLoading(false); }
    };

    const fetchPendingAds = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/ads/pending', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setPendingAds(data.data.data || data.data);
        } catch { } finally { setLoading(false); }
    };

    const fetchPendingWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/withdrawals/pending', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setPendingWithdrawals(data.data.data || data.data);
        } catch { } finally { setLoading(false); }
    };

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/audit-logs', { headers: { 'Authorization': `Bearer ${token}` }});
            const data = await res.json();
            if (data.success) setAuditLogs(data.data.data || data.data);
        } catch { } finally { setLoading(false); }
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
                fetchAdminStats();
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
                fetchAdminStats();
            } else {
                setActionMsg({ type: 'error', text: data.message || 'Gagal memoderasi produk.' });
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
                    status: approve ? 'approved' : 'rejected',
                    notes: approve ? 'Dana telah ditransfer ke rekening merchant.' : 'Informasi rekening tidak valid atau mencurigakan.'
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setActionMsg({ type: 'success', text: `Penarikan dana berhasil ${approve ? 'disetujui' : 'ditolak'}.` });
                fetchPendingWithdrawals();
                fetchAuditLogs();
                fetchAdminStats();
            } else {
                setActionMsg({ type: 'error', text: data.message || 'Gagal memverifikasi penarikan dana.' });
            }
        } catch (err) {
            setActionMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
        }
    };

    const handleSavePackage = async (e) => {
        e.preventDefault();
        setSavingPackage(true);
        try {
            const res = await fetch(`/api/admin/packages/${editingPackage.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editingPackage.name,
                    price: editingPackage.price,
                    duration_days: editingPackage.duration_days,
                    type: editingPackage.type,
                    benefits: typeof editingPackage.benefits === 'string' ? editingPackage.benefits.split('\n').filter(b => b.trim()) : editingPackage.benefits,
                    is_active: editingPackage.is_active
                })
            });
            const data = await res.json();
            if (data.success) {
                setPackages(prev => prev.map(p => p.id === editingPackage.id ? data.data : p));
                setEditingPackage(null);
                alert('Paket iklan berhasil diperbarui!');
            } else {
                alert(data.message || 'Gagal memperbarui paket.');
            }
        } catch (error) {
            alert('Terjadi kesalahan jaringan.');
        } finally {
            setSavingPackage(false);
        }
    };

    return (
        <div className="h-screen bg-[#071922] text-slate-100 font-sans flex overflow-hidden">
            {/* Sidebar Baru */}
            <AdminSidebar
                activeItem={activeTab}
                onNavigate={setActiveTab}
                user={user}
                onLogout={onLogout}
                pendingCounts={{
                    pendingMerchants: adminStats?.pendingMerchants ?? pendingMerchants.length,
                    pendingAds: adminStats?.pendingAds ?? pendingAds.length,
                    pendingProducts: adminStats?.pendingProducts ?? pendingProducts.length,
                    pendingWithdrawals: adminStats?.pendingWithdrawals ?? pendingWithdrawals.length,
                }}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Dashboard Contents */}
                <main className="flex-1 overflow-y-auto px-6 py-10 bg-[#0B2330] text-slate-100">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8 border-b border-[#174256] pb-5">
                            <h1 className="text-3xl font-black text-white mb-1 tracking-tight flex items-center gap-2">
                                Dasbor Administrator <span className="text-xs bg-[#FFBF00] text-[#0F3040] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Superadmin</span>
                            </h1>
                            <p className="text-slate-300 text-sm">Kelola verifikasi merchant, moderasi produk, dan audit sistem secara terpusat.</p>
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
                            <AdminOverview onNavigate={setActiveTab} stats={adminStats} loading={!adminStats} />
                        ) : activeTab === 'analytics' ? (
                            <AdminAnalytics token={token} />
                        ) : activeTab === 'merchants' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 flex items-center gap-3">
                                    <Store className="w-8 h-8 text-teal-400" />
                                    Pengajuan Toko Baru
                                </h2>
                                <p className="text-slate-400 mt-2 font-medium">Tinjau dan verifikasi pendaftaran merchant baru di platform.</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                            </div>
                        ) : pendingMerchants.length === 0 ? (
                            <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                                    <Store className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-300">Belum Ada Pengajuan</h3>
                                <p className="text-sm text-slate-500 mt-1">Saat ini tidak ada permohonan pendaftaran toko baru.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingMerchants.map((merchant) => (
                                    <div key={merchant.id} className="group relative bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] overflow-hidden flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-inner">
                                                <Store className="w-6 h-6" />
                                            </div>
                                            <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-amber-500/20">Pending</span>
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-slate-200 mb-1 line-clamp-1">{merchant.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-6">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="line-clamp-1">Pemilik: <span className="text-slate-400 font-medium">{merchant.owner?.name || 'Unknown'}</span></span>
                                        </div>
                                        
                                        <div className="mt-auto grid grid-cols-2 gap-3">
                                            <button onClick={() => handleVerifyMerchant(merchant.id, false)} className="flex items-center justify-center py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors font-bold text-xs">
                                                Tolak
                                            </button>
                                            <button onClick={() => handleVerifyMerchant(merchant.id, true)} className="flex items-center justify-center py-2.5 rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors font-bold text-xs shadow-lg shadow-teal-500/20">
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'products' ? (
                            <AdminProducts token={token} />
                ) : activeTab === 'ads' ? (
                            <AdminAds token={token} />
                ) : activeTab === 'withdrawals' || activeTab === 'payouts' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Banknote className="w-10 h-10 p-2 bg-teal-500/20 rounded-xl text-teal-400 shadow-inner" /> 
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
                                <div className="mb-4 opacity-50 flex justify-center"><CreditCard className="w-12 h-12 text-slate-500" /></div>
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
                                    <Users className="w-8 h-8 text-indigo-400" /> Kelola Pengguna
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">Atur dan pantau semua pengguna yang terdaftar di sistem.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto relative z-10 bg-slate-950/40 rounded-xl border border-slate-800/50">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800/60 text-slate-400 bg-slate-900/50">
                                        <th className="py-4 px-5 font-semibold">Nama Pengguna</th>
                                        <th className="py-4 px-5 font-semibold">Email</th>
                                        <th className="py-4 px-5 font-semibold">Role</th>
                                        <th className="py-4 px-5 font-semibold">Status</th>
                                        <th className="py-4 px-5 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersLoading ? (
                                        <tr><td colSpan="5" className="py-8 text-center text-slate-400">Memuat data pengguna...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan="5" className="py-8 text-center text-slate-400">Tidak ada pengguna ditemukan.</td></tr>
                                    ) : users.map(u => (
                                        <tr key={u.id} className="border-b border-slate-800/30 hover:bg-indigo-900/20 transition-colors duration-200">
                                            <td className="py-4 px-5 font-bold text-slate-200">{u.name}</td>
                                            <td className="py-4 px-5 text-slate-400">{u.email}</td>
                                            <td className="py-4 px-5 text-slate-400 capitalize">{u.role}</td>
                                            <td className="py-4 px-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    onClick={() => handleToggleUserStatus(u.id, u.status)}
                                                    className={`font-bold py-1.5 px-3 rounded-lg text-xs transition-all ${u.status === 'active' ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}
                                                >
                                                    {u.status === 'active' ? 'Suspend' : 'Aktifkan'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'commissions' ? (
                    <div className="relative">
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900 to-emerald-900/10 pointer-events-none -z-10 rounded-3xl"></div>
                        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
                        
                        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center gap-3">
                                        <Percent className="w-8 h-8 text-emerald-400" />
                                        Pengaturan Komisi & Fee Platform
                                    </h2>
                                    <p className="text-slate-400 mt-2 font-medium">Kelola persentase potongan otomatis untuk pendapatan platform Anda.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Form Section */}
                                <div className="group bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                                    
                                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                                            <HandCoins className="w-5 h-5" />
                                        </div>
                                        Fee Transaksi Marketplace
                                    </h3>
                                    
                                    <div className="flex flex-col sm:flex-row items-stretch gap-4">
                                        <div className="relative flex-1 group/input">
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="100" 
                                                value={feePercent} 
                                                onChange={e => setFeePercent(e.target.value)} 
                                                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 text-2xl font-black text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" 
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-slate-800 rounded-lg text-slate-400 font-bold group-focus-within/input:bg-indigo-500/20 group-focus-within/input:text-indigo-400 transition-colors">
                                                %
                                            </div>
                                        </div>
                                        <button 
                                            onClick={saveCommission} 
                                            disabled={feeSaving} 
                                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:border-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all duration-300"
                                        >
                                            <Save className="w-5 h-5" />
                                            {feeSaving ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                    </div>
                                    
                                    {feeMsg && (
                                        <div className={`mt-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold animate-fade-in-up border ${feeMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                            <Info className="w-4 h-4 flex-shrink-0" />
                                            {feeMsg.text}
                                        </div>
                                    )}
                                    
                                    <div className="mt-6 flex items-start gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                        <Info className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            Persentase potongan otomatis yang masuk ke dompet Admin untuk setiap transaksi <strong className="text-slate-300">produk digital</strong> yang berhasil diselesaikan oleh pembeli.
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Stats Section */}
                                <div className="group bg-gradient-to-br from-indigo-900 to-purple-900 p-6 md:p-8 rounded-3xl border border-indigo-500/30 relative overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.15)] flex flex-col justify-center gap-6 hover:-translate-y-1 transition-transform duration-300 h-fit lg:self-center">
                                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-all duration-500"></div>
                                    <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                        <TrendingUp className="w-16 h-16 text-white/10" />
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <h3 className="text-[11px] font-bold text-indigo-100 uppercase tracking-widest">Total Pendapatan Fee</h3>
                                        </div>
                                        <p className="text-3xl lg:text-4xl font-black text-white drop-shadow-lg tracking-tight mt-1">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(adminStats?.platformRevenue ?? 0)}
                                        </p>
                                    </div>
                                    
                                    <div className="relative z-10">
                                        {adminStats?.gmvGrowth != null && (
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border text-xs ${adminStats.gmvGrowth >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border-rose-500/20'}`}>
                                                    <TrendingUp className={`w-3.5 h-3.5 ${adminStats.gmvGrowth < 0 && 'rotate-180'}`} />
                                                    {adminStats.gmvGrowth >= 0 ? '+' : ''}{adminStats.gmvGrowth}%
                                                </div>
                                                <span className="text-indigo-200 text-xs font-medium">Pertumbuhan dibanding bulan lalu</span>
                                            </div>
                                        )}
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
                                <Settings className="w-10 h-10 p-2 bg-slate-800 rounded-xl text-slate-300 shadow-inner" /> 
                                Pengaturan Konfigurasi Web
                            </h2>
                            <p className="text-slate-400 mt-2 text-sm">Sesuaikan informasi utama dan status operasional sistem secara keseluruhan.</p>
                        </div>
                        
                        <form className="space-y-8" onSubmit={saveSettings}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300 ml-1">Nama Website</label>
                                    <div className="relative">
                                        <input type="text" value={siteSettings.site_name} onChange={e => setSiteSettings(p => ({ ...p, site_name: e.target.value }))} className="w-full bg-slate-950/50 border-2 border-slate-700/50 rounded-xl px-5 py-3 text-white font-medium focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-colors shadow-inner" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-300 ml-1">Email Kontak Resmi</label>
                                    <div className="relative">
                                        <input type="email" value={siteSettings.contact_email} onChange={e => setSiteSettings(p => ({ ...p, contact_email: e.target.value }))} className="w-full bg-slate-950/50 border-2 border-slate-700/50 rounded-xl px-5 py-3 text-white font-medium focus:outline-none focus:border-indigo-500 focus:bg-slate-900 transition-colors shadow-inner" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-6 flex items-start gap-5 hover:bg-amber-950/30 transition-colors">
                                <div className="mt-1">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={!!siteSettings.maintenance_mode} onChange={e => setSiteSettings(p => ({ ...p, maintenance_mode: e.target.checked }))} />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-800/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                                    </label>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-amber-500 mb-1">Mode Maintenance (Perbaikan Server)</h4>
                                    <p className="text-sm text-slate-400">Jika diaktifkan, semua pengguna reguler akan melihat halaman "Sedang Perbaikan". Hanya Superadmin yang tetap bisa mengakses dan menguji sistem.</p>
                                </div>
                            </div>

                            {settingsMsg && (
                                <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${settingsMsg.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/40' : 'bg-red-900/30 text-red-400 border border-red-700/40'}`}>
                                    {settingsMsg.text}
                                </div>
                            )}

                            <div className="pt-6 mt-8 border-t border-slate-800/60 flex justify-end">
                                <button type="submit" disabled={settingsSaving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-3 px-8 rounded-xl text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-0.5">
                                    {settingsSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : activeTab === 'logs' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Shield className="w-10 h-10 p-2 bg-slate-800 rounded-xl text-slate-300 shadow-inner" /> 
                                    Log Audit Keamanan & Moderasi
                                </h2>
                                <p className="text-sm text-slate-400 mt-2">Rekam jejak seluruh aktivitas krusial yang dilakukan oleh jajaran Administrator.</p>
                            </div>
                            <button onClick={handleExportCsv} disabled={!auditLogs.length} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold py-2 px-5 rounded-xl text-sm border border-slate-700 transition-colors shadow-sm">
                                Export CSV
                            </button>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="text-center py-16 bg-slate-950/40 rounded-xl border border-slate-800/50">
                                <div className="mb-4 opacity-50 flex justify-center"><FolderOpen className="w-12 h-12 text-slate-500" /></div>
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
                ) : activeTab === 'categories' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-6">
                            <Tag className="w-10 h-10 p-2 bg-indigo-500/20 rounded-xl text-indigo-400" />
                            Manajemen Kategori
                        </h2>
                        {categoriesLoading ? (
                            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>
                        ) : (
                            <div className="overflow-x-auto bg-slate-950/40 rounded-xl border border-slate-800/50">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800/60 text-slate-400 bg-slate-900/50">
                                            <th className="py-3 px-5 font-semibold">Nama Kategori</th>
                                            <th className="py-3 px-5 font-semibold">Slug</th>
                                            <th className="py-3 px-5 font-semibold">Tipe</th>
                                            <th className="py-3 px-5 font-semibold text-right">Produk</th>
                                            <th className="py-3 px-5 font-semibold text-right">Iklan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.length === 0 ? (
                                            <tr><td colSpan="5" className="py-10 text-center text-slate-500">Belum ada kategori.</td></tr>
                                        ) : categories.map(cat => (
                                            <tr key={cat.id} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 px-5 font-semibold text-slate-200">{cat.name}</td>
                                                <td className="py-3 px-5 text-slate-400 font-mono text-xs">{cat.slug}</td>
                                                <td className="py-3 px-5">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${cat.type === 'product' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                        {cat.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5 text-right text-slate-300 font-bold">{cat.products_count ?? 0}</td>
                                                <td className="py-3 px-5 text-right text-slate-300 font-bold">{cat.advertisements_count ?? 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'transactions' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <ReceiptText className="w-10 h-10 p-2 bg-teal-500/20 rounded-xl text-teal-400" />
                                Riwayat Transaksi (100 Terbaru)
                            </h2>
                            <button 
                                onClick={handleExportTransactionsCsv} 
                                disabled={!transactions.length} 
                                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-2.5 px-5 rounded-xl text-sm border border-yellow-300 hover:border-yellow-200 transition-all shadow-[0_0_15px_rgba(250,204,21,0.4)] hover:shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                        {transactionsLoading ? (
                            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div></div>
                        ) : (
                            <div className="overflow-x-auto bg-slate-950/40 rounded-xl border border-slate-800/50">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800/60 text-slate-400 bg-slate-900/50">
                                            <th className="py-3 px-5 font-semibold">Pembeli</th>
                                            <th className="py-3 px-5 font-semibold">Email</th>
                                            <th className="py-3 px-5 font-semibold text-right">Total</th>
                                            <th className="py-3 px-5 font-semibold">Status</th>
                                            <th className="py-3 px-5 font-semibold">Pembayaran</th>
                                            <th className="py-3 px-5 font-semibold">Waktu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.length === 0 ? (
                                            <tr><td colSpan="6" className="py-10 text-center text-slate-500">Belum ada transaksi.</td></tr>
                                        ) : transactions.map(tx => (
                                            <tr key={tx.id} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 px-5 font-semibold text-slate-200">{tx.buyer}</td>
                                                <td className="py-3 px-5 text-slate-400 text-xs">{tx.email}</td>
                                                <td className="py-3 px-5 text-right font-bold text-teal-400">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.total)}
                                                </td>
                                                <td className="py-3 px-5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : tx.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tx.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>
                                                        {tx.payment_status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5 text-slate-400 text-xs font-mono">{tx.created_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'ads-packages' ? (
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-6">
                            <Package className="w-10 h-10 p-2 bg-amber-500/20 rounded-xl text-amber-400" />
                            Paket Iklan
                        </h2>
                        {packagesLoading ? (
                            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>
                        ) : packages.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">Belum ada paket iklan.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {packages.map(pkg => (
                                    <div key={pkg.id} className={`bg-slate-950/80 border rounded-2xl p-6 flex flex-col gap-3 ${pkg.type === 'premium' ? 'border-amber-500/30' : 'border-slate-700/40'}`}>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-black text-slate-100">{pkg.name}</h3>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${pkg.type === 'premium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-600/20 text-slate-400 border border-slate-700'}`}>
                                                {pkg.type}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-black text-amber-400">
                                            {pkg.price === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.price)}
                                        </p>
                                        <p className="text-sm text-slate-400">{pkg.duration_days} hari tayang</p>
                                        {Array.isArray(pkg.benefits) && pkg.benefits.length > 0 && (
                                            <ul className="text-xs text-slate-400 space-y-1 mt-1">
                                                {pkg.benefits.map((b, i) => <li key={i} className="flex items-start gap-1.5"><span className="text-amber-400 mt-0.5"><Check className="w-4 h-4" /></span>{b}</li>)}
                                            </ul>
                                        )}
                                        <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${pkg.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                            <button onClick={() => setEditingPackage({...pkg, benefits: pkg.benefits.join('\n')})} className="text-xs font-bold text-amber-400 hover:text-amber-300">
                                                Edit Paket
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {editingPackage && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white">Edit Paket Iklan</h3>
                                        <button onClick={() => setEditingPackage(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                                    </div>
                                    <form onSubmit={handleSavePackage} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">Nama Paket</label>
                                            <input type="text" value={editingPackage.name} onChange={e => setEditingPackage({...editingPackage, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1">Harga (Rp)</label>
                                                <input type="number" min="0" value={editingPackage.price} onChange={e => setEditingPackage({...editingPackage, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" required />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1">Durasi Tayang (Hari)</label>
                                                <input type="number" min="1" value={editingPackage.duration_days} onChange={e => setEditingPackage({...editingPackage, duration_days: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">Fitur/Benefits (Pisahkan dengan baris baru)</label>
                                            <textarea rows="4" value={editingPackage.benefits} onChange={e => setEditingPackage({...editingPackage, benefits: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" placeholder="Misal:&#10;Masa tayang 30 hari&#10;Tampil di Headline"></textarea>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={editingPackage.is_active} onChange={e => setEditingPackage({...editingPackage, is_active: e.target.checked})} className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500" />
                                                <span className="text-sm font-bold text-slate-300">Paket Aktif</span>
                                            </label>
                                            <button type="submit" disabled={savingPackage} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50">
                                                {savingPackage ? 'Menyimpan...' : 'Simpan'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'package-subscriptions' ? (
                    <AdminPackageSubscriptions token={token} />
                ) : activeTab === 'ads-reports' ? (
                    <div className="relative">
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-slate-900 pointer-events-none -z-10 rounded-3xl"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
                        
                        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center gap-3">
                                        <BarChart3 className="w-8 h-8 text-purple-400" />
                                        Laporan Iklan Baris
                                    </h2>
                                    <p className="text-slate-400 mt-2 font-medium">Ringkasan performa dan statistik menyeluruh dari layanan iklan baris platform.</p>
                                </div>
                                <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 backdrop-blur-md">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status Sistem</p>
                                        <p className="text-sm font-bold text-white">Berjalan Optimal</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { label: 'Iklan Aktif', desc: 'Disetujui & Tayang', value: adminStats?.activeAds ?? 0, color: 'from-emerald-500/20 to-emerald-900/20', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]', icon: CheckCircle2 },
                                    { label: 'Menunggu Review', desc: 'Perlu moderasi', value: adminStats?.pendingAds ?? 0, color: 'from-amber-500/20 to-amber-900/20', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]', icon: Clock },
                                    { label: 'Total Pengguna', desc: 'Terdaftar di platform', value: adminStats?.totalUsers ?? 0, color: 'from-indigo-500/20 to-indigo-900/20', border: 'border-indigo-500/30', text: 'text-indigo-400', glow: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]', icon: Users },
                                    { label: 'Total Merchant', desc: 'Toko terverifikasi', value: adminStats?.totalMerchants ?? 0, color: 'from-teal-500/20 to-teal-900/20', border: 'border-teal-500/30', text: 'text-teal-400', glow: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.2)]', icon: Store },
                                    { label: 'Total Produk', desc: 'Katalog aktif', value: adminStats?.totalProducts ?? 0, color: 'from-sky-500/20 to-sky-900/20', border: 'border-sky-500/30', text: 'text-sky-400', glow: 'group-hover:shadow-[0_0_30px_rgba(14,165,233,0.2)]', icon: Package },
                                    { label: 'Total Transaksi', desc: 'Order keseluruhan', value: adminStats?.totalOrders ?? 0, color: 'from-rose-500/20 to-rose-900/20', border: 'border-rose-500/30', text: 'text-rose-400', glow: 'group-hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]', icon: ReceiptText },
                                ].map(({ label, desc, value, color, border, text, glow, icon: Icon }) => (
                                    <div key={label} className={`group relative bg-gradient-to-br ${color} border ${border} rounded-3xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 ${glow} overflow-hidden`}>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"></div>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-slate-300 font-bold text-sm tracking-wide">{label}</p>
                                                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                                            </div>
                                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${text} shadow-inner backdrop-blur-md`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className={`text-4xl font-black ${text} drop-shadow-md`}>
                                                {value?.toLocaleString?.('id-ID') ?? value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <div className="mb-4 opacity-50 flex justify-center"><Wrench className="w-10 h-10 text-slate-500" /></div>
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
