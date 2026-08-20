import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit } from 'lucide-react';
import CreateProductModal from './CreateProductModal';

export default function ProductsTab({ products, handleDeleteProduct, fetchProducts, token }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Package className="text-indigo-600" />
          Kelola Produk Digital
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Produk</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Harga</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Stok</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.title}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">Rp{parseFloat(p.price || 0).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">{p.stock}</span>
                    </td>
                    <td className="px-6 py-4 flex gap-2 justify-end">
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
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
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Package size={48} className="text-slate-300 mb-4" />
            <p className="text-base font-medium">Belum ada produk</p>
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
