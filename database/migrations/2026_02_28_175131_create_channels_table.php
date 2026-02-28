<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('channels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['whatsapp', 'telegram']);
            $table->string('phone_number')->nullable();
            $table->string('bot_token')->nullable();
            $table->text('credentials')->nullable();
            $table->enum('status', ['connected', 'disconnected', 'error'])->default('disconnected');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('channels');
    }
};
