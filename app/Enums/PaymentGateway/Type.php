<?php

namespace App\Enums\PaymentGateway;

enum Type: string
{
    case STRIPE = 'stripe';
    case MANUAL = 'manual';

    public function label(): string
    {
        return match($this) {
            self::STRIPE => 'Stripe',
            self::MANUAL => 'manual',
        };
    }

    public function slug(): string
    {
        return match($this) {
            self::STRIPE => 'stripe',
            self::MANUAL => 'manual',
        };
    }

    public static function fromSlug(string $slug): ?self
    {
        return match($slug) {
            'stripe' => self::STRIPE,
            'manual' => self::MANUAL,
            default => null,
        };
    }
}
