import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Building, Phone, ArrowRight, ShieldCheck, 
  Upload, Image as ImageIcon, CheckCircle, Trash2, 
  ShoppingBag, CreditCard, FileText, AlertCircle
} from 'lucide-react';
import { ADMS_CATALOG, ADMS_INFO } from './admsKnowledge';

export default function OrderConfirmationModal({ 
  isOpen, 
  onClose, 
  onSubmitOrder, 
  initialData, 
  selectedService 
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [businessName, setBusinessName] = useState(initialData?.businessName || '');
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '');
  const [service, setService] = useState(selectedService || 'Landing Page Conversion');
  const [notes, setNotes] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('dp'); // 'dp', 'full', 'consultation'
  
  const fileInputRef = useRef(null);

  // Flatten all services for dropdown
  const allServices = ADMS_CATALOG.flatMap(cat => 
    cat.items.map(item => ({
      category: cat.category,
      name: item.name,
      price: item.price,
      formattedPrice: item.formattedPrice
    }))
  );

  useEffect(() => {
    if (selectedService) {
      setService(selectedService);
    }
  }, [selectedService]);

  useEffect(() => {
    if (initialData?.name) setName(initialData.name);
    if (initialData?.businessName) setBusinessName(initialData.businessName);
    if (initialData?.whatsapp) setWhatsapp(initialData.whatsapp);
  }, [initialData]);

  if (!isOpen) return null;

  const currentServiceObj = allServices.find(s => s.name === service) || allServices[0];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProof(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentProofPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPaymentProofPreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setPaymentProof(null);
    setPaymentProofPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const orderId = `ADMS-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderData = {
      orderId,
      name,
      businessName,
      whatsapp,
      serviceName: currentServiceObj?.name || service,
      servicePrice: currentServiceObj?.formattedPrice || 'Sesuai Kesepakatan',
      notes,
      paymentStatus,
      hasPaymentProof: !!paymentProof,
      paymentProofFileName: paymentProof?.name || null,
      paymentProofPreview: paymentProofPreview || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSubmitOrder(orderData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content lead-modal !max-w-[560px]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header bg-[#0A1B33] border-b border-[#132C52] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#061224] border border-amber-400/50 p-1 flex items-center justify-center shadow-md">
              <img src="/assets/Images/adms-symbol.png" alt="ADMS Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base">Form Konfirmasi Pesanan & Layanan ADMS</h3>
              <p className="modal-subtitle text-[11px] text-slate-400">Lengkapi data pesanan untuk langsung diproses Tim Sales Admin ADMS</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-3.5 bg-[#071326] max-h-[78vh] overflow-y-auto custom-scrollbar">
          
          {/* Pilihan Layanan / Paket */}
          <div className="form-group">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-amber-400" /> Pilih Layanan / Paket *
            </label>
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              className="w-full bg-[#0A1B33] border border-[#1E3E62] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-all"
            >
              {allServices.map((s, idx) => (
                <option key={idx} value={s.name} className="bg-[#0A1B33] text-white">
                  {s.name} — {s.formattedPrice}
                </option>
              ))}
            </select>
          </div>

          {/* Data Pemesan */}
          <div className="form-group">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <User size={14} className="text-amber-400" /> Nama Anda *
            </label>
            <input 
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-[#0A1B33] border border-[#1E3E62] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-500"
            />
          </div>



          {/* Ringkasan Biaya Box */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#0A1B33] to-[#0E264A] border border-amber-500/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10.5px] text-slate-400 block">Paket Dipilih:</span>
              <strong className="text-white font-bold">{currentServiceObj?.name}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10.5px] text-slate-400 block">Estimasi Investasi:</span>
              <strong className="text-amber-400 text-sm font-extrabold">{currentServiceObj?.formattedPrice}</strong>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="privacy-note flex items-center gap-2 text-[10.5px] text-slate-400 bg-[#050E1C] p-2.5 rounded-lg border border-[#132C52]">
            <ShieldCheck size={16} className="text-amber-400 shrink-0" />
            <span>Data pesanan Anda aman 100% dan langsung terhubung resmi dengan WhatsApp Sales Admin ADMS.</span>
          </div>

          {/* Actions */}
          <div className="modal-footer pt-3 border-t border-[#132C52] flex items-center justify-between gap-2 bg-[#071326]">
            <button type="button" className="btn-secondary text-xs" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-primary text-xs flex items-center gap-1.5">
              <span>Konfirmasi & Buka WhatsApp 1</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
