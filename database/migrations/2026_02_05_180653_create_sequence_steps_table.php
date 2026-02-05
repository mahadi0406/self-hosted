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
        Schema::create('sequence_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sequence_id')->constrained('email_sequences')->onDelete('cascade');
            $table->integer('step_order')->default(1);
            $table->string('subject');
            $table->text('body_html');
            $table->integer('delay_days')->default(0);
            $table->string('condition')->nullable(); // opened_previous, clicked_previous, none
            $table->boolean('is_ai_generated')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sequence_steps');
    }
};
