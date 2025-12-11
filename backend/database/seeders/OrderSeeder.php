<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear 10 pedidos de prueba
        for ($i = 1; $i <= 10; $i++) {
            $order = \App\Models\Order::create([
                'customer_name' => 'Cliente ' . $i,
                'customer_email' => 'cliente' . $i . '@example.com',
                'status' => 'pending',
                'total' => 0, // Se calculará sumando los items
            ]);

            $total = 0;
            // Crear entre 1 y 5 items por pedido
            $numItems = rand(1, 5);
            
            for ($j = 1; $j <= $numItems; $j++) {
                $price = rand(10, 100);
                $quantity = rand(1, 3);
                $subtotal = $price * $quantity;
                
                $order->items()->create([
                    'product_name' => 'Producto ' . $j . ' del pedido ' . $i,
                    'quantity' => $quantity,
                    'price' => $price,
                ]);

                $total += $subtotal;
            }

            // Actualizar el total del pedido
            $order->update(['total' => $total]);
        }
    }
}
