<?php

namespace App\Enums\User;

use App\Enums\EnumTrait;

enum KycStatus: int
{
    use EnumTrait;
    case ACTIVE = 1;
    case INACTIVE = 2;
    case REQUESTED = 3;

}
