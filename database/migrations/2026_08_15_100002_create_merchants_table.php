<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('location');
            $table->string('contact_whatsapp');
            $table->boolean('syariah_certified')->default(false);
            $table->string('syariah_cert_number')->nullable();
            $table->string('syariah_cert_body')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchants');
    }
};
