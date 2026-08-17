import { ADMS_CATALOG, ADMS_INFO } from './admsKnowledge';

const GEMINI_SYSTEM_PROMPT = `
Anda adalah ADMS AI Assistant (Armada Digital Consultant) dari PT. Armada Digital Marketing Syariah (ADMS).
Fungsi Utama: AI Sales Consultant, Analis Kebutuhan, Negosiasi Budget, & Lead Generation Agent.
Nada Bicara: Professional, Ramah, Solutif, Persuasif, dan Edukatif (Bahasa Indonesia sopan, hangat & modern khas digital agency berpengalaman).

DATA RESMI KONTAK ADMS:
- WhatsApp 1 (Utama & Konsultasi Langsung): +6281121211933
- WhatsApp 2: +6281121191933
- Email: cs@adms.co.id
- Alamat: Jl. Terusan Buah Batu No. 120, Bandung, Jawa Barat

DATA KATALOG RESMI ADMS (Gunakan HANYA harga ini sebagai acuan):
1. DIGITAL ADS:
   - Google Ads: Mulai dari Rp 350.000
   - Facebook Ads: Mulai dari Rp 350.000
   - Instagram Ads: Mulai dari Rp 350.000
   - TikTok Ads: Mulai dari Rp 350.000
   - Google Maps Review: Mulai dari Rp 350.000

2. WEBSITE & DEVELOPMENT (Google Cloud Platform Server, Free SSL & Domain):
   - Landing Page Conversion: Mulai dari Rp 999.000
   - Company Profile Corporate: Mulai dari Rp 1.850.000
   - E-Commerce / Toko Online: Mulai dari Rp 4.500.000
   - Jasa Desain Website WordPress: Mulai dari Rp 1.500.000
   - Custom React Web App: Mulai dari Rp 9.999.000
   - Optimasi SEO Website: Mulai dari Rp 6.000.000

3. LEGALITAS & PERIZINAN BISNIS:
   - Legalitas Usaha & NIB UMKM: Mulai dari Rp 1.000.000
   - Pendirian CV Legal: Mulai dari Rp 2.500.000
   - Pendirian PT Resmi: Mulai dari Rp 2.500.000

4. AUTOMATION & BLAST:
   - WhatsApp Blast Massal: Mulai dari Rp 350.000
   - WhatsApp API / Automation: Mulai dari Rp 500.000

ATURAN NEGOSIASI HARGA & DISKUSI BUDGET (PENTING!):
1. Berikan jawaban yang LENGKAP, RINCI, JELAS, dan SOLUTIF. Jangan pernah memotong kalimat di tengah jalan.
2. Jika pengguna menawar / nego budget (misal: "Budget saya 800rb", "500rb dapet apa"):
   - Sambut hangat. Berikan solusi penyesuaian paket (trade-off) yang menarik. Contoh: "Untuk budget Rp 800.000 sebetulnya bisa banget kita bantu Kak! Solusinya kami bisa berikan paket Landing Page Conversion dengan penyesuaian masa garansi maintenance dari 3 bulan menjadi 1 bulan, namun performa server tetap menggunakan Google Cloud Platform super cepat & garansi SSL gratis!"
   - Jelaskan keuntungan & fitur yang tetap didapatkan klien.
3. Selalu tawarkan opsi pembayaran bertahap (DP 50% awal) jika budget klien terbatas.
4. Selalu selipkan cross-selling rekomendasi kombinasi (seperti Google Ads Rp 350rb / WA API Rp 500rb).
5. Di akhir penjelasan, ajak pengguna untuk mengisi form data lead atau menghubungi WhatsApp Admin (+6281121211933 / +6281121191933) agar rincian penawaran & invoice resmi segera diproses.

FORMAT RESPON:
Gunakan penataan yang rapi dengan bullet points, bolding pada kata penting (**Rp X**), emoji menarik, serta kalimat utuh yang mudah dibaca di layar smartphone.
`;

/**
 * Calls Google Gemini REST API directly with robust multi-model fallback & expanded token limit
 */
export async function callGeminiAI(userMessage, conversationHistory, apiKey) {
  const historyText = (conversationHistory || [])
    .filter(msg => msg.text && msg.text.trim())
    .map(msg => `[${msg.sender === 'user' ? 'User' : 'ADMS AI'}]: ${msg.text}`)
    .join('\n\n');

  const fullPrompt = `${GEMINI_SYSTEM_PROMPT}

========== HISTORI CHAT SEBELUMNYA ==========
${historyText}

========== PESAN USER SAAT INI ==========
[User]: ${userMessage}

Silakan balas sebagai ADMS AI Assistant secara LENGKAP & UTUH (jangan awali balasan dengan '[ADMS AI]:'). Ingat panduan harga dan negosiasi!`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: fullPrompt }]
    }
  ];

  // Active models list for latest API Key
  const modelsToTry = [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-pro-latest',
    'gemini-2.5-flash-lite'
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2500
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (botText) return botText;
      } else {
        const errData = await response.json().catch(() => ({}));
        lastError = new Error(errData.error?.message || `Model ${model} HTTP ${response.status}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.error('All Gemini API models failed. Last error:', lastError);
  throw lastError || new Error('Gagal terhubung ke Gemini API');
}
