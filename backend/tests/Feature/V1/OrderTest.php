<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected $baseUrl = '/api/v1/orders';

    public function test_can_list_orders(): void
    {
        Order::create([
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

    public function test_authenticated_user_can_create_order(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

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
                'total' => 100,
            ]);

        $this->assertDatabaseHas('orders', ['customer_email' => 'juan@example.com']);
    }

    public function test_unauthenticated_user_cannot_create_order(): void
    {
        $response = $this->postJson($this->baseUrl, [
            'customer_name' => 'Invasor',
        ]);

        $response->assertStatus(401); 
    }

    public function test_cannot_create_order_with_invalid_data(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson($this->baseUrl, []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['customer_name', 'items']);
    }

    public function test_create_order_handles_database_error(): void
    {
        Sanctum::actingAs(User::factory()->create());

        DB::shouldReceive('transaction')
            ->once()
            ->andThrow(new \Exception('Database failure simulation'));

        \Illuminate\Support\Facades\Log::shouldReceive('error')->once();

        $payload = [
            'customer_name' => 'Juan Perez',
            'customer_email' => 'juan@example.com',
            'items' => [['product_name' => 'P1', 'quantity' => 1, 'price' => 10]]
        ];

        $response = $this->postJson($this->baseUrl, $payload);

        $response->assertStatus(500);
    }

    public function test_can_show_order(): void
    {
        $order = Order::create([
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
        $response = $this->getJson("{$this->baseUrl}/999999");

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'Order not found'
            ]);
    }
}