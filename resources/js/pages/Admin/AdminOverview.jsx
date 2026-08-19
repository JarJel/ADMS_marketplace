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
        <div className="h-32 bg-[#0F3040]/50 rounded-2xl border border-[#174256]"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-[#0F3040]/50 rounded-2xl border border-[#174256]"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-white">

      {/* Pending Action Center */}
      <div className="bg-[#0F3040] p-6 rounded-2xl border-2 border-[#FFBF00]/40 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#FFBF00]/5 rounded-full pointer-events-none blur-2xl"></div>
        <h3 className="font-extrabold text-lg text-[#FFBF00] flex items-center gap-2 mb-4 tracking-wide">
          <AlertCircle className="w-5 h-5 text-[#FFBF00]" />
          Pekerjaan yang Membutuhkan Tindakan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => onNavigate && onNavigate('merchants')} className="bg-[#071922] p-4 rounded-xl border border-[#174256] hover:border-[#FFBF00] hover:shadow-lg transition-all text-left flex flex-col items-start gap-1 group">
            <span className="text-2xl font-black text-[#FFBF00] group-hover:scale-105 transition-transform">{stats?.pendingMerchants ?? 0}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Verifikasi Merchant</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('products')} className="bg-[#071922] p-4 rounded-xl border border-[#174256] hover:border-[#FFBF00] hover:shadow-lg transition-all text-left flex flex-col items-start gap-1 group">
            <span className="text-2xl font-black text-[#FFBF00] group-hover:scale-105 transition-transform">{stats?.pendingProducts ?? 0}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Moderasi Produk</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('payouts')} className="bg-[#071922] p-4 rounded-xl border border-[#174256] hover:border-[#FFBF00] hover:shadow-lg transition-all text-left flex flex-col items-start gap-1 group">
            <span className="text-2xl font-black text-[#FFBF00] group-hover:scale-105 transition-transform">{stats?.pendingWithdrawals ?? 0}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Withdrawal</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('ads-moderation')} className="bg-[#071922] p-4 rounded-xl border border-[#174256] hover:border-[#FFBF00] hover:shadow-lg transition-all text-left flex flex-col items-start gap-1 group">
            <span className="text-2xl font-black text-[#FFBF00] group-hover:scale-105 transition-transform">{stats?.pendingAds ?? 0}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Iklan Pending</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F3040] p-5 rounded-2xl border border-[#174256] shadow-md flex items-center justify-between hover:border-[#FFBF00]/50 transition-all">
          <div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total User</p>
            <p className="text-2xl font-black text-white mt-1">{(stats?.totalUsers ?? 0).toLocaleString('id-ID')}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071922] border border-[#174256] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#FFBF00]" />
          </div>
        </div>

        <div className="bg-[#0F3040] p-5 rounded-2xl border border-[#174256] shadow-md flex items-center justify-between hover:border-[#FFBF00]/50 transition-all">
          <div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Merchant</p>
            <p className="text-2xl font-black text-white mt-1">{stats?.totalMerchants ?? 0}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071922] border border-[#174256] flex items-center justify-center">
            <Store className="w-5 h-5 text-[#FFBF00]" />
          </div>
        </div>

        <div className="bg-[#0F3040] p-5 rounded-2xl border border-[#174256] shadow-md flex items-center justify-between hover:border-[#FFBF00]/50 transition-all">
          <div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Product</p>
            <p className="text-2xl font-black text-white mt-1">{stats?.totalProducts ?? 0}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071922] border border-[#174256] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-[#FFBF00]" />
          </div>
        </div>

        <div className="bg-[#0F3040] p-5 rounded-2xl border border-[#174256] shadow-md flex items-center justify-between hover:border-[#FFBF00]/50 transition-all">
          <div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Ads</p>
            <p className="text-2xl font-black text-white mt-1">{stats?.activeAds ?? 0}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071922] border border-[#174256] flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-[#FFBF00]" />
          </div>
        </div>

        <div className="bg-[#0F3040] p-5 rounded-2xl border border-[#174256] shadow-md flex items-center justify-between hover:border-[#FFBF00]/50 transition-all">
          <div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-white mt-1">{stats?.totalOrders ?? 0}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071922] border border-[#174256] flex items-center justify-center">
            <Receipt className="w-5 h-5 text-[#FFBF00]" />
          </div>
        </div>

        <div className="bg-[#0F3040] p-5 rounded-2xl border border-[#174256] shadow-md flex items-center justify-between hover:border-[#FFBF00]/50 transition-all">
          <div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Gross Merchandise (GMV)</p>
            <p className="text-base font-black text-[#FFBF00] mt-1">{fmt(stats?.gmv ?? 0)}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071922] border border-[#174256] flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[#FFBF00]" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F3040] to-[#071922] p-5 rounded-2xl border-2 border-[#FFBF00] shadow-lg flex items-center justify-between col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBF00]/10 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <p className="text-xs font-black text-[#FFBF00] uppercase tracking-wider">Net Platform Revenue (5%)</p>
            <p className="text-2xl font-black text-white mt-1">{fmt(stats?.platformRevenue ?? 0)}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFBF00] flex items-center justify-center shadow-lg shadow-[#FFBF00]/20">
            <Wallet className="w-6 h-6 text-[#0F3040]" />
          </div>
        </div>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Chart (7 hari terakhir) */}
        <div className="lg:col-span-2 bg-[#0F3040] p-6 rounded-2xl border border-[#174256] shadow-md min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-white">Revenue 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-300 mt-0.5">Total nilai pesanan yang masuk per hari</p>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-2 sm:gap-4 h-48 mt-auto">
            {(stats?.chartData ?? []).map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative bg-[#071922] rounded-t-md overflow-hidden h-full flex items-end">
                  <div
                    className="w-full bg-[#FFBF00] group-hover:bg-[#ffcd33] transition-all duration-500 rounded-t-sm"
                    style={{ height: `${maxChart > 0 ? Math.round((d.value / maxChart) * 100) : 0}%` }}
                  ></div>
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#071922] text-[#FFBF00] border border-[#FFBF00]/40 text-[10px] font-bold py-1 px-2 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {fmt(d.value)}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-300">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-[#0F3040] p-6 rounded-2xl border border-[#174256] shadow-md min-h-[300px] flex flex-col">
          <h3 className="font-bold text-lg text-white mb-4">Recent Activity</h3>
          {(stats?.recentActivity ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Belum ada aktivitas.</p>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              {stats.recentActivity.map((act, i) => (
                <div key={i} className="flex gap-3 relative before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-0.5 before:bg-[#174256] last:before:hidden">
                  <div className="w-6 h-6 rounded-full bg-[#071922] border border-[#FFBF00]/50 flex items-center justify-center shrink-0 z-10">
                    <ShieldAlert className="w-3 h-3 text-[#FFBF00]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white capitalize">{act.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-300">oleh {act.admin} · {act.created_at}</p>
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

