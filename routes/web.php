<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FactoryController;
use App\Http\Controllers\Admin\MachineTypeController;
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

    // Factory Review, Verification & Creation
    Route::get('/factories', [FactoryController::class, 'index'])->name('admin.factories.index');
    Route::get('/factories/create', [FactoryController::class, 'create'])->name('admin.factories.create');
    Route::post('/factories', [FactoryController::class, 'store'])->name('admin.factories.store');
    Route::get('/factories/import', [FactoryController::class, 'importView'])->name('admin.factories.import');
    Route::post('/factories/import', [FactoryController::class, 'importStore'])->name('admin.factories.import.store');
    Route::get('/factories/template', [FactoryController::class, 'downloadTemplate'])->name('admin.factories.template');
    Route::get('/factories/{id}', [FactoryController::class, 'show'])->name('admin.factories.show');
    Route::post('/factories/{id}/approve', [FactoryController::class, 'approve'])->name('admin.factories.approve');
    Route::post('/factories/{id}/block', [FactoryController::class, 'block'])->name('admin.factories.block');
    Route::post('/factories/{id}/unblock', [FactoryController::class, 'unblock'])->name('admin.factories.unblock');

    // Machine Types Master Data
    Route::get('/machine-types', [MachineTypeController::class, 'index'])->name('admin.machine-types.index');
    Route::post('/machine-types', [MachineTypeController::class, 'store'])->name('admin.machine-types.store');
    Route::post('/machine-types/import', [MachineTypeController::class, 'importStore'])->name('admin.machine-types.import');
    Route::get('/machine-types/template', [MachineTypeController::class, 'downloadTemplate'])->name('admin.machine-types.template');
    Route::post('/machine-types/{id}/toggle', [MachineTypeController::class, 'toggle'])->name('admin.machine-types.toggle');
    Route::delete('/machine-types/{id}', [MachineTypeController::class, 'destroy'])->name('admin.machine-types.destroy');

    // Users Management
    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggleStatus');

    // Subcontract Posts Moderation
    Route::get('/posts', [PostController::class, 'index'])->name('admin.posts.index');
    Route::delete('/posts/{id}', [PostController::class, 'destroy'])->name('admin.posts.destroy');
});
