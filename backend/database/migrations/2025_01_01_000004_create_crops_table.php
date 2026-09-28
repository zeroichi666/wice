<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('tile_x');
            $table->integer('tile_y');
            $table->foreignId('item_id')->constrained()->onDelete('cascade');
            $table->enum('stage', ['seed', 'sprout', 'growing', 'ready'])->default('seed');
            $table->integer('water_level')->default(0)->comment('0-100');
            $table->timestamp('planted_at');
            $table->timestamp('last_watered_at')->nullable();
            $table->timestamp('harvested_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'tile_x', 'tile_y']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crops');
    }
};
