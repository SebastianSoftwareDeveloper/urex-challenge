<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected $baseUrl = '/api/v1/orders';

    public function test_can_list_orders(): void
    {
        // Crear datos de prueba
        \App\Models\Order::create([
            'customer_name' => 'Cliente Test',
            'customer_email' => 'test@test.com',
            'status' => 'pending',
            'total' => 100,
        ]);

        $response = $this->getJson($this->baseUrl);

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'customer_name', 'total', 'items']
            ]);
    }

    public function test_can_create_order(): void
    {
        $payload = [
            'customer_name' => 'Juan Perez',
            'customer_email' => 'juan@example.com',
            'items' => [
                [
                    'product_name' => 'Producto 1',
                    'quantity' => 2,
                    'price' => 50,
                ]
            ]
        ];

        $response = $this->postJson($this->baseUrl, $payload);

        $response->assertStatus(201)
            ->assertJson([
                'customer_name' => 'Juan Perez',
                'total' => 100, // 2 * 50
            ]);

        $this->assertDatabaseHas('orders', ['customer_email' => 'juan@example.com']);
        $this->assertDatabaseHas('order_items', ['product_name' => 'Producto 1']);
    }

    public function test_cannot_create_order_with_invalid_data(): void
    {
        $response = $this->postJson($this->baseUrl, []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['customer_name', 'items']);
    }

    public function test_create_order_handles_database_error(): void
    {
        // Mockear DB::transaction para que falle
        \Illuminate\Support\Facades\DB::shouldReceive('transaction')
            ->once()
            ->andThrow(new \Exception('Database failure simulation'));

        $payload = [
            'customer_name' => 'Juan Perez',
            'customer_email' => 'juan@example.com',
            'items' => [
                [
                    'product_name' => 'Producto 1',
                    'quantity' => 1,
                    'price' => 10,
                ]
            ]
        ];

        $response = $this->postJson($this->baseUrl, $payload);

        $response->assertStatus(500)
            ->assertJson(['error' => 'An unexpected error occurred while creating the order.']);
    }

    public function test_can_show_order(): void
    {
        $order = \App\Models\Order::create([
            'customer_name' => 'Orden Singular',
            'customer_email' => 'singular@test.com',
            'status' => 'pending',
            'total' => 50,
        ]);

        $response = $this->getJson("{$this->baseUrl}/{$order->id}");

        $response->assertStatus(200)
            ->assertJson(['id' => $order->id]);
    }

    public function test_cannot_show_non_existent_order(): void
    {
        $response = $this->getJson("{$this->baseUrl}/9999");

        $response->assertStatus(404);
    }

    public function test_update_returns_not_implemented(): void
    {
        $response = $this->putJson("{$this->baseUrl}/1", []);
        $response->assertStatus(501);
    }

    public function test_destroy_returns_not_implemented(): void
    {
        $response = $this->deleteJson("{$this->baseUrl}/1");
        $response->assertStatus(501);
    }
}
