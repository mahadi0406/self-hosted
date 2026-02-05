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
        Schema::create('validation_results', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->boolean('is_valid')->default(false);
            $table->integer('score')->default(0);
            $table->json('checks'); // all validation check results
            $table->string('status'); // valid, invalid, risky
            $table->string('suggestion')->nullable(); // typo suggestion
            $table->foreignId('list_id')->nullable()->constrained('saved_lists')->onDelete('cascade');
            $table->timestamps();
            $table->index('email');
            $table->index('is_valid');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('validation_results');
    }
};
