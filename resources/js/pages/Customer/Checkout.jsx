import React, { useState, useEffect } from 'react';
import { 
    CreditCard, ArrowLeft, ShieldCheck, CheckCircle2, Copy, Check, 
    QrCode, Building2, PhoneCall, Zap, Lock, Sparkles, ShoppingBag, 
    Clock, Download, ChevronRight, FileText, Store
} from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function Checkout({ user, token, onNavigate, onLogout, darkMode = true, setDarkMode, cartCount, wishlistCount, notifications }) {
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('qris'); // 'qris', 'transfer_bsi', 'transfer_bca', 'wa_admin'
    const [customerInfo, setCustomerInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || user?.whatsapp || '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedText, setCopiedText] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [paymentConfig, setPaymentConfig] = useState(null);

    useEffect(() => {
        const savedItems = JSON.parse(localStorage.getItem('adms_checkout_items') || '[]');
        const savedDiscount = parseFloat(localStorage.getItem('adms_checkout_discount') || '0');
        if (savedItems.length === 0) {
            const guestItems = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
            setCheckoutItems(guestItems);
        } else {
            setCheckoutItems(savedItems);
        }
        setDiscount(savedDiscount);

        fetch('/api/payment-config', { headers: { 'Accept': 'application/json' } })
            .then(r => r.json())
            .then(d => { if (d.success) setPaymentConfig(d.data); })
            .catch(() => {});
    }, []);

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(''), 2000);
    };

    const subtotal = checkoutItems.reduce((sum, item) => {
        const itemPrice = item.product?.price || item.product?.price_num || item.price || 0;
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

    const handleRedirectWhatsApp = (orderResult) => {
        let phone = '';
        let template = '';

        const firstItem = checkoutItems[0];
        
        if (firstItem?.isPackage) {
            phone = '6281234500001'; // Default platform admin WA
            template = `Assalamu'alaikum Admin ADMS, saya ingin mengonfirmasi pembayaran untuk Paket Iklan Baris.\n\n` +
                       `*Detail Pembayaran:*\n` +
                       `• No Invoice: ${orderResult.invoice}\n` +
                       `• Nama Pemesan: ${orderResult.customer.name}\n` +
                       `• Email: ${orderResult.customer.email}\n` +
                       `• Total Bayar: ${formatCurrency(orderResult.total)}\n` +
                       `• Metode: ${orderResult.paymentMethod.toUpperCase()} (Screenshot terlampir)\n\n` +
                       `Berikut saya lampirkan screenshot bukti transfer pembayarannya. Terima kasih!`;
        } else {
            const merchantWa = orderResult?.merchant?.contact_whatsapp || 
                               firstItem?.product?.merchant?.contact_whatsapp || 
                               firstItem?.merchant?.contact_whatsapp;
            phone = merchantWa ? merchantWa.replace(/[^0-9]/g, '') : '6281234500001';
            
            if (phone.startsWith('0')) {
                phone = '62' + phone.substring(1);
            }

            const productTitle = firstItem?.product?.title || 'Produk';
            template = `Assalamu'alaikum Kak, saya ingin mengonfirmasi pembayaran untuk pembelian produk digital Anda.\n\n` +
                       `*Detail Transaksi:*\n` +
                       `• No Invoice: ${orderResult.invoice}\n` +
                       `• Nama Pembeli: ${orderResult.customer.name}\n` +
                       `• Produk: ${productTitle}\n` +
                       `• Total Bayar: ${formatCurrency(orderResult.total)}\n` +
                       `• Metode: ${orderResult.paymentMethod.toUpperCase()} (Screenshot terlampir)\n\n` +
                       `Berikut saya lampirkan screenshot bukti transfer pembayarannya. Mohon bantuannya untuk memproses pesanan saya. Terima kasih!`;
        }

        const encodedText = encodeURIComponent(template);
        const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
        window.open(waUrl, '_blank');
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        if (checkoutItems.length === 0) {
            alert('Tidak ada produk yang siap di-checkout.');
            return;
        }

        setIsSubmitting(true);
        let orderInvoice = 'INV-ADMS-' + Date.now().toString(36).toUpperCase();

        let orderMerchant = null;

        try {
            if (token) {
                const firstItem = checkoutItems[0];
                if (firstItem.isPackage) {
                    const res = await fetch('/api/customer/package-checkout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            package_id: firstItem.product.id,
                            payment_method: paymentMethod
                        })
                    });
                    const data = await res.json();
                    if (!data.success) {
                        alert(data.message || 'Terjadi kesalahan saat memproses pesanan paket.');
                        setIsSubmitting(false);
                        return;
                    }
                    orderInvoice = 'INV-PKG-' + Date.now().toString(36).toUpperCase();
                } else {
                    const merchantId = firstItem.product?.merchant_id || firstItem.merchant_id;
                    const res = await fetch('/api/customer/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            checkout_from_cart: true,
                            merchant_id: merchantId,
                            payment_method: paymentMethod,
                            total_amount: grandTotal,
                            customer_name: customerInfo.name,
                            customer_email: customerInfo.email,
                            customer_phone: customerInfo.phone,
                            notes: customerInfo.notes,
                        })
                    });
                    const data = await res.json();
                    if (data.invoice_number) {
                        orderInvoice = data.invoice_number;
                        orderMerchant = data.data?.merchant;
                    }
                }
            }
        } catch (err) {
        }

        // Clean up purchased items from guest cart
        const guestItems = JSON.parse(localStorage.getItem('adms_guest_cart') || '[]');
        const checkedKeys = checkoutItems.map(item => (item.id || item.product_id || item.product?.id)?.toString());
        const remainingCart = guestItems.filter(g => {
            const key = (g.id || g.product_id || g.product?.id)?.toString();
            return !checkedKeys.includes(key);
        });
        localStorage.setItem('adms_guest_cart', JSON.stringify(remainingCart));
        localStorage.removeItem('adms_checkout_items');

        const orderResult = {
            invoice: orderInvoice,
            items: checkoutItems,
            total: grandTotal,
            paymentMethod,
            customer: customerInfo,
            merchant: orderMerchant || checkoutItems[0]?.product?.merchant || checkoutItems[0]?.merchant,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };

        setCreatedOrder(orderResult);
        setIsSubmitting(false);
        setIsSuccessModalOpen(true);
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 relative overflow-hidden ${
            darkMode ? 'bg-[#071922] text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}>
            {/* Ambient Glows */}
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/4 ${
                darkMode ? 'bg-[#FFBF00]/10' : 'bg-[#FFBF00]/20'
            }`}></div>
            <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none translate-y-1/3 -translate-x-1/4 ${
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
                currentView="checkout"
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                notifications={notifications}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {/* Stepper Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <button 
                        onClick={() => onNavigate('cart')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            darkMode 
                                ? 'border-[#174256] bg-[#0F3040] hover:bg-[#174256] text-slate-300 hover:text-white' 
                                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm'
                        }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Keranjang Belanja
                    </button>

                    {/* Progress Indicator Bar */}
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-[#FFBF00] flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> 1. Keranjang
                        </span>
                        <span className="text-slate-400">&rarr;</span>
                        <span className="text-[#FFBF00] flex items-center gap-1 bg-[#FFBF00]/10 border border-[#FFBF00]/30 px-3 py-1 rounded-full">
                            <CreditCard className="w-4 h-4" /> 2. Pembayaran & Checkout
                        </span>
                        <span className="text-slate-400">&rarr;</span>
                        <span className="text-slate-500">3. Unduh Produk</span>
                    </div>
                </div>

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
                        darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                        {checkoutItems.length > 0 && checkoutItems[0].isPackage ? 'Pembayaran Paket Iklan' : 'Pembayaran & Lisensi Produk'}
                    </h1>
                    <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Lengkapi informasi pesanan dan pilih metode pembayaran resmi ADMS Syariah.
                    </p>
                </div>

                {checkoutItems.length === 0 ? (
                    <div className={`rounded-3xl border p-12 text-center max-w-xl mx-auto backdrop-blur-xl ${
                        darkMode ? 'bg-[#0F3040] border-[#174256]' : 'bg-white border-slate-200'
                    }`}>
                        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">Tidak Ada Produk untuk Di-checkout</h3>
                        <p className="text-xs text-slate-400 mb-6">Silakan pilih produk dari keranjang belanja Anda terlebih dahulu.</p>
                        <button 
                            onClick={() => onNavigate('cart')}
                            className="px-6 py-2.5 bg-[#FFBF00] text-[#0F3040] font-black rounded-xl text-xs hover:bg-[#ffcc33] transition-all cursor-pointer"
                        >
                            Kembali ke Keranjang
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left Column: Customer Form & Payment Methods (7 Cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* 1. Customer Details Card */}
                            <div className={`rounded-3xl border p-6 backdrop-blur-xl ${
                                darkMode ? 'bg-[#0F3040] border-[#174256]' : 'bg-white border-slate-200 shadow-sm'
                            }`}>
                                <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${
                                    darkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                    <FileText className="w-5 h-5 text-[#FFBF00]" /> Information Pemesan
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                            Nama Lengkap / Instansi
                                        </label>
                                        <input 
                                            type="text"
                                            required
                                            placeholder="Contoh: Ahmad Faisal"
                                            value={customerInfo.name}
                                            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                                            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 ${
                                                darkMode ? 'bg-[#071922] border-[#174256] text-white focus:border-[#FFBF00]' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-[#FFBF00]'
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                            Email Aktif (Pengiriman Lisensi)
                                        </label>
                                        <input 
                                            type="email"
                                            required
                                            placeholder="email@domain.com"
                                            value={customerInfo.email}
                                            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                                            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 ${
                                                darkMode ? 'bg-[#071922] border-[#174256] text-white focus:border-[#FFBF00]' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-[#FFBF00]'
                                            }`}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                            Nomor WhatsApp / Telp
                                        </label>
                                        <input 
                                            type="tel"
                                            required
                                            placeholder="081234567890"
                                            value={customerInfo.phone}
                                            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 ${
                                                darkMode ? 'bg-[#071922] border-[#174256] text-white focus:border-[#FFBF00]' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-[#FFBF00]'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Payment Method Selector */}
                            <div className={`rounded-3xl border p-6 backdrop-blur-xl ${
                                darkMode ? 'bg-[#0F3040] border-[#174256]' : 'bg-white border-slate-200 shadow-sm'
                            }`}>
                                <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${
                                    darkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                    <CreditCard className="w-5 h-5 text-[#FFBF00]" /> Metode Pembayaran Resmi ADMS
                                </h3>

                                <div className="space-y-3 mb-6">
                                    {/* Option 1: QRIS */}
                                    <label 
                                        onClick={() => setPaymentMethod('qris')}
                                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                            paymentMethod === 'qris'
                                                ? 'bg-[#FFBF00]/10 border-[#FFBF00] text-white shadow-md shadow-[#FFBF00]/10'
                                                : (darkMode ? 'bg-[#071922]/60 border-[#174256] text-slate-300 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFBF00] to-amber-600 flex items-center justify-center text-[#0F3040] shrink-0 shadow-md">
                                                <QrCode className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <strong className="block text-xs font-bold">QRIS & E-Wallet Instan</strong>
                                                <span className="text-[10px] text-slate-400">Gopay, OVO, Dana, ShopeePay, LinkAja & Semua Bank</span>
                                            </div>
                                        </div>
                                        <input 
                                            type="radio"
                                            name="payment_method"
                                            checked={paymentMethod === 'qris'}
                                            onChange={() => setPaymentMethod('qris')}
                                            className="w-4 h-4 accent-[#FFBF00] cursor-pointer"
                                        />
                                    </label>

                                    {/* Option 2: BSI Syariah */}
                                    <label 
                                        onClick={() => setPaymentMethod('transfer_bsi')}
                                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                            paymentMethod === 'transfer_bsi'
                                                ? 'bg-[#FFBF00]/10 border-[#FFBF00] text-white shadow-md shadow-[#FFBF00]/10'
                                                : (darkMode ? 'bg-[#071922]/60 border-[#174256] text-slate-300 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F3040] to-[#174256] border border-[#FFBF00]/40 flex items-center justify-center text-[#FFBF00] shrink-0 shadow-md">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <strong className="block text-xs font-bold">Transfer BSI (Bank Syariah Indonesia)</strong>
                                                <span className="text-[10px] text-slate-400">Verifikasi Otomatis / Manual &bull; Bebas Riba</span>
                                            </div>
                                        </div>
                                        <input 
                                            type="radio"
                                            name="payment_method"
                                            checked={paymentMethod === 'transfer_bsi'}
                                            onChange={() => setPaymentMethod('transfer_bsi')}
                                            className="w-4 h-4 accent-[#FFBF00] cursor-pointer"
                                        />
                                    </label>

                                    {/* Option 3: BCA */}
                                    <label 
                                        onClick={() => setPaymentMethod('transfer_bca')}
                                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                            paymentMethod === 'transfer_bca'
                                                ? 'bg-[#FFBF00]/10 border-[#FFBF00] text-white shadow-md shadow-[#FFBF00]/10'
                                                : (darkMode ? 'bg-[#071922]/60 border-[#174256] text-slate-300 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-md">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <strong className="block text-xs font-bold">Transfer Bank BCA / Mandiri</strong>
                                                <span className="text-[10px] text-slate-400">Transfer Bank Utama Indonesia</span>
                                            </div>
                                        </div>
                                        <input 
                                            type="radio"
                                            name="payment_method"
                                            checked={paymentMethod === 'transfer_bca'}
                                            onChange={() => setPaymentMethod('transfer_bca')}
                                            className="w-4 h-4 accent-[#FFBF00] cursor-pointer"
                                        />
                                    </label>
                                </div>

                                {/* Dynamic Instructions Box */}
                                {paymentMethod === 'qris' && (
                                    <div className={`p-4 rounded-2xl border text-center space-y-3 ${
                                        darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-amber-50/50 border-amber-200'
                                    }`}>
                                        <div className="w-64 mx-auto bg-white p-4 rounded-2xl shadow-md border flex flex-col items-center justify-center">
                                            <img 
                                                src="/assets/Images/QRIS_ADMS.png" 
                                                alt="QRIS ADMS"
                                                className="w-full h-auto object-contain"
                                            />
                                        </div>
                                        <p className="text-[11px] font-semibold text-slate-400">
                                            Scan QRIS di atas menggunakan Gopay, OVO, Dana, ShopeePay, BCA, Mandiri, BSI, atau M-Banking Anda.
                                        </p>
                                    </div>
                                )}

                                {paymentMethod === 'transfer_bsi' && (
                                    <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
                                        darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-slate-100 border-slate-200'
                                    }`}>
                                        <div className="flex items-center justify-between p-3 bg-[#0F3040] border border-[#174256] rounded-xl">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block uppercase font-bold">{paymentConfig?.bsi?.name ?? 'Bank Syariah Indonesia (BSI)'}</span>
                                                <strong className="text-base text-[#FFBF00] font-mono">{paymentConfig?.bsi?.number ?? '...'}</strong>
                                                <span className="block text-[10px] text-slate-400">a.n. {paymentConfig?.bsi?.account_name ?? 'PT. Armada Digital Marketing Syariah'}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(paymentConfig?.bsi?.number?.replace(/-/g, '') ?? '', 'bsi')}
                                                className="px-3 py-1.5 bg-[#FFBF00] hover:bg-[#ffcc33] text-[#0F3040] font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all"
                                            >
                                                {copiedText === 'bsi' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedText === 'bsi' ? 'Tersalin' : 'Salin Rek'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'transfer_bca' && (
                                    <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
                                        darkMode ? 'bg-[#071922] border-[#174256]' : 'bg-slate-100 border-slate-200'
                                    }`}>
                                        <div className="flex items-center justify-between p-3 bg-[#0F3040] border border-[#174256] rounded-xl">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block uppercase font-bold">{paymentConfig?.bca?.name ?? 'Bank BCA'}</span>
                                                <strong className="text-base text-blue-400 font-mono">{paymentConfig?.bca?.number ?? '...'}</strong>
                                                <span className="block text-[10px] text-slate-400">a.n. {paymentConfig?.bca?.account_name ?? 'PT. Armada Digital Marketing Syariah'}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(paymentConfig?.bca?.number?.replace(/-/g, '') ?? '', 'bca')}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all"
                                            >
                                                {copiedText === 'bca' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedText === 'bca' ? 'Tersalin' : 'Salin Rek'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Right Column: Order Summary & Pay Button (5 Cols) */}
                        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                            <div className={`rounded-3xl border p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
                                darkMode 
                                    ? 'bg-gradient-to-br from-[#0F3040] to-[#071922] border-[#174256] shadow-black/60' 
                                    : 'bg-white border-slate-200 shadow-xl'
                            }`}>
                                <h3 className={`font-black text-lg mb-4 flex items-center gap-2 ${
                                    darkMode ? 'text-white' : 'text-slate-900'
                                }`}>
                                    <ShoppingBag className="w-5 h-5 text-[#FFBF00]" /> Ringkasan Produk ({checkoutItems.length})
                                </h3>

                                {/* Product items list */}
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-6 custom-scrollbar">
                                    {checkoutItems.map((item, idx) => {
                                        const title = item.product?.title || item.title || 'Produk Digital ADMS';
                                        const price = item.product?.price || item.product?.price_num || item.price || 0;
                                        const img = item.product?.thumbnail || item.product?.image || item.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop';
                                        const merchant = item.product?.merchant?.name || item.product?.merchant || 'Merchant Verified';
                                        const qty = item.quantity || 1;

                                        return (
                                            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-800/60 bg-slate-950/40">
                                                <img src={img} alt={title} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-800" />
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-xs truncate text-white">{title}</h5>
                                                    <span className="text-[10px] text-slate-400 block">{merchant} &bull; {qty}x</span>
                                                </div>
                                                <span className="font-black text-xs text-teal-400 shrink-0">{formatCurrency(price * qty)}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Price Calculations */}
                                <div className="space-y-3 text-xs mb-6 border-t border-slate-800/80 pt-4">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Subtotal ({checkoutItems.length} Produk)</span>
                                        <span className="font-semibold text-slate-200">{formatCurrency(subtotal)}</span>
                                    </div>

                                    {discount > 0 && (
                                        <div className="flex justify-between text-emerald-400 font-semibold">
                                            <span>Diskon Voucher</span>
                                            <span>- {formatCurrency(discount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-slate-400">
                                        <span>Biaya Layanan & Lisensi</span>
                                        <span className="text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Gratis Rp 0</span>
                                    </div>

                                    <div className="flex justify-between items-baseline pt-4 border-t border-slate-800">
                                        <div>
                                            <span className="block font-black text-sm text-white">Total Bayar</span>
                                            <span className="text-[10px] text-slate-400">Garansi File Instan Download</span>
                                        </div>
                                        <span className="text-2xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text">
                                            {formatCurrency(grandTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Pay Button */}
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-[#FFBF00]/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#0F3040] border-t-transparent rounded-full animate-spin"></div>
                                            <span>Memproses Transaksi...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5 text-[#0F3040]" />
                                            <span>Bayar Sekarang & Konfirmasi ({formatCurrency(grandTotal)})</span>
                                            <span>&rarr;</span>
                                        </>
                                    )}
                                </button>

                                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[10.5px] text-slate-400">
                                    <ShieldCheck className="w-4 h-4 text-[#FFBF00]" />
                                    <span>256-Bit Encrypted Syariah Payment Security</span>
                                </div>
                            </div>
                        </div>

                    </form>
                )}
            </main>

            {/* Success Invoice Modal */}
            {isSuccessModalOpen && createdOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                    <div className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 ${
                        darkMode ? 'bg-[#0F3040] border-[#174256] text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="w-16 h-16 rounded-full bg-[#FFBF00] text-[#0F3040] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FFBF00]/30">
                            <Check className="w-8 h-8 stroke-[3] text-[#0F3040]" />
                        </div>

                        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#FFBF00] bg-[#FFBF00]/20 border border-[#FFBF00]/40 px-3 py-1 rounded-full mb-2">
                            Pembayaran Berhasil / Terkonfirmasi
                        </span>

                        <h3 className="text-2xl font-black mb-1 text-white">Transaksi Berhasil!</h3>
                        <p className="text-xs text-slate-300 mb-6">
                            {checkoutItems[0]?.isPackage 
                                ? 'Pesanan paket Anda sedang menunggu verifikasi admin.' 
                                : 'File produk digital siap langsung diunduh.'}
                        </p>

                        <div className="bg-[#071922] border border-[#174256] rounded-2xl p-4 text-xs text-left space-y-2 mb-6 font-mono">
                            <div className="flex justify-between border-b border-[#174256] pb-2 text-slate-300">
                                <span>No Invoice:</span>
                                <strong className="text-[#FFBF00]">{createdOrder.invoice}</strong>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Pemesan:</span>
                                <span>{createdOrder.customer.name}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Total Bayar:</span>
                                <strong className="text-[#FFBF00]">{formatCurrency(createdOrder.total)}</strong>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Waktu:</span>
                                <span className="text-[10px]">{createdOrder.date}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={() => handleRedirectWhatsApp(createdOrder)}
                                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                            >
                                <PhoneCall className="w-4 h-4 text-white" />
                                <span>Kirim Konfirmasi WhatsApp</span>
                            </button>

                            <button 
                                onClick={() => {
                                    setIsSuccessModalOpen(false);
                                    if (checkoutItems[0]?.isPackage && user?.role === 'merchant') {
                                        onNavigate('merchant');
                                    } else {
                                        onNavigate('customer');
                                    }
                                }}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black text-xs rounded-xl shadow-lg shadow-[#FFBF00]/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                            >
                                <Download className="w-4 h-4 text-[#0F3040]" />
                                <span>{checkoutItems[0]?.isPackage ? 'Lihat Status di Dashboard' : 'Unduh Produk Saya di Dashboard'}</span>
                            </button>

                            <button 
                                onClick={() => {
                                    setIsSuccessModalOpen(false);
                                    onNavigate('homepage');
                                }}
                                className="w-full py-2.5 px-4 bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
