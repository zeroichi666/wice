<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\GameController;
use App\Http\Controllers\Api\V1\GameStateController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ── Public Routes ──────────────────────────────────────
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // ── Protected Routes ───────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Game State
        Route::get('/game/state', [GameStateController::class, 'state']);
        Route::get('/game/world', [GameStateController::class, 'world']);

        // Game Actions
        Route::prefix('game')->group(function () {
            Route::post('/action', [GameController::class, 'action']);
            Route::get('/status', [GameController::class, 'status']);
            Route::post('/sync', [GameController::class, 'sync']);
        });
    });
});
