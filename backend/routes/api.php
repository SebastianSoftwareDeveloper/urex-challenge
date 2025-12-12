<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::prefix('v1')->group(function () {

    Route::middleware('auth:sanctum')->post('/orders', [\App\Http\Controllers\Api\V1\OrderController::class, 'store']);

    Route::get('/orders', [\App\Http\Controllers\Api\V1\OrderController::class, 'index']);
    Route::get('/orders/{order}', [\App\Http\Controllers\Api\V1\OrderController::class, 'show']);
});
