<?php

namespace App\Enums\User;

use App\Enums\EnumTrait;

enum RoleStatus: string
{
    use EnumTrait;

    case USER = 'user';
    case ADMIN = 'admin';

}
