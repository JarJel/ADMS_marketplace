import React, { useState } from 'react';
import { 
  Users, Store, ShoppingBag, Receipt, DollarSign, Wallet, AlertCircle, Megaphone,
  ArrowUpRight, ArrowDownRight, Clock, ShieldAlert, CreditCard
} from 'lucide-react';

export const AdminOverview = ({ onNavigate }) => {
  const [chartFilter, setChartFilter] = useState('30 Hari');

  const mockStats = {
    totalUsers: 12850,
    totalMerchants: 3,
    totalProducts: 156,
    totalOrders: 1,
    totalTransactions: 1250,
    gmv: 'Rp 450.000.000',
    platformRevenue: 'Rp 22.500.000',
    commission: '5%',
    pendingMerchants: 17,
    pendingProducts: 32,
    pendingWithdrawals: 8,
    pendingRefunds: 4,
    activeAds: 145,
  };

  // Dummy Chart Data
  const chartData = [
    { label: 'Sen', value: 30 },
    { label: 'Sel', value: 45 },
    { label: 'Rab', value: 25 },
    { label: 'Kam', value: 60 },
    { label: 'Jum', value: 80 },
    { label: 'Sab', value: 50 },
    { label: 'Min', value: 90 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Pending Action Center */}
      <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm">
        <h3 className="font-bold text-lg text-rose-900 flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5" />
          Pekerjaan yang Membutuhkan Tindakan (Pending Action Center)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <button onClick={() => onNavigate && onNavigate('merchants-verification')} className="bg-white p-3 rounded-xl border border-rose-200 hover:border-rose-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-rose-600">{mockStats.pendingMerchants}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Verifikasi Merchant</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('marketplace-moderation')} className="bg-white p-3 rounded-xl border border-rose-200 hover:border-rose-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-rose-600">{mockStats.pendingProducts}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Moderasi Produk</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('finance')} className="bg-white p-3 rounded-xl border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-amber-600">{mockStats.pendingWithdrawals}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Withdrawal</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('transactions')} className="bg-white p-3 rounded-xl border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-amber-600">{mockStats.pendingRefunds}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Refund Request</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('moderation')} className="bg-white p-3 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-blue-600">12</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">User Reports</span>
          </button>
          <button onClick={() => onNavigate && onNavigate('support')} className="bg-white p-3 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all text-left flex flex-col items-start gap-1">
            <span className="text-2xl font-black text-blue-600">6</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Support Tickets</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total User</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{mockStats.totalUsers.toLocaleString('id-ID')}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Merchant</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{mockStats.totalMerchants}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <Store className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Product</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{mockStats.totalProducts}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-cyan-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Ads</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{mockStats.activeAds}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{mockStats.totalOrders}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Merchandise (GMV)</p>
            <p className="text-xl font-black text-slate-900 mt-1">{mockStats.gmv}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between col-span-2 lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div>
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Net Platform Revenue</p>
            <p className="text-3xl font-black text-white mt-1">{mockStats.platformRevenue}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </div>
      
      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart Component */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Revenue Overview</h3>
            <select 
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="7 Hari">7 Hari</option>
              <option value="30 Hari">30 Hari</option>
              <option value="3 Bulan">3 Bulan</option>
              <option value="1 Tahun">1 Tahun</option>
            </select>
          </div>
          <div className="flex-1 flex items-end gap-2 sm:gap-4 h-48 mt-auto">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative bg-slate-50 rounded-t-md overflow-hidden h-full flex items-end">
                  <div 
                    className="w-full bg-cyan-400 group-hover:bg-cyan-500 transition-all duration-500 rounded-t-sm"
                    style={{ height: `${data.value}%` }}
                  ></div>
                  {/* Tooltip on hover */}
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-10">
                    Rp {(data.value * 150000).toLocaleString('id-ID')}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{data.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Recent Activity</h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            
            <div className="flex gap-3 relative before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
              <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 z-10">
                <Store className="w-3 h-3 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Merchant baru mendaftar</p>
                <p className="text-xs text-slate-500">5 menit lalu</p>
              </div>
            </div>

            <div className="flex gap-3 relative before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
              <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 z-10">
                <ShieldAlert className="w-3 h-3 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Produk baru menunggu moderasi</p>
                <p className="text-xs text-slate-500">10 menit lalu</p>
              </div>
            </div>

            <div className="flex gap-3 relative before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 z-10">
                <CreditCard className="w-3 h-3 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Withdrawal baru</p>
                <p className="text-xs text-slate-500">20 menit lalu</p>
              </div>
            </div>

            <div className="flex gap-3 relative before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
              <div className="w-6 h-6 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0 z-10">
                <ShoppingBag className="w-3 h-3 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Order baru</p>
                <p className="text-xs text-slate-500">30 menit lalu</p>
              </div>
            </div>

            <div className="flex gap-3 relative before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
              <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 z-10">
                <AlertCircle className="w-3 h-3 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Refund request baru</p>
                <p className="text-xs text-slate-500">45 menit lalu</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
