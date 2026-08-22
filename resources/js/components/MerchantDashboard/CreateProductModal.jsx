import React, { useState, useEffect } from 'react';
import { Package, Upload, X, ArrowLeft } from 'lucide-react';
import Toast from '../Toast';

export default function CreateProductModal({ token, isOpen, onClose, fetchProducts, product }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    price: '',
    price_type: 'starting_from',
    short_description: '',
    full_description: '',
    stock: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        category_id: product.category_id || '',
        price: product.price ? Math.floor(product.price) : '',
        price_type: product.price_type || 'starting_from',
        short_description: product.short_description || '',
        full_description: product.full_description || '',
        stock: product.stock || '',
      });
      setPreviewUrl(product.thumbnail || null);
    } else if (!product && isOpen) {
      setFormData({
        title: '',
        slug: '',
        category_id: '',
        price: '',
        price_type: 'starting_from',
        short_description: '',
        full_description: '',
        stock: '',
      });
      setPreviewUrl(null);
    }
    setThumbnail(null);
    setMsg(null);
  }, [product, isOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/public/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from title if title is changed
      if (name === 'title') {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (thumbnail) {
      data.append('thumbnail', thumbnail);
    }
    
    if (product) {
      data.append('_method', 'PUT');
    }

    try {
      const url = product ? `/api/merchant/products/${product.id}` : '/api/merchant/products';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setMsg({ type: 'success', text: product ? 'Produk berhasil diubah!' : 'Produk digital berhasil ditambahkan dan sudah live!' });
        setTimeout(() => {
          fetchProducts();
          onClose();
        }, 2000);
      } else {
        setMsg({ type: 'error', text: result.message || 'Gagal menambahkan produk.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="text-indigo-600" />
              {product ? 'Edit Produk Digital' : 'Tambah Produk Baru'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {product ? 'Perbarui informasi produk Anda' : 'Lengkapi informasi produk digital yang ingin Anda jual'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          <Toast 
              message={msg?.text} 
              type={msg?.type} 
              onClose={() => setMsg(null)} 
          />

          <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Produk *</label>
              <input 
                type="text" name="title" required value={formData.title} onChange={handleChange}
                placeholder="Contoh: Template Presentasi Pro"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug URL *</label>
              <input 
                type="text" name="slug" required value={formData.slug} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori *</label>
              <select 
                name="category_id" required value={formData.category_id} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Thumbnail Produk *</label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 relative group min-h-[160px]">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="h-32 object-cover rounded-lg" />
                    <button type="button" onClick={() => { setThumbnail(null); setPreviewUrl(null); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="text-slate-400 mb-2" size={32} />
                    <span className="text-xs text-slate-500 text-center">Format JPG, PNG (Max 2MB)</span>
                    <label className="mt-3 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                      Pilih Gambar
                      <input type="file" name="thumbnail" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handleFileChange} required={!product} />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Harga (Rp) *</label>
            <input 
              type="number" name="price" required min="0" value={formData.price} onChange={handleChange}
              placeholder="0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipe Harga *</label>
            <select 
              name="price_type" required value={formData.price_type} onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="starting_from">Mulai dari (Starting From)</option>
              <option value="contact_us">Hubungi Kami (Contact Us)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Sisa Lisensi/Stok *</label>
            <input 
              type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange}
              placeholder="Contoh: 100"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi Singkat *</label>
            <input 
              type="text" name="short_description" required maxLength="255" value={formData.short_description} onChange={handleChange}
              placeholder="Penjelasan singkat mengenai produk ini (max 255 karakter)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi Lengkap *</label>
            <textarea 
              name="full_description" required rows="5" value={formData.full_description} onChange={handleChange}
              placeholder="Jelaskan fitur, cara mendapatkan akses/lisensi, dan ketentuan produk secara detail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            ></textarea>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white py-4 border-t border-slate-100 mt-8">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                product ? 'Simpan Perubahan' : 'Terbitkan Produk'
              )}
          </button>
        </div>

      </form>
      </div>
    </div>
    </div>
  );
}
