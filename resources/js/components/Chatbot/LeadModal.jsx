import React, { useState } from 'react';
import { X, User, Building, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LeadModal({ isOpen, onClose, onSubmitLead, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [businessName, setBusinessName] = useState(initialData?.businessName || '');
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !whatsapp) return;
    onSubmitLead({ name, businessName, whatsapp });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content lead-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#061224] border border-amber-400/50 p-1 flex items-center justify-center shadow-md">
              <img src="/assets/Images/adms-symbol.png" alt="ADMS Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3>Form Data Konsultasi ADMS</h3>
              <p className="modal-subtitle">Dapatkan penawaran khusus & konsultasi langsung dengan Sales Admin ADMS</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-group">
            <label><User size={16} className="text-amber-400" /> Nama Lengkap / Panggilan *</label>
            <input 
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label><Building size={16} className="text-amber-400" /> Nama Usaha / Bisnis (Opsional)</label>
            <input 
              type="text"
              placeholder="Contoh: Kedai Kopi Berkah / PT Mandiri Jaya"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label><Phone size={16} className="text-amber-400" /> Nomor WhatsApp Aktif *</label>
            <input 
              type="tel"
              required
              placeholder="Contoh: 081234567890"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
            />
          </div>

          <div className="privacy-note">
            <ShieldCheck size={16} className="text-amber-400 shrink-0" />
            <span>Data Anda terjamin aman 100% dan hanya digunakan untuk konsultasi resmi tim ADMS.</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-primary">
              Hubungkan ke WA 1 Admin <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
