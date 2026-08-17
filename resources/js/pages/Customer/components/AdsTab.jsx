import React from 'react';
import { Megaphone } from 'lucide-react';

export default function AdsTab({ advertisements, onNavigate }) {
    return (
        <div className="space-y-6 text-left">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                    <h3 className="font-extrabold text-sm text-slate-800">Iklan Baris Saya</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Kelola semua listing iklan gratis dan premium Anda.</p>
                </div>
                <button 
                    onClick={() => onNavigate('create_ad')}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <Megaphone className="w-4 h-4" />
                    Pasang Iklan Baru
                </button>
            </div>

            <div className="space-y-4">
                {advertisements.map((ad) => (
                    <div key={ad.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                                    {ad.category}
                                </span>
                                <span className={`font-bold text-[9px] px-2 py-0.5 rounded uppercase ${
                                    ad.package === 'VIP Premium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    {ad.package}
                                </span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{ad.title}</h4>
                            
                            <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                <span>Views: <strong className="text-slate-600">{ad.views}</strong></span>
                                <span>Clicks: <strong className="text-slate-600">{ad.clicks}</strong></span>
                                <span className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${ad.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                    <span className="font-bold">{ad.status}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                                Edit Iklan
                            </button>
                            {ad.package !== 'VIP Premium' && (
                                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-extrabold rounded-xl transition-colors shadow-sm cursor-pointer">
                                    Upgrade ke VIP
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
