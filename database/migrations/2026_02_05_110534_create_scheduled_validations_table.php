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
        Schema::create('scheduled_validations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('list_id')->constrained('saved_lists')->onDelete('cascade');
            $table->dateTime('scheduled_at');
            $table->string('status'); // pending, running, completed, failed
            $table->foreignId('template_id')->nullable()->constrained('validation_templates')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_validations');
    }
};
