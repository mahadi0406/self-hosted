<?php

declare(strict_types=1);

namespace App\Enums;

trait EnumTrait
{

    /**
     * @return array
     */
    public static function names(): array
    {
        return array_column(self::cases(), 'name');
    }


    /**
     * @return array
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }


    /**
     * @return array
     */
    public static function toArray(): array
    {
        return array_combine(self::names(), self::values());
    }

    /**
     * @return array
     */
    public static function toArrayByKey(): array
    {
        return array_combine(self::values(), array_values(self::names()));
    }


    /**
     * @param string $name
     * @return mixed|null
     */
    public static function getValue(string $name)
    {
        $array = self::toArray();
        return $array[$name] ?? null;
    }
}
