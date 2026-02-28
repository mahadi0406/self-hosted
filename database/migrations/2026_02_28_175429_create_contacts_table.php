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
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable()->unique();
            $table->string('telegram_id')->nullable()->unique();
            $table->string('email')->nullable();
            $table->string('country')->nullable();
            $table->string('language')->default('en');
            $table->json('custom_fields')->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['active', 'opted_out', 'blocked'])->default('active');
            $table->timestamp('last_messaged_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
