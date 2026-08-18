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

export default function MerchantLayout({ children, user, onLogout, activeTab, setActiveTab, pendingOrders = [] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const merchantName = user?.name || "Merchant";

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
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">MajuJaya</span>
          </div>
          <button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors border ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1.5 shrink-0">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors border border-transparent">
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 hidden sm:block">Selamat datang, {merchantName} 👋</h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm w-64 outline-none"
              />
            </div>
            
            <div 
              className="relative"
              onMouseEnter={() => setShowNotifications(true)}
              onMouseLeave={() => setShowNotifications(false)}
            >
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell size={20} />
                {incomingOrdersCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                    {incomingOrdersCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Notifikasi Pesanan</h3>
                    {incomingOrdersCount > 0 && (
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {incomingOrdersCount} Baru
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {newOrders.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {newOrders.map((order) => (
                          <div 
                            key={order.id} 
                            onClick={() => {
                              setActiveTab('orders');
                              setShowNotifications(false);
                            }}
                            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3"
                          >
                            <div className="mt-0.5 p-2 bg-indigo-50 text-indigo-600 rounded-full h-fit">
                              <ShoppingCart size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 mb-0.5">
                                Pesanan Baru #{order.order_number}
                              </p>
                              <p className="text-xs text-slate-500 line-clamp-1">
                                Dari {order.user?.name || 'Pelanggan'} seharga Rp{parseFloat(order.total_amount).toLocaleString('id-ID')}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 mt-1">
                                {new Date(order.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-500 flex flex-col items-center">
                        <Bell size={24} className="text-slate-300 mb-2" />
                        <p className="text-sm font-medium">Belum ada pesanan baru</p>
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                    <button 
                      onClick={() => {
                        setActiveTab('orders');
                        setShowNotifications(false);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Lihat Semua Pesanan
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(merchantName)}&background=4F46E5&color=fff`}
                alt="Profile" 
                className="w-9 h-9 rounded-full border border-slate-200 object-cover shadow-sm"
              />
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{merchantName}</span>
            </button>
          </div>
        </header>

        {/* Tab Content Rendering */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-xl font-bold text-slate-800 sm:hidden mb-4">Selamat datang, {merchantName} 👋</h1>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
