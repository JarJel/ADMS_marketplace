import React from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertCircle, ChevronRight, BarChart2, Eye, MapPin, MousePointerClick } from 'lucide-react';

export default function OverviewTab({ 
  stats, 
  payoutAmount, setPayoutAmount, 
  bankName, setBankName, 
  accName, setAccName, 
  accNumber, setAccNumber, 
  payoutMsg, submitting, handlePayoutRequest 
}) {
  
  if (!stats) return null;

  // Derive stats for UI
  const cards = [
    { id: 1, title: "Total Pendapatan", value: `Rp${new Intl.NumberFormat('id-ID').format(stats.total_revenue)}`, icon: <DollarSign size={24} className="text-emerald-500" />, bgColor: "bg-emerald-100" },
    { id: 2, title: "Pesanan Baru", value: stats.orders_stats?.pending || 0, icon: <ShoppingCart size={24} className="text-blue-500" />, bgColor: "bg-blue-100" },
    { id: 3, title: "Pesanan Selesai", value: stats.orders_stats?.completed || 0, icon: <TrendingUp size={24} className="text-orange-500" />, bgColor: "bg-orange-100" },
    { id: 4, title: "Produk Aktif", value: stats.total_active_products || 0, icon: <Package size={24} className="text-purple-500" />, bgColor: "bg-purple-100" },
  ];

  // Get dynamic lists from backend
  const topProducts = stats.top_products || [];
  const adPerformance = stats.ad_performance || [];
  const demographics = stats.visitor_demographics || [];

  // Dummy Recent Orders
  const recentOrders = [
    { id: "ORD-001", customer: "Budi Santoso", date: "Hari Ini", total: "Rp 250.000", status: "Selesai" },
    { id: "ORD-002", customer: "Siti Aminah", date: "Hari Ini", total: "Rp 125.000", status: "Menunggu Pembayaran" },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Selesai":
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Selesai</span>;
      case "Dikirim":
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">Dikirim</span>;
      case "Diproses":
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Diproses</span>;
      case "Menunggu Pembayaran":
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">Menunggu</span>;
      default:
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((stat) => (
          <div key={stat.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group cursor-default">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Section: Chart & Withdrawal & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            💸 Tarik Dana Hasil Penjualan
          </h2>

          {payoutMsg && (
            <div className={`mb-6 p-4 rounded-xl text-sm border font-medium ${
                payoutMsg.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
            }`}>
                {payoutMsg.text}
            </div>
          )}

          <form onSubmit={handlePayoutRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Bank</label>
                    <select 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                        <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                        <option value="Muamalat">Bank Muamalat</option>
                        <option value="BCA Syariah">BCA Syariah</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah Tarik (Rp)</label>
                    <input 
                        type="number"
                        required
                        min="10000"
                        placeholder="Contoh: 100000"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Rekening</label>
                    <input 
                        type="text"
                        required
                        placeholder="Contoh: Haji Ahmad"
                        value={accName}
                        onChange={(e) => setAccName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Rekening</label>
                    <input 
                        type="text"
                        required
                        placeholder="Contoh: 7001234567"
                        value={accNumber}
                        onChange={(e) => setAccNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
            </div>

            <div className="pt-2">
              <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70"
              >
                  {submitting ? 'Mengirim Pengajuan...' : 'Ajukan Penarikan Sekarang'}
              </button>
            </div>
          </form>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} />
              Produk Terlaris
            </h2>
          </div>
          
          <div className="space-y-3 flex-1">
            {topProducts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl">Belum ada produk terjual.</p>
            ) : (
                topProducts.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-default group border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-slate-700">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{item.product?.name || 'Produk Dihapus'}</h4>
                        <p className="text-xs text-emerald-600 font-bold mt-0.5">{item.total_sold} Terjual</p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ad Performance */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart2 className="text-cyan-500" size={20} />
            Performa Iklan (CTR)
          </h2>
          {adPerformance.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl">Belum ada iklan aktif.</p>
          ) : (
              <div className="space-y-5">
                  {adPerformance.map(ad => {
                      const total = ad.views_count || 1;
                      const percentage = Math.min(100, Math.round(((ad.clicks_count || 0) / total) * 100));
                      return (
                          <div key={ad.id}>
                              <div className="flex justify-between items-end mb-1.5">
                                  <span className="text-sm font-bold text-slate-800 line-clamp-1 flex-1 pr-4">{ad.title}</span>
                                  <span className="text-xs font-bold text-cyan-600 shrink-0">{percentage}% CTR</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                                  <div className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500 font-medium">
                                  <span className="flex items-center gap-1"><Eye size={10} /> {ad.views_count || 0} views</span>
                                  <span className="flex items-center gap-1"><MousePointerClick size={10} /> {ad.clicks_count || 0} clicks</span>
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}
        </div>

        {/* Visitor Demographics */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin className="text-indigo-500" size={20} />
            Demografi Pengunjung (Top Kota)
          </h2>
          <div className="space-y-4">
              {demographics.map((demo, idx) => (
                  <div key={idx}>
                      <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-semibold text-slate-700">{demo.city}</span>
                          <span className="text-xs font-bold text-indigo-600">{demo.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/60">
                          <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${demo.percentage}%` }}></div>
                      </div>
                  </div>
              ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table (Dummy) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Pesanan Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{order.customer}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Ulasan Pelanggan</h2>
          {!stats.recent_reviews || stats.recent_reviews.length === 0 ? (
              <div className="text-sm text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl">Belum ada ulasan untuk toko Anda.</div>
          ) : (
              <div className="space-y-4">
                  {stats.recent_reviews.map((rev) => (
                      <div key={rev.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-800 text-sm">{rev.user.name}</span>
                              <span className="text-yellow-400 text-xs">{'⭐'.repeat(rev.rating)}</span>
                          </div>
                          <p className="text-sm text-slate-600">"{rev.comment}"</p>
                      </div>
                  ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
