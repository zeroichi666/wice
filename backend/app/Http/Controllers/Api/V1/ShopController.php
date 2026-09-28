<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ShopService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ShopService $shopService
    ) {}

    /**
     * GET /api/v1/shop/items
     * Get all shop items
     */
    public function getItems(): JsonResponse
    {
        $items = $this->shopService->getItems();
        return $this->success('Shop items loaded', $items);
    }

    /**
     * POST /api/v1/shop/buy
     * Buy an item from the shop
     */
    public function buy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_code' => 'required|string',
            'quantity' => 'required|integer|min:1',
        ]);

        $result = $this->shopService->buy(
            $request->user(),
            $validated['item_code'],
            $validated['quantity']
        );

        if ($result['success']) {
            return $this->success($result['message'], $result['data']);
        }

        return $this->error($result['message'], 422);
    }
}
