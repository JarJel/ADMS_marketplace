import React from 'react';
import { ShoppingBag, CreditCard, Download, Megaphone } from 'lucide-react';

export default function OverviewTab({ 
    profileName, 
    today, 
    purchases, 
    setActiveTab, 
    formatCurrency 
}) {
    // Calculate total spent based on PAID purchases
    const totalSpent = purchases
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.total, 0);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-left">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                    Halo, {profileName}! Selamat datang kembali.
                </h1>
                <p className="text-xs text-slate-400 mt-1">{today}</p>
            </div>

            {/* Mini stats widgets grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                    onClick={() => setActiveTab('purchases')}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left cursor-pointer active:scale-95"
                >
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Transaksi</span>
                        <span className="text-sm font-black text-slate-800">{purchases.length} Pembelian</span>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveTab('purchases')}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left cursor-pointer active:scale-95"
                >
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pengeluaran</span>
                        <span className="text-sm font-black text-slate-800">{formatCurrency(totalSpent)}</span>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveTab('downloads')}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left cursor-pointer active:scale-95"
                >
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Download className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Siap Unduh</span>
                        <span className="text-sm font-black text-slate-800">File Unduhan</span>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveTab('ads')}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left cursor-pointer active:scale-95"
                >
                    <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Iklan Aktif</span>
                        <span className="text-sm font-black text-slate-800">Iklan Saya</span>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-800">Transaksi Terbaru</h3>
                    <button 
                        onClick={() => setActiveTab('purchases')}
                        className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                        Lihat Semua
                    </button>
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {purchases.slice(0, 3).map((p) => (
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
