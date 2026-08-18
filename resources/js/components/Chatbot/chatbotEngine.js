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
 * Generates automated structured WhatsApp URL for complete orders
 */
export function generateWhatsAppOrderLink(orderData) {
  const { orderId, name, businessName, whatsapp, serviceName, servicePrice, notes, hasPaymentProof, paymentProofFileName } = orderData;
  const adminNumber = ADMS_INFO.primaryWhatsappTarget || '6281121211933';

  const text = `Halo Admin Sales ADMS! 👋
Saya ingin mengonfirmasi pesanan layanan dari website ADMS:

📋 *KONFIRMASI PESANAN RESMI ADMS*
• *No. Pesanan*: ${orderId || 'ADMS-ORD-NEW'}
• *Nama Pemesan*: ${name || 'Klien ADMS'}

🎯 *Layanan Dipilih*: ${serviceName || 'Layanan Digital ADMS'}
💵 *Estimasi Investasi*: ${servicePrice || 'Sesuai Paket'}

Mohon konfirmasi pesanan, nomor rekening tujuan, dan kirimkan informasi langkah pengerjaannya ya Min. Terima kasih!`;

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates automated structured WhatsApp URL with consultation breakdown
 */
export function generateWhatsAppLink(leadData) {
  const { name, businessName, whatsapp, selectedCategory, selectedService, selectedPrice, crossSellAddon } = leadData;
  const adminNumber = ADMS_INFO.primaryWhatsappTarget || '6281121211933';

  const text = `Halo Admin Sales ADMS! 👋

📋 *KONSULTASI & PESANAN LAYANAN ADMS*:
• *Nama Klien*: ${name || 'Calon Klien'}
• *Nama Usaha*: ${businessName || 'Usaha Saya'}
• *No. WhatsApp*: ${whatsapp || '-'}

🎯 *Paket Pilihan*: ${selectedService || selectedCategory || 'Layanan Digital ADMS'}
💵 *Harga Dasar*: ${selectedPrice || 'Mulai dari harga katalog'}
*Rekomendasi Tambahan*: ${crossSellAddon || 'Google Ads / WA API Automation'}
✨ *Spesifikasi*: Server Google Cloud Platform (Garansi SSL & Maintenance)

Mohon informasikan rincian penawaran & invoice resmi ya Min. Terima kasih!`;

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Intelligent NLP, Option Parsing & State Machine Engine
 */
export function processUserMessage(userMessage, currentContext) {
  const lowerMsg = userMessage.trim().toLowerCase();
  const nextContext = { 
    ...currentContext, 
    leadData: { ...currentContext.leadData },
    needsData: { ...currentContext.needsData }
  };

  // 1. Handling Direct Order Confirmation / Data Terkirim
  if (lowerMsg.includes('[data terkirim]') || lowerMsg.includes('[pesanan terkirim]')) {
    nextContext.currentState = CHAT_STATES.STATE_5_HANDOVER;
    const waUrl = generateWhatsAppLink(nextContext.leadData);
    
    return {
      text: `Terima kasih! Pesanan Anda telah berhasil tercatat di sistem kami.\n\n` +
        `Data Anda telah diteruskan ke WhatsApp 1 (+6281121211933) Tim Sales Admin ADMS.\n\n` +
        `• WhatsApp 1: +6281121211933 *(Utama & Terhubung)*\n` +
        `• WhatsApp 2: +6281121211933\n\n` +
        `Silakan klik tombol di bawah jika WhatsApp tidak terbuka otomatis:`,
      quickReplies: ['Hubungi CS via WA', 'Buka Katalog Semua Layanan', 'Reset Konsultasi'],
      whatsappHandover: { url: waUrl },
      nextContext
    };
  }

  // 1b. Handling Direct WA Chat requests
  if (lowerMsg.includes('chat wa') || lowerMsg.includes('konsultasi ke wa') || lowerMsg.includes('hubungi cs')) {
    nextContext.currentState = CHAT_STATES.STATE_5_HANDOVER;
    const waUrl = generateWhatsAppLink(nextContext.leadData);
    
    return {
      text: `Sedang mengalihkan ke WhatsApp... Jika tidak otomatis terbuka, silakan klik tombol di bawah.`,
      whatsappHandover: { url: waUrl },
      nextContext
    };
  }

  // 1c. Handling Specific Service Quick Replies (Starts with 1., 2., dll)
  const quickReplyMatch = userMessage.trim().match(/^([1-9]\.)\s*(.*)$/);
  if (quickReplyMatch) {
    const serviceString = quickReplyMatch[2];
    nextContext.currentState = CHAT_STATES.STATE_3_RECOMMENDATION;
    nextContext.leadData.selectedService = serviceString;
    
    return {
      text: `Pilihan Bagus! Anda memilih paket: \n**${serviceString}**\n\n` +
        `Untuk mempercepat proses, silakan langsung isi Form Konfirmasi Pesanan di bawah ini, atau hubungi CS kami jika ada pertanyaan lebih lanjut.`,
      quickReplies: ['Isi Form Konfirmasi Pesanan', 'Chat WA 1 Admin', 'Buka Katalog Semua Layanan'],
      showOrderForm: true,
      showOrderTrigger: true,
      selectedService: serviceString,
      nextContext
    };
  }

  // 1d. Handling Catalog Selections ("Saya tertarik dengan paket...")
  const catalogMatch = userMessage.match(/saya tertarik dengan paket (.*?) \((.*?)\)/i);
  if (catalogMatch) {
    const serviceName = catalogMatch[1];
    nextContext.currentState = CHAT_STATES.STATE_3_RECOMMENDATION;
    nextContext.leadData.selectedService = serviceName;
    
    return {
      text: `Pilihan Bagus! Anda memilih paket: \n**${serviceName}**\n\n` +
        `Untuk mempercepat proses, silakan langsung isi Form Konfirmasi Pesanan di bawah ini, atau hubungi CS kami jika ada pertanyaan lebih lanjut.`,
      quickReplies: ['Isi Form Konfirmasi Pesanan', 'Chat WA 1 Admin', 'Buka Katalog Semua Layanan'],
      showOrderForm: true,
      showOrderTrigger: true,
      selectedService: serviceName,
      nextContext
    };
  }

  // 2. Kategori: Website & Development
  if (lowerMsg.includes('website') || lowerMsg.includes('landing page') || lowerMsg.includes('company profile') || lowerMsg.includes('toko online') || lowerMsg.includes('react') || lowerMsg.includes('pbn') || lowerMsg.includes('seo') || lowerMsg.includes('hosting')) {
    nextContext.leadData.selectedCategory = "Website & Development";
    nextContext.currentState = CHAT_STATES.STATE_2_NEEDS;

    if (lowerMsg.includes('landing')) {
      nextContext.leadData.selectedService = "Landing Page Conversion";
      nextContext.leadData.selectedPrice = "**Rp 999.000**";
      nextContext.leadData.crossSellAddon = "Google Ads (**Rp 350.000**)";
      nextContext.currentState = CHAT_STATES.STATE_3_RECOMMENDATION;
      
      return {
        text: `**Paket Terpilih: Landing Page Conversion **(**Rp 999.000**)\n\n` +
          `Pilihan tepat untuk mendongkrak penjualan & konversi iklan produk!\n\n` +
          `• Server: Google Cloud Platform Ultra Fast\n` +
          `• Gratis: Domain (.com/.id) & SSL Certificate\n` +
          `• Desain: 100% Mobile Friendly & Copywriting Persuasif\n` +
          `• Garansi: Free Maintenance & Pendampingan Rutin\n\n` +
          `Saran Kombinasi: Tambahkan Google Ads (**Rp 350.000**) agar landing page langsung kebanjiran pembeli!`,
        quickReplies: ['Isi Form Konfirmasi Pesanan', 'Konsultasi ke WA 1 Admin', 'Lihat Paket Website Lain'],
        showOrderForm: true,
        showOrderTrigger: true,
        selectedService: "Landing Page Conversion",
        nextContext
      };
    }

    if (lowerMsg.includes('company') || lowerMsg.includes('profil')) {
      nextContext.leadData.selectedService = "Company Profile Corporate";
      nextContext.leadData.selectedPrice = "**Rp 1.850.000**";
      nextContext.currentState = CHAT_STATES.STATE_3_RECOMMENDATION;
      
      return {
        text: `**Paket Terpilih: Company Profile Corporate **(**Rp 1.850.000**)\n\n` +
          `Tingkatkan kredibilitas & prestise perusahaan Anda di mata calon klien & investor!\n\n` +
          `• Halaman: Home, About Us, Services, Portfolio, Contact Us\n` +
          `• Email Bisnis: Email domain profesional (nama@perusahaan.com)\n` +
          `• Server: Google Cloud Platform Cepat & Aman\n` +
          `• Legalitas: Siap digunakan untuk pengajuan tender / izin resmi`,
        quickReplies: ['Isi Form Konfirmasi Pesanan', 'Konsultasi ke WA 1 Admin', 'Lihat Paket Website Lain'],
        showOrderForm: true,
        showOrderTrigger: true,
        selectedService: "Company Profile Corporate",
        nextContext
      };
    }

    if (lowerMsg.includes('toko') || lowerMsg.includes('e-commerce') || lowerMsg.includes('commerce')) {
      nextContext.leadData.selectedService = "E-Commerce / Toko Online";
      nextContext.leadData.selectedPrice = "**Rp 4.500.000**";
      nextContext.currentState = CHAT_STATES.STATE_3_RECOMMENDATION;
      
      return {
        text: `**Paket Terpilih: E-Commerce / Toko Online **(**Rp 4.500.000**)\n\n` +
          `Sistem toko online mandiri bebas biaya potongan komisi marketplace!\n\n` +
          `• Payment Gateway: Otomatis transfer bank, QRIS, e-Wallet\n` +
          `• Cek Ongkir: Otomatis terintegrasi JNE, J&T, SiCepat, dll\n` +
          `• Dashboard Produk: Manajemen stok & pesanan mudah dari HP\n` +
          `• Performa: Server Google Cloud Platform stabil trafik tinggi`,
        quickReplies: ['Isi Form Konfirmasi Pesanan', 'Konsultasi ke WA 1 Admin', 'Buka Katalog Semua Layanan'],
        showOrderForm: true,
        showOrderTrigger: true,
        selectedService: "E-Commerce / Toko Online",
        nextContext
      };
    }

    return {
      text: `Layanan Website & Development PT. ADMS\n\n` +
        `Semua website kami dibangun menggunakan server Google Cloud Platform, gratis domain, SSL keamanan, dan garansi maintenance:\n\n` +
        `1. Landing Page Conversion — **Rp 999.000**\n` +
        `2. Company Profile Corporate — **Rp 1.850.000**\n` +
        `3. Jasa Desain WordPress — **Rp 1.500.000**\n` +
        `4. E-Commerce / Toko Online — **Rp 4.500.000**\n` +
        `5. Custom React Web App — **Rp 9.999.000**\n` +
        `6. Jasa Blog PBN — **Rp 999.000**\n` +
        `7. Optimasi SEO Google Index — **Rp 6.000.000**\n` +
        `8. Maintenance / Admin Web — **Rp 2.999.000**\n\n` +
        `Silakan pilih jenis website yang sesuai dengan kebutuhan Anda:`,
      quickReplies: [
        '1. Landing Page (Rp 999rb)',
        '2. Company Profile (Rp 1.85Jt)',
        '3. Toko Online (Rp 4.5Jt)',
        '4. Desain WordPress (Rp 1.5Jt)',
        '5. Custom React App (Rp 9.99Jt)',
        'Buka Katalog Semua Layanan'
      ],
      nextContext
    };
  }

  // 3. Kategori: Digital Ads (Iklan Digital)
  if (lowerMsg.includes('iklan') || lowerMsg.includes('ads') || lowerMsg.includes('google ads') || lowerMsg.includes('meta') || lowerMsg.includes('tiktok') || lowerMsg.includes('maps review')) {
    nextContext.leadData.selectedCategory = "Digital Ads";
    nextContext.currentState = CHAT_STATES.STATE_2_NEEDS;

    return {
      text: `Layanan Digital Ads (Iklan Digital Tertarget)\n\n` +
        `Tingkatkan jangkauan audiens & banjir calon pembeli dengan tim media buyer bersertifikasi ADMS:\n\n` +
        `• Google Ads — Mulai **Rp 350.000** (Jangkau orang yang sedang cari produk Anda)\n` +
        `• Facebook Ads — Mulai **Rp 350.000** (Targeting demografi, usia & minat spesifik)\n` +
        `• Instagram Ads — Mulai **Rp 350.000** (Format feed, reels & story visual menarik)\n` +
        `• TikTok Ads — Mulai **Rp 350.000** (Video promosi viral ke audiens masif)\n` +
        `• Google Maps Review — Mulai **Rp 350.000** (Tingkatkan rating bintang 5 & trust)\n\n` +
        `Platform mana yang ingin Anda gunakan untuk beriklan?`,
      quickReplies: [
        '1. Google Ads (Rp 350rb)',
        '2. Facebook & IG Ads (Rp 350rb)',
        '3. TikTok Ads (Rp 350rb)',
        '4. Google Maps Review (Rp 350rb)',
        'Isi Form Konfirmasi Pesanan'
      ],
      nextContext
    };
  }

  // 4. Kategori: WhatsApp & Automation Services
  if (lowerMsg.includes('blast') || lowerMsg.includes('centang hijau') || lowerMsg.includes('sms broadcast') || lowerMsg.includes('bot')) {
    nextContext.leadData.selectedCategory = "WhatsApp & Automation Services";
    nextContext.currentState = CHAT_STATES.STATE_2_NEEDS;

    return {
      text: `Layanan WhatsApp & Automation Services\n\n` +
        `Kirim pesan promosi massal & otomatisasi sistem respon pelanggan:\n\n` +
        `• WhatsApp Broadcast / Blast — Mulai **Rp 350.000**\n` +
        `• Jasa WA Official (Centang Hijau / Green Badge) — Hubungi Admin\n` +
        `• Jasa WA Non-Official — Hubungi Admin\n` +
        `• WhatsApp API / Bot Automation — Mulai **Rp 500.000**\n` +
        `• SMS Broadcast Promo — Mulai **Rp 350.000**\n\n` +
        `Paket otomatisasi apa yang Anda butuhkan?`,
      quickReplies: [
        '1. WA Blast Massal (Rp 350rb)',
        '2. WA Official Centang Hijau',
        '3. WA API Automation (Rp 500rb)',
        'Isi Form Konfirmasi Pesanan'
      ],
      nextContext
    };
  }

  // 5. Kategori: Marketing & Distribution
  if (lowerMsg.includes('artikel') || lowerMsg.includes('sms masking') || lowerMsg.includes('posting 1000') || lowerMsg.includes('backlink') || lowerMsg.includes('brosur') || lowerMsg.includes('press release')) {
    nextContext.leadData.selectedCategory = "Marketing & Distribution";
    nextContext.currentState = CHAT_STATES.STATE_2_NEEDS;

    return {
      text: `Layanan Marketing & Distribution\n\n` +
        `Perluas jangkauan promosi dengan jaringan publikasi luas dari ADMS:\n\n` +
        `• Artikel SEO Berkualitas — Mulai **Rp 99.000** / artikel\n` +
        `• SMS Masking Sender ID Perusahaan — **Rp 1.000** / pesan (Min 10.000)\n` +
        `• Posting 1000 Website — Mulai **Rp 399.000**\n` +
        `• Backlink PBN Premium — Mulai **Rp 8.500.000**\n` +
        `• Sebar Brosur Fisik — Mulai **Rp 350.000**\n` +
        `• Press Release Media Nasional — Mulai **Rp 999.000**`,
      quickReplies: [
        '1. Artikel SEO (Rp 99rb)',
        '2. Posting 1000 Web (Rp 399rb)',
        '3. Press Release (Rp 999rb)',
        'Isi Form Konfirmasi Pesanan'
      ],
      nextContext
    };
  }

  // 6. Kategori: Social Media Management
  if (lowerMsg.includes('sosmed') || lowerMsg.includes('social media') || lowerMsg.includes('content') || lowerMsg.includes('konten')) {
    nextContext.leadData.selectedCategory = "Social Media Management";
    nextContext.currentState = CHAT_STATES.STATE_2_NEEDS;

    return {
      text: `Layanan Social Media Management ADMS\n\n` +
        `Bangun branding profesional dan raih ribuan followers aktif:\n\n` +
        `• Kelola Sosmed Bulanan — Mulai **Rp 2.500.000** (Jadwal posting, riset hashtag & caption)\n` +
        `• Content Creation (Desain Grafis & Video Reels) — Mulai **Rp 2.999.000**\n\n` +
        `Ingin akun media sosial bisnis Anda dikelola profesional oleh tim ADMS?`,
      quickReplies: [
        '1. Kelola Sosmed Bulanan (Rp 2.5Jt)',
        '2. Content Creation Video (Rp 2.999Jt)',
        'Isi Form Konfirmasi Pesanan',
        'Chat WA 1 Admin'
      ],
      nextContext
    };
  }

  // 7. Kategori: Legalitas & Perizinan Bisnis
  if (lowerMsg.includes('legalitas') || lowerMsg.includes('nib') || lowerMsg.includes('pt') || lowerMsg.includes('cv') || lowerMsg.includes('izin')) {
    nextContext.leadData.selectedCategory = "Legal & Perizinan Bisnis";
    nextContext.currentState = CHAT_STATES.STATE_2_NEEDS;

    return {
      text: `Layanan Legalitas & Perizinan Bisnis ADMS\n\n` +
        `Proses resmi, aman, transparan & langsung terdaftar di sistem Kemenkumham & OSS RBA:\n\n` +
        `• Pendirian PT (Perseroan Terbatas) — Mulai **Rp 2.500.000**\n` +
        `• Pendirian CV (Persekutuan Komanditer) — Mulai **Rp 2.500.000**\n` +
        `• Legalitas Usaha / NIB UMKM — Mulai **Rp 1.000.000**\n\n` +
        `Layanan legalitas apa yang sedang Anda butuhkan?`,
      quickReplies: [
        '1. Legalitas NIB (Rp 1 Jt)',
        '2. Pendirian CV (Rp 2.5 Jt)',
        '3. Pendirian PT (Rp 2.5 Jt)',
        'Isi Form Konfirmasi Pesanan'
      ],
      nextContext
    };
  }

  // 8. Kategori: Layanan Offline & Konstruksi
  if (lowerMsg.includes('pindahan') || lowerMsg.includes('konstruksi') || lowerMsg.includes('offline') || lowerMsg.includes('bangun')) {
    nextContext.leadData.selectedCategory = "Layanan Offline & Konstruksi";
    nextContext.currentState = CHAT_STATES.STATE_2_NEEDS;

    return {
      text: `Layanan Offline & Konstruksi ADMS\n\n` +
        `Dukungan operasional & pembangunan fisik berkualitas tinggi:\n\n` +
        `• Pindahan Rumah & Kantor — Hubungi Admin\n` +
        `• Konstruksi Komersil — **Rp 5.000.000** / m²\n` +
        `• Konstruksi Luxury — **Rp 7.000.000** / m²\n\n` +
        `Silakan isi form pesanan atau hubungi CS kami untuk konsultasi survey lokasi:`,
      quickReplies: [
        '1. Konstruksi Komersil',
        '2. Konstruksi Luxury',
        '3. Pindahan Rumah',
        'Isi Form Konfirmasi Pesanan',
        'Chat WA 1 Admin'
      ],
      nextContext
    };
  }

  // 9. Buka Katalog / Reset Action
  if (lowerMsg.includes('katalog') || lowerMsg.includes('harga') || lowerMsg.includes('layanan')) {
    return {
      text: `Katalog Lengkap Layanan & Harga Resmi PT. ADMS\n\n` +
        `Kami menyediakan 7 kategori layanan lengkap:\n` +
        `1. Digital Ads (Mulai **Rp 350**rb)\n` +
        `2. Website & Dev (Mulai **Rp 999**rb - Google Cloud Server)\n` +
        `3. WhatsApp & Automation (Mulai **Rp 350**rb)\n` +
        `4. Marketing & Distribution (Mulai **Rp 99**rb)\n` +
        `5. Social Media Management (Mulai **Rp 2**.5Jt)\n` +
        `6. Legalitas NIB / PT / CV (Mulai **Rp 1**Jt)\n` +
        `7. Layanan Offline & Konstruksi\n\n` +
        `Klik tombol Buka Katalog Semua Layanan untuk melihat daftar harga lengkap dan spesifikasinya.`,
      quickReplies: [
        'Buka Katalog Semua Layanan',
        'Paket Pembuatan Website',
        'Pasang Iklan Google / Ads',
        'Legalitas NIB / PT'
      ],
      nextContext
    };
  }

  // Default fallback response
  return {
    text: `Halo! Saya siap membantu memberikan rekomendasi paket terbaik untuk bisnis Anda.\n\n` +
      `Silakan pilih salah satu layanan kami di bawah atau klik Buka Katalog Semua Layanan:`,
    quickReplies: [
      'Paket Pembuatan Website',
      'Pasang Iklan Google / Ads',
      'Legalitas NIB / PT',
      'Buka Katalog Semua Layanan'
    ],
    nextContext
  };
}
