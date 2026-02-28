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
        Schema::create('inbox_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignId('channel_id')->constrained('channels');
            $table->enum('direction', ['inbound', 'outbound']);
            $table->enum('type', ['text', 'image', 'audio', 'video', 'document'])->default('text');
            $table->text('body')->nullable();
            $table->string('media_url')->nullable();
            $table->string('channel_message_id')->nullable();
            $table->enum('ai_intent', ['inquiry', 'complaint', 'purchase', 'unsubscribe', 'praise', 'spam', 'unknown'])->nullable();
            $table->text('ai_suggested_reply')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('received_at');
            $table->timestamps();

            $table->index(['contact_id', 'direction']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inbox_messages');
    }
};
