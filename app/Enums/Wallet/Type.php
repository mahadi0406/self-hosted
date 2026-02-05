<?php

namespace App\Enums\Wallet;

enum Type: string
{
    case MAIN = 'main';
    case TRADE = 'trade';

    public function label(): string
    {
        return match($this) {
            self::MAIN => 'Main Wallet',
            self::TRADE => 'Trade Wallet',
        };
    }
}
