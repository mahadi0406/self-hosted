<?php

namespace App\Enums\Transaction;

use App\Enums\EnumTrait;

enum Status: int
{
    use EnumTrait;

    case PENDING = 0;
    case COMPLETED = 1;
    case FAILED = 2;
    case CANCELLED = 3;


    /**
     * @return string
     */
    public function getLabel(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::COMPLETED => 'Completed',
            self::FAILED => 'Failed',
            self::CANCELLED => 'Cancelled',
        };
    }

    /**
     * @return string
     */
    public function getDescription(): string
    {
        return match($this) {
            self::PENDING => 'Transaction is being processed',
            self::COMPLETED => 'Transaction completed successfully',
            self::FAILED => 'Transaction failed to process',
            self::CANCELLED => 'Transaction was cancelled',
        };
    }

    /**
     * @return string
     */
    public function getColorClass(): string
    {
        return match($this) {
            self::PENDING => 'text-yellow-800 bg-yellow-100 border-yellow-200',
            self::COMPLETED => 'text-green-800 bg-green-100 border-green-200',
            self::FAILED => 'text-red-800 bg-red-100 border-red-200',
            self::CANCELLED => 'text-gray-800 bg-gray-100 border-gray-200',
        };
    }

    /**
     * @return string
     */
    public function getIconClass(): string
    {
        return match($this) {
            self::PENDING => 'clock',
            self::COMPLETED => 'check-circle',
            self::FAILED => 'x-circle',
            self::CANCELLED => 'ban',
        };
    }

    /**
     * @return bool
     */
    public function allowsRefund(): bool
    {
        return $this === self::COMPLETED;
    }

    /**
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return $this === self::PENDING;
    }

    /**
     * @return array
     */
    public static function toArray(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }

    /**
     * @return array
     */
    public static function getOptions(): array
    {
        return collect(self::cases())->map(fn($case) => [
            'value' => $case->value,
            'label' => $case->getLabel()
        ])->toArray();
    }

}
