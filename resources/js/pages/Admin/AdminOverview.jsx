import React, { useState, useEffect } from 'react';
import {
  Users, Store, ShoppingBag, Receipt, DollarSign, Wallet, AlertCircle, Megaphone,
  ShieldAlert, CreditCard
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export const AdminOverview = ({ onNavigate, token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const maxChart = stats?.chartData ? Math.max(...stats.chartData.map(d => d.value), 1) : 1;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-2xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Pending Action Center */}
      <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm">
        <h3 className="font-bold text-lg text-rose-900 flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5" />
          Pekerjaan yang Membutuhkan Tindakan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => onNavigate && onNavigate('merchants')} className="bg-white p-3 rounded-xl border border-rose-200 hover:border-rose-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-rose-600">{stats?.pendingMerchants ?? 0}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Verifikasi Merchant</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('products')} className="bg-white p-3 rounded-xl border border-rose-200 hover:border-rose-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-rose-600">{stats?.pendingProducts ?? 0}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Moderasi Produk</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('payouts')} className="bg-white p-3 rounded-xl border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-amber-600">{stats?.pendingWithdrawals ?? 0}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Withdrawal</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('ads-moderation')} className="bg-white p-3 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-blue-600">{stats?.pendingAds ?? 0}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Iklan Pending</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total User</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{(stats?.totalUsers ?? 0).toLocaleString('id-ID')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Merchant</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalMerchants ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <Store className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Product</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalProducts ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-cyan-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Ads</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats?.activeAds ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalOrders ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Merchandise (GMV)</p>
            <p className="text-base font-black text-slate-900 mt-1">{fmt(stats?.gmv ?? 0)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div>
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Net Platform Revenue (5%)</p>
            <p className="text-2xl font-black text-white mt-1">{fmt(stats?.platformRevenue ?? 0)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Chart (7 hari terakhir) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Revenue 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-400 mt-0.5">Total nilai pesanan yang masuk per hari</p>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-2 sm:gap-4 h-48 mt-auto">
            {(stats?.chartData ?? []).map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative bg-slate-50 rounded-t-md overflow-hidden h-full flex items-end">
                  <div
                    className="w-full bg-cyan-400 group-hover:bg-cyan-500 transition-all duration-500 rounded-t-sm"
                    style={{ height: `${maxChart > 0 ? Math.round((d.value / maxChart) * 100) : 0}%` }}
                  ></div>
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {fmt(d.value)}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Recent Activity</h3>
          {(stats?.recentActivity ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Belum ada aktivitas.</p>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              {stats.recentActivity.map((act, i) => (
                <div key={i} className="flex gap-3 relative before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 z-10">
                    <ShieldAlert className="w-3 h-3 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 capitalize">{act.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500">oleh {act.admin} · {act.created_at}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
