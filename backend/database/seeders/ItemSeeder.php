<?php

namespace Database\Seeders;

use App\Models\Item;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // Seeds
            ['code' => 'carrot_seed',   'name' => 'Carrot Seed',   'type' => 'seed', 'buy_price' => 10,  'sell_price' => null, 'growth_time' => 30,  'sprite_key' => 'carrot_seed'],
            ['code' => 'tomato_seed',   'name' => 'Tomato Seed',   'type' => 'seed', 'buy_price' => 20,  'sell_price' => null, 'growth_time' => 60,  'sprite_key' => 'tomato_seed'],
            ['code' => 'corn_seed',     'name' => 'Corn Seed',     'type' => 'seed', 'buy_price' => 35,  'sell_price' => null, 'growth_time' => 90,  'sprite_key' => 'corn_seed'],

            // Tools
            ['code' => 'hoe',           'name' => 'Hoe',           'type' => 'tool', 'buy_price' => 50,  'sell_price' => null, 'growth_time' => null, 'sprite_key' => 'hoe'],
            ['code' => 'watering_can',  'name' => 'Watering Can',  'type' => 'tool', 'buy_price' => 75,  'sell_price' => null, 'growth_time' => null, 'sprite_key' => 'watering_can'],
            ['code' => 'harvest_basket','name' => 'Harvest Basket','type' => 'tool', 'buy_price' => 100, 'sell_price' => null, 'growth_time' => null, 'sprite_key' => 'harvest_basket'],

            // Crops ( hasil panen, hanya sell_price)
            ['code' => 'carrot',        'name' => 'Carrot',        'type' => 'crop', 'buy_price' => null, 'sell_price' => 25,  'growth_time' => null, 'sprite_key' => 'carrot'],
            ['code' => 'tomato',        'name' => 'Tomato',        'type' => 'crop', 'buy_price' => null, 'sell_price' => 60,  'growth_time' => null, 'sprite_key' => 'tomato'],
            ['code' => 'corn',          'name' => 'Corn',          'type' => 'crop', 'buy_price' => null, 'sell_price' => 120, 'growth_time' => null, 'sprite_key' => 'corn'],
        ];

        foreach ($items as $item) {
            Item::updateOrCreate(
                ['code' => $item['code']],
                $item
            );
        }
    }
}
