import React, { useState } from 'react';
import { Megaphone, Eye, MousePointerClick, Plus } from 'lucide-react';
import CreateAdModal from './CreateAdModal';

export default function AdsTab({ ads, fetchAds, token }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Megaphone className="text-indigo-600" />
          Iklan Baris Anda
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={18} />
          Tambah Iklan
        </button>
      </div>

      {ads && ads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad.id} className="bg-white shadow-sm border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{ad.title}</h4>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 ml-2 ${
                  ad.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {ad.status}
                </span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                    <Eye size={16} />
                  </div>
                  <span>{ad.views_count} <span className="hidden sm:inline">Views</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <div className="p-1.5 bg-purple-50 text-purple-500 rounded-lg">
                    <MousePointerClick size={16} />
                  </div>
                  <span>{ad.clicks_count} <span className="hidden sm:inline">Clicks</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-slate-500">
          <Megaphone size={48} className="text-slate-300 mb-4" />
          <p className="text-base font-medium">Belum ada iklan</p>
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
