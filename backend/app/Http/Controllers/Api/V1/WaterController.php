<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\WaterService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WaterController extends Controller
{
    use ApiResponse;

    public function __construct(
        private WaterService $waterService
    ) {}

    /**
     * POST /api/v1/game/refill-water
     * Refill watering can at well
     */
    public function refillWater(Request $request): JsonResponse
    {
        $result = $this->waterService->refillWater($request->user());

        if ($result['success']) {
            return $this->success($result['message'], $result['data']);
        }

        return $this->error($result['message'], 422);
    }

    /**
     * POST /api/v1/game/water
     * Water a crop
     */
    public function water(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tile_x' => 'required|integer|min:0',
            'tile_y' => 'required|integer|min:0',
        ]);

        $result = $this->waterService->water(
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
