import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit } from 'lucide-react';
import CreateProductModal from './CreateProductModal';

export default function ProductsTab({ products, handleDeleteProduct, fetchProducts, token }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEditClick = (p) => {
    setSelectedProduct(p);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Package className="text-[#FFBF00]" />
          Kelola Produk Digital
        </h2>
        <button 
          onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#FFBF00] hover:bg-amber-400 text-[#0F3040] text-sm font-black py-2.5 px-4 rounded-xl transition-all shadow-md shadow-[#FFBF00]/20 uppercase tracking-wider"
        >
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      <div className="bg-[#071922] rounded-2xl shadow-xl border border-[#174256] overflow-hidden">
        {products && products.length > 0 ? (
          <>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
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
                        <button 
                          onClick={() => handleEditClick(p)}
                          className="p-2 text-indigo-400 hover:bg-[#174256] rounded-lg transition-colors cursor-pointer" 
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)} 
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer" 
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

            {/* Mobile Stacked Card View (< md) */}
            <div className="block md:hidden p-3.5 space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-[#0B2330] p-4 rounded-xl border border-[#174256] flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-sm text-white line-clamp-2 min-w-0 flex-1">{p.title}</h4>
                    <span className="bg-[#071922] border border-[#174256] text-[#FFBF00] px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0">Stok: {p.stock}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#174256]/60">
                    <p className="text-sm font-black text-emerald-400">Rp{parseFloat(p.price || 0).toLocaleString('id-ID')}</p>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleEditClick(p)}
                        className="p-1.5 text-indigo-400 hover:bg-[#174256] rounded-lg transition-colors cursor-pointer" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)} 
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer" 
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-slate-400 text-center">
            <Package size={40} className="text-[#174256] mb-3" />
            <p className="text-base font-bold text-white mb-1">Belum ada produk</p>
            <p className="text-xs sm:text-sm">Mulai tambahkan produk digital Anda sekarang.</p>
          </div>
        )}
      </div>

      <CreateProductModal 
        token={token}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        fetchProducts={fetchProducts}
        product={selectedProduct}
      />
    </div>
  );
}
