
# ADMS (Armada Digital Marketing System) - Homepage Design Reference Prompt

Dokumen ini berisi panduan desain UI/UX dan prompt AI (seperti untuk Midjourney, v0.dev, Claude, atau frontend builder lainnya) untuk merancang halaman utama (Homepage) platform ADMS yang premium, modern, dan berkonversi tinggi.

---

## 🎨 Konsep Desain Utama (Design System)

* **Tema & Estetika**: Premium Dark/Light mode modern dengan sentuhan glassmorphism, warna gradien halus, bayangan lembut, dan mikro-animasi pada tombol/kartu.
* **Palet Warna Utama (Harmonious Palette)**:
  * *Primary/Brand*: Emerald/Teal Syariah Modern (`#0D9488` / HSL 174, 84%, 37%) - melambangkan pertumbuhan finansial dan syariat.
  * *Secondary/Accent*: Deep Indigo (`#4F46E5` / HSL 243, 75%, 59%) - melambangkan teknologi digital dan profesionalisme.
  * *Background*: Sleek Dark Mode (Neutral-900 `#111827`) atau Pure Light Mode (Neutral-50 `#F9FAFB`).
* **Tipografi**: Menggunakan font modern tanpa kait seperti **Inter** atau **Outfit** untuk keterbacaan tingkat tinggi.

---

## 💻 Panduan Struktur Halaman Utama (Homepage Layout Structure)

### 1. Navigation Bar (Header)

* **Sisi Kiri**: Logo ADMS dengan ikon perisai/digital bergaya minimalis.
* **Tengah**: Bilah pencarian (*search bar*) multifungsi untuk mencari produk digital atau iklan baris secara langsung.
* **Sisi Kanan**: Link menu (Marketplace, Iklan Baris, Daftar Toko, Bantuan) dan Tombol Akses (Masuk / Daftar). Jika sudah login, tampilkan avatar dropdown menu menuju Dashboard.

### 2. Hero Section (First Fold)

* **Elemen Visual**: Latar belakang gradien mesh gelap yang mewah dengan aksen lampu neon lembut. Terdapat ilustrasi 3D bertema marketplace/produk digital melayang di sisi kanan.
* **Copywriting Utama**:
  * *Headline*: "Pusat Produk Digital & Iklan Baris Terbesar, Amanah, dan Syariah."
  * *Sub-headline*: "Temukan ribuan template Canva, Ebook, Source Code, AI Prompt, dan pasang iklan gratis atau premium untuk dongkrak penjualan Anda secara instan."
* **Call-to-Action (CTA)**:
  * Tombol Utama: "Mulai Berbelanja" (Primary Teal button dengan efek hover glow).
  * Tombol Kedua: "Pasang Iklan Gratis" (Outline Indigo button).
* **Stats Floating Cards**: Menampilkan statistik statistik real-time seperti "12,000+ Produk Digital", "5,500+ Iklan Aktif", "99.8% Transaksi Sukses".

### 3. Quick Category Navigation

* Grid berisi kartu kategori dengan ikon interaktif (hover effect scale-up):
  1. **Template Canva**: Ikon kuas/palet seni.
  2. **E-Book & Panduan**: Ikon buku terbuka.
  3. **Software & Source Code**: Ikon tag kode `</>`.
  4. **Prompt AI (ChatGPT/Midjourney)**: Ikon microchip/otak bercahaya.
  5. **Course & Edukasi**: Ikon topi wisuda/video tutorial.
  6. **Iklan Baris (Classified Ads)**: Ikon megafon/pengeras suara.

### 4. Marketplace - Featured Products Section

* Grid produk digital premium terpopuler dengan layout kartu modern.
* **Detail Kartu Produk**:
  * Gambar produk (*thumbnail*) berkualitas tinggi dengan efek border radius lengkung.
  * Kategori tag kecil di atas judul.
  * Judul produk tebal (maksimal 2 baris).
  * Rating bintang kuning beserta jumlah ulasan pembeli (misal: ⭐ 4.9 (120)).
  * Nama merchant/toko dengan **badge sertifikasi syariah** (jika terverifikasi).
  * Harga produk (Fixed / Starting From).
  * Tombol "Beli Instan" (ikon keranjang mini).

### 5. Advertising - VIP & Featured Ads Showcase

* Tampilan baris iklan premium yang di-boost oleh pengiklan.
* Desain kartu iklan memiliki border gradien bergerak halus (*animated gradient border*) untuk menarik perhatian customer.
* Terdapat label khusus **"VIP Premium"** atau **"Featured"**.
* Menampilkan informasi ringkas: Judul Iklan, Harga Penawaran, Lokasi, dan **Tombol Chat WhatsApp Hubungi Penjual** instan berwarna hijau dengan ikon WhatsApp.

### 6. Interactive Floating Chatbot Assistant

* Widget chatbot asisten AI yang melayang di pojok kanan bawah layar.
* Saat diklik, akan menampilkan dialog obrolan selamat datang yang menawarkan quick prompt bantuan:
  * "Bagaimana cara pasang iklan gratis?"
  * "Bagaimana cara menjadi merchant resmi?"
  * "Paket promosi iklan apa saja yang tersedia?"

---

## 📝 Prompt AI untuk Desain (AI Design Generation Prompts)

### A. Prompt untuk Midjourney / Stable Diffusion (Mockup Visual)

> `A premium website homepage mockup for ADMS (Armada Digital Marketing System), dark mode interface, glassmorphism design, emerald green and deep indigo color scheme, featuring a hero section for digital product marketplace and classified ads, floating cards showing statistics, clean dashboard style layout, modern typography with Inter font, high fidelity web design, UI/UX, 8k resolution, photorealistic, trendy Dribbble aesthetic --ar 16:9 --v 6.0`

### B. Prompt untuk v0.dev / Claude (Tailwind CSS & React Code Generation)

> `Create a premium homepage for a platform named "ADMS (Armada Digital Marketing System)". Use Tailwind CSS, Lucide icons, and Framer Motion for animations. The design must be modern and luxury dark mode with an Emerald Teal (#0D9488) and Deep Indigo (#4F46E5) color system. Include a navigation header with a search bar, a grand hero section with high-converting titles about digital products (Canva templates, ebooks, source codes) and classified ads. Add floating stat cards, an interactive category grid with hover micro-animations, a grid section for featured digital products showcasing prices, ratings, and a special "Syariah Certified" badge, a dedicated highlighted section for "VIP Premium Ads" with instant green WhatsApp contact buttons, and a mock floating AI assistant widget at the bottom right. Ensure it is fully responsive and looks extremely polished like a modern SaaS landing page.`
