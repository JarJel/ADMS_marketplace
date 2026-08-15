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

        // Get advertisement category
        $categoryAd = Category::where('slug', 'bimbingan-belajar-quran')->first()
            ?? Category::where('type', 'advertisement')->first();

        $freePackage = Package::where('type', 'free')->first();

        // Seed classified ads for merchant
        $ad = Advertisement::create([
            'title' => 'Jasa Bekam Sunnah Steril Panggilan',
            'category_id' => $categoryAd->id,
            'description' => 'Melayani terapi bekam sunnah dengan jarum dan cup steril sekali pakai untuk wilayah Solo Raya.',
            'price' => 50000.00,
            'location' => 'Surakarta',
            'contact_name' => 'Haji Ahmad',
            'whatsapp' => '082222222222',
            'condition' => 'baru',
            'duration_days' => 30,
            'package_id' => $freePackage->id,
            'status' => 'approved',
            'merchant_id' => $store->id,
            'owner_id' => $merchantUser->id,
            'expires_at' => now()->addDays(30),
        ]);

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
