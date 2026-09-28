<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\GameService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameController extends Controller
{
    use ApiResponse;

    public function __construct(
        private GameService $gameService,
    ) {}

    /**
     * Handle a game action.
     *
     * POST /api/v1/game/action
     */
    public function action(Request $request): JsonResponse
    {
        $payload = $request->all();
        $result = $this->gameService->handleAction($payload);

        return $this->success($result, 'Game action processed');
    }

    /**
     * Get current game status.
     *
     * GET /api/v1/game/status
     */
    public function status(): JsonResponse
    {
        $result = $this->gameService->getStatus();

        return $this->success($result, 'Game status retrieved');
    }

    /**
     * Sync game data from client.
     *
     * POST /api/v1/game/sync
     */
    public function sync(Request $request): JsonResponse
    {
        $data = $request->all();
        $result = $this->gameService->sync($data);

        return $this->success($result, 'Game data synced');
    }
}
