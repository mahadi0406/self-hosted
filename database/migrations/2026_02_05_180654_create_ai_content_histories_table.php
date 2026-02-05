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
        Schema::create('ai_content_history', function (Blueprint $table) {
            $table->id();
            $table->text('prompt');
            $table->string('content_type'); // subject, email_body, template
            $table->text('generated_content');
            $table->integer('rating')->nullable(); // 1-5 stars
            $table->boolean('was_used')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_content_histories');
    }
};
