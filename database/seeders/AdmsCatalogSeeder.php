<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdmsCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define Categories
        $categories = [
            [
                'name' => 'Digital Ads',
                'slug' => 'digital-ads',
                'type' => 'product',
            ],
            [
                'name' => 'Website & Development',
                'slug' => 'website-development',
                'type' => 'product',
            ],
            [
                'name' => 'Marketing & Distribution',
                'slug' => 'marketing-distribution',
                'type' => 'product',
            ],
            [
                'name' => 'Automation & Blast',
                'slug' => 'automation-blast',
                'type' => 'product',
            ],
            [
                'name' => 'Social Media',
                'slug' => 'social-media',
                'type' => 'product',
            ],
            [
                'name' => 'Legal & Bisnis',
                'slug' => 'legal-bisnis',
                'type' => 'product',
            ],
            [
                'name' => 'Layanan Offline',
                'slug' => 'layanan-offline',
                'type' => 'product',
            ],
        ];

        $insertedCategories = 0;
        foreach ($categories as $cat) {
            $existing = DB::table('categories')->where('slug', $cat['slug'])->first();
            if (!$existing) {
                DB::table('categories')->insert([
                    'id' => Str::uuid(),
                    'name' => $cat['name'],
                    'slug' => $cat['slug'],
                    'type' => $cat['type'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $insertedCategories++;
            }
        }

        // Get a merchant_id (if not exists, create a dummy one)
        $merchant = DB::table('merchants')->where('name', 'ADMS')->first();
        if (!$merchant) {
            // we need a user for merchant
            $user = DB::table('users')->where('email', 'adms@adms.id')->first();
            if (!$user) {
                $userId = Str::uuid();
                DB::table('users')->insert([
                    'id' => $userId,
                    'name' => 'ADMS Official',
                    'email' => 'adms@adms.id',
                    'phone' => '08111111111',
                    'password' => bcrypt('password'),
                    'role' => 'merchant',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $userId = $user->id;
            }

            $merchantId = Str::uuid();
            DB::table('merchants')->insert([
                'id' => $merchantId,
                'owner_id' => $userId,
                'name' => 'ADMS',
                'slug' => 'adms',
                'description' => 'Official store for ADMS services',
                'is_verified' => true,
                'location' => 'Jakarta, Indonesia',
                'contact_whatsapp' => '08111111111',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $merchantId = $merchant->id;
        }

        $products = [
            // DIGITAL ADS
            ['title' => 'Google Ads', 'slug' => 'google-ads', 'category_slug' => 'digital-ads', 'price' => 350000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Jasa pengelolaan dan pemasangan iklan Google Ads untuk membantu meningkatkan jangkauan, traffic, dan potensi konversi bisnis.'],
            ['title' => 'Facebook Ads', 'slug' => 'facebook-ads', 'category_slug' => 'digital-ads', 'price' => 350000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Jasa pengelolaan kampanye Facebook Ads yang ditargetkan untuk meningkatkan awareness dan penjualan produk Anda.'],
            ['title' => 'Instagram Ads', 'slug' => 'instagram-ads', 'category_slug' => 'digital-ads', 'price' => 350000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Tingkatkan interaksi dan visibilitas brand Anda melalui Instagram Ads yang dioptimasi secara profesional.'],
            ['title' => 'TikTok Ads', 'slug' => 'tiktok-ads', 'category_slug' => 'digital-ads', 'price' => 350000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Jangkau audiens generasi Z dan milenial melalui video kampanye TikTok Ads yang kreatif dan viral.'],
            ['title' => 'Google Maps Review', 'slug' => 'google-maps-review', 'category_slug' => 'digital-ads', 'price' => 350000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Tingkatkan reputasi bisnis lokal Anda dengan ulasan Google Maps yang kredibel dan berkualitas.'],

            // WEBSITE & DEVELOPMENT
            ['title' => 'Landing Page Conversion', 'slug' => 'landing-page-conversion', 'category_slug' => 'website-development', 'price' => 999000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Jasa pembuatan landing page yang dirancang untuk meningkatkan konversi pengunjung menjadi pelanggan.'],
            ['title' => 'Company Profile Corporate', 'slug' => 'company-profile-corporate', 'category_slug' => 'website-development', 'price' => 1850000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Pembuatan website profil perusahaan yang elegan, profesional, dan responsif untuk citra bisnis yang lebih baik.'],
            ['title' => 'E-Commerce', 'slug' => 'e-commerce', 'category_slug' => 'website-development', 'price' => 4500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Pengembangan toko online (e-commerce) lengkap dengan fitur keranjang belanja, integrasi pembayaran, dan manajemen produk.'],
            ['title' => 'Custom React Web App', 'slug' => 'custom-react-web-app', 'category_slug' => 'website-development', 'price' => 9999000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Jasa pengembangan web application menggunakan React dengan fitur dan kebutuhan yang dapat disesuaikan.'],
            ['title' => 'Jasa Desain Website (WordPress)', 'slug' => 'jasa-desain-website-wordpress', 'category_slug' => 'website-development', 'price' => 1500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Jasa pembuatan website menggunakan CMS WordPress yang mudah dikelola, SEO friendly, dan memiliki desain menarik.'],
            ['title' => 'Jasa Blog PBN', 'slug' => 'jasa-blog-pbn', 'category_slug' => 'website-development', 'price' => 999000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Pembuatan Private Blog Network (PBN) berkualitas tinggi untuk mendongkrak peringkat website utama Anda di mesin pencari.'],
            ['title' => 'Maintenance / Admin Website', 'slug' => 'maintenance-admin-website', 'category_slug' => 'website-development', 'price' => 2999000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Layanan perawatan website, update konten rutin, perbaikan bug, dan pengelolaan server bulanan.'],
            ['title' => 'Optimasi SEO Website (Google Index)', 'slug' => 'optimasi-seo-website-google-index', 'category_slug' => 'website-development', 'price' => 6000000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Layanan optimasi mesin pencari (SEO) komprehensif agar website Anda menduduki halaman pertama Google.'],
            ['title' => 'Custom Fitur', 'slug' => 'custom-fitur', 'category_slug' => 'website-development', 'price' => 500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Penambahan fitur atau modul khusus ke dalam website yang sudah ada sesuai dengan spesifikasi permintaan klien.'],

            // MARKETING & DISTRIBUTION
            ['title' => 'Artikel SEO', 'slug' => 'artikel-seo', 'category_slug' => 'marketing-distribution', 'price' => 99000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'unit' => 'artikel', 'desc' => 'Penulisan artikel yang ramah mesin pencari (SEO optimized) dengan riset kata kunci dan struktur yang teruji.'],
            ['title' => 'SMS Masking', 'slug' => 'sms-masking', 'category_slug' => 'marketing-distribution', 'price' => 100, 'price_type' => 'fixed_per_unit', 'product_type' => 'digital_service', 'unit' => 'pcs', 'minimum_order' => 10000, 'desc' => 'Layanan pengiriman SMS massal menggunakan nama pengirim khusus (Sender ID) perusahaan Anda.'],
            ['title' => 'Posting 1000 Website', 'slug' => 'posting-1000-website', 'category_slug' => 'marketing-distribution', 'price' => 399000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Jasa publikasi konten, iklan, atau backlink profil bisnis ke ribuan website/forum secara masif.'],
            ['title' => 'Backlink PBN', 'slug' => 'backlink-pbn', 'category_slug' => 'marketing-distribution', 'price' => 8500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Jasa backlink premium dari Private Blog Network yang aman dan terbukti ampuh mendongkrak DA/PA dan ranking Google.'],
            ['title' => 'Sebar Brosur', 'slug' => 'sebar-brosur', 'category_slug' => 'marketing-distribution', 'price' => 350000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Layanan distribusi brosur digital ke berbagai kanal komunikasi dan grup tertarget.'],
            ['title' => 'Press Release / Media Placement', 'slug' => 'press-release-media-placement', 'category_slug' => 'marketing-distribution', 'price' => 999000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Penempatan artikel press release ke media berita nasional ternama untuk membangun kredibilitas.'],

            // AUTOMATION & BLAST
            ['title' => 'WhatsApp Blast', 'slug' => 'whatsapp-blast', 'category_slug' => 'automation-blast', 'price' => 350000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Kirim pesan promosi massal ke ribuan kontak WhatsApp secara otomatis dengan sistem anti-blokir kami.'],
            ['title' => 'SMS Broadcast', 'slug' => 'sms-broadcast', 'category_slug' => 'automation-blast', 'price' => 350000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Layanan penyebaran informasi promosi melalui SMS ke database pelanggan aktif dengan tingkat buka (open rate) tinggi.'],
            ['title' => 'WhatsApp API / Automation', 'slug' => 'whatsapp-api-automation', 'category_slug' => 'automation-blast', 'price' => 500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Integrasi WhatsApp API untuk sistem notifikasi otomatis, OTP, chatbot, dan customer service 24/7.'],

            // SOCIAL MEDIA
            ['title' => 'Kelola Sosmed', 'slug' => 'kelola-sosmed', 'category_slug' => 'social-media', 'price' => 2500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Layanan manajemen media sosial terpadu termasuk strategi konten, desain grafis, dan interaksi audiens.'],
            ['title' => 'Content Creation', 'slug' => 'content-creation', 'category_slug' => 'social-media', 'price' => 2999000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'desc' => 'Pembuatan konten kreatif dan profesional, termasuk video reels/Tiktok, desain feed, dan copywriting.'],

            // LEGAL & BISNIS
            ['title' => 'Pendirian PT Persekutuan Modal', 'slug' => 'pendirian-pt-persekutuan-modal', 'category_slug' => 'legal-bisnis', 'price' => 2500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'thumbnail' => 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=300&auto=format&fit=crop', 'desc' => 'Jasa pengurusan legalitas dan pendirian badan usaha PT lengkap dengan akta notaris dan SK Kemenkumham.'],
            ['title' => 'Pendirian CV', 'slug' => 'pendirian-cv', 'category_slug' => 'legal-bisnis', 'price' => 2500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'thumbnail' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=300&auto=format&fit=crop', 'desc' => 'Jasa pembuatan CV secara profesional, cepat, dan legal untuk menunjang aktivitas bisnis Anda.'],
            ['title' => 'Legalitas Usaha (NIB, Perizinan Usaha & Legalitas UMKM)', 'slug' => 'legalitas-usaha-nib-perizinan-usaha-legalitas-umkm', 'category_slug' => 'legal-bisnis', 'price' => 1000000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'thumbnail' => 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=300&auto=format&fit=crop', 'desc' => 'Layanan pendaftaran NIB (Nomor Induk Berusaha) dan perizinan dasar UMKM melalui sistem OSS.'],
            ['title' => 'Pembuatan SIM A/B/C', 'slug' => 'pembuatan-sim-abc', 'category_slug' => 'legal-bisnis', 'price' => 500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'thumbnail' => 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=300&auto=format&fit=crop', 'desc' => 'Biro jasa pengurusan pembuatan baru dan perpanjangan SIM A, B, dan C secara cepat dan aman.'],
            ['title' => 'Pembuatan SIM Internasional', 'slug' => 'pembuatan-sim-internasional', 'category_slug' => 'legal-bisnis', 'price' => 500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'thumbnail' => 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=300&auto=format&fit=crop', 'desc' => 'Biro jasa pengurusan pembuatan SIM Internasional untuk kebutuhan mengemudi di luar negeri.'],
            ['title' => 'Pembuatan Paspor', 'slug' => 'pembuatan-paspor', 'category_slug' => 'legal-bisnis', 'price' => 750000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'thumbnail' => 'https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=300&auto=format&fit=crop', 'desc' => 'Biro jasa pembuatan paspor baru dan perpanjangan paspor biasa maupun paspor elektronik (e-paspor).'],
            ['title' => 'Pembuatan Visa', 'slug' => 'pembuatan-visa', 'category_slug' => 'legal-bisnis', 'price' => 1500000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'thumbnail' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop', 'desc' => 'Jasa pengurusan dan pendampingan aplikasi pengajuan Visa untuk berbagai negara tujuan.'],
            ['title' => 'Konsultan Pajak', 'slug' => 'konsultan-pajak', 'category_slug' => 'legal-bisnis', 'price' => 1000000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'thumbnail' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=300&auto=format&fit=crop', 'desc' => 'Layanan konsultasi perpajakan, pelaporan SPT Tahunan, dan perencanaan pajak untuk individu dan badan usaha.'],
            ['title' => 'Pendirian PT Perorangan', 'slug' => 'pendirian-pt-perorangan', 'category_slug' => 'legal-bisnis', 'price' => 499000, 'price_type' => 'starting_from', 'product_type' => 'digital_service', 'thumbnail' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300&auto=format&fit=crop', 'desc' => 'Jasa pengurusan legalitas dan pendaftaran PT Perorangan (UMKM) dengan proses mudah dan cepat.'],

            // LAYANAN OFFLINE
            ['title' => 'Pindahan Rumah', 'slug' => 'pindahan-rumah', 'category_slug' => 'layanan-offline', 'price' => null, 'price_type' => 'quotation', 'product_type' => 'service', 'desc' => 'Jasa layanan pindahan rumah komprehensif, mulai dari packing barang, pengangkutan, hingga penyusunan kembali.'],
            ['title' => 'Konstruksi Luxury - Komersil', 'slug' => 'konstruksi-luxury-komersil', 'category_slug' => 'layanan-offline', 'price' => 5000000, 'price_type' => 'fixed_per_unit', 'product_type' => 'service', 'unit' => 'm2', 'desc' => 'Layanan konstruksi dan desain bangunan komersil mewah, dikerjakan oleh tim arsitek dan kontraktor profesional.'],
            ['title' => 'Konstruksi Luxury - Luxury', 'slug' => 'konstruksi-luxury-luxury', 'category_slug' => 'layanan-offline', 'price' => 7000000, 'price_type' => 'fixed_per_unit', 'product_type' => 'service', 'unit' => 'm2', 'desc' => 'Layanan konstruksi rumah tinggal atau villa kategori luxury dengan material dan pengerjaan kualitas premium.'],
        ];

        $insertedProducts = 0;
        $updatedProducts = 0;
        $skippedProducts = 0;

        foreach ($products as $prod) {
            $cat = DB::table('categories')->where('slug', $prod['category_slug'])->first();
            if (!$cat) continue;

            $existingProduct = DB::table('products')->where('slug', $prod['slug'])->first();

            $thumbnails = [
                'marketing-distribution' => 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=300&auto=format&fit=crop',
                'automation-blast' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=300&auto=format&fit=crop',
                'social-media' => 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300&auto=format&fit=crop',
                'legal-bisnis' => 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=300&auto=format&fit=crop',
                'layanan-offline' => 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=300&auto=format&fit=crop',
            ];
            $thumbnailUrl = $prod['thumbnail'] ?? ($thumbnails[$prod['category_slug']] ?? null);

            if ($existingProduct) {
                // Update if price differs or merchant is different or thumbnail changed
                if ($existingProduct->price != $prod['price'] || $existingProduct->merchant_id !== $merchantId || $existingProduct->thumbnail !== $thumbnailUrl) {
                    DB::table('products')->where('id', $existingProduct->id)->update([
                        'price' => $prod['price'],
                        'price_type' => $prod['price_type'],
                        'merchant_id' => $merchantId,
                        'thumbnail' => $thumbnailUrl,
                        'updated_at' => now(),
                    ]);
                    $updatedProducts++;
                } else {
                    $skippedProducts++;
                }
            } else {
                DB::table('products')->insert([
                    'id' => Str::uuid(),
                    'merchant_id' => $merchantId,
                    'category_id' => $cat->id,
                    'title' => $prod['title'],
                    'slug' => $prod['slug'],
                    'price' => $prod['price'],
                    'price_type' => $prod['price_type'],
                    'product_type' => $prod['product_type'],
                    'unit' => $prod['unit'] ?? null,
                    'minimum_order' => $prod['minimum_order'] ?? null,
                    'short_description' => $prod['desc'],
                    'full_description' => '<p>' . $prod['desc'] . '</p>',
                    'status' => 'active',
                    'thumbnail' => $thumbnailUrl,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $insertedProducts++;
            }
        }

        $this->command->info("Seeding Report:");
        $this->command->info("Categories Inserted: {$insertedCategories}");
        $this->command->info("Products Inserted: {$insertedProducts}");
        $this->command->info("Products Updated: {$updatedProducts}");
        $this->command->info("Products Skipped: {$skippedProducts}");
    }
}
