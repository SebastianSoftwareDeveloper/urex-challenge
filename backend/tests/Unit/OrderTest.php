<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Order;
use App\Models\OrderItem;

class OrderTest extends TestCase
{
    public function test_order_has_items_relationship(): void
    {
        $order = new Order();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $order->items());
    }

    public function test_order_item_has_order_relationship(): void
    {
        $item = new OrderItem();
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $item->order());
    }
}
