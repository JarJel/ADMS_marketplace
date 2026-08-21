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
            placeholder="Cari nama produk..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="pending">Menunggu Review</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="banned">Di-Takedown</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {p.thumbnail
                          ? <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                          : <Tag className="w-5 h-5 text-slate-400" />
                        }
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white max-w-xs truncate">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{p.merchant?.name ?? '-'}</span>
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
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => changeStatus(p.id, 'active')} title="Setujui" disabled={!!actionLoading} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => changeStatus(p.id, 'banned')} title="Tolak" disabled={!!actionLoading} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {p.status === 'active' && (
                        <button onClick={() => changeStatus(p.id, 'banned')} title="Takedown" disabled={!!actionLoading} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {(p.status === 'banned' || p.status === 'inactive') && (
                        <button onClick={() => changeStatus(p.id, 'active')} title="Aktifkan" disabled={!!actionLoading} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Total: {meta.total} produk</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 border rounded-lg hover:bg-slate-50 disabled:opacity-40">Sebelumnya</button>
              <span className="px-3 py-1.5 font-bold text-slate-700">{page} / {meta.last_page}</span>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page >= meta.last_page} className="px-3 py-1.5 border rounded-lg hover:bg-slate-50 disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
