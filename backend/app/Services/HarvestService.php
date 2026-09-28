<?php

namespace App\Services;

use App\Models\Crop;
use App\Models\Inventory;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

class HarvestService
{
    /**
     * Harvest a ready crop
     */
    public function harvest(User $user, int $tileX, int $tileY): array
    {
        // 1. Check if user has harvest_basket
        $basket = Inventory::where('user_id', $user->id)
            ->where('item_code', 'harvest_basket')
            ->first();

        if (!$basket) {
            return [
                'success' => false,
                'message' => 'Kamu butuh Keranjang Panen',
                'error_code' => 'NO_BASKET',
            ];
        }

        // 2. Check if there's a crop at this tile
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

        // 3. Check if crop is ready
        if ($crop->stage !== 'ready') {
            return [
                'success' => false,
                'message' => 'Tanaman belum siap panen',
                'error_code' => 'NOT_READY',
            ];
        }

        // Get the item info
        $item = Item::find($crop->item_id);
        if (!$item) {
            return [
                'success' => false,
                'message' => 'Item tidak ditemukan',
                'error_code' => 'ITEM_NOT_FOUND',
            ];
        }

        // 4. Mark crop as harvested
        $crop->harvested_at = Carbon::now();
        $crop->save();

        // 5. Add harvest to inventory (find the crop product item)
        // The seed item_code is like "carrot_seed", the product is "carrot"
        $productCode = str_replace('_seed', '', $item->item_code);
        $productItem = Item::where('item_code', $productCode)->first();

        if (!$productItem) {
            // Fallback: use the seed item itself
            $productItem = $item;
        }

        $inventory = Inventory::where('user_id', $user->id)
            ->where('item_id', $productItem->id)
            ->first();

        if ($inventory) {
            $inventory->quantity += 1;
            $inventory->save();
        } else {
            Inventory::create([
                'user_id' => $user->id,
                'item_id' => $productItem->id,
                'quantity' => 1,
            ]);
        }

        // 6. Record transaction
        Transaction::create([
            'user_id' => $user->id,
            'item_id' => $productItem->id,
            'type' => 'harvest',
            'quantity' => 1,
            'price' => 0,
        ]);

        return [
            'success' => true,
            'message' => 'Berhasil panen ' . $productItem->name,
            'data' => [
                'crop_id' => $crop->id,
                'product_code' => $productItem->item_code,
                'product_name' => $productItem->name,
            ],
        ];
    }
}
