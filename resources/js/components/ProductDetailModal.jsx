import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, PhoneCall, Star, ShieldCheck, Download, 
  Store, CheckCircle, ArrowRight, Share2, Heart, Lock, Clock 
} from 'lucide-react';

export default function ProductDetailModal({ 
  product, 
  isOpen, 
  onClose, 
  darkMode = true, 
  onAddToCart 
}) {
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (onClose) onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const title = product.title || product.name || 'Detail Produk Digital';
  const price = product.price || product.price_num || 0;
  const merchantName = product.merchant?.name || product.merchant || 'Merchant Verified ADMS';
  const merchantPhone = product.merchant?.phone || product.merchant_phone || '6281121211933';
  const rating = product.rating || product.average_rating || 4.9;
  const reviewsCount = product.reviewsCount || product.reviews_count || 32;
  const category = product.category?.name || product.category || 'Produk Digital';
  const image = product.image || product.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60';
  const description = product.description || 'Produk digital siap pakai dengan lisensi resmi, pengunduhan serba instan, serta dukungan garansi 100% dari merchant terverifikasi di platform ADMS.';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2500);
  };

  const handleWhatsAppChat = () => {
    // Format phone number to international standard (remove leading 0 or +)
    let cleanPhone = merchantPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    }
    if (!cleanPhone.startsWith('62')) {
      cleanPhone = '6281121211933'; // Default fallback WA Admin / Merchant
    }

    const message = encodeURIComponent(
      `Halo *${merchantName}*, saya menemukan produk *${title}* (${formatCurrency(price)}) di ADMS Marketplace. Saya ingin bertanya lebih lanjut seputar produk ini.`
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in"
      />

      {/* Modal Card */}
      <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all my-auto animate-in zoom-in-95 duration-200 ${
        darkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.8)]' 
          : 'bg-white border-slate-300 text-slate-800 shadow-2xl shadow-indigo-100/90'
      }`}>
        
        {/* Top Header Bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              {category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Guaranteed Syariah
            </span>
          </div>

          <button 
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              darkMode ? 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Main Visual & Key Specs Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Image Column (5 cols) */}
            <div className="md:col-span-5 relative group">
              <div className={`aspect-[4/3] rounded-2xl overflow-hidden border relative ${
                darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'
              }`}>
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border shadow-md transition-all ${
                    isFavorite 
                      ? 'bg-rose-500 text-white border-rose-400' 
                      : (darkMode ? 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-rose-400' : 'bg-white/90 text-slate-600 border-slate-200 hover:text-rose-500')
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Merchant Info Pill */}
              <div className={`mt-3 p-3 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Penjual Terverifikasi</span>
                    <h5 className="font-bold text-xs truncate text-slate-800 dark:text-slate-100">{merchantName}</h5>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              </div>
            </div>

            {/* Info Column (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold leading-snug text-slate-900 dark:text-slate-100">
                  {title}
                </h2>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{rating}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal">({reviewsCount} Ulasan)</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Instan Download
                  </span>
                </div>
              </div>

              {/* Price Tag */}
              <div className={`p-4 rounded-2xl border flex items-baseline justify-between ${
                darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-teal-50/70 border-teal-200'
              }`}>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Harga Lisensi Digital</span>
                  <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{formatCurrency(price)}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  ✔ Hak Akses Selamanya
                </span>
              </div>

              {/* Product Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="block text-[10px] text-slate-400">Tipe Pengiriman</span>
                  <strong className="font-semibold text-slate-700 dark:text-slate-200">Otomatis / Dashboard</strong>
                </div>
                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="block text-[10px] text-slate-400">Garansi Syariah</span>
                  <strong className="font-semibold text-slate-700 dark:text-slate-200">100% Uang Kembali</strong>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Deskripsi Produk:</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

          </div>

          {/* Toast Notification Alert */}
          {addedSuccess && (
            <div className="p-3 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Produk berhasil ditambahkan ke keranjang belanja Anda!
              </span>
              <span className="text-[10px] opacity-80">Siap Checkout &rarr;</span>
            </div>
          )}
        </div>

        {/* Modal Footer Action Buttons */}
        <div className={`p-5 sm:px-7 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Chat WhatsApp Seller Button */}
          <button 
            onClick={handleWhatsAppChat}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Chat WhatsApp Penjual</span>
          </button>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3.5 px-5 font-bold rounded-xl text-xs border active:scale-95 transition-all cursor-pointer ${
              darkMode 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-md'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>+ Masukkan ke Keranjang</span>
          </button>
        </div>

      </div>
    </div>
  );
}
