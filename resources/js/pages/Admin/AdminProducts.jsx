import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Ban, 
  Star, 
  Eye, 
  Tag, 
  AlertTriangle 
} from 'lucide-react';

export const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Dummy Data for Products
  const [products, setProducts] = useState([
    {
      id: 1,
      title: 'UI Kit Dashboard Admin Pro',
      merchant: 'Creative Studio',
      category: 'Desain Grafis',
      price: 250000,
      sales: 124,
      status: 'Active',
      isFeatured: true,
      reports: 0
    },
    {
      id: 2,
      title: 'E-Book Mahir React JS',
      merchant: 'Code Academy',
      category: 'E-Book & Kursus',
      price: 99000,
      sales: 0,
      status: 'Pending',
      isFeatured: false,
      reports: 0
    },
    {
      id: 3,
      title: 'Script POS Kasir PHP',
      merchant: 'DevMaster',
      category: 'Software LIS',
      price: 450000,
      sales: 45,
      status: 'Banned',
      isFeatured: false,
      reports: 12
    },
    {
      id: 4,
      title: 'Template Landing Page SaaS',
      merchant: 'WebFlow Themes',
      category: 'Template Website',
      price: 150000,
      sales: 89,
      status: 'Active',
      isFeatured: false,
      reports: 1
    },
    {
      id: 5,
      title: 'Plugin SEO Booster PRO',
      merchant: 'WP Experts',
      category: 'Plugin & Script',
      price: 300000,
      sales: 210,
      status: 'Active',
      isFeatured: true,
      reports: 0
    }
  ]);

  const toggleFeatured = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
  };

  const changeStatus = (id, newStatus) => {
    setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Aktif</span>;
      case 'Pending': return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Menunggu Review</span>;
      case 'Banned': return <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Di-Takedown</span>;
      default: return null;
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kelola Produk Digital</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lakukan kurasi, moderasi, dan kelola visibilitas produk di marketplace.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama produk atau merchant..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="All">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Pending">Menunggu Review</option>
              <option value="Banned">Di-Takedown</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-bold">Info Produk</th>
                <th className="px-6 py-4 font-bold">Harga & Sales</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Promosi</th>
                <th className="px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                    Tidak ada produk yang ditemukan.
                  </td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  
                  {/* Info Produk */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        <Tag className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{product.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{product.merchant}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{product.category}</span>
                        </div>
                        {product.reports > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-rose-500">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{product.reports} Laporan Pengguna!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Harga & Sales */}
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Rp {product.price.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{product.sales} Terjual</p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {getStatusBadge(product.status)}
                  </td>

                  {/* Promosi (Featured) */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleFeatured(product.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-colors border ${
                        product.isFeatured 
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30 hover:bg-amber-100' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${product.isFeatured ? 'fill-amber-500' : ''}`} />
                      {product.isFeatured ? 'Pilihan' : 'Jadikan Pilihan'}
                    </button>
                  </td>

                  {/* Aksi (Dropdown/Buttons) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button title="Lihat Detail Produk" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {product.status === 'Pending' && (
                        <>
                          <button onClick={() => changeStatus(product.id, 'Active')} title="Setujui (Approve)" className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => changeStatus(product.id, 'Banned')} title="Tolak (Reject)" className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {product.status === 'Active' && (
                        <button onClick={() => changeStatus(product.id, 'Banned')} title="Takedown / Suspend" className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {product.status === 'Banned' && (
                        <button onClick={() => changeStatus(product.id, 'Active')} title="Pulihkan (Unban)" className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Dropdown Options Placeholder */}
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
