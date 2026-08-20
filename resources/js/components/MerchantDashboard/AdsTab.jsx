import React, { useState } from 'react';
import { Megaphone, Eye, MousePointerClick, Plus, Crown } from 'lucide-react';
import CreateAdModal from './CreateAdModal';

export default function AdsTab({ ads, fetchAds, token, packageSubscriptions = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeSub = packageSubscriptions.find(sub => sub.status === 'active');
  const pendingSub = packageSubscriptions.find(sub => sub.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Megaphone className="text-[#FFBF00]" />
          Iklan Baris Anda
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#FFBF00] hover:bg-amber-400 text-[#0F3040] text-sm font-black py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#FFBF00]/20 uppercase tracking-wider"
        >
          <Plus size={18} />
          Tambah Iklan
        </button>
      </div>

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

      {ads && ads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad.id} className="bg-[#071922] shadow-xl border border-[#174256] rounded-2xl p-5 hover:shadow-2xl hover:border-[#FFBF00] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-white group-hover:text-[#FFBF00] transition-colors line-clamp-2">{ad.title}</h4>
                <span className={`px-2 py-1 text-[10px] font-black rounded-md uppercase tracking-wider shrink-0 ml-2 border ${
                  ad.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#0B2330] text-slate-300 border-[#174256]'
                }`}>
                  {ad.status}
                </span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#174256] flex items-center justify-between gap-4 text-sm font-bold">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
                    <Eye size={16} />
                  </div>
                  <span>{ad.views_count} <span className="hidden sm:inline">Views</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <MousePointerClick size={16} />
                  </div>
                  <span>{ad.clicks_count} <span className="hidden sm:inline">Clicks</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#071922] rounded-2xl shadow-xl border border-[#174256] p-12 flex flex-col items-center justify-center text-slate-400">
          <Megaphone size={48} className="text-[#174256] mb-4" />
          <p className="text-base font-black text-white mb-1">Belum ada iklan</p>
          <p className="text-sm">Anda belum memasang iklan baris apapun.</p>
        </div>
      )}

      <CreateAdModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={token}
        fetchAds={fetchAds}
      />
    </div>
  );
}
