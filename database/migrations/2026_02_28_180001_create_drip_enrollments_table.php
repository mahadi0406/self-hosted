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
        Schema::create('drip_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drip_sequence_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignId('current_step_id')->nullable()->constrained('drip_steps')->nullOnDelete();
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->timestamp('enrolled_at');
            $table->timestamp('next_step_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['drip_sequence_id', 'contact_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drip_enrollments');
    }
};
