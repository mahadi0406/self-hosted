<?php

namespace App\Enums\Wallet;

enum Status: int
{
    case INACTIVE = 0;
    case ACTIVE = 1;
    case LOCKED = 2;

    public function label(): string
    {
        return match($this) {
            self::INACTIVE => 'Inactive',
            self::ACTIVE => 'Active',
            self::LOCKED => 'Locked',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::INACTIVE => 'gray',
            self::ACTIVE => 'green',
            self::LOCKED => 'red',
        };
    }
}
