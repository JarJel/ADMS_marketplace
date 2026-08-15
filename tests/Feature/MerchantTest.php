<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuthToken;
use App\Models\Category;
use App\Models\Package;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\Advertisement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MerchantTest extends TestCase
{
    use RefreshDatabase;

    private $merchantUser;
    private $merchantToken;
    private $merchantHeaders;

    private $ordinaryUser;
    private $ordinaryToken;
    private $ordinaryHeaders;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Merchant User setup
        $this->merchantUser = User::factory()->create([
            'role' => 'merchant',
            'status' => 'active',
        ]);

        $this->merchantToken = 'merchant_token_string_12345';
        AuthToken::create([
            'user_id' => $this->merchantUser->id,
            'token' => hash('sha256', $this->merchantToken),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);

        $this->merchantHeaders = [
            'Authorization' => 'Bearer ' . $this->merchantToken,
        ];

        // 2. Ordinary User setup
        $this->ordinaryUser = User::factory()->create([
            'role' => 'user',
            'status' => 'active',
        ]);

        $this->ordinaryToken = 'ordinary_token_string_67890';
        AuthToken::create([
            'user_id' => $this->ordinaryUser->id,
            'token' => hash('sha256', $this->ordinaryToken),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);

        $this->ordinaryHeaders = [
            'Authorization' => 'Bearer ' . $this->ordinaryToken,
        ];
    }

    public function test_ordinary_user_cannot_access_merchant_routes()
    {
        // Attempt dashboard access -> Expect 403 Forbidden
        $response = $this->withHeaders($this->ordinaryHeaders)->getJson('/api/merchant/dashboard');
        $response->assertStatus(403);
    }

    public function test_merchant_user_needs_registered_store_to_access_protected_routes()
    {
        // Has merchant role, but no store registered -> Expect 404
        $response = $this->withHeaders($this->merchantHeaders)->getJson('/api/merchant/dashboard');
        $response->assertStatus(404)
            ->assertJsonFragment(['message' => 'Toko belum terdaftar. Silakan daftarkan toko Anda terlebih dahulu.']);
    }

    public function test_merchant_can_register_store_successfully()
    {
        $response = $this->withHeaders($this->merchantHeaders)->postJson('/api/merchant/register', [
            'name' => 'Toko Buku Syariah',
            'slug' => 'toko-buku-syariah',
            'description' => 'Menjual buku keislaman bebas riba',
            'location' => 'Yogyakarta',
            'contact_whatsapp' => '081234567890',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['is_verified' => false]);

        $this->assertDatabaseHas('merchants', [
            'owner_id' => $this->merchantUser->id,
            'slug' => 'toko-buku-syariah',
        ]);
    }

    public function test_merchant_can_update_store_profile_and_upload_assets()
    {
        Storage::fake('public');

        // Create store profile first
        $merchant = Merchant::create([
            'owner_id' => $this->merchantUser->id,
            'name' => 'Toko Buku Syariah',
            'slug' => 'toko-buku-syariah',
            'description' => 'Lama',
            'location' => 'Yogyakarta',
            'contact_whatsapp' => '081234567890',
        ]);

        $logoFile = UploadedFile::fake()->image('logo.jpg');
        $bannerFile = UploadedFile::fake()->image('banner.jpg');

        $response = $this->withHeaders($this->merchantHeaders)->postJson('/api/merchant/store/update', [
            'name' => 'Toko Buku Syariah Baru',
            'description' => 'Menjual buku keislaman terlengkap',
            'location' => 'Yogyakarta Utara',
            'contact_whatsapp' => '081234567899',
            'logo' => $logoFile,
            'banner' => $bannerFile,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('merchants', [
            'id' => $merchant->id,
            'name' => 'Toko Buku Syariah Baru',
        ]);

        $this->assertDatabaseHas('media', [
            'owner_id' => $merchant->id,
            'type' => 'merchant_logo',
        ]);
    }

    public function test_merchant_can_crud_product()
    {
        Storage::fake('public');

        // Setup store
        $merchant = Merchant::create([
            'owner_id' => $this->merchantUser->id,
            'name' => 'Toko Buku Syariah',
            'slug' => 'toko-buku-syariah',
            'location' => 'Yogyakarta',
            'contact_whatsapp' => '081234567890',
        ]);

        $category = Category::create([
            'name' => 'Buku',
            'slug' => 'buku',
            'type' => 'product',
        ]);

        $thumbnail = UploadedFile::fake()->image('book.jpg');

        // 1. Create Product
        $response = $this->withHeaders($this->merchantHeaders)->postJson('/api/merchant/products', [
            'title' => 'Buku Muamalah',
            'slug' => 'buku-muamalah',
            'category_id' => $category->id,
            'price' => 75000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Buku tuntunan jual beli',
            'full_description' => 'Buku tuntunan lengkap tentang jual beli dalam islam',
            'stock' => 20,
            'thumbnail' => $thumbnail,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Buku Muamalah', 'status' => 'pending']);

        $productId = $response->json('data.id');

        // 2. Update Product
        $updateResponse = $this->withHeaders($this->merchantHeaders)->putJson("/api/merchant/products/{$productId}", [
            'title' => 'Buku Muamalah Edisi Revisi',
            'category_id' => $category->id,
            'price' => 85000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Buku tuntunan jual beli baru',
            'full_description' => 'Buku tuntunan lengkap tentang jual beli dalam islam revisi',
            'stock' => 15,
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonFragment(['title' => 'Buku Muamalah Edisi Revisi', 'price' => '85000.00']);

        // 3. Delete Product
        $deleteResponse = $this->withHeaders($this->merchantHeaders)->deleteJson("/api/merchant/products/{$productId}");
        $deleteResponse->assertStatus(200);

        $this->assertSoftDeleted('products', [
            'id' => $productId,
        ]);
    }

    public function test_merchant_can_manage_incoming_orders()
    {
        // Setup store
        $merchant = Merchant::create([
            'owner_id' => $this->merchantUser->id,
            'name' => 'Toko Buku Syariah',
            'slug' => 'toko-buku-syariah',
            'location' => 'Yogyakarta',
            'contact_whatsapp' => '081234567890',
        ]);

        $buyer = User::factory()->create();

        // Create mock incoming order
        $order = Order::create([
            'user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'total_amount' => 150000.00,
            'status' => 'pending',
            'payment_method' => 'Transfer',
            'payment_status' => 'unpaid',
        ]);

        // Get incoming orders
        $response = $this->withHeaders($this->merchantHeaders)->getJson('/api/merchant/orders');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // Update status to processed
        $updateResponse = $this->withHeaders($this->merchantHeaders)->putJson("/api/merchant/orders/{$order->id}/status", [
            'status' => 'processed',
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonFragment(['status' => 'processed']);
    }

    public function test_merchant_can_get_dashboard_stats()
    {
        // Setup store
        $merchant = Merchant::create([
            'owner_id' => $this->merchantUser->id,
            'name' => 'Toko Buku Syariah',
            'slug' => 'toko-buku-syariah',
            'location' => 'Yogyakarta',
            'contact_whatsapp' => '081234567890',
        ]);

        $buyer = User::factory()->create();

        // Create completed order
        Order::create([
            'user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'total_amount' => 250000.00,
            'status' => 'completed',
            'payment_method' => 'Transfer',
            'payment_status' => 'paid',
        ]);

        // Get dashboard statistics
        $response = $this->withHeaders($this->merchantHeaders)->getJson('/api/merchant/dashboard');

        $response->assertStatus(200)
            ->assertJsonFragment(['total_revenue' => 250000.00]);
    }
}
