<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use \App\Models\Order;
use \Illuminate\Support\Facades\DB;
use \Exception;
use App\Http\Controllers\Controller;

use App\Http\Requests\Api\V1\Order\StoreOrderRequest;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = Order::with('items')->latest()->get();
        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        try {
            return DB::transaction(function () use ($validated) {

                $total = collect($validated['items'])->sum(function ($item) {
                    return $item['quantity'] * $item['price'];
                });

                $order = Order::create([
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'],
                    'status' => 'pending',
                    'total' => $total,
                ]);

                // Calculate total based on items for security and integrity
                foreach ($validated['items'] as $item) {
                    $order->items()->create($item);
                }

                return response()->json($order->load('items'), 201);
            });
        } catch (Exception $e) {
            return response()->json(['error' => 'Error creating order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $order = Order::with('items')->find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        return response()->json(['message' => 'Not implemented'], 501);
    }
}
