<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\HarvestService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HarvestController extends Controller
{
    use ApiResponse;

    public function __construct(
        private HarvestService $harvestService
    ) {}

    /**
     * POST /api/v1/game/harvest
     * Harvest a ready crop
     */
    public function harvest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tile_x' => 'required|integer|min:0',
            'tile_y' => 'required|integer|min:0',
        ]);

        $result = $this->harvestService->harvest(
            $request->user(),
            $validated['tile_x'],
            $validated['tile_y']
        );

        if ($result['success']) {
            return $this->success($result['message'], $result['data']);
        }

        return $this->error($result['message'], 422);
    }
}
