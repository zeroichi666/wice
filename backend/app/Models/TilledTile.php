<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TilledTile extends Model
{
    protected $fillable = [
        'user_id',
        'tile_x',
        'tile_y',
        'tilled_at',
    ];

    protected $casts = [
        'tilled_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
