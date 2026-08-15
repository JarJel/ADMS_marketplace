<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuthToken;
use App\Models\Category;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Withdrawal;
use App\Mail\VerifyEmailMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdvancedFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private $customerUser;
    private $customerToken;
    private $customerHeaders;

    private $merchantUser;
    private $merchantToken;
    private $merchantHeaders;

    private $adminUser;
    private $adminToken;
    private $adminHeaders;

    private $category;
    private $product1;
    private $product2;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        // 1. Users setup
        $this->customerUser = User::factory()->create(['role' => 'user', 'status' => 'active']);
        $this->customerToken = 'cust_tok_123';
        AuthToken::create([
            'user_id' => $this->customerUser->id,
            'token' => hash('sha256', $this->customerToken),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);
        $this->customerHeaders = ['Authorization' => 'Bearer ' . $this->customerToken];

        $this->merchantUser = User::factory()->create(['role' => 'merchant', 'status' => 'active']);
        $this->merchantToken = 'merch_tok_123';
        AuthToken::create([
            'user_id' => $this->merchantUser->id,
            'token' => hash('sha256', $this->merchantToken),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);
        $this->merchantHeaders = ['Authorization' => 'Bearer ' . $this->merchantToken];

        // Create store for merchant
        $merchant = Merchant::create([
            'owner_id' => $this->merchantUser->id,
            'name' => 'Toko Herbal',
            'slug' => 'toko-herbal',
            'location' => 'Solo',
            'contact_whatsapp' => '081234567890',
            'is_verified' => true,
        ]);

        $this->adminUser = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $this->adminToken = 'admin_tok_123';
        AuthToken::create([
            'user_id' => $this->adminUser->id,
            'token' => hash('sha256', $this->adminToken),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);
        $this->adminHeaders = ['Authorization' => 'Bearer ' . $this->adminToken];

        // 2. Setup Category & Products
        $this->category = Category::create([
            'name' => 'Herbal',
            'slug' => 'herbal',
            'type' => 'product',
        ]);

        $this->product1 = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $this->category->id,
            'title' => 'Madu Murni',
            'price' => 50000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Madu asli',
            'full_description' => 'Madu hutan asli',
            'stock' => 10,
            'status' => 'active',
        ]);

        $this->product2 = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $this->category->id,
            'title' => 'Habbatussauda',
            'price' => 75000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Jintan hitam',
            'full_description' => 'Jintan hitam murni',
            'stock' => 5,
            'status' => 'active',
        ]);
    }

    public function test_email_verification_flow_on_registration()
    {
        Mail::fake();

        $response = $this->postJson('/api/register', [
            'name' => 'Ahmad Syarif',
            'email' => 'ahmad@example.com',
            'phone' => '081234567800',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        Mail::assertSent(VerifyEmailMail::class, function ($mail) {
            return $mail->hasTo('ahmad@example.com');
        });

        // Retrieve token
        $user = User::where('email', 'ahmad@example.com')->first();
        $tokenRecord = AuthToken::where('user_id', $user->id)
            ->where('type', 'email_verification')
            ->first();

        $this->assertNotNull($tokenRecord);
        $this->assertNull($user->email_verified_at);

        // Verification call (let's assume we pass the raw code parsed during test or simulation)
        // Since we generated random 6 digit numeric code, we can read it from the database hashed or retrieve the raw token if we knew it.
        // Wait, token stored in DB is hashed!
        // To verify, we simulate calling with a mock token string, or we directly know what was set since we can retrieve or generate.
        // Let's create a known token record for test verification
        $testCode = '123456';
        $tokenRecord->update([
            'token' => hash('sha256', $testCode)
        ]);

        $verifyResponse = $this->postJson('/api/verify-email', [
            'email' => 'ahmad@example.com',
            'token' => $testCode,
        ]);

        $verifyResponse->assertStatus(200);
        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_shopping_cart_crud_operations()
    {
        // 1. Add to cart
        $response = $this->withHeaders($this->customerHeaders)->postJson('/api/customer/cart', [
            'product_id' => $this->product1->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['quantity' => 2]);

        $this->assertDatabaseHas('cart_items', [
            'user_id' => $this->customerUser->id,
            'product_id' => $this->product1->id,
        ]);

        // 2. Fetch cart list
        $response = $this->withHeaders($this->customerHeaders)->getJson('/api/customer/cart');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $cartItemId = $response->json('data.0.id');

        // 3. Delete from cart
        $deleteResponse = $this->withHeaders($this->customerHeaders)->deleteJson("/api/customer/cart/{$cartItemId}");
        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItemId,
        ]);
    }

    public function test_checkout_multi_item_from_cart()
    {
        // Add both products to cart
        CartItem::create([
            'user_id' => $this->customerUser->id,
            'product_id' => $this->product1->id,
            'quantity' => 2,
        ]);

        CartItem::create([
            'user_id' => $this->customerUser->id,
            'product_id' => $this->product2->id,
            'quantity' => 1,
        ]);

        // Checkout cart
        $response = $this->withHeaders($this->customerHeaders)->postJson('/api/customer/orders', [
            'merchant_id' => $this->product1->merchant_id,
            'payment_method' => 'Transfer Bank',
            'checkout_from_cart' => true,
        ]);

        $response->assertStatus(200);

        $orderId = $response->json('data.id');

        // Calculate expected total: (50000 * 2) + (75000 * 1) = 175000
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'total_amount' => 175000.00,
        ]);

        // Verify stock deducted
        $this->product1->refresh();
        $this->product2->refresh();
        $this->assertEquals(8, $this->product1->stock);
        $this->assertEquals(4, $this->product2->stock);

        // Cart items should be deleted/cleared
        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $this->customerUser->id,
        ]);
    }

    public function test_merchant_withdrawal_creation_limits_and_admin_verification()
    {
        $merchant = $this->merchantUser->merchant;

        // 1. Create a paid order to generate merchant revenue
        $order = Order::create([
            'user_id' => $this->customerUser->id,
            'merchant_id' => $merchant->id,
            'total_amount' => 200000.00, // Rp200.000 revenue
            'status' => 'completed',
            'payment_method' => 'Transfer',
            'payment_status' => 'paid',
        ]);

        // 2. Request withdrawal higher than revenue -> Expect 400
        $response = $this->withHeaders($this->merchantHeaders)->postJson('/api/merchant/withdrawals', [
            'amount' => 250000.00,
            'bank_name' => 'BSI',
            'bank_account_name' => 'Toko Herbal Mandiri',
            'bank_account_number' => '7123456789',
        ]);
        $response->assertStatus(400);

        // 3. Request withdrawal within revenue -> Expect 200
        $response = $this->withHeaders($this->merchantHeaders)->postJson('/api/merchant/withdrawals', [
            'amount' => 120000.00,
            'bank_name' => 'BSI',
            'bank_account_name' => 'Toko Herbal Mandiri',
            'bank_account_number' => '7123456789',
        ]);
        $response->assertStatus(200);

        $withdrawalId = $response->json('data.id');

        // 4. Admin verify payout approval
        $verifyResponse = $this->withHeaders($this->adminHeaders)->postJson("/api/admin/withdrawals/{$withdrawalId}/verify", [
            'status' => 'approved',
            'notes' => 'Transfer berhasil via BSI Net',
        ]);

        $verifyResponse->assertStatus(200);

        $this->assertDatabaseHas('withdrawals', [
            'id' => $withdrawalId,
            'status' => 'approved',
        ]);

        $this->assertDatabaseHas('admin_audit_logs', [
            'admin_id' => $this->adminUser->id,
            'action' => 'approve_withdrawal',
            'target_type' => 'merchant',
            'target_id' => $merchant->id,
        ]);
    }
}
