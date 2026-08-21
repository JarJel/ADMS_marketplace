import React from 'react';
import { FileText, Star, ChevronLeft } from 'lucide-react';

export default function PurchasesTab({ purchases, formatCurrency, onBack }) {
    return (
        <div className="space-y-4 text-left">
            {onBack && (
                <button 
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-300 shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Kembali</span>
                </button>
            )}

            <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-md shadow-slate-200/70 overflow-hidden">
                <div className="p-6 sm:p-7 border-b-2 border-slate-300 bg-slate-50/70">
                    <h3 className="font-bold text-lg text-slate-800">Daftar Transaksi Saya</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Riwayat lengkap pembelian produk digital Anda.</p>
                </div>
            <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[700px] text-sm border-collapse">
                    <thead className="bg-slate-200/80 text-slate-800 font-bold text-xs uppercase border-b-2 border-slate-300">
                        <tr>
                            <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 last:border-r-0 whitespace-nowrap">ID Transaksi</th>
                            <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 last:border-r-0 whitespace-nowrap">Merchant</th>
                            <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 last:border-r-0 whitespace-nowrap">Tanggal</th>
                            <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 last:border-r-0 whitespace-nowrap">Total</th>
                            <th className="px-4 sm:px-6 py-4 text-left tracking-wider border-r border-slate-300/60 last:border-r-0 whitespace-nowrap">Status</th>
                            <th className="px-4 sm:px-6 py-4 text-center tracking-wider whitespace-nowrap">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-medium text-sm">
                        {purchases.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 sm:px-6 py-4.5 font-bold font-mono text-slate-900 border-r border-slate-200/70 last:border-r-0 whitespace-nowrap">{p.id}</td>
                                <td className="px-4 sm:px-6 py-4.5 font-medium border-r border-slate-200/70 last:border-r-0 whitespace-nowrap">{p.merchant}</td>
                                <td className="px-4 sm:px-6 py-4.5 text-slate-600 border-r border-slate-200/70 last:border-r-0 whitespace-nowrap">{p.date}</td>
                                <td className="px-4 sm:px-6 py-4.5 font-bold text-teal-600 border-r border-slate-200/70 last:border-r-0 whitespace-nowrap">{formatCurrency(p.total)}</td>
                                <td className="px-4 sm:px-6 py-4.5 border-r border-slate-200/70 last:border-r-0 whitespace-nowrap">
                                    <span className={`inline-block font-bold px-3.5 py-1 rounded-full text-xs uppercase tracking-wide border ${
                                        p.status === 'PAID' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' :
                                        p.status === 'PENDING' ? 'bg-amber-500/15 text-amber-700 border-amber-500/30' :
                                        'bg-rose-500/15 text-rose-700 border-rose-500/30'
                                    }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-4 sm:px-6 py-4.5 text-center whitespace-nowrap">
                                    <div className="flex justify-center gap-2">
                                        <button className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm border border-slate-300">
                                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                                            Invoice
                                        </button>
                                        {p.status === 'PAID' && (
                                            <button className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm border border-indigo-300">
                                                <Star className="w-3.5 h-3.5 text-indigo-600 fill-current" />
                                                Rating
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
}
