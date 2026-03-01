<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drip_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('channel_id')->constrained('channels');
            $table->enum('status', ['active', 'paused', 'archived'])->default('active');
            $table->unsignedInteger('total_steps')->default(0);
            $table->boolean('ai_generated')->default(false);
            $table->string('ai_goal')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drip_sequences');
    }
};
