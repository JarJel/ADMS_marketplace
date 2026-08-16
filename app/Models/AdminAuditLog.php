<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AdminAuditLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'admin_id',
        'action',
        'target_type',
        'target_id',
        'reason',
    ];

    // Relationships

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the target model (polymorphic relation).
     */
    public function target()
    {
        return $this->morphTo('target', 'target_type', 'target_id');
    }
}
