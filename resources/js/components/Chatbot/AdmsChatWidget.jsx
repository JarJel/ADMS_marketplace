import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, User, PhoneCall, ArrowUpRight, 
  RotateCcw, Shield, CheckCircle, FileText, 
  BookOpen, ChevronRight, ShoppingCart, Paperclip
} from 'lucide-react';
import { 
  INITIAL_CHAT_STATE, 
  CHAT_STATES, 
  processUserMessage, 
  generateWhatsAppLink,
  generateWhatsAppOrderLink
} from './chatbotEngine';
import { callGeminiAI } from './aiProvider';
import CatalogModal from './CatalogModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import { ADMS_INFO } from './admsKnowledge';
import './chatbot.css';

export default function AdmsChatWidget({ darkMode = true }) {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const [isOpen, setIsOpen] = useState(false);
  const [chatContext, setChatContext] = useState(INITIAL_CHAT_STATE);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState('');
  const [unreadCount, setUnreadCount] = useState(1);
  const [pendingQuery, setPendingQuery] = useState(null);

  const messagesEndRef = useRef(null);

  // Initialize first greeting message
  useEffect(() => {
    const greetingText = `👋 **Halo! Selamat datang di Layanan Bantuan & Konsultasi Resmi PT. ADMS.**\n\n` +
      `Saya adalah **ADMS Assistant** (Konsultan Resmi ADMS). Kami siap membantu pertumbuhan bisnis Anda dengan layanan profesional berstandar Google Cloud Platform:\n\n` +
      `1. 🌐 **Website & Development** (Landing Page, E-Commerce, WordPress, React App)\n` +
      `2. 📢 **Digital Ads** (Google, Meta, Instagram, TikTok Ads, Maps Review)\n` +
      `3. ⚡ **WhatsApp & Automation** (WA Blast, Official Centang Hijau, SMS)\n` +
      `4. 🚀 **Marketing & Distribution** (Artikel SEO, Posting 1000 Web, Backlink)\n` +
      `5. 📱 **Social Media Management** (Kelola Akun & Video Content)\n` +
      `6. ⚖️ **Legalitas & Perizinan** (NIB UMKM, Pendirian CV & PT)\n` +
      `7. 🏗️ **Layanan Offline & Konstruksi** (Pindahan & Konstruksi)`;

    const initialBotMsg = {
      sender: 'bot',
      text: greetingText,
      quickReplies: [
        '🌐 Paket Pembuatan Website',
        '📢 Pasang Iklan Google / Ads',
        '⚡ Layanan WhatsApp Blast',
        '⚖️ Legalitas NIB / PT',
        '📊 Buka Katalog Semua Layanan'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([initialBotMsg]);
  }, []);

  // Global event listener for external triggers
  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true);
      setUnreadCount(0);
      if (e.detail && e.detail.query) {
        setPendingQuery(e.detail.query);
      }
    };
    window.addEventListener('openAdmsChat', handleOpenChat);
    return () => window.removeEventListener('openAdmsChat', handleOpenChat);
  }, []);

  // Execute pending queries when opened
  useEffect(() => {
    if (pendingQuery && isOpen) {
       // Timeout ensures UI has settled before scrolling / typing begins
       setTimeout(() => {
         handleSendMessage(pendingQuery, true);
       }, 300);
       setPendingQuery(null);
    }
  }, [pendingQuery, isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleResetChat = () => {
    setChatContext(INITIAL_CHAT_STATE);
    const initialBotMsg = {
      sender: 'bot',
      text: `🔄 **Sesi konsultasi telah direset.**\n\nHalo! Silakan pilih layanan atau ketik pertanyaan seputar pembuatan website, perizinan legalitas, atau optimasi iklan online:`,
      quickReplies: [
        '🌐 Paket Pembuatan Website',
        '📢 Pasang Iklan Online',
        '⚡ WhatsApp & Automation',
        '⚖️ Info Legalitas NIB / PT',
        '📊 Buka Katalog Semua Layanan'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialBotMsg]);
  };

  const isTemplateOption = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return (
      lower.includes('🌐') ||
      lower.includes('📢') ||
      lower.includes('⚖️') ||
      lower.includes('📊') ||
      lower.includes('⚡') ||
      lower.includes('🚀') ||
      lower.includes('📱') ||
      lower.includes('1️⃣') ||
      lower.includes('2️⃣') ||
      lower.includes('3️⃣') ||
      lower.includes('4️⃣') ||
      lower.includes('5️⃣') ||
      lower.includes('6️⃣') ||
      lower.includes('7️⃣') ||
      lower.includes('[data terkirim]') ||
      lower.includes('[pesanan terkirim]') ||
      lower.includes('buka katalog') ||
      lower.includes('buat website baru') ||
      lower.includes('paket pembuatan website') ||
      lower.includes('pasang iklan online') ||
      lower.includes('pasang iklan google / ads') ||
      lower.includes('layanan whatsapp') ||
      lower.includes('info legalitas') ||
      lower.includes('legalitas nib / pt') ||
      lower.includes('paket legalitas') ||
      lower.includes('kelola sosmed') ||
      lower.includes('landing page (rp') ||
      lower.includes('company profile (rp') ||
      lower.includes('toko online (rp') ||
      lower.includes('desain wordpress (rp') ||
      lower.includes('custom react app (rp') ||
      lower.includes('optimasi seo (rp') ||
      lower.includes('legalitas nib (rp') ||
      lower.includes('pendirian cv (rp') ||
      lower.includes('pendirian pt (rp') ||
      lower.includes('google ads (rp')
    );
  };

  const handleSendMessage = async (messageToSend, isPreset = false) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text) return;

    const isTemplate = isPreset || isTemplateOption(text);

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      { sender: 'user', text, timestamp: userTime }
    ]);
    setInputMessage('');
    setIsTyping(true);

    // If message is NOT a preset template and API key exists -> Use Gemini AI for custom / free-form query!
    if (!isTemplate && geminiApiKey) {
      try {
        const aiReply = await callGeminiAI(text, messages, geminiApiKey);
        const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: aiReply,
            showOrderTrigger: true,
            quickReplies: [
              '📝 Isi Form Konfirmasi Pesanan',
              '📱 Chat WA 1 Admin Langsung',
              '📊 Buka Katalog Semua Layanan'
            ],
            timestamp: botTime
          }
        ]);
        setIsTyping(false);
        return;
      } catch (err) {
        console.warn('AI call failed, falling back to local NLP template engine:', err);
      }
    }

    // Preset Template Option: Instant local rule-based engine
    setTimeout(() => {
      const response = processUserMessage(text, chatContext);
      setChatContext(response.nextContext);

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: response.text,
          quickReplies: response.quickReplies,
          whatsappHandover: response.whatsappHandover,
          showOrderTrigger: response.showOrderTrigger || response.showLeadTrigger,
          showOrderForm: response.showOrderForm || response.showLeadForm,
          selectedService: response.selectedService,
          timestamp: botTime
        }
      ]);
      setIsTyping(false);
    }, 300);
  };

  const handleSelectServiceFromCatalog = (serviceName, categoryName) => {
    setIsCatalogOpen(false);
    if (!isOpen) setIsOpen(true);
    setSelectedServiceForOrder(serviceName);
    const promptText = `Saya tertarik dengan paket ${serviceName} (${categoryName}). Boleh minta info detail harga dan rekomendasinya?`;
    handleSendMessage(promptText, true);
  };

  const handleSubmitOrder = (orderData) => {
    const waUrl = generateWhatsAppOrderLink(orderData);

    const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add Order Confirmation Card to chat
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        isOrderConfirmation: true,
        orderData: orderData,
        whatsappHandover: { url: waUrl },
        text: `🎉 **Konfirmasi Pesanan Berhasil Dicatat!**\n\n` +
          `• **No. Pesanan**: \`${orderData.orderId}\`\n` +
          `• **Nama**: ${orderData.name} ${orderData.businessName ? `(${orderData.businessName})` : ''}\n` +
          `• **Layanan**: **${orderData.serviceName}** (${orderData.servicePrice})\n` +
          `• **Status Bukti Bayar**: ${orderData.hasPaymentProof ? '✅ File Bukti Bayar/Referensi Terlampir' : 'ℹ️ Konfirmasi pembayaran via WA'}\n\n` +
          `Pesanan Anda sedang diarahkan ke **WhatsApp 1 (+6281121211933)** Tim Sales Admin ADMS.`,
        quickReplies: [
          '📱 Hubungi WhatsApp 1 Admin',
          '📊 Lihat Katalog Layanan Lain',
          '🔄 Reset Percakapan'
        ],
        timestamp: botTime
      }
    ]);

    // Automatically open WhatsApp in new tab
    window.open(waUrl, '_blank');
  };

  const getStateStepLabel = (state) => {
    switch (state) {
      case CHAT_STATES.STATE_1_GREETING: return 'Tahap 1: Pilihan Layanan Produk';
      case CHAT_STATES.STATE_2_NEEDS: return 'Tahap 2: Rincian Paket';
      case CHAT_STATES.STATE_3_RECOMMENDATION: return 'Tahap 3: Konfirmasi Pesanan';
      case CHAT_STATES.STATE_4_LEAD_CAPTURE: return 'Tahap 4: Form Data & Bukti Bayar';
      case CHAT_STATES.STATE_5_HANDOVER: return 'Tahap 5: Handover WhatsApp CS';
      default: return 'Konsultasi Digital ADMS';
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      return (
        <p key={idx} className="my-1">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-amber-300">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-[#0A1B33] text-amber-300 font-mono text-[11px] border border-amber-500/30">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={pIdx} className="italic opacity-90">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button - Navy & Gold Theme with Official Logo */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button 
            onClick={handleToggleOpen}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-[#0A1B33] via-[#0F274E] to-[#0A1B33] hover:from-[#0D2447] hover:to-[#12315E] text-white text-xs font-bold py-3 px-5 sm:px-6 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-amber-400/80"
          >
            <div className="relative flex items-center justify-center">
              <img 
                src="/assets/Images/adms-symbol.png" 
                alt="ADMS Logo" 
                className="w-6 h-6 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
              )}
            </div>
            <span className="tracking-wide text-amber-200 font-bold drop-shadow">Bantuan ADMS</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
          </button>
        )}

        {/* Floating Chat Window - Elegant Navy & Gold Theme */}
        {isOpen && (
          <div className="w-[380px] sm:w-[420px] h-[580px] max-h-[85vh] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl bg-[#071326]/98 backdrop-blur-xl border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            
            {/* Header: Navy & Gold */}
            <div className="bg-gradient-to-r from-[#0A1B33] via-[#102A54] to-[#0A1B33] p-3.5 px-4 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#061224] border border-amber-400/50 p-1 flex items-center justify-center shadow-md shadow-amber-500/10">
                  <img 
                    src="/assets/Images/adms-symbol.png" 
                    alt="ADMS Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white tracking-wide">ADMS Assistant</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/40">Resmi</span>
                  </div>
                  <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online &bull; Layanan Produk & Sales
                  </span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsCatalogOpen(true)}
                  title="Lihat Katalog Lengkap"
                  className="p-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-500/15 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleResetChat}
                  title="Reset Percakapan"
                  className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleToggleOpen}
                  title="Tutup Chat"
                  className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stepper Status Bar - Navy & Gold */}
            <div className="bg-[#050E1C] px-3.5 py-2 border-b border-[#132C52] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-medium">{getStateStepLabel(chatContext.currentState)}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(step => (
                  <span 
                    key={step} 
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      step === chatContext.currentState 
                        ? 'w-3.5 bg-amber-400 shadow-[0_0_8px_#f59e0b]' 
                        : step < chatContext.currentState 
                        ? 'bg-amber-600' 
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar text-xs bg-[#071326]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-[#0A1B33] border border-amber-500/40 p-1 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <img 
                        src="/assets/Images/adms-symbol.png" 
                        alt="ADMS" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-[#1E3E62] to-[#2B5488] text-white border border-amber-400/30 rounded-tr-none' 
                      : 'bg-[#0B1E38] text-slate-100 border border-[#1B365D] rounded-tl-none'
                  }`}>
                    {renderFormattedText(msg.text)}

                    {/* Order Confirmation Card */}
                    {msg.isOrderConfirmation && msg.orderData && (
                      <div className="mt-3 p-3 rounded-xl bg-[#061427] border border-amber-500/40 space-y-2 text-[11px]">
                        <div className="flex items-center justify-between border-b border-[#132C52] pb-2">
                          <span className="text-amber-300 font-bold flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" /> Ringkasan Pesanan
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{msg.orderData.orderId}</span>
                        </div>
                        <div className="space-y-1 text-slate-300">
                          <div><strong>Paket:</strong> <span className="text-white">{msg.orderData.serviceName}</span></div>
                          <div><strong>Harga:</strong> <span className="text-amber-400 font-bold">{msg.orderData.servicePrice}</span></div>
                          {msg.orderData.notes && <div><strong>Catatan:</strong> <span>{msg.orderData.notes}</span></div>}
                          {msg.orderData.hasPaymentProof && (
                            <div className="flex items-center gap-1 text-emerald-400 pt-1">
                              <Paperclip className="w-3 h-3" />
                              <span>Bukti Bayar: {msg.orderData.paymentProofFileName || 'File Terlampir'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order / Lead Trigger Button */}
                    {(msg.showOrderForm || msg.showOrderTrigger) && (
                      <div className="mt-3 pt-2.5 border-t border-[#1E3E62]">
                        <button 
                          onClick={() => {
                            if (msg.selectedService) setSelectedServiceForOrder(msg.selectedService);
                            setIsOrderModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Isi Form Konfirmasi Pesanan</span>
                        </button>
                      </div>
                    )}

                    {/* WhatsApp Handover Card */}
                    {msg.whatsappHandover && (
                      <div className="mt-3 pt-2.5 border-t border-[#1E3E62] space-y-2">
                        <div className="p-2.5 rounded-xl bg-[#061427] border border-amber-500/40 text-[11px] text-slate-200 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-amber-300">
                            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="font-semibold text-white">Data diteruskan ke Tim Sales Admin ADMS</span>
                          </div>
                          <div className="text-[10.5px] text-slate-300 pl-6 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              <span>WhatsApp 1: <strong className="text-amber-300 font-mono">+6281121211933</strong> <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">Utama</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              <span>WhatsApp 2: <strong className="text-slate-300 font-mono">+6281121211933</strong></span>
                            </div>
                          </div>
                        </div>
                        <a 
                          href={msg.whatsappHandover.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
                        >
                          <PhoneCall className="w-4 h-4" />
                          <span>Hubungi WhatsApp 1 CS (+6281121211933)</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Quick Suggestion Cards */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && idx === messages.length - 1 && (
                      <div className="mt-3 pt-3 border-t border-[#1E3E62] grid grid-cols-1 gap-2.5">
                        {msg.quickReplies.map((reply, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => {
                              if (reply.includes('Katalog')) {
                                setIsCatalogOpen(true);
                              } else if (reply.includes('Form Konfirmasi') || reply.includes('Form Data')) {
                                setIsOrderModalOpen(true);
                              } else if (reply.includes('Hubungi CS') || reply.includes('WhatsApp')) {
                                const waUrl = generateWhatsAppLink(chatContext.leadData);
                                window.open(waUrl, '_blank');
                              } else {
                                handleSendMessage(reply, true);
                              }
                            }}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#0F274E] to-[#0A1B33] hover:from-[#133060] hover:to-[#0F274E] border border-amber-500/40 hover:border-amber-400 transition-all text-left group shadow-sm shadow-amber-500/10"
                          >
                            <span className="text-[11.5px] font-semibold text-amber-300 group-hover:text-amber-200 pr-2">
                              {reply}
                            </span>
                            <ChevronRight className="w-4 h-4 text-amber-500/60 group-hover:text-amber-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 text-[9px] opacity-60 text-right">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-[#1E3E62] flex items-center justify-center shrink-0 mt-0.5 text-amber-200">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 justify-start items-center text-slate-300 text-[11px]">
                  <div className="w-7 h-7 rounded-lg bg-[#0A1B33] border border-amber-500/40 p-1 flex items-center justify-center shrink-0">
                    <img 
                      src="/assets/Images/adms-symbol.png" 
                      alt="ADMS" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="bg-[#0B1E38] border border-[#1B365D] rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="ml-1 text-amber-200">ADMS Assistant sedang menyiapkan respon...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#050D1A] border-t border-[#132C52]">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text"
                  placeholder="Ketik kebutuhan (contoh: Landing Page, Google Ads, NIB, WA Blast)..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-[#0A1B33] border border-[#1E3E62] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <button 
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-amber-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-1 pt-1 border-t border-[#0F2647]">
                <span className="flex items-center gap-1 text-slate-300">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>Google Cloud Platform Server</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <span>WA 1: <strong className="text-amber-400 font-semibold">+6281121211933</strong></span>
                  <span className="text-slate-600">&bull;</span>
                  <span>WA 2: <strong className="text-slate-300 font-semibold">+6281121211933</strong></span>
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Catalog Modal */}
      <CatalogModal 
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectService={handleSelectServiceFromCatalog}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSubmitOrder={handleSubmitOrder}
        initialData={chatContext.leadData}
        selectedService={selectedServiceForOrder}
      />
    </>
  );
}
