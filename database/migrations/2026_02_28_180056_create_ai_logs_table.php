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
        Schema::create('ai_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('feature', ['message_writer', 'campaign_planner', 'analytics', 'reply_classifier', 'translator', 'validator']);
            $table->string('model')->default('claude-sonnet-4-20250514');
            $table->longText('prompt');
            $table->longText('response')->nullable();
            $table->integer('input_tokens')->default(0);
            $table->integer('output_tokens')->default(0);
            $table->boolean('success')->default(true);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_logs');
    }
};
