<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FactoryController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Portal Routes
|--------------------------------------------------------------------------
*/

// Guest Admin Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('admin.login');
    Route::post('/login', [AuthController::class, 'store'])->name('admin.login.store');
});

// Authenticated Admin Routes
Route::middleware(['auth', 'admin'])->group(function () {
    // Logout
    Route::post('/logout', [AuthController::class, 'destroy'])->name('admin.logout');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('admin.home');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    // Factory Review & Verification
    Route::get('/factories', [FactoryController::class, 'index'])->name('admin.factories.index');
    Route::get('/factories/{id}', [FactoryController::class, 'show'])->name('admin.factories.show');
    Route::post('/factories/{id}/approve', [FactoryController::class, 'approve'])->name('admin.factories.approve');
    Route::post('/factories/{id}/block', [FactoryController::class, 'block'])->name('admin.factories.block');
    Route::post('/factories/{id}/unblock', [FactoryController::class, 'unblock'])->name('admin.factories.unblock');

    // Users Management
    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggleStatus');

    // Subcontract Posts Moderation
    Route::get('/posts', [PostController::class, 'index'])->name('admin.posts.index');
    Route::delete('/posts/{id}', [PostController::class, 'destroy'])->name('admin.posts.destroy');
});
