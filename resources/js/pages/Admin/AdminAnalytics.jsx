import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, Wallet, Users, ShoppingCart, Download, Calendar, ChevronDown
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export const AdminAnalytics = ({ token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (data.success) setAnalytics(data.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const kpi        = analytics?.kpi        ?? {};
  const revenueData  = analytics?.revenueData  ?? [];
  const categoryData = analytics?.categoryData ?? [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-2xl"></div>
          <div className="h-96 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Analytics & Laporan</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau performa keuangan, transaksi, dan pertumbuhan platform.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gross Merchandise Value</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{fmt(kpi.gmv ?? 0)}</h3>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md mt-2 w-fit">
            <TrendingUp className="w-3 h-3" />
            {kpi.gmvGrowth >= 0 ? '+' : ''}{kpi.gmvGrowth ?? 0}% vs bulan lalu
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Net Platform Revenue (5%)</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{fmt(kpi.revenue ?? 0)}</h3>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mt-2">
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Pesanan</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{(kpi.totalOrders ?? 0).toLocaleString('id-ID')}</h3>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mt-2">
            <ShoppingCart className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pengguna Aktif</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{(kpi.activeUsers ?? 0).toLocaleString('id-ID')}</h3>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mt-2">
            <Users className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Chart (Monthly) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[380px]">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Grafik Pendapatan Bulanan</h3>
            <p className="text-xs text-slate-500 mt-1">GMV pesanan berbayar tahun {new Date().getFullYear()}</p>
          </div>
          <div className="flex-1 flex items-end gap-1 sm:gap-2 h-[240px]">
            {revenueData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative bg-slate-50 dark:bg-slate-800 rounded-t-sm overflow-visible h-full flex items-end">
                  <div
                    className="w-full bg-indigo-400 group-hover:bg-indigo-500 transition-all duration-500 rounded-t-sm"
                    style={{ height: `${d.value}%` }}
                  ></div>
                  {d.value > 0 && (
                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap">
                      {fmt(d.raw)}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Distribusi Kategori Produk</h3>
            {categoryData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Belum ada data kategori.</p>
            ) : (
              <div className="space-y-5">
                {categoryData.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-2.5 rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
