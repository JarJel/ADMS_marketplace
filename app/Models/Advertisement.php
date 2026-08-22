<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Advertisement extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'category_id',
        'subcategory',
        'description',
        'price',
        'location',
        'contact_name',
        'whatsapp',
        'website_url',
        'condition',
        'tags',
        'duration_days',
        'package_id',
        'status',
        'merchant_id',
        'owner_id',
        'views_count',
        'clicks_count',
        'expires_at',
        'moderation_note',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'tags' => 'array',
        'duration_days' => 'integer',
        'views_count' => 'integer',
        'clicks_count' => 'integer',
        'expires_at' => 'datetime',
    ];

    protected static function booted()
    {
        parent::booted();

        static::creating(function ($ad) {
            if (empty($ad->expires_at) && $ad->duration_days) {
                $ad->expires_at = now()->addDays($ad->duration_days);
            }
        });
    }

    // Relationships

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function merchant()
    {
        return $this->belongsTo(Merchant::class, 'merchant_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class, 'advertisement_id');
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'owner');
    }
}
