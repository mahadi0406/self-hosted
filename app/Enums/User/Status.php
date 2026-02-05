<?php

namespace App\Enums\User;

use App\Enums\EnumTrait;

enum Status: string
{
    use EnumTrait;

    case BANNED = 'banned';
    case ACTIVE = 'active';
    case PENDING = 'pending';
    case SUSPENDED = 'suspended';

    /**
     * Get display name of a specific status value.
     */
    public static function getName($value): ?string
    {
        return match ($value) {
            self::BANNED->value => 'Banned',
            self::ACTIVE->value => 'Active',
            self::PENDING->value => 'Pending',
            self::SUSPENDED->value => 'Suspended',
            default => null,
        };
    }
}
