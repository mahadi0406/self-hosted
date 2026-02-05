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
        Schema::create('domain_reputations', function (Blueprint $table) {
            $table->id();
            $table->string('domain')->unique();
            $table->integer('score')->default(50); // 0-100
            $table->integer('total_validations')->default(0);
            $table->integer('valid_count')->default(0);
            $table->integer('invalid_count')->default(0);
            $table->boolean('is_blacklisted')->default(false);
            $table->timestamps();
            $table->index('domain');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('domain_reputations');
    }
};
