<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuthToken;
use App\Models\Category;
use App\Models\Package;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\Advertisement;
use App\Models\AdminAuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private $adminUser;
    private $adminToken;
    private $adminHeaders;

    private $nonAdminUser;
    private $nonAdminToken;
    private $nonAdminHeaders;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Admin setup
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->adminToken = 'admin_secret_token_12345';
        AuthToken::create([
            'user_id' => $this->adminUser->id,
            'token' => hash('sha256', $this->adminToken),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);

        $this->adminHeaders = [
            'Authorization' => 'Bearer ' . $this->adminToken,
        ];

        // 2. Non-admin setup
        $this->nonAdminUser = User::factory()->create([
            'role' => 'user',
            'status' => 'active',
        ]);

        $this->nonAdminToken = 'non_admin_token_67890';
        AuthToken::create([
            'user_id' => $this->nonAdminUser->id,
            'token' => hash('sha256', $this->nonAdminToken),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);

        $this->nonAdminHeaders = [
            'Authorization' => 'Bearer ' . $this->nonAdminToken,
        ];
    }

    public function test_non_admin_cannot_access_admin_endpoints()
    {
        $response = $this->withHeaders($this->nonAdminHeaders)->getJson('/api/admin/users');
        $response->assertStatus(403);
    }

    public function test_admin_can_toggle_user_status_and_audit_log_is_created()
    {
        $targetUser = User::factory()->create(['status' => 'active']);

        // Suspend user
        $response = $this->withHeaders($this->adminHeaders)->postJson("/api/admin/users/{$targetUser->id}/toggle-status", [
            'reason' => 'Pelanggaran syarat & ketentuan syariah',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'suspended']);

        $this->assertDatabaseHas('admin_audit_logs', [
            'admin_id' => $this->adminUser->id,
            'action' => 'suspend_user',
            'target_type' => 'user',
            'target_id' => $targetUser->id,
            'reason' => 'Pelanggaran syarat & ketentuan syariah',
        ]);

        // Unsuspend user
        $response = $this->withHeaders($this->adminHeaders)->postJson("/api/admin/users/{$targetUser->id}/toggle-status");
        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'active']);
    }

    public function test_admin_can_verify_merchant_and_owner_role_upgrades()
    {
        $merchantOwner = User::factory()->create(['role' => 'user']);
        $merchant = Merchant::create([
            'owner_id' => $merchantOwner->id,
            'name' => 'Toko Herbal Habbat',
            'slug' => 'toko-herbal-habbat',
            'location' => 'Solo',
            'contact_whatsapp' => '081234567890',
            'is_verified' => false,
        ]);

        $response = $this->withHeaders($this->adminHeaders)->postJson("/api/admin/merchants/{$merchant->id}/verify", [
            'status' => 'VERIFIED',
            'notes' => 'Dokumen sertifikasi MUI valid',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['is_verified' => true]);

        // Owner's role should be upgraded to 'merchant'
        $merchantOwner->refresh();
        $this->assertEquals('merchant', $merchantOwner->role);

        $this->assertDatabaseHas('admin_audit_logs', [
            'admin_id' => $this->adminUser->id,
            'action' => 'approve_merchant',
            'target_type' => 'merchant',
            'target_id' => $merchant->id,
        ]);
    }

    public function test_admin_can_verify_product_and_audit_log_is_created()
    {
        $merchantOwner = User::factory()->create();
        $merchant = Merchant::create([
            'owner_id' => $merchantOwner->id,
            'name' => 'Toko Buku',
            'slug' => 'toko-buku',
            'location' => 'Solo',
            'contact_whatsapp' => '081234567890',
        ]);

        $category = Category::create([
            'name' => 'Buku',
            'slug' => 'buku',
            'type' => 'product',
        ]);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $category->id,
            'title' => 'Ebook Fiqh',
            'price' => 20000.00,
            'price_type' => 'starting_from',
            'short_description' => 'Ebook fiqh',
            'full_description' => 'Ebook fiqh muamalah',
            'stock' => 100,
            'status' => 'pending',
        ]);

        $response = $this->withHeaders($this->adminHeaders)->postJson("/api/admin/products/{$product->id}/verify", [
            'status' => 'active',
            'reason' => 'Konten sesuai nilai syariah',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'active']);

        $this->assertDatabaseHas('admin_audit_logs', [
            'admin_id' => $this->adminUser->id,
            'action' => 'approve_product',
            'target_type' => 'product',
            'target_id' => $product->id,
        ]);
    }

    public function test_admin_can_verify_ad_and_expiration_is_set()
    {
        $category = Category::create([
            'name' => 'Jasa',
            'slug' => 'jasa',
            'type' => 'advertisement',
        ]);

        $package = Package::create([
            'name' => 'Premium Featured',
            'price' => 150000.00,
            'duration_days' => 30,
            'type' => 'premium',
        ]);

        $ad = Advertisement::create([
            'title' => 'Jasa Bekam',
            'category_id' => $category->id,
            'description' => 'Jasa bekam sunnah',
            'location' => 'Yogyakarta',
            'contact_name' => 'Ahmad',
            'whatsapp' => '081234567890',
            'condition' => 'baru',
            'duration_days' => $package->duration_days,
            'package_id' => $package->id,
            'status' => 'pending',
            'owner_id' => $this->nonAdminUser->id,
        ]);

        $response = $this->withHeaders($this->adminHeaders)->postJson("/api/admin/ads/{$ad->id}/verify", [
            'status' => 'approved',
            'reason' => 'Iklan sesuai kriteria',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'approved']);

        $ad->refresh();
        $this->assertNotNull($ad->expires_at);

        $this->assertDatabaseHas('admin_audit_logs', [
            'admin_id' => $this->adminUser->id,
            'action' => 'approve_ad',
            'target_type' => 'advertisement',
            'target_id' => $ad->id,
        ]);
    }

    public function test_admin_can_manage_categories_and_packages()
    {
        // 1. Store Category
        $response = $this->withHeaders($this->adminHeaders)->postJson('/api/admin/categories', [
            'name' => 'Makanan Organik',
            'slug' => 'makanan-organik',
            'type' => 'product',
        ]);

        $response->assertStatus(200);
        $categoryId = $response->json('data.id');

        // 2. Update Category
        $response = $this->withHeaders($this->adminHeaders)->putJson("/api/admin/categories/{$categoryId}", [
            'name' => 'Makanan & Minuman Sehat',
            'slug' => 'makanan-minuman-sehat',
            'type' => 'product',
        ]);
        $response->assertStatus(200);

        // 3. Update Package
        $package = Package::create([
            'name' => 'Premium Featured',
            'price' => 150000.00,
            'duration_days' => 30,
            'type' => 'premium',
            'is_active' => true,
        ]);

        $response = $this->withHeaders($this->adminHeaders)->putJson("/api/admin/packages/{$package->id}", [
            'name' => 'Premium VIP',
            'price' => 299000.00,
            'duration_days' => 90,
            'type' => 'premium',
            'benefits' => ['Headline display', 'Unlimited media', 'CS Priority'],
            'is_active' => true,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['price' => '299000.00', 'duration_days' => 90]);
    }

    public function test_admin_can_get_audit_logs()
    {
        // Trigger an audit log creation
        AdminAuditLog::create([
            'admin_id' => $this->adminUser->id,
            'action' => 'custom_admin_action',
            'target_type' => 'user',
            'target_id' => $this->nonAdminUser->id,
            'reason' => 'Testing logs',
        ]);

        $response = $this->withHeaders($this->adminHeaders)->getJson('/api/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'data' => ['data', 'current_page']]);
    }
}
