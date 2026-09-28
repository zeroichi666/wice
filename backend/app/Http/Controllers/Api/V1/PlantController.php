<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PlantService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlantController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PlantService $plantService
    ) {}

    /**
     * POST /api/v1/game/plant
     * Plant a seed on a tilled tile
     */
    public function plant(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tile_x' => 'required|integer|min:0',
            'tile_y' => 'required|integer|min:0',
            'seed_code' => 'required|string',
        ]);

        $result = $this->plantService->plant(
            $request->user(),
            $validated['tile_x'],
            $validated['tile_y'],
            $validated['seed_code']
        );

        if ($result['success']) {
            return $this->success($result['message'], $result['data']);
        }

        return $this->error($result['message'], 422);
    }
}
