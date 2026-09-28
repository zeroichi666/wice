<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Crop;
use App\Models\Inventory;
use App\Services\CropService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameStateController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CropService $cropService
    ) {}

    /**
     * GET /api/v1/game/state
     *
     * Load full game state for the authenticated player.
     * Updates crop states before returning.
     *
     * @example Response
     * {
     *   "success": true,
     *   "message": "Game state loaded",
     *   "data": {
     *     "user": { "id": 1, "username": "farmer1", "coins": 100, "level": 1 },
     *     "inventory": [
     *       { "item_code": "carrot_seed", "name": "Carrot Seed", "quantity": 3 },
     *       { "item_code": "hoe", "name": "Hoe", "quantity": 1 }
     *     ],
     *     "tools": ["hoe", "watering_can"],
     *     "crops": [
     *       {
     *         "tile_x": 5, "tile_y": 3,
     *         "item_code": "carrot_seed",
     *         "stage": "growing",
     *         "water_level": 60,
     *         "planted_at": "2025-01-01T10:00:00Z",
     *         "time_to_ready": 15
     *       }
     *     ]
     *   }
     * }
     */
    public function state(Request $request): JsonResponse
    {
        $user = $request->user();

        // Update all crop states based on elapsed time
        $this->cropService->updateAllUserCrops($user->id);

        // Fetch inventory with item details
        $inventory = Inventory::where('user_id', $user->id)
            ->with('item')
            ->get()
            ->filter(fn($inv) => $inv->item !== null)
            ->map(fn($inv) => [
                'item_code' => $inv->item->code,
                'name'      => $inv->item->name,
                'type'      => $inv->item->type,
                'quantity'  => $inv->quantity,
            ]);

        // Extract tool shortcuts
        $tools = $inventory
            ->where('type', 'tool')
            ->pluck('item_code')
            ->values();

        // Fetch crops with computed state
        $crops = Crop::where('user_id', $user->id)
            ->whereNull('harvested_at')
            ->with('item')
            ->get()
            ->map(function (Crop $crop) {
                $item = $crop->item;
                return [
                    'tile_x'       => $crop->tile_x,
                    'tile_y'       => $crop->tile_y,
                    'item_code'    => $item?->code,
                    'stage'        => $crop->stage,
                    'water_level'  => $crop->water_level,
                    'planted_at'   => $crop->planted_at?->toISOString(),
                    'time_to_ready'=> $crop->time_to_ready ?? 0,
                ];
            });

        return $this->success('Game state loaded', [
            'user'      => $user->only(['id', 'username', 'coins', 'level']),
            'inventory' => $inventory->values(),
            'tools'     => $tools,
            'crops'     => $crops,
        ]);
    }

    /**
     * GET /api/v1/game/world
     *
     * Return map/world data (static for now).
     *
     * @example Response
     * {
     *   "success": true,
     *   "message": "World data loaded",
     *   "data": {
     *     "width": 20,
     *     "height": 15,
     *     "tile_size": 32,
     *     "well": { "x": 0, "y": 7 },
     *     "shop": { "x": 19, "y": 7 },
     *     "tiles": [
     *       { "x": 5, "y": 3, "type": "soil" },
     *       { "x": 5, "y": 4, "type": "soil" }
     *     ]
     *   }
     * }
     */
    public function world(): JsonResponse
    {
        // Static world data for phase 1
        $world = [
            'width'     => 20,
            'height'    => 15,
            'tile_size' => 32,
            'well'      => ['x' => 0, 'y' => 7],
            'shop'      => ['x' => 19, 'y' => 7],
            'tiles'     => $this->generateSoilTiles(),
        ];

        return $this->success('World data loaded', $world);
    }

    /**
     * Generate farmable soil tiles (hardcoded layout)
     */
    private function generateSoilTiles(): array
    {
        $tiles = [];

        // Farm plot: rows 2-8, cols 3-16
        for ($y = 2; $y <= 8; $y++) {
            for ($x = 3; $x <= 16; $x++) {
                $tiles[] = ['x' => $x, 'y' => $y, 'type' => 'soil'];
            }
        }

        return $tiles;
    }
}
