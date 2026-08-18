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
              return <strong key={pIdx} className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{part.slice(2, -2)}</strong>;
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
                    <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-md border ${
                      darkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>AI Pro</span>
                  </div>
                  <span className={`text-[11px] flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online &bull; Konsultan Digital & Sales
                  </span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsCatalogOpen(true)}
                  title="Lihat Katalog Layanan"
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode ? 'text-slate-400 hover:text-teal-300 hover:bg-slate-800/60' : 'text-slate-500 hover:text-teal-700 hover:bg-slate-200/80'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleResetChat}
                  title="Reset Percakapan"
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode ? 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60' : 'text-slate-500 hover:text-amber-700 hover:bg-slate-200/80'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleToggleOpen}
                  title="Tutup Chat"
                  className={`p-1.5 rounded-lg transition-colors ${
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar text-xs">
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
                          : 'bg-slate-100 text-slate-800 border border-slate-300/90 rounded-tl-none')
                  }`}>
                    {renderFormattedText(msg.text)}

                    {/* Lead Trigger Button */}
                    {(msg.showLeadForm || msg.showLeadTrigger) && (
                      <div className={`mt-3 pt-2.5 border-t ${darkMode ? 'border-slate-700/60' : 'border-slate-300'}`}>
                        <button 
                          onClick={() => setIsLeadFormOpen(true)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-md transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Isi Data Lead Konsultasi</span>
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
                              <span>WhatsApp 2: <strong className="font-mono text-slate-700 dark:text-slate-300">+6281121191933</strong></span>
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
                          <span>Chat WhatsApp 1 Admin (+6281121211933)</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Quick Suggestion Chips */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && idx === messages.length - 1 && (
                      <div className={`mt-3 pt-2.5 border-t flex flex-wrap gap-1.5 ${darkMode ? 'border-slate-700/60' : 'border-slate-300'}`}>
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
                            className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all text-left font-medium ${
                              darkMode 
                                ? 'bg-slate-900/80 hover:bg-teal-900/60 text-teal-300 border-teal-500/30 hover:border-teal-400' 
                                : 'bg-white hover:bg-teal-50 text-teal-700 border-teal-300 hover:border-teal-500 shadow-sm'
                            }`}
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
                  placeholder="Ketik pertanyaan (contoh: harga website, izin NIB, Ads)..."
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
                  className="p-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-teal-500/20"
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
                  <span>WA 2: <strong className="text-slate-700 dark:text-slate-300 font-semibold">+6281121191933</strong></span>
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
