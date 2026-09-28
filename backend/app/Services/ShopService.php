<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\User;

class ShopService
{
    /**
     * Get all shop items (seeds and tools)
     */
    public function getItems(): array
    {
        $items = Item::whereIn('type', ['seed', 'tool'])
            ->get()
            ->map(fn($item) => [
                'code' => $item->item_code,
                'name' => $item->name,
                'type' => $item->type,
                'buy_price' => $item->buy_price,
                'sell_price' => $item->sell_price,
            ])
            ->toArray();

        return $items;
    }

    /**
     * Buy an item from the shop
     */
    public function buy(User $user, string $itemCode, int $quantity): array
    {
        // 1. Validate item exists
        $item = Item::where('item_code', $itemCode)->first();

        if (!$item) {
            return [
                'success' => false,
                'message' => 'Item tidak ditemukan',
                'error_code' => 'ITEM_NOT_FOUND',
            ];
        }

        // 2. Validate quantity
        if ($quantity < 1) {
            return [
                'success' => false,
                'message' => 'Jumlah minimal 1',
                'error_code' => 'INVALID_QUANTITY',
            ];
        }

        // 3. Check if user has enough coins
        $totalCost = $item->buy_price * $quantity;

        if ($user->coins < $totalCost) {
            return [
                'success' => false,
                'message' => 'Koin tidak cukup (butuh ' . $totalCost . ' 💰)',
                'error_code' => 'INSUFFICIENT_COINS',
            ];
        }

        // 4. Deduct coins
        $user->coins -= $totalCost;
        $user->save();

        // 5. Add to inventory (or increment)
        $inventory = Inventory::where('user_id', $user->id)
            ->where('item_id', $item->id)
            ->first();

        if ($inventory) {
            $inventory->quantity += $quantity;
            $inventory->save();
        } else {
            Inventory::create([
                'user_id' => $user->id,
                'item_id' => $item->id,
                'quantity' => $quantity,
            ]);
        }

        // 6. Record transaction
        Transaction::create([
            'user_id' => $user->id,
            'item_id' => $item->id,
            'type' => 'buy',
            'quantity' => $quantity,
            'price' => $item->buy_price,
        ]);

        return [
            'success' => true,
            'message' => 'Berhasil membeli ' . $quantity . 'x ' . $item->name,
            'data' => [
                'coins' => $user->coins,
                'item_code' => $item->item_code,
                'item_name' => $item->name,
                'quantity' => $quantity,
                'total_cost' => $totalCost,
            ],
        ];
    }

    /**
     * Sell a crop item
     */
    public function sell(User $user, string $itemCode, int $quantity): array
    {
        // 1. Validate item exists and is a crop
        $item = Item::where('item_code', $itemCode)
            ->where('type', 'crop')
            ->first();

        if (!$item) {
            return [
                'success' => false,
                'message' => 'Item tidak bisa dijual',
                'error_code' => 'ITEM_NOT_SELLABLE',
            ];
        }

        // 2. Validate quantity
        if ($quantity < 1) {
            return [
                'success' => false,
                'message' => 'Jumlah minimal 1',
                'error_code' => 'INVALID_QUANTITY',
            ];
        }

        // 3. Check if user has enough in inventory
        $inventory = Inventory::where('user_id', $user->id)
            ->where('item_id', $item->id)
            ->first();

        if (!$inventory || $inventory->quantity < $quantity) {
            return [
                'success' => false,
                'message' => 'Inventory tidak cukup',
                'error_code' => 'INSUFFICIENT_INVENTORY',
            ];
        }

        // 4. Calculate earnings
        $totalEarnings = $item->sell_price * $quantity;

        // 5. Deduct from inventory
        $inventory->quantity -= $quantity;
        if ($inventory->quantity <= 0) {
            $inventory->delete();
        } else {
            $inventory->save();
        }

        // 6. Add coins
        $user->coins += $totalEarnings;
        $user->save();

        // 7. Record transaction
        Transaction::create([
            'user_id' => $user->id,
            'item_id' => $item->id,
            'type' => 'sell',
            'quantity' => $quantity,
            'price' => $item->sell_price,
        ]);

        return [
            'success' => true,
            'message' => 'Berhasil menjual ' . $quantity . 'x ' . $item->name . ' seharga 💰' . $totalEarnings,
            'data' => [
                'coins' => $user->coins,
                'item_code' => $item->item_code,
                'item_name' => $item->name,
                'quantity' => $quantity,
                'total_earnings' => $totalEarnings,
            ],
        ];
    }
}
