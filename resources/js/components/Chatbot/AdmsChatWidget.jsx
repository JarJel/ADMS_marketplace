import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, PhoneCall, ArrowUpRight, 
  Sparkles, RotateCcw, Shield, CheckCircle, FileText, ChevronDown, 
  Layers, ExternalLink 
} from 'lucide-react';
import { 
  INITIAL_CHAT_STATE, 
  CHAT_STATES, 
  processUserMessage, 
  generateWhatsAppLink 
} from './chatbotEngine';
import { callGeminiAI } from './aiProvider';
import CatalogModal from './CatalogModal';
import LeadModal from './LeadModal';
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
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const messagesEndRef = useRef(null);

  // Initialize first greeting message
  useEffect(() => {
    const greetingText = `👋 **Halo! Selamat datang di Layanan Bantuan & Konsultasi Digital PT. ADMS.**\n\n` +
      `Saya adalah **ADMS AI Assistant** (Armada Digital Consultant) resmi ADMS. Ada solusi digital apa yang sedang Anda butuhkan untuk mengembangkan bisnis saat ini?\n\n` +
      `• 🚀 **Digital Marketing & Ads** (Google, Meta, TikTok)\n` +
      `• 🌐 **Website & Development** (Landing Page, E-Commerce, Custom Web)\n` +
      `• ⚖️ **Legalitas & Perizinan** (NIB UMKM, Pendirian CV & PT)\n` +
      `• ⚡ **WhatsApp API & Blast Massal**`;

    const initialBotMsg = {
      sender: 'bot',
      text: greetingText,
      quickReplies: [
        '🌐 Paket Pembuatan Website',
        '📢 Pasang Iklan Google / Ads',
        '⚖️ Legalitas NIB / PT',
        '📊 Buka Katalog Semua Layanan'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([initialBotMsg]);
  }, []);

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
      text: `🔄 **Sesi chat telah direset.**\n\nHalo! Silakan pilih layanan atau ketik pertanyaan seputar pembuatan website, perizinan legalitas, atau optimasi iklan online:`,
      quickReplies: [
        '🌐 Buat Website Baru',
        '📢 Pasang Iklan Online',
        '⚖️ Info Legalitas NIB / PT',
        '📊 Buka Katalog Semua Layanan'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialBotMsg]);
  };

  const handleSendMessage = async (messageToSend) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      { sender: 'user', text, timestamp: userTime }
    ]);
    setInputMessage('');
    setIsTyping(true);

    if (geminiApiKey) {
      try {
        const aiReply = await callGeminiAI(text, messages, geminiApiKey);
        const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: aiReply,
            isGemini: true,
            showLeadTrigger: true,
            quickReplies: [
              '📝 Isi Form Data Lead',
              '📱 Chat WA 1 Admin Langsung',
              '📊 Buka Katalog Semua Layanan'
            ],
            timestamp: botTime
          }
        ]);
        setIsTyping(false);
        return;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local NLP engine:', err);
      }
    }

    // Fallback to local rule engine
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
          showLeadTrigger: response.showLeadTrigger,
          showLeadForm: response.showLeadForm,
          timestamp: botTime
        }
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleSelectServiceFromCatalog = (serviceName, categoryName) => {
    setIsCatalogOpen(false);
    if (!isOpen) setIsOpen(true);
    const promptText = `Saya tertarik dengan paket ${serviceName} (${categoryName}). Boleh minta info detail harga dan rekomendasinya?`;
    handleSendMessage(promptText);
  };

  const handleSubmitLeadData = (leadInfo) => {
    const updatedLeadData = {
      ...chatContext.leadData,
      name: leadInfo.name,
      businessName: leadInfo.businessName,
      whatsapp: leadInfo.whatsapp
    };

    setChatContext(prev => ({
      ...prev,
      currentState: CHAT_STATES.STATE_5_HANDOVER,
      leadData: updatedLeadData
    }));

    const leadMsg = `[Data Terkirim] Nama: ${leadInfo.name}, Usaha: ${leadInfo.businessName || '-'}, WA: ${leadInfo.whatsapp}`;
    handleSendMessage(leadMsg);

    // Auto open WhatsApp in new tab
    const waUrl = generateWhatsAppLink(updatedLeadData);
    window.open(waUrl, '_blank');
  };

  const getStateStepLabel = (state) => {
    if (geminiApiKey) return '✨ AI Gemini Live (Generatif & Negosiasi)';
    switch (state) {
      case CHAT_STATES.STATE_1_GREETING: return 'Tahap 1: Orientasi Intent';
      case CHAT_STATES.STATE_2_NEEDS: return 'Tahap 2: Analisis Kebutuhan';
      case CHAT_STATES.STATE_3_RECOMMENDATION: return 'Tahap 3: Rekomendasi Paket';
      case CHAT_STATES.STATE_4_LEAD_CAPTURE: return 'Tahap 4: Pengumpulan Leads';
      case CHAT_STATES.STATE_5_HANDOVER: return 'Tahap 5: Handover WA Admin';
      default: return 'Konsultasi Digital ADMS';
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="my-1">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-emerald-400">{part.slice(2, -2)}</strong>;
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
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button 
            onClick={handleToggleOpen}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-bold py-3.5 px-6 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-teal-400/30"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </div>
            <span className="tracking-wide">Bantuan ADMS</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b7]"></span>
          </button>
        )}

        {/* Floating Chat Window Modal */}
        {isOpen && (
          <div className="w-[380px] sm:w-[420px] h-[580px] max-h-[85vh] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 p-3.5 px-4 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
                  <Bot className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white tracking-wide">ADMS Assistant</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-medium bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">AI Pro</span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online &bull; Konsultan Digital & Sales
                  </span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsCatalogOpen(true)}
                  title="Lihat Katalog Layanan"
                  className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
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

            {/* Stepper Status Bar */}
            <div className="bg-slate-950/80 px-3.5 py-2 border-b border-slate-800/60 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-teal-400 font-medium">{getStateStepLabel(chatContext.currentState)}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(step => (
                  <span 
                    key={step} 
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      step === chatContext.currentState 
                        ? 'w-3.5 bg-emerald-400 shadow-[0_0_8px_#34d399]' 
                        : step < chatContext.currentState 
                        ? 'bg-emerald-600' 
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar text-xs">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-teal-900/60 border border-teal-700/50 flex items-center justify-center shrink-0 mt-0.5 text-teal-300">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-tr-none' 
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}>
                    {renderFormattedText(msg.text)}

                    {/* Lead Trigger Button */}
                    {(msg.showLeadForm || msg.showLeadTrigger) && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                        <button 
                          onClick={() => setIsLeadFormOpen(true)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Isi Data Lead Konsultasi</span>
                        </button>
                      </div>
                    )}

                    {/* WhatsApp Handover Card */}
                    {msg.whatsappHandover && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-2">
                        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-[11px] text-emerald-300 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-semibold text-white">Data siap diteruskan ke Tim Sales Admin ADMS</span>
                          </div>
                          <div className="text-[10.5px] text-slate-300 pl-6 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>WhatsApp 1: <strong className="text-emerald-300 font-mono">+6281121211933</strong> <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">Utama</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              <span>WhatsApp 2: <strong className="text-slate-300 font-mono">+6281121191933</strong></span>
                            </div>
                          </div>
                        </div>
                        <a 
                          href={msg.whatsappHandover.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
                        >
                          <PhoneCall className="w-4 h-4" />
                          <span>Chat WhatsApp 1 Admin (+6281121211933)</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Quick Suggestion Chips */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && idx === messages.length - 1 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                        {msg.quickReplies.map((reply, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => {
                              if (reply.includes('Katalog')) {
                                setIsCatalogOpen(true);
                              } else if (reply.includes('Form Data Lead')) {
                                setIsLeadFormOpen(true);
                              } else {
                                handleSendMessage(reply);
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900/80 hover:bg-teal-900/60 text-teal-300 border border-teal-500/30 hover:border-teal-400 transition-all text-left"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 text-[9px] opacity-60 text-right">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 justify-start items-center text-slate-400 text-[11px]">
                  <div className="w-7 h-7 rounded-lg bg-teal-900/60 border border-teal-700/50 flex items-center justify-center shrink-0 text-teal-300">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="ml-1 text-slate-300">ADMS AI sedang merespons...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text"
                  placeholder="Ketik pertanyaan (contoh: harga website, izin NIB, Ads)..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <button 
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-teal-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-1 pt-1 border-t border-slate-900">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-teal-400" />
                  <span>Google Cloud Platform Server</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <span>WA 1: <strong className="text-emerald-400 font-semibold">+6281121211933</strong></span>
                  <span className="text-slate-600">&bull;</span>
                  <span>WA 2: <strong className="text-slate-300 font-semibold">+6281121191933</strong></span>
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

      {/* Lead Modal */}
      <LeadModal 
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        onSubmitLead={handleSubmitLeadData}
        initialData={chatContext.leadData}
      />
    </>
  );
}
