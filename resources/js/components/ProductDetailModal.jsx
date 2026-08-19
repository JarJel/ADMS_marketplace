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
    const cleanPhone = '6281121211933'; // Forced to admin WA as requested

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
          darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFBF00] text-[#0F3040] border border-[#FFBF00]/30">
              {category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFBF00]" /> Guaranteed Syariah
            </span>
          </div>

          <button 
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              darkMode ? 'border-[#174256] bg-[#071922] hover:bg-[#174256] text-slate-300 hover:text-white' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
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
                darkMode ? 'border-[#174256] bg-[#071922]' : 'border-slate-200 bg-slate-100'
              }`}>
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border shadow-md transition-all cursor-pointer ${
                    isFavorite 
                      ? 'bg-rose-500 text-white border-rose-400' 
                      : (darkMode ? 'bg-[#071922]/90 text-[#FFBF00] border-[#174256]' : 'bg-white/90 text-slate-600 border-slate-200 hover:text-rose-500')
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Merchant Info Pill */}
              <div className={`mt-3 p-3 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FFBF00] text-[#0F3040] flex items-center justify-center font-bold text-xs shrink-0">
                    <Store className="w-4 h-4 text-[#0F3040]" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-400">Penjual Terverifikasi</span>
                    <h5 className="font-bold text-xs truncate text-slate-100">{merchantName}</h5>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#FFBF00] shrink-0"></span>
              </div>
            </div>

            {/* Info Column (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black leading-snug text-[#FFBF00]">
                  {title}
                </h2>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-[#FFBF00] text-xs font-bold">
                    <Star className="w-4 h-4 fill-current text-[#FFBF00]" />
                    <span>{rating}</span>
                    <span className="text-slate-400 font-normal">({reviewsCount} Ulasan)</span>
                  </div>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-xs text-[#FFBF00] font-semibold flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-[#FFBF00]" /> Instan Download
                  </span>
                </div>
              </div>

              {/* Price Tag */}
              <div className={`p-4 rounded-2xl border flex items-baseline justify-between ${
                darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Harga Lisensi Digital</span>
                  <span className="text-2xl font-black text-[#FFBF00]">{formatCurrency(price)}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#FFBF00]/20 text-[#FFBF00] border border-[#FFBF00]/40">
                  ✔ Hak Akses Selamanya
                </span>
              </div>

              {/* Product Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="block text-[10px] text-slate-400">Tipe Pengiriman</span>
                  <strong className="font-semibold text-slate-200">Otomatis / Dashboard</strong>
                </div>
                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="block text-[10px] text-slate-400">Garansi Syariah</span>
                  <strong className="font-semibold text-slate-200">100% Uang Kembali</strong>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Deskripsi Produk:</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

          </div>

          {/* Toast Notification Alert */}
          {addedSuccess && (
            <div className="p-3 bg-[#FFBF00] text-[#0F3040] font-black text-xs rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0F3040]" /> Produk berhasil ditambahkan ke keranjang belanja Anda!
              </span>
              <span className="text-[10px] font-extrabold uppercase">Siap Checkout &rarr;</span>
            </div>
          )}
        </div>

        {/* Modal Footer Action Buttons */}
        <div className={`p-5 sm:px-7 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Chat WhatsApp Seller Button */}
          <button 
            onClick={handleWhatsAppChat}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Chat WhatsApp Penjual</span>
          </button>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3.5 px-5 bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black rounded-xl text-xs shadow-lg shadow-[#FFBF00]/20 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            <ShoppingBag className="w-4 h-4 text-[#0F3040]" />
            <span>+ Masukkan ke Keranjang</span>
          </button>
        </div>

      </div>
    </div>
  );
}
