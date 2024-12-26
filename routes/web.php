<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlaylistController;

Route::match(['GET', 'POST'], '/convert', [PlaylistController::class, 'convert'])->name('convert');
Route::get('/youtube/callback', [PlaylistController::class, 'handleGoogleCallback'])->name('youtube.callback');
Route::get('/test-convert', function () {
    return view('test-convert');
});
