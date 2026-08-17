import React from 'react';
import { Upload, Check } from 'lucide-react';

export default function SettingsTab({
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    profileEmail,
    setProfileEmail,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    saveSuccess,
    handleProfileSave
}) {
    return (
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 text-left">
            <div>
                <h3 className="font-extrabold text-sm text-slate-800">Pengaturan Profil</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Perbarui informasi pribadi dan keamanan kata sandi Anda.</p>
            </div>

            {saveSuccess && (
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600" />
                    Profil Anda berhasil diperbarui dan disimpan!
                </div>
            )}

            {/* Profile Photo Upload UI */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" 
                    alt="Profile Preview" 
                    className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm"
                />
                <div className="space-y-1 text-center sm:text-left">
                    <button type="button" className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4 text-slate-500" />
                        Unggah Foto Baru
                    </button>
                    <span className="block text-[10px] text-slate-400">JPG, PNG, atau WEBP. Maks 2MB.</span>
                </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-extrabold text-xs text-slate-800 pb-2 border-b border-slate-100">Detail Personal</h4>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                        <input 
                            type="text" 
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Nomor Telepon</label>
                        <input 
                            type="text" 
                            required
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Alamat Email</label>
                        <input 
                            type="email" 
                            required
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-extrabold text-xs text-slate-800 pb-2 border-b border-slate-100">Ganti Kata Sandi</h4>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Kata Sandi Lama</label>
                        <input 
                            type="password" 
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Kata Sandi Baru</label>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            placeholder="Minimal 8 karakter"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Konfirmasi Kata Sandi Baru</label>
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            placeholder="Ulangi sandi baru"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                    <Check className="w-4 h-4" />
                    Simpan Perubahan
                </button>
            </div>
        </form>
    );
}
