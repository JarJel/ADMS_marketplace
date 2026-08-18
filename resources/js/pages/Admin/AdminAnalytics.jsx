import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  Users, 
  ShoppingCart,
  Download,
  Calendar,
  ChevronDown
} from 'lucide-react';

export const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('30 Hari Terakhir');

  // Dummy Data for KPI
  const stats = {
    gmv: 'Rp 1.450.000.000',
    gmvGrowth: '+12.5%',
    revenue: 'Rp 72.500.000',
    revenueGrowth: '+15.2%',
    orders: 3450,
    ordersGrowth: '+5.4%',
    activeUsers: 12540,
    usersGrowth: '+2.1%',
  };

  // Dummy Data for Revenue Chart (Bar)
  const revenueData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 38 },
    { label: 'Apr', value: 65 },
    { label: 'Mei', value: 48 },
    { label: 'Jun', value: 70 },
    { label: 'Jul', value: 85 },
    { label: 'Ags', value: 60 },
    { label: 'Sep', value: 90 },
    { label: 'Okt', value: 75 },
    { label: 'Nov', value: 95 },
    { label: 'Des', value: 110 },
  ];

  // Dummy Data for Category Sales (Horizontal Bar)
  const categoryData = [
    { name: 'Template Website', value: 85, color: 'bg-indigo-500' },
    { name: 'Plugin & Script', value: 65, color: 'bg-blue-500' },
    { name: 'E-Book & Kursus', value: 45, color: 'bg-cyan-500' },
    { name: 'Desain Grafis', value: 30, color: 'bg-emerald-500' },
    { name: 'Software LIS', value: 20, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Analytics & Laporan</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau performa keuangan, transaksi, dan pertumbuhan platform.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Calendar className="w-4 h-4 text-slate-400" />
            {dateRange}
            <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* GMV */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Gross Merchandise Value</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.gmv}</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              {stats.gmvGrowth}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Net Platform Revenue</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.revenue}</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              {stats.revenueGrowth}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Pesanan Sukses</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.orders.toLocaleString('id-ID')}</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              {stats.ordersGrowth}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pengguna Aktif</p>
          <div className="flex items-end gap-2 mb-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeUsers.toLocaleString('id-ID')}</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              {stats.usersGrowth}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[380px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Grafik Pendapatan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Perbandingan GMV vs Platform Revenue tahun ini</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700 block"></span> GMV
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-indigo-500 block"></span> Revenue
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-end gap-2 sm:gap-4 relative pt-6">
            {/* Grid lines (Decorative) */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-b border-slate-100 dark:border-slate-800/60 border-dashed flex-1"></div>
              ))}
            </div>

            {revenueData.map((data, idx) => {
              const heightGmv = `${data.value}%`;
              const heightRev = `${Math.max(10, data.value * 0.3)}%`; // Mock revenue relation

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group z-10 h-full justify-end">
                  <div className="w-full max-w-[40px] flex items-end justify-center gap-0.5 sm:gap-1 h-[240px]">
                    {/* GMV Bar */}
                    <div className="w-1/2 bg-slate-200 dark:bg-slate-700/50 rounded-t-sm transition-all duration-300 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 relative" style={{ height: heightGmv }}>
                      {/* Tooltip */}
                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-xl pointer-events-none transition-opacity whitespace-nowrap">
                        GMV: Rp {(data.value * 2500000).toLocaleString('id-ID')}
                      </div>
                    </div>
                    {/* Revenue Bar */}
                    <div className="w-1/2 bg-indigo-500 rounded-t-sm transition-all duration-300 group-hover:bg-indigo-400 relative" style={{ height: heightRev }}>
                       {/* Tooltip */}
                       <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold py-1 px-2 rounded shadow-xl pointer-events-none transition-opacity whitespace-nowrap">
                        Rev: Rp {(data.value * 2500000 * 0.1).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2">{data.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-Charts & Metrics */}
        <div className="flex flex-col gap-6">
          
          {/* Top Categories */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Penjualan Kategori Tertinggi</h3>
            <div className="space-y-5">
              {categoryData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-slate-900 dark:text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Source Mock */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Traffic Insights</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Organik</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">45%</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Iklan Baris</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">32%</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Direct</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">15%</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Sosmed</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">8%</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
