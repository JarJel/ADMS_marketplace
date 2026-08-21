import React, { useState, useEffect } from 'react';
import { 
    ShoppingCart, Trash2, CreditCard, ArrowLeft, ShieldCheck, 
    Zap, Store, CheckCircle, Tag, Plus, Minus, Lock, Sparkles, CheckSquare, Square
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';

export default function Cart({ user, token, onNavigate, onLogout, darkMode = true, setDarkMode, cartCount, wishlistCount, notifications }) {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [promoCode, setPromoCode] = useState('');
    const [promoLabel, setPromoLabel] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, title: '', message: '' });

    useEffect(() => {
        fetchCart();
    }, [token]);

    const fetchCart = async () => {
        setIsLoading(true);
        try {
            let apiItems = [];
            if (token) {
                const res = await fetch('/api/customer/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    apiItems = data.data;
                }
            }
            const guestItems = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
            
            const mergedMap = new Map();

            // First insert guest items (contains full product objects with title, price, thumbnail)
            guestItems.forEach(g => {
                const key = (g.product_id || g.id || g.product?.id)?.toString();
                if (key) mergedMap.set(key, g);
            });

            // Then insert API items, inheriting product info from guest item if apiItem.product is null
            apiItems.forEach(a => {
                const key = (a.product_id || a.id || a.product?.id)?.toString();
                if (key) {
                    if (mergedMap.has(key)) {
                        const existing = mergedMap.get(key);
                        mergedMap.set(key, {
                            ...existing,
                            ...a,
                            product: a.product || existing.product
                        });
                    } else {
                        mergedMap.set(key, a);
                    }
                }
            });

            const loadedItems = Array.from(mergedMap.values());
            setCartItems(loadedItems);

            // Select all items by default
            const allKeys = loadedItems.map(item => (item.id || item.product_id || item.product?.id)?.toString()).filter(Boolean);
            setSelectedItemIds(allKeys);
        } catch (err) {
            const guestItems = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
            setCartItems(guestItems);
            const allKeys = guestItems.map(item => (item.id || item.product_id || item.product?.id)?.toString()).filter(Boolean);
            setSelectedItemIds(allKeys);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectItem = (key) => {
        setSelectedItemIds(prev => {
            if (prev.includes(key)) {
                return prev.filter(k => k !== key);
            } else {
                return [...prev, key];
            }
        });
    };

    const toggleSelectAll = () => {
        const allKeys = cartItems.map(item => (item.id || item.product_id || item.product?.id)?.toString()).filter(Boolean);
        if (selectedItemIds.length === allKeys.length) {
            setSelectedItemIds([]);
        } else {
            setSelectedItemIds(allKeys);
        }
    };

    const isAllSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;

    const updateQuantity = (id, change) => {
        setCartItems(prevItems => 
            prevItems.map(item => {
                if (item.id === id || item.product_id === id) {
                    const newQty = Math.max(1, (item.quantity || 1) + change);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const triggerRemove = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'single',
            id: id,
            title: 'Hapus Produk',
            message: 'Apakah Anda yakin ingin menghapus produk ini dari keranjang?'
        });
    };

    const triggerClearAll = () => {
        setConfirmModal({
            isOpen: true,
            type: 'all',
            id: null,
            title: 'Kosongkan Keranjang',
            message: 'Apakah Anda yakin ingin mengosongkan semua produk dari keranjang?'
        });
    };

    const confirmAction = () => {
        if (confirmModal.type === 'single') {
            executeRemove(confirmModal.id);
        } else if (confirmModal.type === 'all') {
            executeClearAll();
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    const executeRemove = async (id) => {
        const key = id?.toString();
        setSelectedItemIds(prev => prev.filter(k => k !== key));

        if (token) {
            try {
                const res = await fetch(`/api/customer/cart/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    const guestItems = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
                    const updatedGuestItems = guestItems.filter(item => item.id !== id && item.product_id !== id);
                    localStorage.setItem('adms_guest_cart', JSON.stringify(updatedGuestItems));
                    fetchCart();
                    return;
                }
            } catch (err) {
            }
        }

        const guestItems = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
        const updatedGuestItems = guestItems.filter(item => item.id !== id && item.product_id !== id);
        localStorage.setItem('adms_guest_cart', JSON.stringify(updatedGuestItems));
        fetchCart();
    };

    const executeClearAll = () => {
        localStorage.removeItem('adms_guest_cart');
        setCartItems([]);
        setSelectedItemIds([]);
    };

    const handleApplyPromo = async (e) => {
        e.preventDefault();
        setPromoError('');
        if (!promoCode.trim()) return;
        try {
            const res = await fetch('/api/customer/promo/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ code: promoCode.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setDiscount(data.data.discount);
                setPromoLabel(data.data.label);
                setPromoApplied(true);
            } else {
                setPromoError(data.message || 'Kode promo tidak valid.');
            }
        } catch {
            setPromoError('Gagal menghubungi server. Coba lagi.');
        }
    };

    const selectedItemsList = cartItems.filter(item => {
        const key = (item.id || item.product_id || item.product?.id)?.toString();
        return selectedItemIds.includes(key);
    });

    const handleCheckout = async () => {
        if (selectedItemsList.length === 0) {
            alert('Pilih setidaknya 1 produk untuk di-checkout.');
            return;
        }
        localStorage.setItem('adms_checkout_items', JSON.stringify(selectedItemsList));
        localStorage.setItem('adms_checkout_discount', discount.toString());
        if (onNavigate) {
            onNavigate('checkout');
        }
    };

    const subtotal = selectedItemsList.reduce((sum, item) => {
        const itemPrice = item.product?.price || item.product?.price_num || 0;
        return sum + (itemPrice * (item.quantity || 1));
    }, 0);

    const grandTotal = Math.max(0, subtotal - discount);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${
            darkMode ? 'bg-[#071922] text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}>
            {/* Ambient Background Glow Effects */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none -translate-y-1/2 translate-x-1/4 ${
                darkMode ? 'bg-[#FFBF00]/10' : 'bg-[#FFBF00]/20'
            }`}></div>
            <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none translate-y-1/3 -translate-x-1/4 ${
                darkMode ? 'bg-[#0F3040]/40' : 'bg-emerald-300/20'
            }`}></div>

            {/* Navbar */}
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout} 
                onNavigate={onNavigate} 
                currentView="cart"
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                notifications={notifications}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {/* Top Navigation Row */}
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => onNavigate('homepage')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            darkMode 
                                ? 'border-[#174256] bg-[#0F3040] hover:bg-[#174256] text-slate-300 hover:text-white' 
                                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm'
                        }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Lanjut Belanja Produk Lain
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#FFBF00] bg-[#FFBF00]/10 border border-[#FFBF00]/30 px-3 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" /> Garansi Syariah 100%
                        </span>
                    </div>
                </div>

                {/* Page Title & Count */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
                            darkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                            Keranjang Belanja
                        </h1>
                        <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Pilih produk digital yang ingin Anda bayar sekarang.
                        </p>
                    </div>

                    {cartItems.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                darkMode ? 'bg-[#FFBF00]/10 border-[#FFBF00]/30 text-[#FFBF00]' : 'bg-gold-50 border-gold-200 text-gold-700'
                            }`}>
                                {cartItems.length} Produk Digital
                            </span>
                            <button 
                                onClick={triggerClearAll}
                                className="text-xs text-rose-500 hover:text-rose-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Kosongkan
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FFBF00]"></div>
                        <p className="text-xs text-slate-400 font-medium">Memuat keranjang belanja Anda...</p>
                    </div>
                ) : cartItems.length === 0 ? (
                    /* Empty State Container */
                    <div className={`rounded-3xl border p-12 sm:p-16 text-center max-w-xl mx-auto backdrop-blur-xl ${
                        darkMode 
                            ? 'bg-[#0F3040] border-[#174256] shadow-2xl shadow-black/50' 
                            : 'bg-white border-slate-200/90 shadow-xl'
                    }`}>
                        <div className="w-20 h-20 rounded-3xl bg-[#FFBF00]/10 border border-[#FFBF00]/30 flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-10 h-10 text-[#FFBF00]" />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Keranjang Anda Masih Kosong</h3>
                        <p className={`text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Anda belum menambahkan produk digital apapun. Temukan template Canva, source code, ebook, atau jasa terbaik sekarang!
                        </p>
                        <button 
                            onClick={() => onNavigate('homepage')}
                            className="bg-gradient-to-r from-[#FFBF00] to-[#ffcc33] hover:from-[#ffcc33] hover:to-[#FFBF00] text-[#0F3040] font-black py-3.5 px-8 rounded-xl text-xs shadow-lg shadow-[#FFBF00]/20 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4 text-[#0F3040]" />
                            <span>Jelajahi Produk Digital Sekarang</span>
                        </button>
                    </div>
                ) : (
                    /* Cart Layout Grid (Items + Summary) */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Cart Item Cards List (7 Columns) */}
                        <div className="lg:col-span-7 space-y-4">
                            {/* Select All Bar */}
                            <div className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md ${
                                darkMode ? 'bg-[#0F3040] border-[#174256]' : 'bg-white border-slate-200 shadow-xs'
                            }`}>
                                <label className="flex items-center gap-3 cursor-pointer select-none font-bold text-xs">
                                    <input 
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded text-[#FFBF00] focus:ring-[#FFBF00] cursor-pointer accent-[#FFBF00]"
                                    />
                                    <span>Pilih Semua ({cartItems.length} Produk)</span>
                                </label>
                                <span className="text-xs text-[#FFBF00] font-bold">
                                    {selectedItemIds.length} Dipilih
                                </span>
                            </div>

                            {cartItems.map((item) => {
                                const itemId = (item.id || item.product_id || item.product?.id)?.toString();
                                const prodTitle = item.product?.title || item.product?.name || 'Produk Digital ADMS';
                                const merchantName = item.product?.merchant?.name || item.product?.merchant?.store_name || item.product?.merchant || 'Merchant Verified ADMS';
                                const prodPrice = item.product?.price || item.product?.price_num || 0;
                                const categoryName = item.product?.category?.name || item.product?.category || 'Aset Digital';
                                const prodImg = item.product?.thumbnail || item.product?.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                                const quantity = item.quantity || 1;
                                const isChecked = selectedItemIds.includes(itemId);

                                return (
                                    <div 
                                        key={itemId} 
                                        className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
                                            isChecked
                                                ? (darkMode ? 'bg-[#0F3040] border-[#FFBF00]/50 shadow-lg shadow-[#FFBF00]/5' : 'bg-white border-[#FFBF00]/60 shadow-md')
                                                : (darkMode ? 'bg-[#0F3040]/40 border-[#174256]/60 opacity-70' : 'bg-slate-50/80 border-slate-200 opacity-80')
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            {/* Selection Checkbox & Product Image */}
                                            <div className="flex items-center gap-3 shrink-0">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectItem(itemId)}
                                                    className="w-4 h-4 rounded text-[#FFBF00] focus:ring-[#FFBF00] cursor-pointer accent-[#FFBF00] shrink-0"
                                                />
                                                <div className="relative shrink-0 w-20 sm:w-24 aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-[#071922] border border-slate-200 dark:border-[#174256]">
                                                    <img 
                                                        src={prodImg} 
                                                        alt={prodTitle} 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => {
                                                            e.target.onerror = null; 
                                                            e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop';
                                                        }}
                                                    />
                                                    <span className="absolute top-1 left-1 bg-[#071922]/80 backdrop-blur-sm text-[7px] font-bold text-[#FFBF00] px-1 py-0.5 rounded border border-[#174256]">
                                                        {categoryName}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Product Details Info */}
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                                    <Store className="w-3 h-3 text-[#FFBF00]" />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{merchantName}</span>
                                                    <span className="text-[#FFBF00] font-bold bg-[#FFBF00]/10 px-1.5 rounded border border-[#FFBF00]/20 text-[8px]">✔ Terverifikasi</span>
                                                </div>

                                                <h4 className={`font-bold text-sm leading-snug line-clamp-2 ${
                                                    darkMode ? 'text-white' : 'text-slate-900'
                                                }`}>
                                                    {prodTitle}
                                                </h4>

                                                <div className="flex items-center gap-3 text-[11px] pt-0.5">
                                                    <span className="flex items-center gap-1 text-[#FFBF00] font-medium">
                                                        <Zap className="w-3 h-3" /> Instan Download
                                                    </span>
                                                    <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                                                    <span className="text-slate-500 dark:text-slate-400">Lisensi Syariah</span>
                                                </div>
                                            </div>

                                            {/* Quantity & Price Action Column */}
                                            <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-[#174256] shrink-0">
                                                <div className="text-left sm:text-right">
                                                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">Total Harga</span>
                                                    <span className="font-black text-base sm:text-lg text-[#FFBF00]">
                                                        {formatCurrency(prodPrice * quantity)}
                                                    </span>
                                                </div>

                                                {/* Quantity Selector & Remove Button */}
                                                <div className="flex items-center gap-2">
                                                    <div className={`flex items-center rounded-xl border p-1 ${
                                                        darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-slate-100 border-slate-200'
                                                    }`}>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id || item.product_id, -1)}
                                                            className={`p-1 rounded-lg transition-colors ${
                                                                darkMode ? 'hover:bg-[#174256] text-slate-400' : 'hover:bg-white text-slate-600 shadow-xs'
                                                            }`}
                                                            title="Kurangi Qty"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="px-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[20px] text-center">
                                                            {quantity}
                                                        </span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id || item.product_id, 1)}
                                                            className={`p-1 rounded-lg transition-colors ${
                                                                darkMode ? 'hover:bg-[#174256] text-slate-400' : 'hover:bg-white text-slate-600 shadow-xs'
                                                            }`}
                                                            title="Tambah Qty"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    <button 
                                                        onClick={() => triggerRemove(item.id || item.product_id)}
                                                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
                                                        title="Hapus Produk"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary Sticky Panel (5 Columns) */}
                        <div className="lg:col-span-5 space-y-3 sticky bottom-3 lg:top-24 z-30">
                            {/* Promo Code Form */}
                            <form onSubmit={handleApplyPromo} className={`rounded-xl border p-3 ${darkMode ? 'bg-[#0F3040] border-[#174256]' : 'bg-white border-slate-200 shadow-xs'}`}>
                                <p className={`text-xs font-bold mb-1.5 flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    <Tag className="w-3.5 h-3.5 text-[#FFBF00]" /> Kode Promo / Voucher
                                </p>
                                {promoApplied ? (
                                    <div className="flex items-center gap-2 text-[#FFBF00] text-xs font-bold bg-[#FFBF00]/10 border border-[#FFBF00]/30 rounded-lg px-3 py-1.5">
                                        <CheckCircle className="w-4 h-4 shrink-0" />
                                        <span>{promoLabel} — {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(discount)} diterapkan!</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                                                placeholder="Masukkan kode promo..."
                                                className={`flex-1 text-xs rounded-lg border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#FFBF00] ${darkMode ? 'bg-[#071922] border-[#174256] text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                                            />
                                            <button type="submit" className="bg-[#FFBF00] hover:bg-[#ffcc33] text-[#0F3040] text-xs font-extrabold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer">
                                                Pakai
                                            </button>
                                        </div>
                                        {promoError && <p className="mt-1 text-xs text-rose-500 font-medium">{promoError}</p>}
                                    </>
                                )}
                            </form>

                            <div className={`rounded-2xl border p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-xl transition-all ${
                                darkMode
                                    ? 'bg-gradient-to-br from-[#0F3040] to-[#071922] border-[#174256] shadow-black/50'
                                    : 'bg-white border-slate-200 shadow-lg'
                            }`}>
                                {/* Shimmer Border Line Top */}
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFBF00]/60 to-transparent"></div>

                                <h3 className={`font-bold text-sm sm:text-base mb-3 flex items-center gap-2 ${
                                    darkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                    <ShoppingCart className="w-4 h-4 text-[#FFBF00]" /> Ringkasan Belanja
                                </h3>

                                {/* Cost Breakdown */}
                                <div className="space-y-2 text-xs mb-3.5 border-t border-slate-200 dark:border-[#174256] pt-3">
                                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                        <span>Subtotal ({selectedItemsList.length} produk)</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(subtotal)}</span>
                                    </div>

                                    {discount > 0 && (
                                        <div className="flex justify-between text-[#FFBF00] font-semibold">
                                            <span>{promoLabel || 'Diskon Promo'}</span>
                                            <span>- {formatCurrency(discount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                        <span>Biaya Layanan</span>
                                        <span className="text-[#FFBF00] font-bold uppercase text-[10px] bg-[#FFBF00]/10 px-2 py-0.5 rounded border border-[#FFBF00]/20">Gratis</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-[#174256]">
                                        <div>
                                            <span className={`block font-extrabold text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Total Tagihan</span>
                                            <span className="text-[9.5px] text-slate-400 font-normal">Termasuk PPN</span>
                                        </div>
                                        <span className="text-xl sm:text-2xl font-black text-[#FFBF00]">
                                            {formatCurrency(grandTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Checkout Main CTA Button */}
                                <button 
                                    onClick={handleCheckout}
                                    disabled={selectedItemsList.length === 0}
                                    className={`w-full font-black text-xs py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group uppercase tracking-wider ${
                                        selectedItemsList.length > 0
                                            ? 'bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] shadow-[#FFBF00]/20 active:scale-98'
                                            : 'bg-[#174256] text-slate-500 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform text-[#0F3040]" />
                                    <span>
                                        {selectedItemsList.length > 0 
                                            ? `Lanjut Ke Pembayaran (${selectedItemsList.length})` 
                                            : 'Pilih Produk'}
                                    </span>
                                    {selectedItemsList.length > 0 && (
                                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                    )}
                                </button>

                                {/* Compact Security Guarantee */}
                                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#174256] flex items-center justify-center gap-4 text-[10px] text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-[#FFBF00] shrink-0" />
                                        <span>Garansi 100% Syariah</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Lock className="w-3.5 h-3.5 text-[#FFBF00] shrink-0" />
                                        <span>Aman 256-Bit SSL</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                )}
            </main>

            {/* Confirmation Modal */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmAction}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
}
