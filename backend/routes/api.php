<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::prefix('v1')->group(function () {
    Route::apiResource('orders', \App\Http\Controllers\Api\V1\OrderController::class);
});
