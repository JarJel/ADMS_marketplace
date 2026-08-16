import React, { useState } from 'react';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 relative overflow-hidden font-sans">
            {/* Visual Lights background */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[150px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px]"></div>

            <div className="max-w-md w-full z-10 text-left">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/50">
                    
                    {/* Brand Logo & Name */}
                    <div className="text-center mb-6">
                        <img 
                            src="/assets/Images/adms-logo.png" 
                            alt="ADMS Logo" 
                            className="h-14 mx-auto mb-3 hover:scale-105 transition-transform duration-300"
                        />
                        <h2 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                            {authMode === 'login' && 'ADMS Syariah'}
                            {authMode === 'forgot' && 'Lupa Password'}
                            {authMode === 'reset' && 'Reset Password'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            {authMode === 'login' && 'Armada Digital Marketing Syariah'}
                            {authMode === 'forgot' && 'Masukkan email terdaftar Anda'}
                            {authMode === 'reset' && 'Masukkan token & kata sandi baru'}
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-5 p-4 rounded-lg bg-red-950/50 border border-red-800/40 text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-5 p-4 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            {successMsg}
                        </div>
                    )}

                    {/* Render Forms based on authMode */}
                    {authMode === 'login' && (
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    Email / Nomor Telepon
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                    placeholder="Masukkan email atau phone"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-slate-300">
                                        Password
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => setAuthMode('forgot')}
                                        className="text-[10px] text-teal-400 hover:underline font-bold"
                                    >
                                        Lupa Password?
                                    </button>
                                </div>
                                <input 
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-lg text-xs shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 cursor-pointer"
                            >
                                {loading ? 'Memproses Masuk...' : 'Masuk ke Platform'}
                            </button>
                        </form>
                    )}

                    {authMode === 'forgot' && (
                        <form onSubmit={handleForgotSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    Alamat Email
                                </label>
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                    placeholder="Masukkan email terdaftar Anda"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-lg text-xs shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 cursor-pointer"
                            >
                                {loading ? 'Mengirim Permintaan...' : 'Kirim Permintaan Reset'}
                            </button>

                            <button 
                                type="button"
                                onClick={handleBackToLogin}
                                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors mt-2"
                            >
                                Kembali ke Login
                            </button>
                        </form>
                    )}

                    {authMode === 'reset' && (
                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    Email Konfirmasi
                                </label>
                                <input 
                                    type="email"
                                    required
                                    readOnly
                                    value={email}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    Token Reset
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                    placeholder="Masukkan token dari email Anda"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    Password Baru
                                </label>
                                <input 
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                    placeholder="Minimal 8 karakter"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                    Konfirmasi Password Baru
                                </label>
                                <input 
                                    type="password"
                                    required
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                    placeholder="Ulangi password baru"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-lg text-xs shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 cursor-pointer"
                            >
                                {loading ? 'Memperbarui Sandi...' : 'Perbarui Password'}
                            </button>

                            <button 
                                type="button"
                                onClick={handleBackToLogin}
                                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors mt-2"
                            >
                                Kembali ke Login
                            </button>
                        </form>
                    )}

                    {authMode === 'login' && (
                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-400">
                                Belum punya akun?{' '}
                                <button 
                                    type="button"
                                    onClick={onNavigateToRegister}
                                    className="text-teal-400 hover:underline font-semibold cursor-pointer"
                                >
                                    Daftar di sini
                                </button>
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
