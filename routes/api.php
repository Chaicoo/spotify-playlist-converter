<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PlaylistController;

Route::post('/convert', [PlaylistController::class, 'convert']);
