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
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('channel_id')->constrained('channels');
            $table->foreignId('template_id')->nullable()->constrained('templates')->nullOnDelete();
            $table->enum('type', ['instant', 'scheduled'])->default('instant');
            $table->json('content');
            $table->json('audience'); // {list_ids: [1,2]}
            $table->enum('status', ['draft', 'scheduled', 'running', 'paused', 'completed', 'failed'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('total_recipients')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
