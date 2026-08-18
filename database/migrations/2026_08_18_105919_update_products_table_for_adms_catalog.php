<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Alter products table
        Schema::table('products', function (Blueprint $table) {
            $table->string('product_type')->default('digital_service')->after('category_id');
            $table->string('unit')->nullable()->after('price_type');
            $table->integer('minimum_order')->nullable()->after('unit');
            $table->decimal('price', 12, 2)->nullable()->change();
            // Drop enum constraint by changing to string
            $table->string('price_type')->default('starting_from')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['product_type', 'unit', 'minimum_order']);
            // Note: Cannot easily revert string back to enum without risking data loss
            $table->decimal('price', 12, 2)->nullable(false)->change();
        });
    }
};
