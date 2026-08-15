<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'merchant_id',
        'category_id',
        'title',
        'slug',
        'price',
        'price_type',
        'short_description',
        'full_description',
        'status',
        'thumbnail',
        'stock',
        'views_count',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'views_count' => 'integer',
    ];

    protected static function booted()
    {
        parent::booted();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->title);
            }
        });
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Relationships

    public function merchant()
    {
        return $this->belongsTo(Merchant::class, 'merchant_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class, 'product_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'product_id');
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'owner');
    }
}
