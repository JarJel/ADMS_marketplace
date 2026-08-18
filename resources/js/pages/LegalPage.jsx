import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { ChevronRight, Home, ShieldCheck } from 'lucide-react';

const legalData = {
    terms: {
        title: 'Syarat & Ketentuan',
        seoTitle: 'ADMS Marketplace | Terms & Conditions',
        description: 'Syarat dan ketentuan penggunaan ADMS Marketplace untuk pembelian dan penjualan produk digital.',
        content: (
            <>
                <p className="mb-4">Selamat datang di ADMS Marketplace. Dengan mengakses dan menggunakan platform ADMS Marketplace, pengguna dianggap telah membaca, memahami, dan menyetujui Syarat & Ketentuan yang berlaku.</p>
                
                <p className="mb-4">ADMS Marketplace merupakan platform yang menyediakan produk digital dari berbagai penjual. Pengguna bertanggung jawab untuk memberikan informasi yang benar saat melakukan pendaftaran maupun transaksi.</p>
                
                <p className="mb-4">Setiap produk digital yang dibeli hanya dapat digunakan sesuai dengan deskripsi, lisensi, dan ketentuan yang diberikan oleh penjual. Pengguna dilarang menggandakan, menjual kembali, membagikan, atau mendistribusikan produk digital tanpa izin dari pemilik hak.</p>
                
                <p className="mb-8">ADMS Marketplace berhak melakukan tindakan terhadap akun atau produk yang terbukti melanggar ketentuan, termasuk pembatasan atau penghentian akses.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Penggunaan Platform</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Pengguna wajib mematuhi seluruh hukum yang berlaku saat mengakses dan menggunakan platform ini. Setiap aktivitas yang mengganggu atau merusak infrastruktur marketplace dilarang keras.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Akun Pengguna</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi dan aktivitas yang terjadi di bawah akun mereka. ADMS Marketplace berhak menonaktifkan akun yang mencurigakan.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Pembelian Produk Digital</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Seluruh transaksi pembelian dilakukan secara langsung melalui platform yang kami sediakan. Harap pastikan detail pesanan sudah sesuai sebelum melanjutkan pembayaran.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Lisensi dan Hak Penggunaan</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Pembelian produk digital tidak mengalihkan hak cipta produk kepada pembeli. Pembeli hanya mendapatkan lisensi penggunaan sesuai dengan yang ditetapkan oleh penjual.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Larangan Penggunaan</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Segala bentuk pembajakan, penyebaran ulang, dan eksploitasi komersial ilegal atas produk digital yang dibeli sangat dilarang dan dapat berujung pada sanksi hukum.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Tanggung Jawab Pengguna</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Pengguna bertanggung jawab penuh atas semua tindakan yang dilakukan menggunakan akun mereka dan setiap konsekuensi hukum yang timbul dari aktivitas tersebut.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Pelanggaran Ketentuan</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Tindakan pelanggaran dapat mengakibatkan penghapusan produk, suspend akun secara sementara, hingga pemblokiran akses secara permanen tanpa pengembalian dana.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Perubahan Syarat & Ketentuan</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">ADMS Marketplace dapat merevisi syarat dan ketentuan ini sewaktu-waktu. Pengguna diharapkan secara berkala memeriksa halaman ini untuk memastikan kepatuhan terhadap aturan terbaru.</p>
            </>
        )
    },
    privacy: {
        title: 'Kebijakan Privasi',
        seoTitle: 'ADMS Marketplace | Privacy Policy',
        description: 'Kebijakan pengumpulan, penggunaan, dan perlindungan data privasi pengguna ADMS Marketplace.',
        content: (
            <>
                <p className="mb-4">ADMS Marketplace menghargai dan melindungi privasi setiap pengguna. Informasi yang diberikan, seperti nama, alamat email, nomor kontak, serta informasi transaksi, digunakan untuk menyediakan dan meningkatkan layanan marketplace.</p>

                <p className="mb-4">Data pengguna dapat digunakan untuk proses pendaftaran akun, pemrosesan transaksi, pemberian akses produk digital, komunikasi terkait pesanan, dukungan pelanggan, dan keamanan platform.</p>

                <p className="mb-8">ADMS Marketplace berkomitmen untuk menjaga keamanan informasi pengguna dan tidak menjual atau menyalahgunakan data pribadi pengguna untuk kepentingan yang tidak sesuai dengan kebijakan ini.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Informasi yang Dikumpulkan</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Kami mengumpulkan informasi yang Anda berikan secara langsung, seperti saat mendaftar, melakukan pembelian, atau menghubungi layanan pelanggan kami.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Penggunaan Informasi</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Informasi yang kami kumpulkan digunakan untuk merespons pertanyaan Anda, memproses transaksi, dan menyesuaikan pengalaman pengguna sesuai dengan preferensi Anda.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Keamanan Data</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Kami menerapkan standar keamanan teknis terkini untuk melindungi data pengguna dari akses tidak sah, perubahan, pengungkapan, atau penghancuran data.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Penggunaan Cookie</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Platform kami mungkin menggunakan cookie untuk mengoptimalkan kinerja situs, menyimpan preferensi, dan melakukan analisis trafik pengunjung.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Berbagi Informasi</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Kami tidak akan membagikan informasi pribadi Anda kepada pihak ketiga kecuali diperlukan secara hukum atau esensial untuk penyediaan layanan (contoh: gerbang pembayaran).</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Hak Pengguna</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Setiap pengguna memiliki hak untuk meninjau, memperbarui, atau menghapus informasi profil mereka kapan saja melalui pengaturan akun.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Perubahan Kebijakan Privasi</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Kebijakan privasi ini dapat berubah seiring berjalannya waktu. Pembaruan akan segera ditayangkan pada halaman ini, dan kami menyarankan pengguna untuk merujuk ke halaman ini secara berkala.</p>
            </>
        )
    },
    refund: {
        title: 'Kebijakan Pengembalian Dana',
        seoTitle: 'ADMS Marketplace | Refund Policy',
        description: 'Kebijakan pengembalian dana (refund) untuk setiap transaksi produk digital di ADMS Marketplace.',
        content: (
            <>
                <p className="mb-4">Karena produk yang tersedia di ADMS Marketplace merupakan produk digital, transaksi yang telah selesai pada umumnya tidak dapat dibatalkan atau dikembalikan.</p>

                <p className="mb-4">Pengajuan refund dapat dipertimbangkan apabila terjadi kendala seperti pembayaran berhasil tetapi produk tidak dapat diakses, produk tidak sesuai dengan deskripsi secara signifikan, terjadi transaksi ganda, atau terdapat masalah teknis yang menyebabkan pengguna tidak menerima produk yang telah dibeli.</p>

                <p className="mb-8">Setiap pengajuan refund akan diperiksa berdasarkan bukti transaksi dan kondisi yang terjadi. ADMS Marketplace berhak menentukan kelayakan refund berdasarkan ketentuan yang berlaku.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Ketentuan Refund</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Pengajuan refund hanya sah jika dilaporkan dalam batas waktu tertentu setelah transaksi berhasil, dibuktikan dengan faktur / order ID yang valid.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Kondisi yang Dapat Mengajukan Refund</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Kerusakan file (corrupted), kesalahan spesifikasi produk yang diunggah penjual, link unduhan yang mati total, dan duplikasi tagihan akibat sistem pembayaran.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Kondisi yang Tidak Dapat Refund</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Pembeli sekadar berubah pikiran (change of mind), salah klik saat membeli, merasa "tidak puas" padahal produk sesuai deskripsi, atau kegagalan akibat spesifikasi perangkat pembeli yang tidak memenuhi standar (tidak compatible).</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Proses Pengajuan Refund</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Silakan hubungi tim Customer Support kami melalui formulir atau tombol Bantuan dengan melampirkan nomor tagihan dan deskripsi detail masalah Anda.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Waktu Proses Refund</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Investigasi dan pemrosesan dana pengembalian (jika disetujui) akan diproses dalam estimasi 3-7 hari kerja tergantung dari gateway pembayaran yang digunakan pembeli.</p>
            </>
        )
    },
    advertising: {
        title: 'Kebijakan Iklan',
        seoTitle: 'ADMS Marketplace | Advertising Policy',
        description: 'Kebijakan dan aturan promosi atau pengiklanan untuk para penjual (merchant) di platform ADMS Marketplace.',
        content: (
            <>
                <p className="mb-4">ADMS Marketplace dapat menyediakan fitur promosi atau iklan bagi penjual untuk meningkatkan visibilitas produk digital mereka.</p>

                <p className="mb-4">Setiap materi iklan harus memberikan informasi yang benar, jelas, dan tidak menyesatkan. Produk yang dipromosikan juga harus memiliki hak atau izin yang diperlukan untuk diperjualbelikan.</p>

                <p className="mb-4">Dilarang menggunakan iklan untuk mempromosikan produk ilegal, produk bajakan, konten yang melanggar hak cipta, malware, penipuan, atau produk lain yang bertentangan dengan ketentuan ADMS Marketplace.</p>

                <p className="mb-8">ADMS Marketplace berhak meninjau, menolak, menghentikan, atau menghapus iklan yang dianggap melanggar kebijakan.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Ketentuan Materi Iklan</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Materi grafis dan teks pada iklan harus pantas (family-friendly) dan merepresentasikan secara spesifik produk digital yang sedang dijual tanpa manipulasi berlebihan.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Produk yang Dilarang</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Segala jenis eksploitasi, peretasan (hacking tools), skema ponzi, konten dewasa (18+), produk bajakan (nulled scripts), serta produk fisik murni yang diluar cakupan marketplace ini.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Hak Kekayaan Intelektual</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Pengiklan bertanggung jawab atas semua materi dan menjamin bahwa elemen desain iklan tidak melanggar hak kekayaan intelektual individu atau entitas mana pun.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Konten yang Menyesatkan</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Klaim penghasilan berlebihan, garansi tidak masuk akal, deskripsi palsu, atau disonansi kognitif (clickbait ekstrem) yang bermaksud menipu pembeli sangat dilarang.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Peninjauan dan Penghapusan Iklan</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Tim ADMS memiliki wewenang penuh untuk meninjau secara manual setiap kampanye iklan, dan menghentikan penayangan sewaktu-waktu jika ditemukan keganjilan atau laporan/report dari pengguna lain.</p>

                <h3 className="text-xl font-bold mb-3 mt-6">Pelanggaran Kebijakan</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Merchant yang mengiklankan konten pelanggaran akan menerima surat peringatan (strike), pencabutan fitur promosi, atau suspensi akun sebagai sanksi administratif.</p>
            </>
        )
    }
};

export default function LegalPage({ type, user, token, darkMode, setDarkMode, onLogout, onNavigate }) {
    const data = legalData[type] || legalData['terms'];

    // Handle SEO tags
    useEffect(() => {
        document.title = data.seoTitle;
        let metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", data.description);
        } else {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            metaDescription.content = data.description;
            document.head.appendChild(metaDescription);
        }
    }, [data]);

    return (
        <div className={`min-h-screen transition-colors duration-300 font-sans ${
            darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}>
            {/* 1. Reusing Main Navbar for consistent navigation */}
            <Navbar 
                user={user} 
                token={token} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={onLogout} 
                onNavigate={onNavigate}
                currentView={`legal_${type}`}
            />

            {/* 2. Main Content Area */}
            <main className="pt-28 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Breadcrumbs & Navigation */}
                    <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                        <button 
                            onClick={() => onNavigate('homepage', '/')} 
                            className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span>Beranda</span>
                        </button>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span>Legal & Kebijakan</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-slate-800 dark:text-slate-200">{data.title}</span>
                    </nav>

                    {/* Page Header */}
                    <div className="flex items-center gap-4 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {data.title}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Dokumen Resmi PT. Armada Digital Marketing Syariah
                            </p>
                        </div>
                    </div>

                    {/* Content Markdown/Typography */}
                    <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:tracking-tight">
                        {data.content}
                    </div>
                    
                    {/* Back to Home Button */}
                    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-center sm:justify-start">
                        <button 
                            onClick={() => onNavigate('homepage', '/')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0A1B33] hover:bg-[#071324] text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Home className="w-4 h-4" />
                            Kembali ke Beranda
                        </button>
                    </div>

                </div>
            </main>

            {/* 3. Reusing Footer identically from Homepage (as requested) */}
            <footer className="bg-[#071324] text-slate-100 pt-20 pb-10 border-t border-slate-900 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Upper column links grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                        {/* Company info block */}
                        <div className="md:col-span-5 space-y-6">
                            <div className="inline-flex items-center gap-2 mb-2">
                                <img src="/assets/Images/adms-symbol.png" alt="ADMS Symbol" className="h-12 object-contain" />
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed pr-0 md:pr-12">
                                Platform marketplace produk digital dan periklanan terpercaya. Temukan, jual, dan promosikan bisnis Anda dalam satu ekosistem yang saling terintegrasi.
                            </p>
                            <div className="pt-2 space-y-3">
                                <a href="mailto:Info@armadadigitalmarketing.top" className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                    </div>
                                    Info@armadadigitalmarketing.top
                                </a>
                                <a href="https://wa.me/6281121211933" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                    </div>
                                    +6281121211933
                                </a>
                                <a href="https://www.instagram.com/adms.group?igsh=MWVtdWZ6NGF5NWI2Ng==" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center border border-slate-700">
                                        <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                    </div>
                                    @adms.group
                                </a>
                            </div>
                        </div>

                        {/* Navigation Columns (3 cols) */}
                        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {/* Col 1 */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Platform</h4>
                                <ul className="space-y-3.5 text-xs text-slate-400">
                                    <li><button onClick={() => { window.location.pathname = '/'; }} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Marketplace</button></li>
                                    <li><button onClick={() => onNavigate('products', 'digital')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Produk Digital</button></li>
                                    <li><button onClick={() => onNavigate('classifieds')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Iklan Gratis</button></li>
                                    <li><button onClick={() => onNavigate('merchants')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Merchant Vendor</button></li>
                                    <li><button onClick={() => onNavigate('create_ad')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Paket Iklan</button></li>
                                </ul>
                            </div>
                            
                            {/* Col 2 */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Bantuan</h4>
                                <ul className="space-y-3.5 text-xs text-slate-400">
                                    <li><button onClick={() => { window.location.pathname = '/'; }} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">FAQ & Pertanyaan</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat'))} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Customer Support (AI Assistant)</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat', { detail: { query: 'buka katalog' } }))} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Cara Pembelian Produk</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat', { detail: { query: 'info legalitas' } }))} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Cara Menjadi Merchant</button></li>
                                    <li><button onClick={() => window.dispatchEvent(new CustomEvent('openAdmsChat', { detail: { query: 'pasang iklan online' } }))} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Panduan Iklan Gratis</button></li>
                                </ul>
                            </div>
                            
                            {/* Col 3 */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Legal & Kebijakan</h4>
                                <ul className="space-y-3.5 text-xs text-slate-400">
                                    <li><button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Terms & Conditions</button></li>
                                    <li><button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Privacy Policy</button></li>
                                    <li><button onClick={() => onNavigate('refund')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Refund Policy</button></li>
                                    <li><button onClick={() => onNavigate('advertising')} className="hover:text-white transition-colors cursor-pointer text-left bg-transparent border-0 p-0 font-medium">Advertising Policy</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="pt-8 border-t border-slate-900/60 flex flex-col items-center justify-center gap-4 text-xs text-slate-500 text-center">
                        <p>&copy; 2026 ADMS (PT. Armada Digital Marketing Syariah). All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
