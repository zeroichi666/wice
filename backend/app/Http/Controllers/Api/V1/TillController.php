<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TillService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TillController extends Controller
{
    use ApiResponse;

    public function __construct(
        private TillService $tillService
    ) {}

    /**
     * POST /api/v1/game/till
     * Till a soil tile
     */
    public function till(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tile_x' => 'required|integer|min:0',
            'tile_y' => 'required|integer|min:0',
        ]);

        $result = $this->tillService->till(
            $request->user(),
            $validated['tile_x'],
            $validated['tile_y']
        );

        if ($result['success']) {
            return $this->success($result['message'], $result['data']);
        }

        return $this->error($result['message'], 422);
    }

    /**
     * GET /api/v1/game/tilled
     * Get all tilled tiles for user
     */
    public function getTilledTiles(Request $request): JsonResponse
    {
        $tiles = $this->tillService->getTilledTiles($request->user());
        return $this->success('Tilled tiles loaded', $tiles);
    }
}
