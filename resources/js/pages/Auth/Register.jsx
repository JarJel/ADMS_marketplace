import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('user'); // Default: user

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        setError(null);

        // Validation checks
        if (password !== passwordConfirmation) {
            setError('Konfirmasi password tidak cocok dengan password baru.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    phone, 
                    password, 
                    password_confirmation: passwordConfirmation, 
                    role 
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setSuccess(true);
                setTimeout(() => {
                    onRegisterSuccess();
                }, 1500);
            } else {
                // Parse Laravel validator error bag if it exists
                if (data.errors) {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    setError(data.errors[firstErrorKey][0]);
                } else {
                    setError(data.message || 'Registrasi gagal. Coba hubungi administrator.');
                }
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#05131b] via-[#0F3040] to-[#071922] px-4 py-12 relative overflow-hidden font-sans">
            {/* Visual lights decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FFBF00]/10 blur-[160px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[#174256]/50 blur-[180px] pointer-events-none"></div>

            <div className="max-w-md w-full z-10">
                <div className="bg-[#0F3040]/90 backdrop-blur-2xl border-2 border-[#174256] hover:border-[#FFBF00]/40 rounded-3xl p-8 sm:p-9 shadow-2xl shadow-black/80 transition-all duration-300">
                    
                    {/* Brand Logo & Name */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2.5 mb-3 hover:scale-105 transition-transform duration-300 cursor-pointer">
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
                        <h2 className="text-2xl font-black text-[#FFBF00] tracking-tight">
                            Daftar Akun Baru
                        </h2>
                        <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">
                            Armada Digital Marketing Syariah
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-5 p-4 rounded-2xl bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-semibold shadow-inner">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            Registrasi Sukses! Mengalihkan ke halaman masuk...
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4 text-left">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                                Nama Lengkap
                            </label>
                            <input 
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#071922] border border-[#174256] rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all shadow-inner"
                                placeholder="Masukkan nama lengkap Anda"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                                Alamat Email
                            </label>
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#071922] border border-[#174256] rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all shadow-inner"
                                placeholder="nama@email.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                                Nomor HP / WA
                            </label>
                            <input 
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-[#071922] border border-[#174256] rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all shadow-inner"
                                placeholder="Contoh: 08123456789"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#071922] border border-[#174256] rounded-2xl px-4 py-3 pr-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all shadow-inner"
                                    placeholder="Minimal 8 karakter"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="w-full bg-[#071922] border border-[#174256] rounded-2xl px-4 py-3 pr-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFBF00] focus:ring-1 focus:ring-[#FFBF00] transition-all shadow-inner"
                                    placeholder="Ulangi password"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] font-black py-3.5 px-4 rounded-2xl text-xs shadow-xl shadow-[#FFBF00]/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 cursor-pointer uppercase tracking-wider"
                        >
                            {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-[#174256]/80 pt-4">
                        <p className="text-xs text-slate-300">
                            Sudah punya akun?{' '}
                            <button 
                                onClick={onNavigateToLogin}
                                className="text-[#FFBF00] hover:underline font-extrabold cursor-pointer ml-1"
                            >
                                Masuk di sini
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

