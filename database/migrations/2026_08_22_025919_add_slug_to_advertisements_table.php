<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('title');
        });

        // Generate slugs for existing advertisements
        $ads = DB::table('advertisements')->get();
        foreach ($ads as $ad) {
            $baseSlug = Str::slug($ad->title);
            if (empty($baseSlug)) {
                $baseSlug = 'ad-' . substr($ad->id, 0, 8);
            }
            $slug = $baseSlug;
            $count = 1;
            while (DB::table('advertisements')->where('slug', $slug)->where('id', '!=', $ad->id)->exists()) {
                $slug = $baseSlug . '-' . $count;
                $count++;
            }
            DB::table('advertisements')->where('id', $ad->id)->update(['slug' => $slug]);
        }

        Schema::table('advertisements', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
