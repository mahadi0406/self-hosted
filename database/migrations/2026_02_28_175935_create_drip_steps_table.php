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
        Schema::create('drip_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drip_sequence_id')->constrained()->cascadeOnDelete();
            $table->integer('step_order');
            $table->string('name');
            $table->integer('delay_days')->default(0);
            $table->integer('delay_hours')->default(0);
            $table->string('send_at_time')->nullable(); // e.g. "10:00"
            $table->foreignId('template_id')->nullable()->constrained('templates')->nullOnDelete();
            $table->json('content')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drip_steps');
    }
};
