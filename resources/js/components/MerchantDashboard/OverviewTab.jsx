import React from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertCircle, ChevronRight, BarChart2, Eye, MapPin, MousePointerClick, Crown, Wallet, Star } from 'lucide-react';

export default function OverviewTab({ 
  stats, 
  payoutAmount, setPayoutAmount, 
  bankName, setBankName, 
  accName, setAccName, 
  accNumber, setAccNumber, 
  payoutMsg, submitting, handlePayoutRequest,
  packageSubscriptions = []
}) {
  
  const activeSub = packageSubscriptions.find(sub => sub.status === 'active');
  const pendingSub = packageSubscriptions.find(sub => sub.status === 'pending');

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

  const recentOrders = stats.recent_orders || [];

  const getStatusBadge = (status) => {
    const map = {
      completed: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Selesai' },
      shipped:   { cls: 'bg-blue-100 text-blue-700 border-blue-200',           label: 'Dikirim' },
      processing:{ cls: 'bg-yellow-100 text-yellow-700 border-yellow-200',     label: 'Diproses' },
      pending:   { cls: 'bg-slate-100 text-slate-700 border-slate-200',        label: 'Menunggu' },
      cancelled: { cls: 'bg-rose-100 text-rose-700 border-rose-200',           label: 'Dibatalkan' },
    };
    const s = map[status] ?? { cls: 'bg-slate-100 text-slate-600 border-slate-200', label: status };
    return <span className={`px-3 py-1 text-xs font-medium rounded-full border ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Premium Subscription CTA or Active Status */}
      {activeSub ? (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Crown className="text-emerald-400" size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-400">Paket Iklan Aktif: {activeSub.package?.name || 'Premium'}</h3>
              <p className="text-xs text-slate-300">Nikmati keuntungan posisi eksklusif untuk iklan Anda.</p>
            </div>
          </div>
        </div>
      ) : pendingSub ? (
        <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Crown className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-blue-400">Pesanan Paket Menunggu Pembayaran</h3>
              <p className="text-xs text-slate-300">Harap selesaikan pembayaran untuk mengaktifkan paket {pendingSub.package?.name}.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Crown className="text-amber-400" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-400">Tingkatkan Penjualan Anda!</h3>
              <p className="text-sm text-slate-300">Dapatkan posisi eksklusif di halaman utama dengan langganan Iklan Premium.</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#0F3040] font-black px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all uppercase tracking-wide text-sm"
          >
            Langganan Sekarang
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
        {cards.map((stat) => (
          <div key={stat.id} className="bg-[#071922] rounded-2xl p-3.5 sm:p-5 shadow-xl border border-[#174256] hover:shadow-2xl hover:border-[#FFBF00] transition-all group cursor-default">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-400 mb-1 truncate">{stat.title}</p>
                <h3 className="text-base sm:text-2xl font-black text-white group-hover:text-[#FFBF00] transition-colors truncate">{stat.value}</h3>
              </div>
              <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${stat.bgColor}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Section: Chart & Withdrawal & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 bg-[#071922] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#174256]">
          <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Wallet className="text-[#FFBF00]" size={20} />
            Tarik Dana Hasil Penjualan
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
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">Nama Bank</label>
                    <select 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-[#0B2330] border border-[#174256] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all"
                    >
                        <option value="BSI" className="bg-[#0B2330]">BSI (Bank Syariah Indonesia)</option>
                        <option value="Muamalat" className="bg-[#0B2330]">Bank Muamalat</option>
                        <option value="BCA Syariah" className="bg-[#0B2330]">BCA Syariah</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">Jumlah Tarik (Rp)</label>
                    <input 
                        type="number"
                        required
                        min="10000"
                        placeholder="Contoh: 100000"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        className="w-full bg-[#0B2330] border border-[#174256] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">Nama Rekening</label>
                    <input 
                        type="text"
                        required
                        placeholder="Contoh: Haji Ahmad"
                        value={accName}
                        onChange={(e) => setAccName(e.target.value)}
                        className="w-full bg-[#0B2330] border border-[#174256] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">Nomor Rekening</label>
                    <input 
                        type="text"
                        required
                        placeholder="Contoh: 7001234567"
                        value={accNumber}
                        onChange={(e) => setAccNumber(e.target.value)}
                        className="w-full bg-[#0B2330] border border-[#174256] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all"
                    />
                </div>
            </div>

            <div className="pt-2">
              <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-[#FFBF00] hover:bg-amber-400 text-[#0F3040] font-black py-2.5 px-6 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 shadow-md shadow-[#FFBF00]/20 uppercase tracking-wider"
              >
                  {submitting ? 'Mengirim Pengajuan...' : 'Ajukan Penarikan Sekarang'}
              </button>
            </div>
          </form>
        </div>

        {/* Top Selling Products */}
        <div className="bg-[#071922] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#174256] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-500" size={20} />
              Produk Terlaris
            </h2>
          </div>
          
          <div className="space-y-3 flex-1">
            {topProducts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4 bg-[#0B2330] rounded-xl border border-[#174256]">Belum ada produk terjual.</p>
            ) : (
                topProducts.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B2330] hover:bg-[#174256]/50 transition-colors cursor-default group border border-[#174256]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#071922] border border-[#174256] shadow-sm flex items-center justify-center font-black text-white">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.product?.name || 'Produk Dihapus'}</h4>
                        <p className="text-xs text-emerald-400 font-bold mt-0.5">{item.total_sold} Terjual</p>
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
        <div className="bg-[#071922] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#174256]">
          <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <BarChart2 className="text-cyan-500" size={20} />
            Performa Iklan (CTR)
          </h2>
          {adPerformance.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 bg-[#0B2330] rounded-xl border border-[#174256]">Belum ada iklan aktif.</p>
          ) : (
              <div className="space-y-5">
                  {adPerformance.map(ad => {
                      const total = ad.views_count || 1;
                      const percentage = Math.min(100, Math.round(((ad.clicks_count || 0) / total) * 100));
                      return (
                          <div key={ad.id}>
                              <div className="flex justify-between items-end mb-1.5">
                                  <span className="text-sm font-bold text-slate-100 line-clamp-1 flex-1 pr-4">{ad.title}</span>
                                  <span className="text-xs font-black text-cyan-400 shrink-0">{percentage}% CTR</span>
                              </div>
                              <div className="w-full bg-[#0B2330] rounded-full h-2.5 overflow-hidden border border-[#174256]">
                                  <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400 font-bold">
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
        <div className="bg-[#071922] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#174256]">
          <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
            <MapPin className="text-indigo-400" size={20} />
            Demografi Pengunjung (Top Kota)
          </h2>
          <div className="space-y-4">
              {demographics.map((demo, idx) => (
                  <div key={idx}>
                      <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-bold text-slate-200">{demo.city}</span>
                          <span className="text-xs font-black text-indigo-400">{demo.percentage}%</span>
                      </div>
                      <div className="w-full bg-[#0B2330] rounded-full h-3 overflow-hidden border border-[#174256]">
                          <div className="bg-indigo-500 h-3 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${demo.percentage}%` }}></div>
                      </div>
                  </div>
              ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-[#071922] rounded-2xl shadow-xl border border-[#174256] overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#174256] flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-white">Pesanan Terbaru</h2>
          </div>
          
          {recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400 text-center">Belum ada pesanan masuk.</p>
          ) : (
            <>
              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#0B2330] text-slate-300 border-b border-[#174256]">
                    <tr>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wider">Pelanggan</th>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#174256]">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-[#0B2330]/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-white font-mono text-xs">{order.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-200">{order.customer}</td>
                        <td className="px-6 py-4 text-slate-300 font-bold">{order.total}</td>
                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (< md) */}
              <div className="block md:hidden p-3 space-y-2.5">
                {recentOrders.map((order, index) => (
                  <div key={index} className="bg-[#0B2330] p-3 rounded-xl border border-[#174256] flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">#{order.id}</span>
                        <span className="font-bold text-xs text-white truncate">{order.customer}</span>
                      </div>
                      <p className="text-xs font-black text-emerald-400">{order.total}</p>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-[#071922] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#174256]">
          <h2 className="text-lg font-black text-white mb-6">Ulasan Pelanggan</h2>
          {!stats.recent_reviews || stats.recent_reviews.length === 0 ? (
              <div className="text-sm text-slate-400 italic p-4 text-center bg-[#0B2330] rounded-xl border border-[#174256]">Belum ada ulasan untuk toko Anda.</div>
          ) : (
              <div className="space-y-4">
                  {stats.recent_reviews.map((rev) => (
                      <div key={rev.id} className="border-b border-[#174256] pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-white text-sm">{rev.user.name}</span>
                              <div className="flex items-center gap-0.5">
                                  {[...Array(rev.rating || 5)].map((_, i) => (
                                      <Star key={i} className="w-3.5 h-3.5 fill-[#FFBF00] text-[#FFBF00]" />
                                  ))}
                              </div>
                          </div>
                          <p className="text-sm text-slate-300 italic">"{rev.comment}"</p>
                      </div>
                  ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
