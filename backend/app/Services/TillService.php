<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\TilledTile;
use App\Models\User;
use Carbon\Carbon;

class TillService
{
    /**
     * Map boundaries
     */
    private const MAP_WIDTH = 20;
    private const MAP_HEIGHT = 15;

    /**
     * Tillable tile types (soil, grass)
     * Non-tillable: path, water, well, shop, walls
     */
    private const TILLABLE_TILES = ['soil', 'grass'];

    /**
     * Till a tile at given coordinates
     */
    public function till(User $user, int $tileX, int $tileY): array
    {
        // 1. Check if user has hoe in inventory
        $hoe = Inventory::where('user_id', $user->id)
            ->where('item_code', 'hoe')
            ->first();

        if (!$hoe) {
            return [
                'success' => false,
                'message' => 'Kamu butuh Cangkul',
                'error_code' => 'NO_HOE',
            ];
        }

        // 2. Validate tile is within map bounds
        if ($tileX < 0 || $tileX >= self::MAP_WIDTH || $tileY < 0 || $tileY >= self::MAP_HEIGHT) {
            return [
                'success' => false,
                'message' => 'Posisi di luar batas peta',
                'error_code' => 'OUT_OF_BOUNDS',
            ];
        }

        // 3. Check if tile is already tilled
        $existingTill = TilledTile::where('user_id', $user->id)
            ->where('tile_x', $tileX)
            ->where('tile_y', $tileY)
            ->first();

        if ($existingTill) {
            return [
                'success' => false,
                'message' => 'Tanah sudah dicangkul',
                'error_code' => 'ALREADY_TILLED',
            ];
        }

        // 4. Create tilled tile
        $tilledTile = TilledTile::create([
            'user_id' => $user->id,
            'tile_x' => $tileX,
            'tile_y' => $tileY,
            'tilled_at' => Carbon::now(),
        ]);

        return [
            'success' => true,
            'message' => 'Berhasil mencangkul tanah',
            'data' => [
                'tile_x' => $tilledTile->tile_x,
                'tile_y' => $tilledTile->tile_y,
                'tilled_at' => $tilledTile->tilled_at->toISOString(),
            ],
        ];
    }

    /**
     * Get all tilled tiles for a user
     */
    public function getTilledTiles(User $user): array
    {
        return TilledTile::where('user_id', $user->id)
            ->get()
            ->map(fn($tile) => [
                'tile_x' => $tile->tile_x,
                'tile_y' => $tile->tile_y,
                'tilled_at' => $tile->tilled_at->toISOString(),
            ])
            ->toArray();
    }
}
