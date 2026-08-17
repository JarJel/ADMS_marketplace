import React, { useState } from 'react';
import { X, Search, CheckCircle2, Megaphone, Globe, TrendingUp, Zap, Share2, ShieldCheck, Home, ArrowRight, Sparkles } from 'lucide-react';
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
  'digital-ads': { themeClass: 'theme-ads', labelBadge: 'Digital Marketing', color: '#0ea5e9' },
  'website-dev': { themeClass: 'theme-web', labelBadge: 'Google Cloud Web', color: '#10b981' },
  'legalitas': { themeClass: 'theme-legal', labelBadge: 'Legalitas Bisnis', color: '#f59e0b' },
  'sosmed': { themeClass: 'theme-sosmed', labelBadge: 'Social Media', color: '#a855f7' },
  'automation': { themeClass: 'theme-auto', labelBadge: 'WA & Bot API', color: '#06b6d4' },
  'offline': { themeClass: 'theme-offline', labelBadge: 'Branding Offline', color: '#f43f5e' },
  'gcp-server': { themeClass: 'theme-gcp', labelBadge: 'Cloud Infrastructure', color: '#6366f1' }
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
              <Sparkles size={22} className="text-emerald" />
            </div>
            <div>
              <h3>Katalog Layanan & Harga Resmi ADMS</h3>
              <p className="modal-subtitle">Pilih paket digital marketing, website, & legalitas usaha sesuai budget bisnis Anda</p>
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
              placeholder="Cari layanan (Google Ads, Landing Page, NIB, WA Blast, PT...)"
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
            const theme = CATEGORY_THEME_MAP[cat.id] || { themeClass: 'theme-web', labelBadge: 'Service' };
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
                        <span>Pilih & Konsultasi Paket</span>
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
            <CheckCircle2 size={16} className="text-emerald" />
            <span>Garansi Google Cloud Platform Server, SSL & Maintenance Rutin Terjamin 100%!</span>
          </div>
          <button className="btn-primary glow" onClick={onClose}>Tutup Katalog</button>
        </div>

      </div>
    </div>
  );
}
