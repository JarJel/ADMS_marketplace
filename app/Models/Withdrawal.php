<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Withdrawal extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'merchant_id',
        'amount',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    // Relationships

    public function merchant()
    {
        return $this->belongsTo(Merchant::class, 'merchant_id');
    }
}
