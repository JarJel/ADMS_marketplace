import React, { useState } from 'react';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 relative overflow-hidden font-sans">
            {/* Visual lights decoration */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[150px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px]"></div>

            <div className="max-w-md w-full z-10">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/50">
                    
                    {/* Brand Logo & Name */}
                    <div className="text-center mb-6">
                        <img 
                            src="/assets/Images/adms-logo.png" 
                            alt="ADMS Logo" 
                            className="h-14 mx-auto mb-3 hover:scale-105 transition-transform duration-300"
                        />
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                            Daftar Akun Baru
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Gabung ADMS (Armada Digital Marketing Syariah)
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-5 p-4 rounded-lg bg-red-950/50 border border-red-800/40 text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 p-4 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            Registrasi Sukses! Mengalihkan ke halaman masuk...
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4 text-left">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Nama Lengkap
                            </label>
                            <input 
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                placeholder="Masukkan nama lengkap Anda"
                            />
                        </div>

                        {/* Email */}
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
                                placeholder="nama@email.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Nomor HP / WA
                            </label>
                            <input 
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                placeholder="Contoh: 08123456789"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Password
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

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Konfirmasi Password
                            </label>
                            <input 
                                type="password"
                                required
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                placeholder="Ulangi password Anda"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-lg text-xs shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 cursor-pointer"
                        >
                            {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            Sudah punya akun?{' '}
                            <button 
                                onClick={onNavigateToLogin}
                                className="text-teal-400 hover:underline font-semibold cursor-pointer"
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
