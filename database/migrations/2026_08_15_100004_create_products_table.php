<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('merchant_id')->constrained('merchants')->onDelete('cascade');
            $table->foreignUuid('category_id')->constrained('categories');
            $table->string('title');
            $table->string('slug')->unique();
            $table->decimal('price', 12, 2);
            $table->enum('price_type', ['starting_from', 'contact_us']);
            $table->string('short_description');
            $table->text('full_description');
            $table->enum('status', ['active', 'pending', 'rejected'])->default('pending');
            $table->string('thumbnail')->nullable();
            $table->integer('stock')->default(0);
            $table->integer('views_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            // $table->fullText('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
