<?php

namespace App\Exceptions;

use Exception;

class InsufficientBalanceException extends Exception
{
    /**
     * Create a new exception instance
     *
     * @param string $message
     * @param int $code
     * @param Exception|null $exception
     */
    public function __construct(string $message = "Insufficient balance", int $code = 422, Exception $exception = null)
    {
        parent::__construct($message, $code, $exception);
    }
}
