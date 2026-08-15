<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Merchant extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'description',
        'is_verified',
        'location',
        'contact_whatsapp',
        'syariah_certified',
        'syariah_cert_number',
        'syariah_cert_body',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'syariah_certified' => 'boolean',
    ];

    protected static function booted()
    {
        parent::booted();

        static::creating(function ($merchant) {
            if (empty($merchant->slug)) {
                $merchant->slug = Str::slug($merchant->name);
            }
        });
    }

    // Scopes

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    // Relationships

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'merchant_id');
    }

    public function advertisements()
    {
        return $this->hasMany(Advertisement::class, 'merchant_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'merchant_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'merchant_id');
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'owner');
    }

    public function logo()
    {
        return $this->morphOne(Media::class, 'owner')->where('type', 'merchant_logo');
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class, 'merchant_id');
    }
}
