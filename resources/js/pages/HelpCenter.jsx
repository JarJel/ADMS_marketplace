import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import {
    Search, ChevronDown, Plus, Minus, MessageCircle, ShoppingCart,
    CreditCard, Package, User, Store, RefreshCcw, ShieldCheck
} from 'lucide-react';

export default function HelpCenter({ user, token, darkMode, setDarkMode, onNavigate, onLogout, cartCount = 0, wishlistCount = 0, notifications = [], setNotifications }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [openFaqs, setOpenFaqs] = useState({});

    const toggleFaq = (categoryIndex, itemIndex) => {
        const key = `${categoryIndex}-${itemIndex}`;
        setOpenFaqs(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const faqsData = [
        {
            category: "Pembelian Produk",
            icon: ShoppingCart,
            items: [
                { q: "Bagaimana cara membeli produk digital?", a: "Pilih produk yang diinginkan, lihat detail produk, kemudian klik tombol Beli atau Checkout. Ikuti proses pembayaran hingga transaksi berhasil. Setelah pembayaran terverifikasi, produk dapat diakses sesuai ketentuan produk." },
                { q: "Apakah saya bisa melihat detail produk sebelum membeli?", a: "Ya. Pastikan membaca deskripsi, fitur, format file, lisensi, dan informasi lainnya sebelum melakukan pembelian." },
                { q: "Di mana saya mendapatkan produk yang sudah dibeli?", a: "Setelah pembayaran berhasil, produk digital dapat diakses melalui halaman pesanan atau area download yang tersedia di akun pengguna." }
            ]
        },
        {
            category: "Pembayaran",
            icon: CreditCard,
            items: [
                { q: "Metode pembayaran apa yang tersedia?", a: "Metode pembayaran yang tersedia akan ditampilkan pada halaman checkout sesuai dengan sistem pembayaran yang digunakan ADMS Marketplace." },
                { q: "Pembayaran saya berhasil tetapi produk belum tersedia.", a: "Pastikan status pembayaran sudah berhasil. Jika produk masih belum dapat diakses setelah beberapa saat, hubungi Customer Support dengan menyertakan bukti pembayaran dan informasi transaksi." },
                { q: "Apakah pembayaran yang sudah dilakukan dapat dibatalkan?", a: "Karena ADMS Marketplace menjual produk digital, pembatalan atau refund mengikuti ketentuan yang tercantum dalam Refund Policy." }
            ]
        },
        {
            category: "Produk Digital",
            icon: Package,
            items: [
                { q: "Apa saja produk yang tersedia di ADMS Marketplace?", a: "ADMS Marketplace menyediakan berbagai produk digital seperti template, desain, ebook, source code, preset, digital assets, dan produk digital lainnya." },
                { q: "Apakah produk digital bisa dibagikan kepada orang lain?", a: "Penggunaan produk mengikuti lisensi dan ketentuan yang diberikan oleh penjual. Jangan membagikan, menjual kembali, atau mendistribusikan produk tanpa izin." },
                { q: "File produk saya rusak atau tidak dapat dibuka. Apa yang harus dilakukan?", a: "Hubungi Customer Support dan sertakan informasi produk serta kendala yang terjadi. Tim kami akan membantu memeriksa masalah tersebut." }
            ]
        },
        {
            category: "Akun",
            icon: User,
            items: [
                { q: "Apakah saya harus memiliki akun untuk membeli produk?", a: "Jika ADMS Marketplace mewajibkan akun untuk transaksi, pengguna harus melakukan pendaftaran terlebih dahulu. Ikuti instruksi yang tersedia pada halaman pendaftaran." },
                { q: "Saya lupa password.", a: "Gunakan fitur Lupa Password pada halaman login untuk melakukan pemulihan akun." },
                { q: "Bagaimana cara mengubah informasi akun?", a: "Masuk ke akun Anda dan buka halaman profil atau pengaturan akun untuk memperbarui informasi yang tersedia." }
            ]
        },
        {
            category: "Penjual",
            icon: Store,
            items: [
                { q: "Bagaimana cara menjual produk digital di ADMS Marketplace?", a: "Jika ADMS Marketplace menyediakan fitur penjual, pengguna dapat mengikuti proses pendaftaran sebagai penjual dan mengunggah produk sesuai ketentuan platform." },
                { q: "Produk seperti apa yang boleh dijual?", a: "Produk harus merupakan karya yang sah untuk dijual dan tidak melanggar hak cipta, lisensi, hukum, maupun kebijakan ADMS Marketplace." },
                { q: "Apakah produk bajakan boleh dijual?", a: "Tidak. Produk bajakan, hasil pelanggaran hak cipta, atau produk yang tidak memiliki hak untuk diperjualbelikan tidak diperbolehkan." }
            ]
        },
        {
            category: "Refund",
            icon: RefreshCcw,
            items: [
                { q: "Apakah produk digital dapat direfund?", a: "Karena produk ADMS Marketplace bersifat digital, refund tidak selalu tersedia. Pengajuan refund hanya dapat dilakukan pada kondisi tertentu sesuai dengan Refund Policy." },
                { q: "Bagaimana cara mengajukan refund?", a: "Hubungi Customer Support dan sertakan informasi transaksi serta alasan pengajuan refund. Setiap pengajuan akan diperiksa berdasarkan ketentuan yang berlaku." }
            ]
        },
        {
            category: "Hak Cipta & Keamanan",
            icon: ShieldCheck,
            items: [
                { q: "Bagaimana jika saya menemukan produk yang melanggar hak cipta?", a: "Segera hubungi Customer Support dan berikan informasi produk serta bukti yang relevan agar dapat dilakukan pemeriksaan." },
                { q: "Apakah produk bajakan diperbolehkan?", a: "Tidak. ADMS Marketplace tidak mengizinkan penjualan atau distribusi produk yang melanggar hak cipta atau hak kekayaan intelektual pihak lain." }
            ]
        }
    ];

    // Filter FAQs based on search and category
    const filteredData = useMemo(() => {
        let result = faqsData;

        // Apply category filter
        if (activeCategory !== 'Semua') {
            result = result.filter(cat => cat.category === activeCategory);
        }

        // Apply search query
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.map(cat => {
                const matchingItems = cat.items.filter(item =>
                    item.q.toLowerCase().includes(lowerQuery) ||
                    item.a.toLowerCase().includes(lowerQuery)
                );
                return { ...cat, items: matchingItems };
            }).filter(cat => cat.items.length > 0);
        }

        return result;
    }, [searchQuery, activeCategory]);

    const handleWhatsAppClick = () => {
        // You can use the existing WhatsApp link convention here
        window.open('https://wa.me/6281121211933', '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#071922] text-slate-900 dark:text-white font-sans pb-20 transition-colors duration-300">
            <Navbar
                user={user}
                token={token}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onLogout={onLogout}
                onNavigate={onNavigate}
                currentView="help_center"
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                notifications={notifications}
                setNotifications={setNotifications}
            />

            {/* 2. Hero Section Bantuan */}
            <header className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b-2 border-slate-300 dark:border-[#174256] bg-slate-50 dark:bg-[#0F3040] text-slate-900 dark:text-white transition-colors duration-300">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0F3040] dark:text-white">
                        Pusat Bantuan <span className="text-[#FFBF00]">ADMS Marketplace</span>
                    </h1>
                    <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-slate-600 dark:text-slate-300">
                        Temukan jawaban atas pertanyaan seputar pembelian, pembayaran, produk digital, akun, dan kendala penggunaan ADMS Marketplace.
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Category Navigation Tabs */}
                {!searchQuery && (
                    <div className="mb-12">
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={() => setActiveCategory('Semua')}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-2 ${activeCategory === 'Semua'
                                        ? 'bg-[#FFBF00] text-[#0F3040] font-black border-[#FFBF00] shadow-lg shadow-[#FFBF00]/20'
                                        : 'bg-white dark:bg-[#071922] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#174256] hover:text-[#FFBF00]'
                                    }`}
                            >
                                Semua Kategori
                            </button>
                            {faqsData.map((cat, idx) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.category;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveCategory(cat.category)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-2 ${isActive
                                                ? 'bg-[#FFBF00] text-[#0F3040] font-black border-[#FFBF00] shadow-lg shadow-[#FFBF00]/20'
                                                : 'bg-white dark:bg-[#071922] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#174256] hover:text-[#FFBF00]'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 text-[#FFBF00]" />
                                        {cat.category}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* 4. FAQ berdasarkan kategori */}
                <div className="space-y-10">
                    {filteredData.length > 0 ? (
                        filteredData.map((cat, catIdx) => {
                            const Icon = cat.icon;
                            return (
                                <section key={catIdx} className="space-y-4">
                                    {/* Only show Category header if not searching, or if searching we can still show it */}
                                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 mb-6 text-[#0F3040] dark:text-white">
                                        <Icon className="w-6 h-6 text-[#FFBF00]" />
                                        {cat.category}
                                    </h2>

                                    <div className="space-y-3">
                                        {cat.items.map((item, itemIdx) => {
                                            const isOpen = openFaqs[`${catIdx}-${itemIdx}`];
                                            return (
                                                <div
                                                    key={itemIdx}
                                                    className="border-2 border-slate-300 dark:border-[#174256] rounded-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-[#0F3040] text-slate-900 dark:text-white hover:border-[#FFBF00] shadow-md dark:shadow-lg"
                                                >
                                                    <button
                                                        onClick={() => toggleFaq(catIdx, itemIdx)}
                                                        className="w-full px-6 py-5 flex items-start sm:items-center justify-between gap-4 focus:outline-none text-left cursor-pointer"
                                                        aria-expanded={isOpen}
                                                    >
                                                        <h3 className={`font-black text-sm sm:text-base leading-snug transition-colors ${isOpen ? 'text-[#FFBF00]' : 'text-[#0F3040] dark:text-white'
                                                            }`}>
                                                            {item.q}
                                                        </h3>
                                                        <div className={`mt-0.5 sm:mt-0 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen
                                                                ? 'bg-[#FFBF00] text-[#0F3040]'
                                                                : 'bg-slate-100 dark:bg-[#071922] text-[#FFBF00] border border-slate-300 dark:border-[#174256]'
                                                            }`}>
                                                            {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                                        </div>
                                                    </button>

                                                    <div
                                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                                            }`}
                                                    >
                                                        <div className="px-6 pb-6 pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-[#174256]/50 mt-2">
                                                            <p>{item.a}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </section>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 px-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Tidak menemukan jawaban yang sesuai.</h3>
                            <p className={`mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Coba gunakan kata kunci lain atau hubungi tim dukungan kami.
                            </p>
                            <button
                                onClick={handleWhatsAppClick}
                                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Hubungi Customer Support
                            </button>
                        </div>
                    )}
                </div>

                {/* 5. Section Customer Support */}
                <div className={`mt-20 p-8 sm:p-10 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left ${darkMode
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
                        : 'bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100 shadow-sm'
                    }`}>
                    <div className="max-w-xl">
                        <h4 className={`text-2xl font-extrabold tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            Masih Membutuhkan Bantuan?
                        </h4>
                        <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Tidak menemukan jawaban yang Anda cari? Tim Customer Support ADMS Marketplace siap membantu menangani pertanyaan dan kendala Anda.
                        </p>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto">
                        <button
                            onClick={handleWhatsAppClick}
                            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white px-8 py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Hubungi Customer Support
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
