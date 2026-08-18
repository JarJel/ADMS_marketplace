import React from 'react';
import { ShoppingCart, CheckCircle, XCircle, User, Calendar, Package } from 'lucide-react';

export default function OrdersTab({ orders, handleUpdateOrderStatus }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingCart className="text-indigo-600" size={24} />
        <h2 className="text-xl font-bold text-slate-900">Pesanan Masuk</h2>
      </div>
      
      {orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map(o => (
            <div key={o.id} className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{o.order_number}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status:</span>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      o.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Total</span>
                  <p className="text-lg text-indigo-600 font-black">Rp{parseFloat(o.total_amount).toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Order Details: Customer & Items */}
              <div className="mb-4 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1">
                <div className="flex justify-between items-start text-sm border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User size={14} className="text-slate-400" />
                    <span className="font-medium">{o.user?.name || o.customer_name || 'Pelanggan'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span>{new Date(o.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  {o.items && o.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-slate-700 truncate pr-2">
                        <Package size={14} className="text-indigo-400 shrink-0" />
                        <span className="truncate">{item.product?.name || 'Produk Dihapus'}</span>
                      </div>
                      <span className="font-semibold text-slate-900 shrink-0">{item.quantity}x</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
                {o.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleUpdateOrderStatus(o.id, 'completed')} 
                      className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98]"
                    >
                      <CheckCircle size={18} />
                      Terima Pesanan
                    </button>
                    <button 
                      onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')} 
                      className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold rounded-xl transition-all active:scale-[0.98]"
                    >
                      <XCircle size={18} />
                      Tolak
                    </button>
                  </>
                ) : (
                  <button className="w-full px-4 py-2.5 bg-slate-50 text-slate-500 text-sm font-bold rounded-xl" disabled>
                    Tindakan Selesai
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-slate-500">
          <ShoppingCart size={48} className="text-slate-300 mb-4" />
          <p className="text-base font-medium">Belum ada pesanan</p>
          <p className="text-sm">Pesanan dari pelanggan Anda akan muncul di sini.</p>
        </div>
      )}
    </div>
  );
}
