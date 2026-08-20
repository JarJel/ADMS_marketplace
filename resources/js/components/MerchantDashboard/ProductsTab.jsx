import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit } from 'lucide-react';
import CreateProductModal from './CreateProductModal';

export default function ProductsTab({ products, handleDeleteProduct, fetchProducts, token }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Package className="text-[#FFBF00]" />
          Kelola Produk Digital
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#FFBF00] hover:bg-amber-400 text-[#0F3040] text-sm font-black py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#FFBF00]/20 uppercase tracking-wider"
        >
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      <div className="bg-[#071922] rounded-2xl shadow-xl border border-[#174256] overflow-hidden">
        {products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0B2330] border-b border-[#174256] text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Produk</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Harga</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Stok</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#174256]">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#0B2330]/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{p.title}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">Rp{parseFloat(p.price || 0).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 font-medium text-slate-300">
                      <span className="bg-[#0B2330] border border-[#174256] text-[#FFBF00] px-3 py-1 rounded-full text-xs font-black">{p.stock}</span>
                    </td>
                    <td className="px-6 py-4 flex gap-2 justify-end">
                      <button className="p-2 text-indigo-400 hover:bg-[#174256] rounded-lg transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)} 
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" 
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Package size={48} className="text-[#174256] mb-4" />
            <p className="text-base font-bold text-white mb-1">Belum ada produk</p>
            <p className="text-sm">Mulai tambahkan produk digital Anda sekarang.</p>
          </div>
        )}
      </div>

      <CreateProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={token}
        fetchProducts={fetchProducts}
      />
    </div>
  );
}
