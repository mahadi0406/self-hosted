<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AutomationsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Automations', [
            'basePath' => base_path(),
        ]);
    }
}
