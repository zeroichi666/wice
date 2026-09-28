<?php

namespace App\Services;

use App\Models\Crop;
use App\Models\Inventory;
use App\Models\User;
use Carbon\Carbon;

class WaterService
{
    private const WATER_CAPACITY_MAX = 5;

    /**
     * Refill watering can to max capacity
     */
    public function refillWater(User $user): array
    {
        // Check if user has watering_can
        $wateringCan = Inventory::where('user_id', $user->id)
            ->where('item_code', 'watering_can')
            ->first();

        if (!$wateringCan) {
            return [
                'success' => false,
                'message' => 'Kamu butuh Ember Air',
                'error_code' => 'NO_WATERING_CAN',
            ];
        }

        // Refill to max
        $user->water_capacity = self::WATER_CAPACITY_MAX;
        $user->save();

        return [
            'success' => true,
            'message' => 'Ember air penuh! (' . self::WATER_CAPACITY_MAX . '/' . self::WATER_CAPACITY_MAX . ')',
            'data' => [
                'water_capacity' => $user->water_capacity,
            ],
        ];
    }

    /**
     * Water a crop at given coordinates
     */
    public function water(User $user, int $tileX, int $tileY): array
    {
        // Check if user has watering_can
        $wateringCan = Inventory::where('user_id', $user->id)
            ->where('item_code', 'watering_can')
            ->first();

        if (!$wateringCan) {
            return [
                'success' => false,
                'message' => 'Kamu butuh Ember Air',
                'error_code' => 'NO_WATERING_CAN',
            ];
        }

        // Check water capacity
        if ($user->water_capacity < 1) {
            return [
                'success' => false,
                'message' => 'Air habis! Isi ulang di sumur',
                'error_code' => 'NO_WATER',
            ];
        }

        // Check if there's a crop at this tile
        $crop = Crop::where('user_id', $user->id)
            ->where('tile_x', $tileX)
            ->where('tile_y', $tileY)
            ->whereNull('harvested_at')
            ->first();

        if (!$crop) {
            return [
                'success' => false,
                'message' => 'Tidak ada tanaman di tile ini',
                'error_code' => 'NO_CROP',
            ];
        }

        // Check if crop is ready
        if ($crop->stage === 'ready') {
            return [
                'success' => false,
                'message' => 'Tanaman sudah siap panen',
                'error_code' => 'CROP_READY',
            ];
        }

        // Decrease water capacity
        $user->water_capacity -= 1;
        $user->save();

        // Update crop water level
        $crop->water_level = 100;
        $crop->last_watered_at = Carbon::now();
        $crop->save();

        return [
            'success' => true,
            'message' => 'Tanaman berhasil disiram 💧',
            'data' => [
                'water_capacity' => $user->water_capacity,
                'water_level' => $crop->water_level,
                'last_watered_at' => $crop->last_watered_at->toISOString(),
            ],
        ];
    }
}
