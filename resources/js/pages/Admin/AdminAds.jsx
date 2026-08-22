import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, MoreVertical, CheckCircle, XCircle, Ban, Eye, Tag, AlertTriangle, Plus, Edit, Trash2
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const StatusBadge = ({ status }) => {
  const map = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending:  'bg-amber-100 text-amber-700',
    rejected: 'bg-rose-100 text-rose-700',
  };
  const labels = { approved: 'Tayang', pending: 'Menunggu Review', rejected: 'Ditolak/Takedown' };
  const cls = map[status] ?? 'bg-slate-100 text-slate-600';
  return <span className={`${cls} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>{labels[status] ?? status}</span>;
};

export const AdminAds = ({ token }) => {
  const [ads, setads]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage]               = useState(1);
  const [meta, setMeta]               = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewingad, setViewingad] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({ title: '', category_id: '', description: '', price: '', location: '', status: 'approved' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (e) {}
    };
    fetchCategories();
  }, [token]);

  const openAddForm = () => {
    setEditingAd(null);
    setFormData({ title: '', category_id: categories[0]?.id || '', description: '', price: '', location: '', status: 'approved' });
    setShowAdForm(true);
  };

  const openEditForm = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      category_id: ad.category_id || ad.category?.id || '',
      description: ad.description || '',
      price: ad.price,
      location: ad.location || '',
      status: ad.status
    });
    setShowAdForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus iklan ini secara permanen?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        setads(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      alert('Gagal menghapus iklan.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const url = editingAd ? `/api/admin/ads/${editingAd.id}` : '/api/admin/ads';
    const method = editingAd ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowAdForm(false);
        load();
      } else {
        alert(data.message || 'Gagal menyimpan iklan');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setFormLoading(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (searchTerm)                     params.set('search', searchTerm);
      if (filterStatus && filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/admin/ads?${params}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        const d = data.data;
        setads(d.data ?? d);
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
      const res = await fetch(`/api/admin/ads/${id}/status`, {
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
        setads(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        setViewingad(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
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
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden animate-in fade-in duration-200">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 flex items-center gap-3">
            Kelola Iklan Baris
          </h2>
          <p className="text-sm text-slate-400 mt-1">Lakukan kurasi, moderasi, dan kelola visibilitas iklan di marketplace.</p>
        </div>
        <button onClick={openAddForm} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer shrink-0">
          <Plus className="w-4 h-4" /> Tambah Iklan Baru
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama iklan..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 placeholder-slate-500 transition-all"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-300 rounded-lg pl-9 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 appearance-none cursor-pointer transition-all"
          >
            <option value="all">Semua Status</option>
            <option value="approved">Tayang</option>
            <option value="pending">Menunggu Review</option>
            <option value="rejected">Ditolak / Takedown</option>
          </select>
        </div>
      </div>

      {/* ad Content: Desktop Table & Mobile Stacked Cards */}
      <div className="overflow-x-auto relative z-10 bg-slate-950/40 rounded-xl border border-slate-800/50">
        
        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800/60 text-slate-400 bg-slate-900/50">
                <th className="px-6 py-4 font-semibold w-12 text-center">No.</th>
                <th className="px-6 py-4 font-semibold">Info iklan</th>
                <th className="px-6 py-4 font-semibold">Harga</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan="5" className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse"></div></td></tr>
                ))
              ) : ads.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Tidak ada iklan yang ditemukan.</td></tr>
              ) : ads.map((p, idx) => {
                const rowIndex = (page - 1) * (meta?.per_page || 20) + idx + 1;
                return (
                <tr key={p.id} className={`border-b border-slate-800/30 hover:bg-amber-900/10 transition-colors duration-200 ${actionLoading === p.id ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 text-center font-bold text-slate-400">
                    {rowIndex}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 overflow-hidden">
                        <img 
                          src={p.media?.[0]?.url || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop'} 
                          alt="" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop';
                          }}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-200 max-w-xs truncate">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-amber-400 font-semibold">{p.merchant?.name ?? '-'}</span>
                          {p.category && <><span className="text-[10px] text-slate-600">•</span><span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{p.category.name}</span></>}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-200">{fmt(p.price)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Lokasi: {p.location}</p>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={p.status} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setViewingad(p)} 
                        title="Tinjau iklan" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-gold-400 text-xs font-bold rounded-lg border border-amber-500/20 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditForm(p)} 
                        title="Edit iklan" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        title="Hapus iklan" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards View (< md) */}
        <div className="block md:hidden divide-y divide-slate-800/50">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat iklan...</div>
          ) : ads.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Tidak ada iklan yang ditemukan.</div>
          ) : (
            ads.map((p) => (
              <div key={p.id} className="p-4 space-y-3 bg-slate-950/40">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 overflow-hidden">
                    <img 
                      src={p.media?.[0]?.url || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop'} 
                      alt="" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-xs text-slate-200 leading-snug line-clamp-2">{p.title}</h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[11px] text-amber-400 font-bold">{p.merchant?.name ?? '-'}</span>
                      {p.category && (
                        <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {p.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/50 text-xs">
                  <div>
                    <span className="font-black text-sm text-slate-200">{fmt(p.price)}</span>
                    <span className="text-[10px] text-slate-400 block">Lokasi: {p.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <button 
                      onClick={() => setViewingad(p)} 
                      title="Tinjau iklan" 
                      className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-gold-400 rounded-lg border border-amber-500/20 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openEditForm(p)} 
                      title="Edit iklan" 
                      className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-500/20 transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      title="Hapus iklan" 
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>Total: {meta.total} iklan</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-40 cursor-pointer">Sebelumnya</button>
              <span className="px-3 py-1.5 font-bold text-slate-200">{page} / {meta.last_page}</span>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page >= meta.last_page} className="px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-40 cursor-pointer">Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      </div>

      {/* Detail & Review Modal */}
      {viewingad && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Tinjau Detail iklan</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Lakukan pemeriksaan konten iklan secara menyeluruh sebelum mengambil tindakan.</p>
              </div>
              <button 
                onClick={() => setViewingad(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* ad Info Card */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-32 h-32 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  <img 
                    src={viewingad.media?.[0]?.url || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop'} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="space-y-2 text-left">
                  <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">{viewingad.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-amber-600 dark:text-gold-400">{viewingad.merchant?.name ?? '-'}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    {viewingad.category && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-medium">
                        {viewingad.category.name}
                      </span>
                    )}
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <StatusBadge status={viewingad.status} />
                  </div>
                  <div className="pt-1">
                    <span className="font-black text-lg text-slate-900 dark:text-gold-400">{fmt(viewingad.price)}</span>
                    <span className="text-xs text-slate-400 ml-2">(Lokasi: {viewingad.location})</span>
                  </div>
                </div>
              </div>

              {/* Warnings / Flags */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3 text-left">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <p className="font-extrabold mb-0.5">Panduan Moderasi Konten ADMS</p>
                  <p>Pastikan iklan tidak mengandung konten ilegal seperti perjudian online, pornografi, penipuan, riba non-syariah, atau hak cipta bajakan. Jika melanggar, silakan gunakan tombol **Takedown**.</p>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4 pt-2 text-left">
                <div>
                  <h5 className="font-black text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Deskripsi Lengkap</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg leading-relaxed whitespace-pre-line">
                    {viewingad.description || 'Tidak ada deskripsi lengkap.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end items-center gap-2.5">
              
              {/* Ban / Takedown Action */}
              {viewingad.status !== 'rejected' ? (
                <button 
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin melakukan takedown pada iklan/iklan ini karena melanggar ketentuan (seperti judi online)?')) {
                      changeStatus(viewingad.id, 'rejected');
                    }
                  }}
                  disabled={!!actionLoading}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Takedown (Melanggar / Judi Online)
                </button>
              ) : (
                <button 
                  onClick={() => changeStatus(viewingad.id, 'approved')}
                  disabled={!!actionLoading}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Pulihkan / Aktifkan Kembali
                </button>
              )}

              {/* Approve / Activate Action if pending */}
              {viewingad.status === 'pending' && (
                <button 
                  onClick={() => {
                    changeStatus(viewingad.id, 'approved');
                  }}
                  disabled={!!actionLoading}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Setujui & Aktifkan
                </button>
              )}

              <button 
                onClick={() => setViewingad(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-black bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Form Modal (Tambah / Edit) */}
      {showAdForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {editingAd ? 'Edit Iklan' : 'Tambah Iklan Baru'}
              </h3>
              <button onClick={() => setShowAdForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-lg">&times;</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Iklan</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Harga (Rp)</label>
                    <input type="number" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi</label>
                    <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white">
                    <option value="approved">Tayang</option>
                    <option value="pending">Menunggu Review</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Lengkap</label>
                  <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"></textarea>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAdForm(false)} className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors hover:bg-slate-300 dark:hover:bg-slate-600">Batal</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
