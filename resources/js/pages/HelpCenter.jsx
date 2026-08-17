import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ChevronDown, MessageCircle, Mail, HelpCircle, Shield, ShoppingBag, Store, Megaphone } from 'lucide-react';

export default function HelpCenter({ user, token, darkMode, setDarkMode, onNavigate, onLogout }) {
    const [activeCategory, setActiveCategory] = useState('umum');
    const [openFaq, setOpenFaq] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const heroImages = [
        "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=1920&auto=format&fit=crop", // Layanan/Support
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1920&auto=format&fit=crop", // Digital workspace
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop"  // Tech connection
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const categories = [
        { id: 'umum', label: 'Umum & Akun', icon: Shield },
        { id: 'pembeli', label: 'Pembeli', icon: ShoppingBag },
        { id: 'merchant', label: 'Merchant', icon: Store },
        { id: 'iklan', label: 'Iklan Baris', icon: Megaphone }
    ];

    const faqs = {
        umum: [
            { q: "Apa itu ADMS Marketplace?", a: "ADMS Marketplace adalah platform digital terintegrasi yang memungkinkan pengguna untuk melakukan jual beli aset digital (ebook, template, source code), sekaligus menyediakan layanan pemasangan Iklan Baris gratis dan premium." },
            { q: "Bagaimana cara mendaftar akun?", a: "Anda dapat mendaftar dengan mengklik tombol 'Daftar' di kanan atas halaman utama. Isi data diri Anda, atau gunakan login cepat melalui integrasi pihak ketiga (jika tersedia). Pendaftaran di ADMS 100% gratis." },
            { q: "Apakah platform ini sepenuhnya gratis?", a: "Ya, mendaftar akun dan menggunakan sebagian besar fitur dasar kami adalah gratis. Untuk layanan eksklusif seperti Iklan VIP Boost, berlaku biaya berlangganan atau paket berbayar." }
        ],
        pembeli: [
            { q: "Bagaimana cara membeli dan mendownload produk digital?", a: "Pilih produk digital yang Anda inginkan, klik 'Beli Sekarang', dan selesaikan pembayaran. Setelah pembayaran terverifikasi otomatis oleh sistem (contoh: via QRIS), Anda bisa langsung mendownload file produk tersebut dari halaman Transaksi atau 'My Downloads'." },
            { q: "Metode pembayaran apa saja yang didukung?", a: "Kami mendukung berbagai metode pembayaran otomatis yang aman, termasuk QRIS, Transfer Bank Virtual Account, dan E-Wallet (OVO, Dana, ShopeePay)." },
            { q: "Bagaimana jika file yang saya beli rusak atau tidak bisa diakses?", a: "Anda dapat menghubungi Merchant secara langsung melalui fitur Pesan/Kontak, atau melaporkannya ke tim resolusi ADMS jika merchant tidak merespons dalam waktu 2x24 jam." }
        ],
        merchant: [
            { q: "Bagaimana cara membuka toko / menjadi Merchant di ADMS?", a: "Setelah mendaftar sebagai pengguna biasa, masuk ke Dashboard profil Anda dan pilih menu 'Daftar Merchant'. Isi profil lengkap toko Anda dan tunggu proses verifikasi oleh tim admin kami." },
            { q: "Produk apa saja yang boleh dijual di sini?", a: "ADMS mengusung konsep Syariah Certified, sehingga kami hanya menerima produk digital yang halal, tidak melanggar hak cipta (legal), dan tidak mengandung unsur perjudian, pornografi, maupun hal negatif lainnya." },
            { q: "Bagaimana prosedur penarikan dana (Withdrawal)?", a: "Saldo penjualan Anda dapat ditarik kapan saja melalui menu 'Withdrawal' di Dashboard Merchant. Dana akan ditransfer ke rekening bank yang Anda daftarkan dalam waktu 1x24 jam kerja." }
        ],
        iklan: [
            { q: "Bagaimana cara memasang Iklan Baris secara gratis?", a: "Klik menu 'Iklan Gratis' atau tombol 'Pasang Iklan Gratis'. Isi detail barang atau jasa yang ingin Anda promosikan beserta kontak Anda. Iklan Anda akan tayang setelah lolos moderasi singkat." },
            { q: "Berapa lama masa tayang iklan gratis?", a: "Iklan baris gratis biasanya aktif selama 30 hari. Anda bisa memperbaruinya kembali setelah masa tayang habis." },
            { q: "Apa bedanya Iklan Gratis dan Iklan Premium (VIP Boost)?", a: "Iklan Premium/VIP akan mendapatkan prioritas tayang di halaman utama, muncul paling atas di hasil pencarian, dan menjangkau lebih banyak calon pembeli dibandingkan iklan reguler." }
        ]
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 font-sans pb-20 ${darkMode ? 'bg-[#030914] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout}
                onNavigate={onNavigate} 
                currentView="help_center"
            />

            {/* Hero Header with Slideshow Background */}
            <div className="relative pt-28 pb-16 px-4 text-center border-b border-slate-800/50 overflow-hidden">
                {/* Slideshow Background */}
                {heroImages.map((img, idx) => (
                    <div 
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            currentImageIndex === idx ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <img 
                            src={img} 
                            alt={`Slide ${idx + 1}`} 
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Dark Overlay for readability */}
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
                    </div>
                ))}

                {/* Content */}
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white drop-shadow-md">
                        Pusat Bantuan ADMS
                    </h1>
                    <p className="max-w-xl mx-auto text-sm text-slate-300 drop-shadow">
                        Temukan panduan, jawaban pertanyaan umum, dan informasi lengkap seputar layanan ADMS Marketplace & Iklan Baris.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
                
                {/* Category Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id); setOpenFaq(null); }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                                    isActive 
                                        ? (darkMode ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-sky-600 text-white shadow-md shadow-sky-600/20')
                                        : (darkMode ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50' : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200')
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        )
                    })}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {faqs[activeCategory].map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <div 
                                key={index} 
                                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                                    darkMode 
                                        ? `bg-slate-900 border-slate-800 ${isOpen ? 'ring-1 ring-sky-500/50 shadow-lg shadow-sky-500/5' : ''}`
                                        : `bg-white border-slate-200 ${isOpen ? 'ring-1 ring-sky-500/30 shadow-md shadow-slate-200' : ''}`
                                }`}
                            >
                                <button 
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                                >
                                    <h3 className={`font-bold text-sm sm:text-base pr-8 ${
                                        darkMode ? (isOpen ? 'text-sky-400' : 'text-slate-200') : (isOpen ? 'text-sky-700' : 'text-slate-800')
                                    }`}>
                                        {faq.q}
                                    </h3>
                                    <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-500' : 'text-slate-400'}`} />
                                </button>
                                
                                <div 
                                    className={`px-6 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        <p>{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Contact Banner */}
                <div className={`mt-16 p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 border ${
                    darkMode ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-r from-slate-100 to-white border-slate-200 shadow-sm'
                }`}>
                    <div>
                        <h4 className="font-extrabold text-lg mb-2">Masih Butuh Bantuan?</h4>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tim dukungan pelanggan kami siap membantu Anda setiap hari (09.00 - 17.00 WIB).</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-green-500/20">
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp CS
                        </button>
                        <button className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${
                            darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}>
                            <Mail className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
