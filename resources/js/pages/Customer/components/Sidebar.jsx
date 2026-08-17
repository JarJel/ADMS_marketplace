import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';

export default function Sidebar({ 
    activeTab, 
    setActiveTab, 
    onLogout, 
    profileName, 
    setSaveSuccess, 
    menuItems 
}) {
    return (
        <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
                <div className="relative w-20 h-20 mx-auto mb-4">
                    <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" 
                        alt="Profile Avatar" 
                        className="w-full h-full rounded-full object-cover border border-slate-100 shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 bg-teal-600 text-white p-1 rounded-full border-2 border-white shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">{profileName}</h3>
                <span className="inline-block bg-indigo-50 text-[10px] font-bold text-indigo-700 px-3 py-1 rounded-full mt-1.5 uppercase tracking-wider">
                    Customer
                </span>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.id);
                            setSaveSuccess(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === item.id 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </button>
                ))}

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all mt-4 border-t border-slate-100 pt-4 cursor-pointer"
                >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Keluar Akun</span>
                </button>
            </div>
        </div>
    );
}
