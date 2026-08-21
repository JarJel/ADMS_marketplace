import React, { useState } from 'react';
import { Megaphone, Eye, MousePointerClick, Plus, Crown, Trash2, Edit } from 'lucide-react';
import CreateAdModal from './CreateAdModal';

export default function AdsTab({ user, ads, fetchAds, token, packageSubscriptions = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeSub = packageSubscriptions.find(sub => sub.status === 'active');
  const pendingSub = packageSubscriptions.find(sub => sub.status === 'pending');
  const [viewingAd, setViewingAd] = useState(null);
  const [editingAd, setEditingAd] = useState(null);

  const handleDeleteAd = async (adId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus iklan ini?')) return;
    try {
      const res = await fetch(`/api/customer/ads/${adId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setViewingAd(null);
        fetchAds();
      } else {
        alert(data.message || 'Gagal menghapus iklan.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    }
  };

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
            <div key={ad.id} onClick={() => setViewingAd(ad)} className="bg-[#071922] shadow-xl border border-[#174256] rounded-2xl p-5 hover:shadow-2xl hover:border-[#FFBF00] transition-all group cursor-pointer">
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

      {viewingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0B2330] rounded-2xl border border-[#174256] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#174256] shrink-0">
              <h3 className="font-extrabold text-white text-lg">Detail Iklan</h3>
              <button onClick={() => setViewingAd(null)} className="text-slate-400 hover:text-white text-2xl font-bold leading-none cursor-pointer">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto text-slate-300 space-y-4">
              <h2 className="text-2xl font-black text-white">{viewingAd.title}</h2>
              {viewingAd.price && (
                <div className="text-xl font-bold text-[#FFBF00]">
                  Rp {Number(viewingAd.price).toLocaleString('id-ID')}
                </div>
              )}
              <div className="bg-[#071922] p-4 rounded-xl border border-[#174256]">
                <h4 className="font-bold text-white mb-2">Deskripsi</h4>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewingAd.description || 'Tidak ada deskripsi.'}</p>
              </div>
            </div>
            <div className="bg-[#071922] p-4 sm:p-6 border-t border-[#174256] flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
              <button 
                onClick={() => {
                  setEditingAd(viewingAd);
                  setIsModalOpen(true);
                  setViewingAd(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#174256] hover:bg-[#1a4b62] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Edit size={18} />
                Edit Iklan
              </button>
              <button 
                onClick={() => handleDeleteAd(viewingAd.id)}
                className="w-full sm:w-auto px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 font-bold border border-rose-500/30 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
                Hapus Iklan
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateAdModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAd(null);
        }}
        token={token}
        fetchAds={fetchAds}
        adToEdit={editingAd}
        user={user}
      />
    </div>
  );
}
