import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, CreditCard, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function Cart({ user, token, onNavigate, onLogout, darkMode, setDarkMode }) {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            onNavigate('login');
            return;
        }
        fetchCart();
    }, [token]);

    const fetchCart = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/customer/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCartItems(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (id) => {
        try {
            const res = await fetch(`/api/customer/cart/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchCart();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCheckout = async () => {
        try {
            // Kita gunakan merchant_id pertama dari item (karena order_id by merchant, di real case mungkin multi-merchant butuh per-merchant)
            // Untuk MVP ini, kita ambil merchant_id dari produk pertama.
            if (cartItems.length === 0) return;
            const merchantId = cartItems[0].product.merchant_id;
            
            const res = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    checkout_from_cart: true,
                    merchant_id: merchantId,
                    payment_method: 'transfer_bank'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Checkout berhasil! Menuju ke Dashboard.');
                onNavigate('customer');
            } else {
                alert(data.message || 'Checkout gagal.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout} 
                onNavigate={onNavigate} 
                currentView="cart"
            />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <button 
                    onClick={() => onNavigate('homepage')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-bold text-sm mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali Belanja
                </button>

                <h1 className="text-3xl font-extrabold tracking-tight mb-8">Keranjang Belanja</h1>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
                        <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Keranjang Anda Kosong</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Mulai eksplorasi produk digital terbaik kami.</p>
                        <button 
                            onClick={() => onNavigate('homepage')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                        >
                            Belanja Sekarang
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center gap-4">
                                    <img src={item.product.thumbnail || 'https://via.placeholder.com/100'} alt={item.product.title} className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
                                    <div className="flex-1">
                                        <h4 className="font-extrabold text-sm mb-1 line-clamp-1">{item.product.title}</h4>
                                        <p className="text-[10px] text-slate-500 mb-2">Penjual: {item.product.merchant?.name}</p>
                                        <span className="font-bold text-indigo-600">Rp{item.product.price.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-3">
                                        <button 
                                            onClick={() => handleRemove(item.id)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Hapus item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-fit">
                            <h3 className="font-extrabold text-lg mb-6">Ringkasan Belanja</h3>
                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Total Harga ({cartItems.length} item)</span>
                                    <span>Rp{total.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between font-extrabold text-lg pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <span>Total Tagihan</span>
                                    <span clas1sName="text-indigo-600">Rp{total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                Checkout Sekarang
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
