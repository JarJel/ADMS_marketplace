import React from 'react';
import { FileText, Star } from 'lucide-react';

export default function PurchasesTab({ purchases, formatCurrency }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-800">Daftar Transaksi Saya</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Riwayat lengkap pembelian produk digital Anda.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-left">ID Transaksi</th>
                            <th className="px-6 py-4 text-left">Merchant</th>
                            <th className="px-6 py-4 text-left">Tanggal</th>
                            <th className="px-6 py-4 text-left">Total</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {purchases.map((p) => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 font-bold text-slate-800">{p.id}</td>
                                <td className="px-6 py-4">{p.merchant}</td>
                                <td className="px-6 py-4">{p.date}</td>
                                <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(p.total)}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] ${
                                        p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                        p.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                        'bg-rose-100 text-rose-800'
                                    }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            Invoice
                                        </button>
                                        {p.status === 'PAID' && (
                                            <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1">
                                                <Star className="w-3 h-3 text-indigo-600 fill-current" />
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
    );
}
