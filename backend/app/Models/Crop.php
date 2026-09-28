<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Crop extends Model
{
    protected $fillable = [
        'user_id',
        'tile_x',
        'tile_y',
        'item_id',
        'stage',
        'water_level',
        'planted_at',
        'last_watered_at',
        'harvested_at',
    ];

    protected $casts = [
        'planted_at' => 'datetime',
        'last_watered_at' => 'datetime',
        'harvested_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
