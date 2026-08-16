<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Package extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'price',
        'duration_days',
        'type',
        'benefits',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'benefits' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships

    public function advertisements()
    {
        return $this->hasMany(Advertisement::class, 'package_id');
    }
}
