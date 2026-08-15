<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advertisements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->foreignUuid('category_id')->constrained('categories');
            $table->string('subcategory')->nullable();
            $table->text('description');
            $table->decimal('price', 12, 2)->nullable();
            $table->string('location');
            $table->string('contact_name');
            $table->string('whatsapp');
            $table->string('website_url')->nullable();
            $table->enum('condition', ['baru', 'bekas']);
            $table->json('tags')->nullable();
            $table->integer('duration_days');
            $table->foreignUuid('package_id')->constrained('packages');
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');
            $table->foreignUuid('merchant_id')->nullable()->constrained('merchants')->nullOnDelete();
            $table->foreignUuid('owner_id')->constrained('users')->onDelete('cascade');
            $table->integer('views_count')->default(0);
            $table->integer('clicks_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->fullText('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
