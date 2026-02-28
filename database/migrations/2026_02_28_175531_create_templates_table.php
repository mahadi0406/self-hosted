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
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('channel', ['whatsapp', 'telegram', 'both']);
            $table->string('language')->default('en');
            $table->text('header')->nullable();
            $table->text('body');
            $table->text('footer')->nullable();
            $table->json('buttons')->nullable();
            $table->json('variables')->nullable();
            $table->enum('source', ['manual', 'ai_generated'])->default('manual');
            $table->enum('status', ['draft', 'approved', 'rejected'])->default('draft');
            $table->integer('usage_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
