<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::apiResource('orders', \App\Http\Controllers\OrderController::class);
