import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  ShoppingCart, 
  Package, 
  LayoutDashboard,
  Megaphone,
  LogOut,
  Menu,
  X,
  History
} from 'lucide-react';

export default function MerchantLayout({ children, user, onLogout, activeTab, setActiveTab, pendingOrders = [], onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const merchantName = user?.name || "Merchant";
  const storeName = user?.merchant?.name || "Toko Merchant";

  const newOrders = pendingOrders.filter(o => o.status === 'pending');
  const incomingOrdersCount = newOrders.length;

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Produk Digital', icon: <Package size={20} /> },
    { id: 'orders', label: 'Pesanan Aktif', icon: <ShoppingCart size={20} /> },
    { id: 'history', label: 'Riwayat Pesanan', icon: <History size={20} /> },
    { id: 'ads', label: 'Produk Iklan', icon: <Megaphone size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#071922] text-slate-100 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#071922]/80 backdrop-blur-sm z-20 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#071922] border-r border-[#174256] flex flex-col shrink-0 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#174256] shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-[#FFBF00] rounded-lg flex items-center justify-center shadow-sm shadow-[#FFBF00]/20 shrink-0">
              <span className="text-[#0F3040] font-black text-xl">{storeName.charAt(0).toUpperCase()}</span>
            </div>
            <span className="font-black text-xl tracking-tight text-white truncate" title={storeName}>{storeName}</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all border ${
                  isActive 
                    ? 'bg-[#FFBF00] text-[#0F3040] border-[#FFBF00] shadow-md shadow-[#FFBF00]/20' 
                    : 'text-slate-300 hover:bg-[#0B2330] hover:text-white border-transparent'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#174256] space-y-1.5 shrink-0">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl font-bold transition-all border border-transparent">
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full bg-[#0B2330]">
        {/* Header */}
        <header className="h-16 bg-[#071922] border-b border-[#174256] flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-400 hover:text-white transition-colors p-1" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 md:hidden truncate max-w-[150px]">
              <div className="w-6 h-6 bg-[#FFBF00] rounded-md flex items-center justify-center shrink-0">
                <span className="text-[#0F3040] font-black text-xs">{storeName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="font-bold text-sm text-white truncate">{storeName}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white hidden md:block">Selamat datang, {merchantName}</h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari..." 
                className="pl-10 pr-4 py-2 bg-[#0B2330] border-transparent text-white rounded-xl focus:bg-[#071922] focus:border-[#FFBF00] border focus:ring-1 focus:ring-[#FFBF00] transition-all text-sm w-64 outline-none placeholder-slate-500"
              />
            </div>
            
            <div 
              className="relative"
              onMouseEnter={() => setShowNotifications(true)}
              onMouseLeave={() => setShowNotifications(false)}
            >
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-400 hover:bg-[#0B2330] hover:text-[#FFBF00] rounded-full transition-colors"
              >
                <Bell size={20} />
                {incomingOrdersCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 border-2 border-[#071922] rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                    {incomingOrdersCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#071922] rounded-2xl shadow-2xl border border-[#174256] z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="p-4 border-b border-[#174256] flex justify-between items-center bg-[#0B2330]">
                    <h3 className="font-black text-white">Notifikasi Pesanan</h3>
                    {incomingOrdersCount > 0 && (
                      <span className="bg-[#FFBF00]/20 text-[#FFBF00] text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full border border-[#FFBF00]/40">
                        {incomingOrdersCount} Baru
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {newOrders.length > 0 ? (
                      <div className="divide-y divide-[#174256]">
                        {newOrders.map((order) => (
                          <div 
                            key={order.id} 
                            onClick={() => {
                              setActiveTab('orders');
                              setShowNotifications(false);
                            }}
                            className="p-4 hover:bg-[#0B2330] transition-colors cursor-pointer flex gap-3"
                          >
                            <div className="mt-0.5 p-2 bg-[#FFBF00]/20 text-[#FFBF00] rounded-full h-fit border border-[#FFBF00]/30">
                              <ShoppingCart size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white mb-0.5">
                                Pesanan Baru #{order.order_number}
                              </p>
                              <p className="text-xs text-slate-400 line-clamp-1">
                                Dari <span className="text-slate-300 font-semibold">{order.user?.name || 'Pelanggan'}</span> seharga Rp{parseFloat(order.total_amount).toLocaleString('id-ID')}
                              </p>
                              <p className="text-[10px] font-medium text-slate-500 mt-1">
                                {new Date(order.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center flex flex-col items-center">
                        <Bell size={24} className="text-slate-600 mb-2" />
                        <p className="text-sm font-semibold text-slate-500">Belum ada pesanan baru</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-[#174256] bg-[#0B2330] text-center">
                    <button 
                      onClick={() => {
                        setActiveTab('orders');
                        setShowNotifications(false);
                      }}
                      className="text-xs font-black uppercase tracking-wider text-[#FFBF00] hover:text-amber-400 transition-colors"
                    >
                      Lihat Semua Pesanan
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-px bg-[#174256] mx-1 hidden sm:block"></div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=FFBF00&color=0F3040&bold=true`}
                  alt="Profile" 
                  className="w-9 h-9 rounded-full border border-[#174256] object-cover shadow-sm"
                />
                <span className="text-sm font-bold text-white hidden sm:block">{merchantName}</span>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-[#071922] rounded-xl shadow-2xl border border-[#174256] z-50 py-1 overflow-hidden transform origin-top-right transition-all">
                  <div className="px-4 py-3 border-b border-[#174256] mb-1 bg-[#0B2330]">
                    <p className="text-sm font-black text-white">{merchantName}</p>
                    <p className="text-[10px] text-[#FFBF00] uppercase font-black tracking-widest">{user?.role || 'Merchant'}</p>
                  </div>
                  <button 
                    onClick={() => {
                        setShowProfileDropdown(false);
                        if (onNavigate) onNavigate('customer_dashboard');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-[#0B2330] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#174256] flex items-center justify-center text-slate-300 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </div>
                    Kembali ke Dashboard Customer
                  </button>
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors border-t border-[#174256] mt-1 flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Keluar Akun
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content Rendering */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth bg-[#0B2330] text-slate-100">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-xl font-black text-white sm:hidden mb-4">Selamat datang, {merchantName}</h1>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
