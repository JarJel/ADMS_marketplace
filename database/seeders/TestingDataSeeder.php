<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Merchant;
use App\Models\Category;
use App\Models\Product;
use App\Models\Advertisement;
use App\Models\Package;
use App\Models\CartItem;
use App\Models\Wishlist;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Withdrawal;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestingDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Admin
        $admin = User::create([
            'name' => 'ADMS Admin Utama',
            'email' => 'admin@adms.id',
            'phone' => '081111111111',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 2. Create Merchant User
        $merchantUser = User::create([
            'name' => 'Haji Ahmad Seller',
            'email' => 'merchant@adms.id',
            'phone' => '082222222222',
            'password' => Hash::make('password123'),
            'role' => 'merchant',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create Verified Store for Merchant
        $store = Merchant::create([
            'owner_id' => $merchantUser->id,
            'name' => 'Herbal Mart Syariah',
            'slug' => 'herbal-mart-syariah',
            'description' => 'Toko resmi obat herbal alami, madu murni, dan perlengkapan pengobatan thibbun nabawi bergaransi.',
            'is_verified' => true,
            'location' => 'Kota Surakarta, Jawa Tengah',
            'contact_whatsapp' => '082222222222',
            'syariah_certified' => true,
            'syariah_cert_number' => 'MUI-LPPOM-1209384729',
            'syariah_cert_body' => 'Majelis Ulama Indonesia',
        ]);

        // Get product category from previous seeder
        $categoryHerbal = Category::where('slug', 'camilan-frozen-food-halal')->first() 
            ?? Category::where('type', 'product')->first();

        // Seed products for Merchant
        $product1 = Product::create([
            'merchant_id' => $store->id,
            'category_id' => $categoryHerbal->id,
            'title' => 'Madu Hutan Murni Baduy',
            'slug' => 'madu-hutan-murni-baduy',
            'price' => 125000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Madu murni mentah (raw honey) langsung dari hutan Baduy.',
            'full_description' => 'Madu hutan Baduy asli yang diambil langsung dari sarang lebah Apis Dorsata. Sangat baik untuk daya tahan tubuh, pencernaan, dan pengganti gula alami.',
            'stock' => 50,
            'thumbnail' => '/storage/products/thumbnails/madu.jpg',
            'status' => 'active',
        ]);

        $product2 = Product::create([
            'merchant_id' => $store->id,
            'category_id' => $categoryHerbal->id,
            'title' => 'Minyak Zaitun Ekstra Virgin Palestina',
            'slug' => 'minyak-zaitun-ekstra-virgin-palestina',
            'price' => 85000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Minyak zaitun perasan pertama cold pressed kualitas ekspor.',
            'full_description' => 'Minyak zaitun perasan pertama (extra virgin) dari buah zaitun pilihan perkebunan Palestina. Menggunakan metode cold pressed untuk menjaga khasiat minyak zaitun tetap utuh.',
            'stock' => 30,
            'thumbnail' => '/storage/products/thumbnails/zaitun.jpg',
            'status' => 'active',
        ]);

        // Get digital product categories
        $catCanva = Category::where('slug', 'template-canva')->first();
        $catCode = Category::where('slug', 'source-code-web')->first();
        $catEbook = Category::where('slug', 'ebook-buku-digital')->first();
        $catPrompt = Category::where('slug', 'ai-prompt-kit')->first();

        // Seed digital products
        if ($catCanva) {
            Product::create([
                'merchant_id' => $store->id,
                'category_id' => $catCanva->id,
                'title' => 'Template Bundling Social Media Canva untuk UMKM 2026',
                'slug' => 'template-bundling-social-media-canva-untuk-umkm-2026',
                'price' => 49000.00,
                'price_type' => 'starting_from',
                'short_description' => 'Paket lengkap berisi 500+ template Canva siap pakai untuk promosi produk kuliner, fashion, jasa, dan edukasi.',
                'full_description' => 'Paket lengkap berisi 500+ template Canva siap pakai untuk promosi produk kuliner, fashion, jasa, dan edukasi. Membantu UMKM meningkatkan branding secara profesional dalam hitungan menit.',
                'stock' => 999,
                'thumbnail' => 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop',
                'status' => 'active',
            ]);
        }

        if ($catCode) {
            Product::create([
                'merchant_id' => $store->id,
                'category_id' => $catCode->id,
                'title' => 'Source Code Aplikasi Kasir Web Laravel 11 & React',
                'slug' => 'source-code-aplikasi-kasir-web-laravel-11-react',
                'price' => 199000.00,
                'price_type' => 'starting_from',
                'short_description' => 'Aplikasi kasir web modern berbasis Laravel 11 (backend API) dan ReactJS (frontend SPA).',
                'full_description' => 'Aplikasi kasir web modern berbasis Laravel 11 (backend API) dan ReactJS (frontend SPA). Dilengkapi dengan fitur multi-cabang, laporan penjualan realtime, cetak struk thermal, dan manajemen inventori barang.',
                'stock' => 999,
                'thumbnail' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
                'status' => 'active',
            ]);
        }

        if ($catEbook) {
            Product::create([
                'merchant_id' => $store->id,
                'category_id' => $catEbook->id,
                'title' => 'Ebook Panduan Sukses Jualan Produk Digital Dari Nol',
                'slug' => 'ebook-panduan-sukses-jualan-produk-digital-dari-nol',
                'price' => 29000.00,
                'price_type' => 'starting_from',
                'short_description' => 'Ebook panduan praktis setebal 150 halaman yang membahas strategi riset pasar, pembuatan aset digital bernilai tinggi.',
                'full_description' => 'Ebook panduan praktis setebal 150 halaman yang membahas strategi riset pasar, pembuatan aset digital bernilai tinggi, hingga cara memasarkannya menggunakan taktik organik dan iklan berbayar.',
                'stock' => 999,
                'thumbnail' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
                'status' => 'active',
            ]);
        }

        if ($catPrompt) {
            Product::create([
                'merchant_id' => $store->id,
                'category_id' => $catPrompt->id,
                'title' => 'Mega Prompt Generator ChatGPT untuk Copywriting Iklan',
                'slug' => 'mega-prompt-generator-chatgpt-untuk-copywriting-iklan',
                'price' => 15000.00,
                'price_type' => 'starting_from',
                'short_description' => 'Koleksi 1000+ prompt ChatGPT super spesifik untuk menghasilkan naskah iklan, landing page copy, email marketing.',
                'full_description' => 'Koleksi 1000+ prompt ChatGPT super spesifik untuk menghasilkan naskah iklan, landing page copy, email marketing, dan ide konten kreatif secara instan yang terbukti mendatangkan pembeli.',
                'stock' => 999,
                'thumbnail' => 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop',
                'status' => 'active',
            ]);
        }

        // Seed multiple classified advertisements
        $freePackage = Package::where('type', 'free')->first();

        // 1. Create categories of type 'advertisement' if they don't exist
        $adCategories = [
            'Mobil' => 'car',
            'Motor' => 'motorcycle',
            'Handphone' => 'mobile',
            'Elektronik' => 'laptop',
            'Properti' => 'home',
            'Tanah' => 'map-marked',
            'Jasa' => 'tools',
            'Lowongan Kerja' => 'briefcase',
            'Fashion' => 'tshirt',
            'Rumah Tangga' => 'couch'
        ];

        $catModels = [];
        foreach ($adCategories as $name => $icon) {
            $catModels[$name] = Category::firstOrCreate(
                ['slug' => Str::slug($name), 'type' => 'advertisement'],
                ['name' => $name, 'icon' => $icon]
            );
        }

        $mockAdsData = [
            [
                'title' => 'Honda HRV 2021 E Special Edition Matic Terawat',
                'category' => 'Mobil',
                'condition' => 'bekas',
                'price' => 278000000.00,
                'location' => 'Sleman, Yogyakarta',
                'contact_name' => 'Ahmad Hidayat',
                'whatsapp' => '6281234567890',
                'image' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop',
                'desc' => 'Kondisi istimewa, tangan pertama dari baru. Pajak panjang bulan September. Servis rutin Honda resmi. Bebas banjir dan tabrakan. Nego tipis setelah lihat unit.',
                'tags' => ['honda', 'hrv', 'mobil bekas']
            ],
            [
                'title' => 'Yamaha NMAX ABS 2023 Low KM Gress',
                'category' => 'Motor',
                'condition' => 'bekas',
                'price' => 31500000.00,
                'location' => 'Jakarta Selatan',
                'contact_name' => 'Rian Pratama',
                'whatsapp' => '6289988776655',
                'image' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop',
                'desc' => 'Jual santai Yamaha NMAX ABS warna hitam matte. KM baru 4.000. Body mulus 99% like new, kunci keyless cadangan lengkap. Surat-surat lengkap STNK BPKB.',
                'tags' => ['yamaha', 'nmax', 'motor bekas']
            ],
            [
                'title' => 'iPhone 15 Pro Max 256GB Dual SIM Resmi iBox',
                'category' => 'Handphone',
                'condition' => 'bekas',
                'price' => 18450000.00,
                'location' => 'Surabaya, Jawa Timur',
                'contact_name' => 'Budi Santoso',
                'whatsapp' => '6281122334455',
                'image' => 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop',
                'desc' => 'iPhone 15 Pro Max warna Titanium Alami. BH 98%, Face ID lancar, True Tone aktif. Masih garansi resmi iBox sampai Desember 2026. Lengkap kotak dan kabel.',
                'tags' => ['iphone', 'apple', 'handphone']
            ],
            [
                'title' => 'MacBook Pro M2 16GB 512GB Space Gray Mulus',
                'category' => 'Elektronik',
                'condition' => 'bekas',
                'price' => 21900000.00,
                'location' => 'Bandung, Jawa Barat',
                'contact_name' => 'Citra Lestari',
                'whatsapp' => '6285566778899',
                'image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
                'desc' => 'Jual MacBook Pro M2 untuk kebutuhan upgrade. CC batre rendah, screen guard sudah terpasang. Fisik sangat mulus tanpa dent. Kelengkapan charger original bawaan.',
                'tags' => ['macbook', 'apple', 'laptop']
            ],
            [
                'title' => 'Rumah Minimalis Modern 2 Lantai Cluster Premium',
                'category' => 'Properti',
                'condition' => 'baru',
                'price' => 980000000.00,
                'location' => 'Tangerang, Banten',
                'contact_name' => 'Developer Amanah',
                'whatsapp' => '6281344556677',
                'image' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop',
                'desc' => 'Cluster baru bernuansa syariah dengan sistem pembayaran bebas riba. 3 Kamar Tidur, 2 Kamar Mandi. Free canopy dan AC 1 PK. Keamanan 24 jam dengan CCTV.',
                'tags' => ['rumah', 'properti', 'syariah']
            ],
            [
                'title' => 'Jasa Pembuatan Landing Page & Web E-Commerce Syariah',
                'category' => 'Jasa',
                'condition' => 'baru',
                'price' => 1500000.00,
                'location' => 'Depok, Jawa Barat',
                'contact_name' => 'ADMS Tech Agency',
                'whatsapp' => '6281299001122',
                'image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
                'desc' => 'Melayani pembuatan website company profile, portofolio, landing page, dan e-commerce siap pakai. Responsif mobile, desain modern, premium, gratis domain & hosting 1 tahun.',
                'tags' => ['website', 'jasa', 'coding']
            ],
            [
                'title' => 'Tanah Kavling Siap Bangun 200m2 dekat Pintu Tol',
                'category' => 'Tanah',
                'condition' => 'baru',
                'price' => 320000000.00,
                'location' => 'Bekasi, Jawa Barat',
                'contact_name' => 'Haji Sulaiman',
                'whatsapp' => '6287711223344',
                'image' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop',
                'desc' => 'Tanah kavling matang siap bangun pondasi di kawasan strategis. Sertifikat Hak Milik (SHM) bersih atas nama sendiri. Bebas sengketa, akses jalan masuk mobil lebar.',
                'tags' => ['tanah', 'kavling', 'investasi']
            ],
            [
                'title' => 'Lowongan Kerja Desainer Grafis & Content Creator Full-Time',
                'category' => 'Lowongan Kerja',
                'condition' => 'baru',
                'price' => 0.00,
                'location' => 'Sleman, Yogyakarta',
                'contact_name' => 'Berkah Media Utama',
                'whatsapp' => '6282133445566',
                'image' => 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600&auto=format&fit=crop',
                'desc' => 'Dibutuhkan Creative Designer dengan keahlian Adobe Photoshop, Illustrator, & editing video pendek. Portofolio aktif wajib disertakan. Lingkungan kerja syariah & kondusif.',
                'tags' => ['lowongan', 'loker', 'desainer']
            ]
        ];

        foreach ($mockAdsData as $mock) {
            $catId = $catModels[$mock['category']]->id;
            
            $newAd = Advertisement::create([
                'title' => $mock['title'],
                'category_id' => $catId,
                'description' => $mock['desc'],
                'price' => $mock['price'],
                'location' => $mock['location'],
                'contact_name' => $mock['contact_name'],
                'whatsapp' => $mock['whatsapp'],
                'condition' => $mock['condition'],
                'tags' => $mock['tags'],
                'duration_days' => 30,
                'package_id' => $freePackage->id,
                'status' => 'approved',
                'merchant_id' => $store->id,
                'owner_id' => $merchantUser->id,
                'expires_at' => now()->addDays(30),
            ]);

            \App\Models\Media::create([
                'url' => $mock['image'],
                'type' => 'ad_image',
                'owner_id' => $newAd->id,
                'owner_type' => Advertisement::class,
            ]);
        }

        // 3. Create Customer User
        $customerUser = User::create([
            'name' => 'Akhi Budi Prasetyo',
            'email' => 'customer@adms.id',
            'phone' => '083333333333',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Add items to customer cart
        CartItem::create([
            'user_id' => $customerUser->id,
            'product_id' => $product1->id,
            'quantity' => 1,
        ]);

        // Add items to customer wishlist
        Wishlist::create([
            'user_id' => $customerUser->id,
            'product_id' => $product2->id,
        ]);

        // Create completed paid order (merchant gets revenue of 250,000)
        $completedOrder = Order::create([
            'user_id' => $customerUser->id,
            'merchant_id' => $store->id,
            'total_amount' => 250000.00,
            'status' => 'completed',
            'payment_method' => 'Transfer Bank Syariah',
            'payment_status' => 'paid',
            'shipping_address' => 'Jl. Slamet Riyadi No. 10, Surakarta',
        ]);

        OrderItem::create([
            'order_id' => $completedOrder->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'price_at_purchase' => $product1->price,
            'subtotal' => 250000.00,
        ]);

        // Write a review for the product
        Review::create([
            'user_id' => $customerUser->id,
            'merchant_id' => $store->id,
            'product_id' => $product1->id,
            'rating' => 5,
            'comment' => 'Masya Allah madunya manis alami dan pengiriman sangat cepat. Sangat direkomendasikan!',
        ]);

        // Create a pending payout request (withdrawal) for merchant (worth 100,000)
        Withdrawal::create([
            'merchant_id' => $store->id,
            'amount' => 100000.00,
            'bank_name' => 'Bank Syariah Indonesia (BSI)',
            'bank_account_name' => 'Haji Ahmad',
            'bank_account_number' => '7001234567',
            'status' => 'pending',
        ]);
    }
}
