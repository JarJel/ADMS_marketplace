import React from 'react';
import { Heart, Trash2 } from 'lucide-react';

export default function WishlistTab({ wishlist, formatCurrency, handleRemoveFromWishlist }) {
    return (
        <div className="space-y-6 text-left">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-800">Favorit & Wishlist</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Produk dan iklan baris yang Anda simpan untuk dibeli nanti.</p>
            </div>

            {wishlist.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                    <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <h4 className="font-extrabold text-slate-700 text-sm">Wishlist Anda Kosong</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Mulai cari produk halal pilihan dan tambahkan ke favorit Anda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlist.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex items-center justify-between p-4 gap-4 relative group">
                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-xs text-slate-800 leading-snug line-clamp-1">{item.title}</h4>
                                    <span className="block font-black text-sm text-teal-600">{formatCurrency(item.price)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleRemoveFromWishlist(item.id)}
                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm cursor-pointer"
                                title="Hapus dari Favorit"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
