<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('type', ['seed', 'tool', 'crop']);
            $table->integer('buy_price')->nullable();
            $table->integer('sell_price')->nullable();
            $table->integer('growth_time')->nullable()->comment('Detik, untuk seed');
            $table->string('sprite_key')->comment('Key sprite untuk frontend');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
