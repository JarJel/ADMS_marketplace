import React from 'react';
import { Download } from 'lucide-react';

export default function DownloadsTab({ downloads }) {
    return (
        <div className="space-y-6 text-left">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-800">Aset Digital Siap Unduh</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Semua file produk yang telah Anda beli secara amanah.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {downloads.map((d) => (
                    <div key={d.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div className="aspect-[16/10] w-full bg-slate-100 relative">
                            <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                                <h4 className="font-extrabold text-xs text-slate-800 leading-snug line-clamp-2">{d.title}</h4>
                                <span className="block text-[10px] text-slate-400">Oleh: <span className="font-semibold">{d.merchant}</span></span>
                                <span className="inline-block bg-indigo-50 text-[9px] font-bold text-indigo-600 px-2 py-0.5 rounded-md mt-1">{d.size}</span>
                            </div>

                            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer mt-4 shadow-sm">
                                <Download className="w-4 h-4" />
                                <span>Unduh File Sekarang</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
