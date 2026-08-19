import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, User, PhoneCall, ArrowUpRight, 
  RotateCcw, Shield, CheckCircle, FileText, 
  BookOpen, ChevronRight, ShoppingCart, Paperclip, Bot
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
import { ADMS_INFO, ADMS_CATALOG, updateCatalog } from './admsKnowledge';
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
  const [liveCatalog, setLiveCatalog] = useState(ADMS_CATALOG);

  const messagesEndRef = useRef(null);

  // Fetch live service catalog from backend (override static prices if admin updated them)
  useEffect(() => {
    fetch('/api/public/service-catalog')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          updateCatalog(data.data);
          setLiveCatalog(data.data);
        }
      })
      .catch(() => {});
  }, []);

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
        '⚖️ Layanan Legalitas NIB / PT',
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
              return <strong key={pIdx} className={`font-semibold ${darkMode ? 'text-[#10B981]' : 'text-teal-700'}`}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={pIdx} className={`px-1.5 py-0.5 rounded font-mono text-[11px] border ${
                darkMode ? 'bg-slate-950 text-teal-300 border-slate-700' : 'bg-slate-100 text-teal-800 border-slate-300'
              }`}>{part.slice(1, -1)}</code>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button 
            onClick={handleToggleOpen}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-[#FFBF00] via-[#ffcd33] to-[#FFBF00] hover:brightness-110 text-[#0F3040] text-xs font-black py-3 px-5 sm:px-6 rounded-full shadow-[0_8px_30px_rgba(255,191,0,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 border border-[#FFBF00]/40 cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#0F3040]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0F3040] rounded-full animate-ping"></span>
              )}
            </div>
            <span className="tracking-wide text-[#0F3040] font-black uppercase">Bantuan ADMS</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F3040]"></span>
          </button>
        )}

        {/* Floating Chat Window */}
        {isOpen && (
          <div className={`w-[380px] sm:w-[420px] h-[580px] max-h-[85vh] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl backdrop-blur-xl border shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            darkMode 
              ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.6)]' 
              : 'bg-white/95 border-slate-300 text-slate-800 shadow-2xl shadow-indigo-100/90'
          }`}>
            
            {/* Header */}
            <div className={`p-3.5 px-4 border-b flex items-center justify-between ${
              darkMode 
                ? 'bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 border-slate-800/80' 
                : 'bg-gradient-to-r from-slate-100 via-teal-50 to-indigo-50 border-slate-300'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
                  <Bot className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-sm tracking-wide ${darkMode ? 'text-white' : 'text-slate-900'}`}>ADMS Assistant</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20">Resmi</span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online &bull; Layanan Produk & Sales
                  </span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsCatalogOpen(true)}
                  title="Lihat Katalog Layanan"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    darkMode ? 'text-slate-400 hover:text-teal-300 hover:bg-slate-800/60' : 'text-slate-500 hover:text-teal-700 hover:bg-slate-200/80'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleResetChat}
                  title="Reset Percakapan"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    darkMode ? 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60' : 'text-slate-500 hover:text-amber-700 hover:bg-slate-200/80'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleToggleOpen}
                  title="Tutup Chat"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    darkMode ? 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60' : 'text-slate-500 hover:text-rose-700 hover:bg-slate-200/80'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stepper Status Bar */}
            <div className={`px-3.5 py-2 border-b flex items-center justify-between text-[11px] ${
              darkMode ? 'bg-slate-950/80 border-slate-800/60' : 'bg-slate-100/90 border-slate-300'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className={`font-semibold ${darkMode ? 'text-teal-400' : 'text-teal-700'}`}>{getStateStepLabel(chatContext.currentState)}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(step => (
                  <span 
                    key={step} 
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      step === chatContext.currentState 
                        ? 'w-3.5 bg-emerald-500 shadow-sm' 
                        : step < chatContext.currentState 
                        ? 'bg-emerald-600' 
                        : (darkMode ? 'bg-slate-700' : 'bg-slate-300')
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar text-xs ${
              darkMode ? 'bg-slate-950/50' : 'bg-slate-50/50'
            }`}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      darkMode ? 'bg-teal-900/60 border-teal-700/50 text-teal-300' : 'bg-teal-100 border-teal-300 text-teal-700'
                    }`}>
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-tr-none' 
                      : (darkMode 
                          ? 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none' 
                          : 'bg-white text-slate-800 border border-slate-300/90 rounded-tl-none shadow-xs')
                  }`}>
                    {renderFormattedText(msg.text)}

                    {/* Order Confirmation Card */}
                    {msg.isOrderConfirmation && msg.orderData && (
                      <div className={`mt-3 p-3 rounded-xl border text-[11px] space-y-2 ${
                        darkMode ? 'bg-slate-900 border-emerald-500/40' : 'bg-emerald-50/60 border-emerald-200'
                      }`}>
                        <div className="flex items-center justify-between border-b border-slate-700/40 pb-2">
                          <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5" /> Ringkasan Pesanan
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{msg.orderData.orderId}</span>
                        </div>
                        <div className="space-y-1 text-slate-300 dark:text-slate-200">
                          <div><strong>Paket:</strong> <span>{msg.orderData.serviceName}</span></div>
                          <div><strong>Harga:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{msg.orderData.servicePrice}</span></div>
                          {msg.orderData.notes && <div><strong>Catatan:</strong> <span>{msg.orderData.notes}</span></div>}
                          {msg.orderData.hasPaymentProof && (
                            <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 pt-1">
                              <Paperclip className="w-3 h-3" />
                              <span>Bukti Bayar: {msg.orderData.paymentProofFileName || 'File Terlampir'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order / Lead Trigger Button */}
                    {(msg.showOrderForm || msg.showOrderTrigger || msg.showLeadForm || msg.showLeadTrigger) && (
                      <div className={`mt-3 pt-2.5 border-t ${darkMode ? 'border-slate-700/60' : 'border-slate-300'}`}>
                        <button 
                          onClick={() => {
                            if (msg.selectedService) setSelectedServiceForOrder(msg.selectedService);
                            setIsOrderModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Isi Form Konfirmasi Pesanan</span>
                        </button>
                      </div>
                    )}

                    {/* WhatsApp Handover Card */}
                    {msg.whatsappHandover && (
                      <div className={`mt-3 pt-2.5 border-t space-y-2 ${darkMode ? 'border-slate-700/60' : 'border-slate-300'}`}>
                        <div className={`p-2.5 rounded-xl border text-[11px] flex flex-col gap-1.5 ${
                          darkMode ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        }`}>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Data siap diteruskan ke Tim Sales Admin ADMS</span>
                          </div>
                          <div className={`text-[10.5px] pl-6 space-y-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>WhatsApp 1: <strong className="font-mono text-emerald-600 dark:text-emerald-300">+6281121211933</strong> <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-500/30">Utama</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>WhatsApp 2: <strong className="font-mono text-slate-700 dark:text-slate-300">+6281121211933</strong></span>
                            </div>
                          </div>
                        </div>
                        <a 
                          href={msg.whatsappHandover.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all text-xs"
                        >
                          <PhoneCall className="w-4 h-4" />
                          <span>Hubungi WhatsApp 1 CS (+6281121211933)</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Quick Suggestion Cards */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && idx === messages.length - 1 && (
                      <div className={`mt-3 pt-2.5 border-t flex flex-wrap gap-1.5 ${darkMode ? 'border-slate-700/60' : 'border-slate-300'}`}>
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
                            className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all text-left font-medium cursor-pointer ${
                              darkMode 
                                ? 'bg-slate-900/80 hover:bg-teal-900/60 text-teal-300 border-teal-500/30 hover:border-teal-400' 
                                : 'bg-white hover:bg-teal-50 text-teal-700 border-teal-300 hover:border-teal-500 shadow-xs'
                            }`}
                          >
                            <span>{reply}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 text-[9px] opacity-60 text-right">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                    }`}>
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 justify-start items-center text-slate-400 text-[11px]">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-teal-900/60 border-teal-700/50 text-teal-300' : 'bg-teal-100 border-teal-300 text-teal-700'
                  }`}>
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className={`border rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5 ${
                    darkMode ? 'bg-slate-800/90 border-slate-700/60 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
                    <span className={`ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>ADMS AI sedang merespons...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className={`p-3 border-t ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
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
                  className={`flex-1 rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-1 ${
                    darkMode 
                      ? 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-teal-500' 
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 font-medium focus:border-teal-500 focus:ring-teal-500 shadow-sm'
                  }`}
                />
                <button 
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-teal-500/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className={`mt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] gap-1 pt-1 border-t ${
                darkMode ? 'text-slate-400 border-slate-900' : 'text-slate-500 border-slate-200'
              }`}>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-teal-500" />
                  <span>Google Cloud Platform Server</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <span>WA 1: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">+6281121211933</strong></span>
                  <span className="text-slate-400">&bull;</span>
                  <span>WA 2: <strong className="text-slate-700 dark:text-slate-300 font-semibold">+6281121211933</strong></span>
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
        catalog={liveCatalog}
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
