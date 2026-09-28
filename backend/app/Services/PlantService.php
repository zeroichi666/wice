<?php

namespace App\Services;

use App\Models\Crop;
use App\Models\Inventory;
use App\Models\Item;
use App\Models\TilledTile;
use App\Models\User;
use Carbon\Carbon;

class PlantService
{
    /**
     * Plant a seed on a tilled tile
     */
    public function plant(User $user, int $tileX, int $tileY, string $seedCode): array
    {
        // 1. Check if tile is tilled
        $tilledTile = TilledTile::where('user_id', $user->id)
            ->where('tile_x', $tileX)
            ->where('tile_y', $tileY)
            ->first();

        if (!$tilledTile) {
            return [
                'success' => false,
                'message' => 'Tanah belum dicangkul',
                'error_code' => 'NOT_TILLED',
            ];
        }

        // 2. Check if tile already has a crop
        $existingCrop = Crop::where('user_id', $user->id)
            ->where('tile_x', $tileX)
            ->where('tile_y', $tileY)
            ->whereNull('harvested_at')
            ->first();

        if ($existingCrop) {
            return [
                'success' => false,
                'message' => 'Tile sudah ada tanaman',
                'error_code' => 'CROP_EXISTS',
            ];
        }

        // 3. Check if seed_code is valid
        $item = Item::where('item_code', $seedCode)
            ->where('type', 'seed')
            ->first();

        if (!$item) {
            return [
                'success' => false,
                'message' => 'Bibit tidak valid',
                'error_code' => 'INVALID_SEED',
            ];
        }

        // 4. Check if user has the seed in inventory
        $inventory = Inventory::where('user_id', $user->id)
            ->where('item_id', $item->id)
            ->first();

        if (!$inventory || $inventory->quantity < 1) {
            return [
                'success' => false,
                'message' => 'Bibit tidak cukup',
                'error_code' => 'NO_SEED',
            ];
        }

        // 5. Decrease seed quantity
        $inventory->quantity -= 1;
        $inventory->save();

        // 6. Create crop
        $crop = Crop::create([
            'user_id' => $user->id,
            'tile_x' => $tileX,
            'tile_y' => $tileY,
            'item_id' => $item->id,
            'stage' => 'seed',
            'water_level' => 100,
            'planted_at' => Carbon::now(),
        ]);

        return [
            'success' => true,
            'message' => 'Berhasil menanam ' . $item->name,
            'data' => [
                'crop_id' => $crop->id,
                'tile_x' => $crop->tile_x,
                'tile_y' => $crop->tile_y,
                'item_code' => $item->item_code,
                'stage' => $crop->stage,
                'water_level' => $crop->water_level,
                'planted_at' => $crop->planted_at->toISOString(),
            ],
        ];
    }
}
