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
        Schema::create('campaign_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->integer('sent')->default(0);
            $table->integer('delivered')->default(0);
            $table->integer('read')->default(0);
            $table->integer('replied')->default(0);
            $table->integer('failed')->default(0);
            $table->integer('opted_out')->default(0);
            $table->decimal('delivery_rate', 5, 2)->default(0);
            $table->decimal('read_rate', 5, 2)->default(0);
            $table->decimal('reply_rate', 5, 2)->default(0);
            $table->text('ai_summary')->nullable();
            $table->json('ai_recommendations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_analytics');
    }
};
