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
        Schema::create('drip_step_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drip_step_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->boolean('success')->default(true);
            $table->timestamp('sent_at');
            $table->timestamps();
            $table->unique(['drip_step_id', 'contact_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drip_step_logs');
    }
};
