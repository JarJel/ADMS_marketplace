<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Category;
use App\Models\Product;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_fetch_public_categories()
    {
        Category::factory()->count(3)->create(['type' => 'product']);

        $response = $this->getJson('/api/public/categories');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ])
                 ->assertJsonCount(3, 'data');
    }

    public function test_can_fetch_public_products()
    {
        // Product factory might need Category and Merchant, assuming Product factory handles it.
        // We use testing seeder to safely run this test if factories are complex.
        $this->seed(\Database\Seeders\TestingDataSeeder::class);

        $response = $this->getJson('/api/public/products');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ]);
                 
        // Verify data structure has pagination
        $this->assertArrayHasKey('data', $response->json());
        $this->assertArrayHasKey('total', $response->json('data'));
    }

    public function test_can_fetch_public_product_detail()
    {
        $this->seed(\Database\Seeders\TestingDataSeeder::class);
        $product = Product::active()->first();

        $response = $this->getJson('/api/public/products/' . $product->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ])
                 ->assertJsonPath('data.id', $product->id);
    }
}
