import React from 'react';
import { ShoppingCart, CheckCircle, XCircle, User, Calendar, Package } from 'lucide-react';

export default function OrdersTab({ orders, handleUpdateOrderStatus }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingCart className="text-[#FFBF00]" size={24} />
        <h2 className="text-xl font-black text-white">Pesanan Masuk</h2>
      </div>
      
      {orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {orders.map(o => (
            <div key={o.id} className="bg-[#071922] shadow-xl border border-[#174256] rounded-2xl p-4 sm:p-6 flex flex-col justify-between hover:border-[#FFBF00] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-white text-lg">{o.order_number}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status:</span>
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider border ${
                      o.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                      o.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      o.status === 'cancelled' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      'bg-[#0B2330] text-slate-300 border-[#174256]'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Total</span>
                  <p className="text-lg text-emerald-400 font-black">Rp{parseFloat(o.total_amount).toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Order Details: Customer & Items */}
              <div className="mb-4 space-y-3 bg-[#0B2330] p-4 rounded-xl border border-[#174256] flex-1">
                <div className="flex justify-between items-start text-sm border-b border-[#174256] pb-2">
                  <div className="flex items-center gap-2 text-slate-200">
                    <User size={14} className="text-[#FFBF00]" />
                    <span className="font-bold">{o.user?.name || o.customer_name || 'Pelanggan'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="font-bold">{new Date(o.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  {o.items && o.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-300 truncate pr-2">
                        <Package size={14} className="text-indigo-400 shrink-0" />
                        <span className="truncate">{item.product?.name || 'Produk Dihapus'}</span>
                      </div>
                      <span className="font-black text-white shrink-0">{item.quantity}x</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-[#174256] flex gap-3">
                {o.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleUpdateOrderStatus(o.id, 'completed')} 
                      className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black rounded-xl transition-all active:scale-[0.98]"
                    >
                      <CheckCircle size={18} />
                      Terima Pesanan
                    </button>
                    <button 
                      onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')} 
                      className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-black rounded-xl transition-all active:scale-[0.98] border border-rose-500/20"
                    >
                      <XCircle size={18} />
                      Tolak
                    </button>
                  </>
                ) : (
                  <button className="w-full px-4 py-2.5 bg-[#0B2330] text-slate-500 text-sm font-black rounded-xl border border-[#174256]" disabled>
                    Tindakan Selesai
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#071922] rounded-2xl shadow-xl border border-[#174256] p-12 flex flex-col items-center justify-center text-slate-400">
          <ShoppingCart size={48} className="text-[#174256] mb-4" />
          <p className="text-base font-black text-white mb-1">Belum ada pesanan</p>
          <p className="text-sm">Pesanan dari pelanggan Anda akan muncul di sini.</p>
        </div>
      )}
    </div>
  );
}
