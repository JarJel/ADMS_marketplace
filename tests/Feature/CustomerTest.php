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
use App\Models\Wishlist;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $token;
    private $headers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'status' => 'active',
            'role' => 'user'
        ]);

        $this->token = 'custom_test_token_string_987654321';
        AuthToken::create([
            'user_id' => $this->user->id,
            'token' => hash('sha256', $this->token),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);

        $this->headers = [
            'Authorization' => 'Bearer ' . $this->token,
        ];
    }

    public function test_user_can_update_profile()
    {
        $response = $this->withHeaders($this->headers)->putJson('/api/customer/profile', [
            'name' => 'Ahmad Baru',
            'phone' => '081299998888',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Ahmad Baru', 'phone' => '081299998888']);

        $this->user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $this->user->password));
    }

    public function test_user_can_upload_avatar()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->withHeaders($this->headers)->postJson('/api/customer/profile/avatar', [
            'avatar' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'data' => ['avatar_url']]);

        $this->assertDatabaseHas('media', [
            'owner_id' => $this->user->id,
            'type' => 'profile_avatar',
        ]);
    }

    public function test_user_can_toggle_wishlist()
    {
        $merchantUser = User::factory()->create();
        $merchant = Merchant::create([
            'owner_id' => $merchantUser->id,
            'name' => 'Toko Barokah',
            'slug' => 'toko-barokah',
            'location' => 'Jakarta',
            'contact_whatsapp' => '08123456789',
        ]);

        $category = Category::create([
            'name' => 'Produk',
            'slug' => 'produk',
            'type' => 'product',
        ]);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $category->id,
            'title' => 'Kurma Ajwa',
            'price' => 150000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Kurma nabi yang barokah',
            'full_description' => 'Kurma Ajwa asli dari Madinah Al Munawwarah',
            'stock' => 50,
            'status' => 'active',
        ]);

        // Toggle add
        $response = $this->withHeaders($this->headers)->postJson('/api/customer/wishlist/toggle', [
            'product_id' => $product->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Item berhasil ditambahkan ke wishlist']);

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $this->user->id,
            'product_id' => $product->id,
        ]);

        // Toggle remove
        $response = $this->withHeaders($this->headers)->postJson('/api/customer/wishlist/toggle', [
            'product_id' => $product->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Item berhasil dihapus dari wishlist']);

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $this->user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_create_order_successfully()
    {
        $merchantUser = User::factory()->create();
        $merchant = Merchant::create([
            'owner_id' => $merchantUser->id,
            'name' => 'Toko Barokah',
            'slug' => 'toko-barokah',
            'location' => 'Jakarta',
            'contact_whatsapp' => '08123456789',
        ]);

        $category = Category::create([
            'name' => 'Produk',
            'slug' => 'produk',
            'type' => 'product',
        ]);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $category->id,
            'title' => 'Kurma Ajwa',
            'price' => 100000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Kurma nabi yang barokah',
            'full_description' => 'Kurma Ajwa asli dari Madinah',
            'stock' => 10,
            'status' => 'active',
        ]);

        $response = $this->withHeaders($this->headers)->postJson('/api/customer/orders', [
            'merchant_id' => $merchant->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'payment_method' => 'Bank Transfer Syariah',
            'shipping_address' => 'Jakarta Timur',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['total_amount' => '200000.00']);

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'total_amount' => '200000.00',
            'payment_status' => 'unpaid',
        ]);

        $product->refresh();
        $this->assertEquals(8, $product->stock); // Stock decremented from 10 to 8
    }

    public function test_digital_product_download_access_control()
    {
        $merchantUser = User::factory()->create();
        $merchant = Merchant::create([
            'owner_id' => $merchantUser->id,
            'name' => 'Toko Barokah',
            'slug' => 'toko-barokah',
            'location' => 'Jakarta',
            'contact_whatsapp' => '08123456789',
        ]);

        $category = Category::create([
            'name' => 'Produk',
            'slug' => 'produk',
            'type' => 'product',
        ]);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $category->id,
            'title' => 'Ebook Syariah',
            'price' => 50000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Panduan Muamalah',
            'full_description' => 'Panduan Muamalah Kontemporer',
            'stock' => 100,
            'status' => 'active',
        ]);

        // Create unpaid order
        $order = Order::create([
            'user_id' => $this->user->id,
            'merchant_id' => $merchant->id,
            'total_amount' => 50000.00,
            'status' => 'pending',
            'payment_method' => 'Transfer',
            'payment_status' => 'unpaid',
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price_at_purchase' => 50000.00,
            'subtotal' => 50000.00,
        ]);

        // Attempt download on unpaid -> Expect 403 Forbidden
        $response = $this->withHeaders($this->headers)->getJson("/api/customer/orders/items/{$item->id}/download");
        $response->assertStatus(403);

        // Update order status to paid
        $order->update([
            'payment_status' => 'paid',
            'status' => 'completed',
        ]);

        // Attempt download on paid -> Expect 200 OK file stream
        $response = $this->withHeaders($this->headers)->getJson("/api/customer/orders/items/{$item->id}/download");
        $response->assertStatus(200);
    }

    public function test_user_can_only_review_purchased_products()
    {
        $merchantUser = User::factory()->create();
        $merchant = Merchant::create([
            'owner_id' => $merchantUser->id,
            'name' => 'Toko Barokah',
            'slug' => 'toko-barokah',
            'location' => 'Jakarta',
            'contact_whatsapp' => '08123456789',
        ]);

        $category = Category::create([
            'name' => 'Produk',
            'slug' => 'produk',
            'type' => 'product',
        ]);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $category->id,
            'title' => 'Kurma Ajwa',
            'price' => 100000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Kurma nabi yang barokah',
            'full_description' => 'Kurma Ajwa asli dari Madinah',
            'stock' => 10,
            'status' => 'active',
        ]);

        // Review attempt before purchasing -> Expect 403 Forbidden
        $response = $this->withHeaders($this->headers)->postJson('/api/customer/reviews', [
            'product_id' => $product->id,
            'rating' => 5,
            'comment' => 'Sangat enak dan barokah!',
        ]);

        $response->assertStatus(403);

        // Create a completed order
        $order = Order::create([
            'user_id' => $this->user->id,
            'merchant_id' => $merchant->id,
            'total_amount' => 100000.00,
            'status' => 'completed',
            'payment_method' => 'Transfer',
            'payment_status' => 'paid',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price_at_purchase' => 100000.00,
            'subtotal' => 100000.00,
        ]);

        // Review attempt after purchasing -> Expect 200 OK
        $response = $this->withHeaders($this->headers)->postJson('/api/customer/reviews', [
            'product_id' => $product->id,
            'rating' => 5,
            'comment' => 'Sangat enak dan barokah!',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('reviews', [
            'user_id' => $this->user->id,
            'product_id' => $product->id,
            'rating' => 5,
        ]);
    }

    public function test_user_can_create_ad_and_upgrade()
    {
        $category = Category::create([
            'name' => 'Iklan Jasa',
            'slug' => 'iklan-jasa',
            'type' => 'advertisement',
        ]);

        $freePackage = Package::create([
            'name' => 'Free',
            'price' => 0.00,
            'duration_days' => 7,
            'type' => 'free',
        ]);

        $premiumPackage = Package::create([
            'name' => 'Premium Amanah',
            'price' => 99000.00,
            'duration_days' => 30,
            'type' => 'premium',
        ]);

        // Create Ad (Free)
        $response = $this->withHeaders($this->headers)->postJson('/api/customer/ads', [
            'title' => 'Jasa Renovasi Rumah Syariah',
            'category_id' => $category->id,
            'description' => 'Melayani renovasi rumah amanah tanpa riba',
            'price' => 50000000.00,
            'location' => 'Bandung',
            'whatsapp' => '081288889999',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'pending']);

        $adId = $response->json('data.id');

        // Upgrade Ad to Premium
        $upgradeResponse = $this->withHeaders($this->headers)->postJson("/api/customer/ads/{$adId}/upgrade", [
            'package_id' => $premiumPackage->id,
        ]);

        $upgradeResponse->assertStatus(200)
            ->assertJsonFragment(['duration_days' => 30]);

        $this->assertDatabaseHas('advertisements', [
            'id' => $adId,
            'package_id' => $premiumPackage->id,
        ]);
    }

    public function test_user_can_register_as_merchant()
    {
        $response = $this->withHeaders($this->headers)->postJson('/api/customer/merchant/register', [
            'name' => 'Toko Herbal Muslim',
            'slug' => 'toko-herbal-muslim',
            'description' => 'Jual obat herbal berkualitas halal',
            'location' => 'Solo',
            'contact_whatsapp' => '089988887777',
            'syariah_certified' => true,
            'syariah_cert_number' => 'MUI-12345',
            'syariah_cert_body' => 'LPPOM MUI',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['is_verified' => false]);

        $this->assertDatabaseHas('merchants', [
            'owner_id' => $this->user->id,
            'slug' => 'toko-herbal-muslim',
            'syariah_certified' => true,
        ]);
    }
}
