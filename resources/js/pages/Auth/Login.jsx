import React, { useState, useEffect } from 'react';
import { 
    Shield, ArrowRight, CheckCircle, Store, Eye, EyeOff, Mail, Lock, 
    Sparkles, BadgeCheck, ShoppingBag, Megaphone, UserCheck, ChevronRight 
} from 'lucide-react';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
    // Mode: 'login', 'forgot', 'reset'
    const [authMode, setAuthMode] = useState('login'); 
    
    // Form Inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [token, setToken] = useState(''); // Password Reset Token

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
        setToken('');
        setError(null);
        setSuccessMsg(null);
        setAuthMode('login');
        setShowPassword(false);
        setShowConfirmPassword(false);
    }, []);

    // Quick Test Account Handler
    const handleSelectTestAccount = (accEmail) => {
        setEmail(accEmail);
        setPassword('password123');
        setError(null);
    };

    const handleLoginSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setSuccessMsg('Login Berhasil! Mengalihkan ke dashboard...');
                localStorage.setItem('auth_token', data.data.token);
                setTimeout(() => {
                    onLoginSuccess(data.data.token, data.data.user);
                }, 1000);
            } else {
                setError(data.message || 'Login gagal. Periksa kembali email dan password Anda.');
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setSuccessMsg('Link reset password telah dikirim ke email Anda! Silakan periksa kotak masuk.');
                setTimeout(() => {
                    setSuccessMsg(null);
                    setAuthMode('reset');
                }, 2000);
            } else {
                setError(data.message || 'Email tidak terdaftar.');
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);

        if (password !== passwordConfirmation) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    email, 
                    token,
                    password, 
                    password_confirmation: passwordConfirmation 
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setSuccessMsg('Password berhasil diperbarui! Silakan masuk.');
                setTimeout(() => {
                    setSuccessMsg(null);
                    setAuthMode('login');
                    setPassword('');
                    setPasswordConfirmation('');
                    setToken('');
                }, 2000);
            } else {
                if (data.errors) {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    setError(data.errors[firstErrorKey][0]);
                } else {
                    setError(data.message || 'Gagal reset password.');
                }
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setError(null);
        setSuccessMsg(null);
        setAuthMode('login');
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#05131b] via-[#0F3040] to-[#071922] flex flex-col lg:flex-row font-sans">
            
            {/* LEFT PANEL: Full Height Login Panel (Spread Top-Center-Bottom) */}
            <div className="w-full lg:w-[460px] xl:w-[500px] h-full bg-[#0F3040] border-r border-[#174256] px-8 sm:px-10 py-8 flex flex-col justify-between shrink-0 shadow-2xl z-20 relative overflow-y-auto">
                
                {/* Background ambient lighting for left panel */}
                <div className="absolute top-0 left-0 w-full h-40 bg-[#FFBF00]/5 blur-3xl pointer-events-none"></div>

                {/* Top Section: Logo & Brand (Slightly Lowered) */}
                <div className="flex flex-col items-center justify-center text-center pt-6 sm:pt-8">
                    <div className="flex items-center justify-center gap-3 mb-2 hover:scale-105 transition-transform duration-300 cursor-pointer">
                        <img 
                            src="/assets/Images/adms-symbol.png" 
                            alt="ADMS Symbol" 
                            className="h-11 w-auto object-contain drop-shadow-md"
                        />
                        <img 
                            src="/assets/Images/adms-text.png" 
                            alt="ADMS Text" 
                            className="h-7 w-auto object-contain invert mix-blend-screen"
                        />
                    </div>

                    {authMode === 'login' ? (
                        <p className="text-xs font-black text-[#FFBF00] tracking-widest uppercase mt-1 text-center">
                            Armada Digital Marketing Syariah
                        </p>
                    ) : (
                        <div className="text-center">
                            <h2 className="text-xl font-black text-[#FFBF00] tracking-tight mt-1">
                                {authMode === 'forgot' && 'Lupa Password'}
                                {authMode === 'reset' && 'Reset Password'}
                            </h2>
                            <p className="text-xs text-slate-300 mt-1">
                                {authMode === 'forgot' && 'Masukkan email terdaftar Anda untuk tautan pemulihan.'}
                                {authMode === 'reset' && 'Masukkan token dari email & buat password baru Anda.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Center Section: Forms & Inputs (Middle Centered) */}
                <div className="w-full max-w-sm mx-auto my-auto py-4">
                    
                    {/* Alerts */}
                    {error && (
                        <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-semibold shadow-inner text-left">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-inner text-left">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            {successMsg}
                        </div>
                    )}

                    {/* Login Form */}
                    {authMode === 'login' && (
                        <form onSubmit={handleLoginSubmit} className="space-y-4 text-left" autoComplete="off">
                            <div>
                                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                                    Email / Nomor Telepon
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        required
                                        autoComplete="off"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#071922] border border-[#174256] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all shadow-inner"
                                        placeholder="nama@gmail.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-bold text-slate-200">
                                        Password
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => setAuthMode('forgot')}
                                        className="text-[11px] text-[#FFBF00] hover:underline font-bold transition-all"
                                    >
                                        Lupa Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#071922] border border-[#174256] rounded-2xl pl-11 pr-11 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all shadow-inner"
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black py-3.5 px-4 rounded-2xl text-xs shadow-xl shadow-[#FFBF00]/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-3 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span>Memproses Masuk...</span>
                                ) : (
                                    <>
                                        <span>Masuk ke Platform</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Forgot Password Form */}
                    {authMode === 'forgot' && (
                        <form onSubmit={handleForgotSubmit} className="space-y-4 text-left" autoComplete="off">
                            <div>
                                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                                    Alamat Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email"
                                        required
                                        autoComplete="off"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#071922] border border-[#174256] rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all"
                                        placeholder="Masukkan email terdaftar Anda"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black py-3.5 px-4 rounded-2xl text-xs shadow-xl shadow-[#FFBF00]/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-3 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                {loading ? 'Mengirim Permintaan...' : 'Kirim Permintaan Reset'}
                            </button>

                            <button 
                                type="button"
                                onClick={handleBackToLogin}
                                className="w-full text-center text-xs text-slate-300 hover:text-[#FFBF00] transition-colors mt-2 font-semibold"
                            >
                                Kembali ke Login
                            </button>
                        </form>
                    )}

                    {/* Reset Password Form */}
                    {authMode === 'reset' && (
                        <form onSubmit={handleResetSubmit} className="space-y-3.5 text-left" autoComplete="off">
                            <div>
                                <label className="block text-xs font-bold text-slate-200 mb-1">
                                    Email Konfirmasi
                                </label>
                                <input 
                                    type="email"
                                    required
                                    readOnly
                                    value={email}
                                    className="w-full bg-[#071922]/50 border border-[#174256] rounded-2xl px-4 py-2.5 text-xs text-slate-400 focus:outline-none cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-200 mb-1">
                                    Token Reset
                                </label>
                                <input 
                                    type="text"
                                    required
                                    autoComplete="off"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full bg-[#071922] border border-[#174256] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all"
                                    placeholder="Masukkan token dari email Anda"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-200 mb-1">
                                    Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#071922] border border-[#174256] rounded-2xl pl-11 pr-11 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all"
                                        placeholder="Minimal 8 karakter"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-200 mb-1">
                                    Konfirmasi Password Baru
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        autoComplete="new-password"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className="w-full bg-[#071922] border border-[#174256] rounded-2xl pl-11 pr-11 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all"
                                        placeholder="Ulangi password baru"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black py-3.5 px-4 rounded-2xl text-xs shadow-xl shadow-[#FFBF00]/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-3 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                {loading ? 'Memperbarui Sandi...' : 'Perbarui Password'}
                            </button>

                            <button 
                                type="button"
                                onClick={handleBackToLogin}
                                className="w-full text-center text-xs text-slate-300 hover:text-[#FFBF00] transition-colors mt-2 font-semibold"
                            >
                                Kembali ke Login
                            </button>
                        </form>
                    )}

                </div>

                {/* Bottom Section: Footer & Links (Positioned at Bottom) */}
                <div className="border-t border-[#174256]/80 pt-4 text-center pb-2">
                    {authMode === 'login' && (
                        <p className="text-xs text-slate-300 mb-1.5">
                            Belum punya akun?{' '}
                            <button 
                                type="button"
                                onClick={onNavigateToRegister}
                                className="text-[#FFBF00] hover:underline font-extrabold cursor-pointer ml-1 inline-flex items-center gap-1"
                            >
                                <span>Daftar Akun Baru</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                        &copy; 2026 PT. Armada Digital Marketing Syariah. All rights reserved.
                    </p>
                </div>

            </div>

            {/* RIGHT PANEL: Hero Background & Showcase Section (Full Screen Width / Height) */}
            <div className="flex-1 h-full bg-gradient-to-br from-[#05131b] via-[#071922] to-[#0F3040] hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
                
                {/* Visual Ambient Gold Lighting Effects */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#FFBF00]/10 blur-[180px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-[#174256]/60 blur-[180px] pointer-events-none"></div>

                {/* Top Badge */}
                <div className="flex justify-end z-10">
                    <div className="inline-flex items-center gap-2 bg-[#0F3040]/80 border border-[#FFBF00]/30 px-4 py-2 rounded-full backdrop-blur-md shadow-lg">
                        <BadgeCheck className="w-5 h-5 text-[#FFBF00]" />
                        <span className="text-xs font-extrabold text-[#FFBF00] tracking-wide">Platform Digital Marketplace Syariah No. 1</span>
                    </div>
                </div>

                {/* Center Content / Hero Header */}
                <div className="max-w-2xl z-10 text-left my-auto space-y-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[#FFBF00] text-[#0F3040] tracking-wider uppercase shadow-md">
                        <Sparkles className="w-3 h-3 text-[#0F3040]" />
                        Ekosistem Halal Terverifikasi
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
                        Kemudahan Bertransaksi & Beriklan dalam Satu <span className="text-[#FFBF00] bg-clip-text text-transparent bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00]">Ekosistem Syariah</span>
                    </h1>

                    <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
                        Nikmati pengalaman belanja produk digital & fisik berkualitas tinggi, serta fasilitas iklan classified terpercaya dengan garansi transaksi bebas riba.
                    </p>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="bg-[#0F3040]/70 backdrop-blur-xl border border-[#174256] p-5 rounded-2xl hover:border-[#FFBF00]/60 transition-all group shadow-lg">
                            <div className="w-11 h-11 rounded-xl bg-[#071922] border border-[#174256] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
                                <ShoppingBag className="w-5 h-5 text-[#FFBF00]" />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">Marketplace Produk</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">Produk herbal, makanan halal, hingga source code & template Canva.</p>
                        </div>

                        <div className="bg-[#0F3040]/70 backdrop-blur-xl border border-[#174256] p-5 rounded-2xl hover:border-[#FFBF00]/60 transition-all group shadow-lg">
                            <div className="w-11 h-11 rounded-xl bg-[#071922] border border-[#174256] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
                                <Megaphone className="w-5 h-5 text-[#FFBF00]" />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">Iklan Classified</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">Pasang & cari iklan mobil, motor, properti, tanah, jasa, hingga loker.</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Trust Indicators */}
                <div className="flex items-center justify-between pt-6 border-t border-[#174256]/80 z-10">
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                        <CheckCircle className="w-4 h-4 text-[#FFBF00]" />
                        <span>Sertifikasi MUI & Bebas Riba</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                        <CheckCircle className="w-4 h-4 text-[#FFBF00]" />
                        <span>Merchant Terverifikasi</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                        <CheckCircle className="w-4 h-4 text-[#FFBF00]" />
                        <span>Bantuan 24/7 AI Chatbot</span>
                    </div>
                </div>

            </div>

        </div>
    );
}


