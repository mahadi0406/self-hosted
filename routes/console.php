<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('campaigns:dispatch-scheduled')
    ->everyMinute()
    ->withoutOverlapping()
    ->onOneServer();

Schedule::command('drip:dispatch-steps')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->onOneServer();

Schedule::command('inbox:classify-messages')
    ->everyTwoMinutes()
    ->withoutOverlapping()
    ->onOneServer();

Schedule::command('telegram:register-webhooks')
    ->hourly()
    ->onOneServer();

Schedule::command('logs:cleanup')
    ->dailyAt('02:00')
    ->onOneServer();

Schedule::command('contacts:sync-counts')
    ->dailyAt('03:00')
    ->onOneServer();
