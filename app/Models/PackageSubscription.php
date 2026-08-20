<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageSubscription extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'package_id',
        'total_amount',
        'status',
        'payment_method',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
