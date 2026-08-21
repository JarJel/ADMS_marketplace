import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, MoreVertical, CheckCircle, XCircle, Ban, Eye, Tag, AlertTriangle
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const StatusBadge = ({ status }) => {
  const map = {
    active:   'bg-emerald-100 text-emerald-700',
    pending:  'bg-amber-100 text-amber-700',
    inactive: 'bg-slate-100 text-slate-600',
    banned:   'bg-rose-100 text-rose-700',
  };
  const labels = { active: 'Aktif', pending: 'Menunggu Review', inactive: 'Tidak Aktif', banned: 'Di-Takedown' };
  const cls = map[status] ?? 'bg-slate-100 text-slate-600';
  return <span className={`${cls} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>{labels[status] ?? status}</span>;
};

export const AdminProducts = ({ token }) => {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage]               = useState(1);
  const [meta, setMeta]               = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (searchTerm)                     params.set('search', searchTerm);
      if (filterStatus && filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/admin/products?${params}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        const d = data.data;
        setProducts(d.data ?? d);
        if (d.last_page) setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, per_page: d.per_page || 20 });
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, filterStatus, page]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, newStatus) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        setViewingProduct(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
      } else {
        alert(data.message || 'Gagal mengubah status.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Kelola Produk Digital</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Lakukan kurasi, moderasi, dan kelola visibilitas produk di marketplace.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama produk..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-9 sm:pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="pending">Menunggu Review</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="banned">Di-Takedown</option>
          </select>
        </div>
      </div>

      {/* Product Content: Desktop Table & Mobile Stacked Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        
        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-bold w-12 text-center">No.</th>
                <th className="px-6 py-4 font-bold">Info Produk</th>
                <th className="px-6 py-4 font-bold">Harga</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan="5" className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse"></div></td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Tidak ada produk yang ditemukan.</td></tr>
              ) : products.map((p, idx) => {
                const rowIndex = (page - 1) * (meta?.per_page || 20) + idx + 1;
                return (
                <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${actionLoading === p.id ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 text-center font-bold text-slate-400">
                    {rowIndex}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <img 
                          src={p.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop'} 
                          alt="" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop';
                          }}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white max-w-xs truncate">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-amber-600 dark:text-gold-400 font-semibold">{p.merchant?.name ?? '-'}</span>
                          {p.category && <><span className="text-[10px] text-slate-400">•</span><span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{p.category.name}</span></>}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{fmt(p.price)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Stok: {p.stock}</p>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={p.status} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setViewingProduct(p)} 
                        title="Tinjau Produk" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-gold-400 text-xs font-bold rounded-lg border border-amber-500/20 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Tinjau</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards View (< md) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat produk...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Tidak ada produk yang ditemukan.</div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="p-4 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <img 
                      src={p.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop'} 
                      alt="" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug line-clamp-2">{p.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[11px] text-amber-600 dark:text-gold-400 font-bold">{p.merchant?.name ?? '-'}</span>
                      {p.category && (
                        <span className="text-[9px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {p.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="font-black text-sm text-slate-900 dark:text-gold-400">{fmt(p.price)}</span>
                    <span className="text-[10px] text-slate-400 block">Stok: {p.stock}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <button 
                      onClick={() => setViewingProduct(p)} 
                      title="Tinjau Produk" 
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-gold-400 text-[11px] font-bold rounded-lg border border-amber-500/20 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tinjau</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>Total: {meta.total} produk</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer">Sebelumnya</button>
              <span className="px-3 py-1.5 font-bold text-slate-700 dark:text-slate-200">{page} / {meta.last_page}</span>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page >= meta.last_page} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer">Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail & Review Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Tinjau Detail Produk</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Lakukan pemeriksaan konten produk secara menyeluruh sebelum mengambil tindakan.</p>
              </div>
              <button 
                onClick={() => setViewingProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Product Info Card */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-32 h-32 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  <img 
                    src={viewingProduct.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop'} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="space-y-2 text-left">
                  <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">{viewingProduct.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-amber-600 dark:text-gold-400">{viewingProduct.merchant?.name ?? '-'}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    {viewingProduct.category && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-medium">
                        {viewingProduct.category.name}
                      </span>
                    )}
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <StatusBadge status={viewingProduct.status} />
                  </div>
                  <div className="pt-1">
                    <span className="font-black text-lg text-slate-900 dark:text-gold-400">{fmt(viewingProduct.price)}</span>
                    <span className="text-xs text-slate-400 ml-2">(Stok: {viewingProduct.stock})</span>
                  </div>
                </div>
              </div>

              {/* Warnings / Flags */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3 text-left">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <p className="font-extrabold mb-0.5">Panduan Moderasi Konten ADMS</p>
                  <p>Pastikan produk tidak mengandung konten ilegal seperti perjudian online, pornografi, penipuan, riba non-syariah, atau hak cipta bajakan. Jika melanggar, silakan gunakan tombol **Takedown**.</p>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4 pt-2 text-left">
                <div>
                  <h5 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Deskripsi Singkat</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg leading-relaxed">
                    {viewingProduct.short_description || 'Tidak ada deskripsi singkat.'}
                  </p>
                </div>
                <div>
                  <h5 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Deskripsi Lengkap</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg leading-relaxed whitespace-pre-line">
                    {viewingProduct.full_description || 'Tidak ada deskripsi lengkap.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end items-center gap-2.5">
              
              {/* Ban / Takedown Action */}
              {viewingProduct.status !== 'banned' ? (
                <button 
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin melakukan takedown pada produk/iklan ini karena melanggar ketentuan (seperti judi online)?')) {
                      changeStatus(viewingProduct.id, 'banned');
                    }
                  }}
                  disabled={!!actionLoading}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Takedown (Melanggar / Judi Online)
                </button>
              ) : (
                <button 
                  onClick={() => changeStatus(viewingProduct.id, 'active')}
                  disabled={!!actionLoading}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Pulihkan / Aktifkan Kembali
                </button>
              )}

              {/* Approve / Activate Action if pending */}
              {viewingProduct.status === 'pending' && (
                <button 
                  onClick={() => {
                    changeStatus(viewingProduct.id, 'active');
                  }}
                  disabled={!!actionLoading}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Setujui & Aktifkan
                </button>
              )}

              <button 
                onClick={() => setViewingProduct(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-black bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
