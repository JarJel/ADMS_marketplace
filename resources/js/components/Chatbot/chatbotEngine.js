import { ADMS_CATALOG, ADMS_INFO, CROSS_SELL_RULES } from './admsKnowledge';

export const CHAT_STATES = {
  STATE_1_GREETING: 1,
  STATE_2_NEEDS: 2,
  STATE_3_RECOMMENDATION: 3,
  STATE_4_LEAD_CAPTURE: 4,
  STATE_5_HANDOVER: 5
};

export const INITIAL_CHAT_STATE = {
  currentState: CHAT_STATES.STATE_1_GREETING,
  leadData: {
    name: '',
    businessName: '',
    whatsapp: '',
    selectedCategory: '',
    selectedService: '',
    selectedPrice: '',
    crossSellAddon: '',
    estimatedBudget: ''
  },
  needsData: {
    businessType: '',
    mainGoal: '',
    budget: ''
  }
};

/**
 * Generates automated structured WhatsApp URL with full order breakdown
 */
export function generateWhatsAppLink(leadData) {
  const { name, businessName, whatsapp, selectedCategory, selectedService, selectedPrice, crossSellAddon } = leadData;
  const adminNumber = ADMS_INFO.primaryWhatsapp; // 6281121211933

  const text = `Halo Admin Sales ADMS! 👋

📋 *FORM ORDER KONSULTASI ADMS*:
• **Nama Klien**: ${name || 'Calon Klien'}
• **Nama Usaha**: ${businessName || 'Usaha Saya'}
• **No. WhatsApp**: ${whatsapp || '-'}

🎯 **Paket Pilihan**: ${selectedService || selectedCategory || 'Layanan Digital ADMS'}
💵 **Harga Dasar**: ${selectedPrice || 'Mulai dari harga katalog'}
💡 **Rekomendasi Kombinasi**: ${crossSellAddon || 'Google Ads / WA API Automation'}
✨ **Spesifikasi**: Google Cloud Platform (Garansi SSL & Domain)

Saya sudah berdiskusi dengan ADMS AI Assistant. Mohon informasikan rincian penawaran & link pembayaran resmi ya Min. Terima kasih!`;

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Intelligent NLP, Option Parsing & State Machine Engine
 */
export function processUserMessage(userMessage, currentContext) {
  const lowerMsg = userMessage.trim().toLowerCase();
  const nextContext = { 
    ...currentContext, 
    leadData: { ...currentContext.leadData } 
  };

  // 0. SPECIFIC PACKAGE SELECTION PARSER (FOR CHIPS & DIRECT SELECTIONS)
  const isChipOrNumberClick = 
    lowerMsg.includes("1️⃣") || lowerMsg.includes("2️⃣") || lowerMsg.includes("3️⃣") || 
    lowerMsg.includes("4️⃣") || lowerMsg.includes("5️⃣") || lowerMsg.includes("6️⃣") ||
    lowerMsg.includes("landing page conversion") || lowerMsg.includes("company profile corporate") || lowerMsg.includes("e-commerce / toko online") ||
    lowerMsg.includes("jasa desain website wordpress") || lowerMsg.includes("custom react web app") || lowerMsg.includes("optimasi seo website") ||
    lowerMsg.includes("pendirian pt resmi") || lowerMsg.includes("pendirian cv legal") || lowerMsg.includes("legalitas usaha & nib") ||
    /^[1-6]$/.test(lowerMsg);

  if (isChipOrNumberClick) {
    let chosenService = "";
    let chosenPrice = "";
    let crossSell = "";

    if (lowerMsg.includes("nib") || lowerMsg.includes("legalitas nib")) {
      chosenService = "Legalitas Usaha & NIB UMKM"; chosenPrice = "Mulai dari Rp 1.000.000"; crossSell = "Landing Page Conversion (Rp 999rb)";
    } else if (lowerMsg.includes("cv") || lowerMsg.includes("pendirian cv")) {
      chosenService = "Pendirian CV Legal"; chosenPrice = "Mulai dari Rp 2.500.000"; crossSell = "Company Profile Corporate";
    } else if (lowerMsg.includes("pt") || lowerMsg.includes("pendirian pt")) {
      chosenService = "Pendirian PT Resmi"; chosenPrice = "Mulai dari Rp 2.500.000"; crossSell = "Company Profile Corporate + NIB";
    } else if (lowerMsg.includes("1") || lowerMsg.includes("landing page")) {
      chosenService = "Landing Page Conversion"; chosenPrice = "Mulai dari Rp 999.000"; crossSell = "Google Ads (Rp 350rb) / WA Auto (Rp 500rb)";
    } else if (lowerMsg.includes("2") || lowerMsg.includes("company profile")) {
      chosenService = "Company Profile Corporate"; chosenPrice = "Mulai dari Rp 1.850.000"; crossSell = "Google Ads / SEO Optimization";
    } else if (lowerMsg.includes("3") || lowerMsg.includes("toko online") || lowerMsg.includes("e-commerce")) {
      chosenService = "E-Commerce / Toko Online"; chosenPrice = "Mulai dari Rp 4.500.000"; crossSell = "FB Ads & Payment Gateway";
    } else if (lowerMsg.includes("4") || lowerMsg.includes("wordpress")) {
      chosenService = "Jasa Desain Website WordPress"; chosenPrice = "Mulai dari Rp 1.500.000"; crossSell = "SEO On-Page & Maintenance";
    } else if (lowerMsg.includes("5") || lowerMsg.includes("react")) {
      chosenService = "Custom React Web App"; chosenPrice = "Mulai dari Rp 9.999.000"; crossSell = "Google Cloud Platform Microservices";
    } else if (lowerMsg.includes("6") || lowerMsg.includes("seo")) {
      chosenService = "Optimasi SEO Website"; chosenPrice = "Mulai dari Rp 6.000.000"; crossSell = "PBN Backlinks & Artikel SEO";
    }

    if (chosenService) {
      nextContext.leadData.selectedService = chosenService;
      nextContext.leadData.selectedPrice = chosenPrice;
      nextContext.leadData.crossSellAddon = crossSell;
      nextContext.currentState = CHAT_STATES.STATE_4_LEAD_CAPTURE;

      return {
        text: `Pilihan yang sangat bagus! Kakak memilih paket **${chosenService}** (${chosenPrice}) 🎯.\n\n` +
          `💡 **Saran Kombinasi Biar Hasil Maksimal**: ${crossSell}.\n\n` +
          `Silakan klik tombol **"📝 Isi Form Data Lead"** di bawah ini untuk memasukkan data diri Kakak, sehingga rincian pesanan & invoice langsung terkirim otomatis ke WhatsApp Admin (+6281121211933)!`,
        nextContext,
        showLeadForm: true,
        quickReplies: ["📝 Isi Form Data Lead", "📱 Chat WA Admin Direct"]
      };
    }
  }

  // 1. DYNAMIC PRICE NEGOTIATOR & CUSTOM BUDGET ENGINE (Auto-Active on Nego Queries!)
  const isNegotiationQuery = 
    lowerMsg.includes("nawar") || lowerMsg.includes("nego") || lowerMsg.includes("kurang") || 
    lowerMsg.includes("budget") || lowerMsg.includes("buget") || lowerMsg.includes("anggaran") || lowerMsg.includes("700") || 
    lowerMsg.includes("800") || lowerMsg.includes("500") || lowerMsg.includes("750") || lowerMsg.includes("100") || 
    lowerMsg.includes("dp") || lowerMsg.includes("potongan") || lowerMsg.includes("diskon") || lowerMsg.includes("tawar");

  if (isNegotiationQuery) {
    let negoResponseText = "";

    if (lowerMsg.includes("700") || lowerMsg.includes("750") || lowerMsg.includes("800")) {
      negoResponseText = `Untuk **budget Rp 700.000 - Rp 800.000** bisa banget kami bantu Kak! 🤝\n\n` +
        `💡 **Penyesuaian Paket Solutif ADMS**:\n` +
        `• **Server**: Tetap menggunakan **Google Cloud Platform** super cepat & garansi SSL.\n` +
        `• **Desain**: Landing Page 1 Halaman konversi tinggi.\n` +
        `• **Masa Garansi Maintenance**: Disesuaikan dari 3 bulan jadi 1 bulan.\n\n` +
        `Penawaran khusus ini bisa langsung dikunci dan dikirimkan rincian in voicenya ke WhatsApp Admin **(+6281121211933)**!`;
      
      nextContext.leadData.selectedPrice = "Penyesuaian Budget Khusus (Rp 750.000)";
    } else if (lowerMsg.includes("dp") || lowerMsg.includes("bertahap")) {
      negoResponseText = `Bisa banget Kak! Di ADMS kami mendukung **Pembayaran Bertahap (DP 50% Awal)** 💳.\n\n` +
        `• **DP 50%**: Pengerjaan proyek langsung dimulai hari ini pada server Google Cloud Platform.\n` +
        `• **Pelunasan 50%**: Diberikan setelah proyek selesai & siap tayang online!\n\n` +
        `Silakan isi form data lead di bawah agar tim admin kami langsung buatkan invoice DP resminya!`;
    } else {
      negoResponseText = `Tentu bisa didiskusikan Kak! 😊\n\n` +
        `Di ADMS, kami sangat fleksibel menyesuaikan kebutuhan & budget bisnis Kakak. Kami menyediakan **Diskon Bundel Khusus 5-10%** (jika ambil Website + Ads) atau **Penyesuaian Fitur Kustom** agar sesuai kantong.\n\n` +
        `Mari isi form di bawah untuk kami jadwalkan konsultasi budget custom langsung dengan WA Admin Sales (+6281121211933)!`;
    }

    nextContext.currentState = CHAT_STATES.STATE_4_LEAD_CAPTURE;

    return {
      text: negoResponseText,
      nextContext,
      showLeadForm: true,
      quickReplies: ["📝 Isi Form Data Lead", "📱 Chat WA Admin Direct", "📊 Lihat Katalog Paket"]
    };
  }

  // STATE 5 HANDOVER / LEAD SUBMITTED ACKNOWLEDGEMENT
  if (lowerMsg.includes("data lead") || currentContext.currentState === CHAT_STATES.STATE_5_HANDOVER) {
    nextContext.currentState = CHAT_STATES.STATE_5_HANDOVER;
    const waUrl = generateWhatsAppLink(nextContext.leadData);

    return {
      text: `🎉 **Terima Kasih Banyak Kak ${nextContext.leadData.name || 'Mitra ADMS'}! Pesanan & Data Anda Siap Diproses!**\n\n` +
        `📋 **Ringkasan Pesanan & Konsultasi ADMS**:\n` +
        `• **Nama Klien**: ${nextContext.leadData.name || '-'}\n` +
        `• **Nama Bisnis**: ${nextContext.leadData.businessName || '-'}\n` +
        `• **No. WhatsApp**: ${nextContext.leadData.whatsapp || '-'}\n` +
        `• **Paket Pilihan**: ${nextContext.leadData.selectedService || nextContext.leadData.selectedCategory || 'Layanan Digital ADMS'}\n` +
        `• **Estimasi Harga**: ${nextContext.leadData.selectedPrice || 'Mulai dari harga dasar'}\n\n` +
        `📱 **Status**: Tab WhatsApp telah otomatis terbuka menuju WA Sales Admin **(+6281121211933)**.\n` +
        `*Jika tab WhatsApp tidak sengaja tertutup atau terblokir popup blocker, Anda bisa mengklik kembali tombol hijau di bawah ini.*`,
      nextContext,
      whatsappHandover: {
        url: waUrl,
        buttonText: "📱 Buka Ulang Chat WA Sales Admin (+6281121211933)",
        adminPhone: "+6281121211933"
      },
      quickReplies: ["📊 Lihat Katalog Layanan Lain", "🌐 Paket Website Lainnya", "📜 Paket Legalitas Usaha"]
    };
  }

  // Guardrail 1: Out-of-scope check
  const outOfScopeKeywords = ["resep", "masak", "politik", "presiden", "pemilu", "game", "ff", "ml", "slot", "cuaca", "pacar", "cinta"];
  if (outOfScopeKeywords.some(kw => lowerMsg.includes(kw))) {
    return {
      text: "Maaf Kak, saya adalah **AI Sales Consultant ADMS** yang khusus memberikan solusi digital marketing, pembuatan website, iklan online, & legalitas usaha 🚀.\n\nAda layanan website, iklan Ads, atau legalitas NIB/PT yang ingin Kakak tanyakan?",
      nextContext,
      quickReplies: ["🌐 Buat Website Baru", "📢 Pasang Iklan Google/Meta", "📜 Legalitas NIB / PT", "📊 Lihat Katalog Harga"]
    };
  }

  // Guardrail 2: Discount & Nego queries
  const discountKeywords = ["diskon", "potongan", "nego", "kurang", "murah lagi", "bisa tawar", "promo khusus"];
  if (discountKeywords.some(kw => lowerMsg.includes(kw))) {
    return {
      text: "Untuk **promo potongan harga khusus** atau **konsultasi custom budget**, nanti bisa disesuaikan dan dinegosiasikan langsung saat diskusi dengan **Tim Sales Kami di WhatsApp (+6281121211933)** ya Kak! 😊\n\nSemua harga dasar kami sangat transparan dan sudah mencakup performa server Google Cloud Platform serta garansi.",
      nextContext,
      quickReplies: ["📱 Chat WA Admin Sekarang", "📊 Lihat Katalog Paket", "💡 Minta Rekomendasi"]
    };
  }

  // Company Info Queries
  if (lowerMsg.includes("alamat") || lowerMsg.includes("kantor") || lowerMsg.includes("lokasi")) {
    return {
      text: `📍 **Alamat Kantor Resmi PT. ADMS**:\n${ADMS_INFO.address}\n\n 📧 Email: ${ADMS_INFO.email}\n📞 WA Admin: ${ADMS_INFO.whatsappNumbers.join(' / ')}\n\nKantor pusat kami berlokasi di Bandung, Jawa Barat, melayani 2500+ klien di seluruh Indonesia sejak 2011!`,
      nextContext,
      quickReplies: ["📊 Lihat Katalog Layanan", "💬 Konsultasi Kebutuhan Saya"]
    };
  }

  // GENERAL CATEGORY QUERIES
  if (lowerMsg.includes("legalitas usaha") || lowerMsg.includes("info legalitas") || lowerMsg.includes("izin usaha")) {
    nextContext.leadData.selectedCategory = "Legalitas & Perizinan Bisnis";
    nextContext.currentState = CHAT_STATES.STATE_3_RECOMMENDATION;

    return {
      text: `📜 **Katalog Harga Resmi Layanan Legalitas & Perizinan Bisnis ADMS**:\n\n` +
        `1️⃣ **Legalitas Usaha & NIB UMKM**: Mulai dari **Rp 1.000.000**\n` +
        `2️⃣ **Pendirian CV Legal**: Mulai dari **Rp 2.500.000**\n` +
        `3️⃣ **Pendirian PT Resmi**: Mulai dari **Rp 2.500.000**\n\n` +
        `💡 *Klik tombol pilihan di bawah untuk memproses penawaran!*`,
      nextContext,
      quickReplies: [
        "1️⃣ Legalitas NIB (Rp 1 Jt)", 
        "2️⃣ Pendirian CV (Rp 2.5 Jt)", 
        "3️⃣ Pendirian PT (Rp 2.5 Jt)", 
        "📝 Isi Form Data Lead"
      ],
      showLeadTrigger: true
    };
  }

  if (lowerMsg.includes("info website") || lowerMsg.includes("paket website") || lowerMsg.includes("buat website baru")) {
    nextContext.leadData.selectedCategory = "Website & Development";
    nextContext.currentState = CHAT_STATES.STATE_3_RECOMMENDATION;

    return {
      text: `🌐 **Katalog Harga Resmi Pembuatan Website ADMS**:\n\n` +
        `1️⃣ **Landing Page Conversion**: Mulai dari **Rp 999.000** (Fokus tinggi konversi iklan).\n` +
        `2️⃣ **Company Profile Corporate**: Mulai dari **Rp 1.850.000** (Web profil perusahaan & branding).\n` +
        `3️⃣ **E-Commerce / Toko Online**: Mulai dari **Rp 4.500.000** (Payment gateway & ongkir otomatis).\n` +
        `4️⃣ **Jasa Desain Website WordPress**: Mulai dari **Rp 1.500.000** (Desain custom SEO friendly).\n` +
        `5️⃣ **Custom React Web App**: Mulai dari **Rp 9.999.000** (Aplikasi web modern, fast & scalable).\n` +
        `6️⃣ **Optimasi SEO Website**: Mulai dari **Rp 6.000.000** (Tembus rangking 1 Google On-Page).\n\n` +
        `✨ *Klik tombol pilihan di bawah untuk memilih paket yang Anda inginkan (Semua 6 pilihan lengkap)!*`,
      nextContext,
      quickReplies: [
        "1️⃣ Landing Page (Rp 999rb)",
        "2️⃣ Company Profile (Rp 1.85Jt)",
        "3️⃣ Toko Online (Rp 4.5Jt)",
        "4️⃣ Desain WordPress (Rp 1.5Jt)",
        "5️⃣ Custom React App (Rp 9.99Jt)",
        "6️⃣ Optimasi SEO (Rp 6Jt)",
        "📝 Isi Form Data Lead"
      ],
      showLeadTrigger: true
    };
  }

  // DIRECT CATALOG SELECTION (Triggered when user clicks a service from Catalog Modal)
  if (lowerMsg.includes("tertarik") || lowerMsg.includes("pilih paket") || lowerMsg.includes("ambil paket")) {
    nextContext.leadData.selectedService = userMessage;
    nextContext.leadData.selectedPrice = "Mulai dari harga katalog resmi";
    nextContext.currentState = CHAT_STATES.STATE_4_LEAD_CAPTURE;

    return {
      text: `Pilihan yang sangat tepat Kak! 👍\n\nUntuk memproses penawaran paket **${userMessage}** ini dan mengirimkan **invoice rincian / link pembayaran ke WhatsApp Admin (+6281121211933)**, silakan isi data singkat di bawah ini:`,
      nextContext,
      showLeadForm: true,
      quickReplies: ["📝 Isi Form Data Lead", "📱 Langsung Chat WA Admin"]
    };
  }

  // DEFAULT FALLBACK WITH ALL TOP OPTIONS
  return {
    text: `Saya paham Kak! Berikut pilihan paket terbaik yang paling banyak dipilih di ADMS:\n\n` +
      `• 1️⃣ **Landing Page Conversion**: Rp 999.000\n` +
      `• 2️⃣ **Company Profile Corporate**: Rp 1.850.000\n` +
      `• 3️⃣ **E-Commerce / Toko Online**: Rp 4.500.000\n` +
      `• 4️⃣ **Legalitas NIB UMKM**: Rp 1.000.000\n` +
      `• 5️⃣ **Google / Meta Ads**: Rp 350.000\n` +
      `• 6️⃣ **Pendirian PT Resmi**: Rp 2.500.000\n\n` +
      `Silakan ketik tawar harga / budget Anda atau klik tombol chip di bawah ini!`,
    nextContext,
    quickReplies: [
      "1️⃣ Landing Page (Rp 999rb)", 
      "2️⃣ Company Profile (Rp 1.85Jt)", 
      "3️⃣ Toko Online (Rp 4.5Jt)", 
      "4️⃣ Legalitas NIB (Rp 1Jt)", 
      "5️⃣ Google Ads (Rp 350rb)", 
      "6️⃣ Pendirian PT (Rp 2.5Jt)"
    ]
  };
}
