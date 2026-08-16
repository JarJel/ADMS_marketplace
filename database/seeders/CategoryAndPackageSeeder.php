<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Package;
use Illuminate\Database\Seeder;

class CategoryAndPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // --- SEED PACKAGES ---
        $packages = [
            [
                'name' => 'Paket Gratis (Berkah)',
                'price' => 0.00,
                'duration_days' => 7,
                'type' => 'free',
                'benefits' => [
                    'Maksimal 1 iklan aktif',
                    'Masa tayang 7 hari',
                    'Fitur standard',
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Paket Premium (Amanah)',
                'price' => 99000.00,
                'duration_days' => 30,
                'type' => 'premium',
                'benefits' => [
                    'Iklan tidak terbatas',
                    'Masa tayang 30 hari',
                    'Lencana terverifikasi syariah',
                    'Tampil di halaman utama (Headline)',
                    'Bantuan CS prioritas',
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Paket Pro (Muamalah)',
                'price' => 249000.00,
                'duration_days' => 90,
                'type' => 'premium',
                'benefits' => [
                    'Iklan tidak terbatas',
                    'Masa tayang 90 hari',
                    'Lencana terverifikasi syariah',
                    'Tampil di halaman utama (Headline & Slideshow)',
                    'Broadcast WA ke member',
                    'Bantuan CS prioritas',
                ],
                'is_active' => true,
            ],
        ];

        foreach ($packages as $pkg) {
            Package::create($pkg);
        }

        // --- SEED CATEGORIES ---
        // Product category root
        $makananHalal = Category::create([
            'name' => 'Makanan & Minuman Halal',
            'slug' => 'makanan-minuman-halal',
            'type' => 'product',
            'icon' => 'utensils',
        ]);

        Category::create([
            'name' => 'Katering Syariah',
            'slug' => 'katering-syariah',
            'parent_id' => $makananHalal->id,
            'type' => 'product',
            'icon' => 'utensils-alt',
        ]);

        Category::create([
            'name' => 'Camilan & Frozen Food Halal',
            'slug' => 'camilan-frozen-food-halal',
            'parent_id' => $makananHalal->id,
            'type' => 'product',
            'icon' => 'ice-cream',
        ]);

        $fashionMuslim = Category::create([
            'name' => 'Fashion Muslim',
            'slug' => 'fashion-muslim',
            'type' => 'product',
            'icon' => 'tshirt',
        ]);

        Category::create([
            'name' => 'Busana Muslimah',
            'slug' => 'busana-muslimah',
            'parent_id' => $fashionMuslim->id,
            'type' => 'product',
            'icon' => 'female',
        ]);

        Category::create([
            'name' => 'Koko & Perlengkapan Shalat',
            'slug' => 'koko-perlengkapan-shalat',
            'parent_id' => $fashionMuslim->id,
            'type' => 'product',
            'icon' => 'mosque',
        ]);

        // Advertisement categories
        $jasaSyariah = Category::create([
            'name' => 'Jasa & Layanan Syariah',
            'slug' => 'jasa-layanan-syariah',
            'type' => 'advertisement',
            'icon' => 'hands-helping',
        ]);

        Category::create([
            'name' => 'Bimbingan Belajar Qur\'an',
            'slug' => 'bimbingan-belajar-quran',
            'parent_id' => $jasaSyariah->id,
            'type' => 'advertisement',
            'icon' => 'book-reader',
        ]);

        Category::create([
            'name' => 'Konsultasi Waris & Muamalah',
            'slug' => 'konsultasi-waris-muamalah',
            'parent_id' => $jasaSyariah->id,
            'type' => 'advertisement',
            'icon' => 'balance-scale',
        ]);

        $propertiSyariah = Category::create([
            'name' => 'Properti Syariah',
            'slug' => 'properti-syariah',
            'type' => 'advertisement',
            'icon' => 'home',
        ]);

        Category::create([
            'name' => 'Perumahan Tanpa Riba',
            'slug' => 'perumahan-tanpa-riba',
            'parent_id' => $propertiSyariah->id,
            'type' => 'advertisement',
            'icon' => 'building',
        ]);
    }
}
