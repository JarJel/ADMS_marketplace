import React, { useState } from 'react';
import { X, Search, CheckCircle2, Megaphone, Globe, TrendingUp, Zap, Share2, ShieldCheck, Home, ArrowRight } from 'lucide-react';
import { ADMS_CATALOG } from './admsKnowledge';

const ICON_MAP = {
  Megaphone: Megaphone,
  Globe: Globe,
  TrendingUp: TrendingUp,
  Zap: Zap,
  Share2: Share2,
  ShieldCheck: ShieldCheck,
  Home: Home
};

const CATEGORY_THEME_MAP = {
  'digital-ads': { themeClass: 'theme-ads', labelBadge: 'Digital Ads', color: '#f59e0b' },
  'website-dev': { themeClass: 'theme-web', labelBadge: 'Google Cloud Web', color: '#eab308' },
  'automation': { themeClass: 'theme-auto', labelBadge: 'WhatsApp & SMS', color: '#f59e0b' },
  'marketing-dist': { themeClass: 'theme-dist', labelBadge: 'Marketing & SEO', color: '#d97706' },
  'sosmed': { themeClass: 'theme-sosmed', labelBadge: 'Social Media', color: '#f59e0b' },
  'legalitas': { themeClass: 'theme-legal', labelBadge: 'Legalitas Usaha', color: '#d97706' },
  'offline-const': { themeClass: 'theme-offline', labelBadge: 'Layanan Offline', color: '#f59e0b' }
};

export default function CatalogModal({ isOpen, onClose, onSelectService }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  if (!isOpen) return null;

  const filteredCategories = ADMS_CATALOG.map(cat => {
    const matchingItems = cat.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...cat, items: matchingItems };
  }).filter(cat => activeCategory === 'all' || cat.id === activeCategory);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content catalog-modal" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="title-with-badge">
            <div className="catalog-icon-badge">
              <img src="/assets/Images/adms-symbol.png" alt="ADMS Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h3>Katalog Layanan & Harga Resmi ADMS</h3>
              <p className="modal-subtitle">Daftar lengkap 7 kategori layanan digital, website, legalitas & konstruksi ADMS</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Controls: Search & Category Chips */}
        <div className="modal-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder="Cari layanan (Google Ads, Landing Page, NIB, WA Blast, PT, SEO...)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-chips">
            <button 
              className={`chip chip-all ${activeCategory === 'all' ? 'active' : ''}`} 
              onClick={() => setActiveCategory('all')}
            >
              Semua Paket ({ADMS_CATALOG.reduce((acc, c) => acc + c.items.length, 0)})
            </button>
            {ADMS_CATALOG.map(cat => {
              const theme = CATEGORY_THEME_MAP[cat.id] || { themeClass: 'theme-web' };
              return (
                <button 
                  key={cat.id} 
                  className={`chip ${theme.themeClass} ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.category.split('.')[1] || cat.category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="modal-body catalog-scroll">
          {filteredCategories.map(cat => {
            const IconComp = ICON_MAP[cat.icon] || Globe;
            const theme = CATEGORY_THEME_MAP[cat.id] || { themeClass: 'theme-web', labelBadge: 'Layanan' };
            if (cat.items.length === 0) return null;

            return (
              <div key={cat.id} className={`catalog-section ${theme.themeClass}`}>
                <div className="section-header-banner">
                  <div className="title-left">
                    <div className="cat-icon-wrapper">
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h4>{cat.category}</h4>
                      <p className="cat-desc">{cat.description}</p>
                    </div>
                  </div>
                  <span className="cat-badge-pill">{theme.labelBadge}</span>
                </div>

                <div className="catalog-grid">
                  {cat.items.map((item, idx) => (
                    <div key={idx} className="catalog-card">
                      <div className="card-top">
                        <h5>{item.name}</h5>
                        <div className="price-badge-pill">
                          <span>{item.formattedPrice}</span>
                        </div>
                      </div>
                      <p className="card-desc">{item.desc}</p>
                      <button 
                        className="btn-select-service"
                        onClick={() => {
                          onSelectService(item.name, cat.category);
                          onClose();
                        }}
                      >
                        <span>Pilih & Konfirmasi Pesanan</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-notice">
            <CheckCircle2 size={16} className="text-amber-400" />
            <span>Server Google Cloud Platform & Garansi Maintenance Resmi PT. ADMS</span>
          </div>
          <button className="btn-primary" onClick={onClose}>Tutup Katalog</button>
        </div>

      </div>
    </div>
  );
}
