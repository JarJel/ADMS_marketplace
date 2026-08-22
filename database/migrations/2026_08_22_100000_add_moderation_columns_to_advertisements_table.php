<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->text('moderation_note')->nullable();
            
            // Note: Changing ENUM column to string to allow 'blocked' and 'review' statuses
            // This is supported natively in Laravel 11 for most databases.
            $table->string('status')->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropColumn('moderation_note');
        });
    }
};
