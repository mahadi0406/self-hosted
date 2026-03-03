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
        Schema::create('drip_sequence_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drip_sequence_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamps();
            $table->unique(['drip_sequence_id', 'contact_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drip_sequence_contacts');
    }
};
