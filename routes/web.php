<?php

use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\BillingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FactoryController;
use App\Http\Controllers\Admin\FactoryMachineController;
use App\Http\Controllers\Admin\FloorErpController;
use App\Http\Controllers\Admin\FreeMachineRequestController;
use App\Http\Controllers\Admin\JobListingController;
use App\Http\Controllers\Admin\MessageThreadController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\SubcontractOrderController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\SupplierRfqController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VendorController;
use App\Http\Controllers\Admin\WorkforceController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Portal Routes
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->name('admin.login.store');
});

Route::get('/admin/login', fn () => redirect()->route('login'))->name('admin.login');

Route::middleware(['auth', 'admin'])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('admin.logout');

    Route::get('/storage-link', function (): string {
        Artisan::call('storage:link');

        return Artisan::output();
    })->name('admin.storage-link');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('admin.home');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    // Operations & ERP Oversight (Orders, Floor Production/QC/Challans, Billing/Expenses/Store, Workforce, Threads)
    Route::get('/orders', [SubcontractOrderController::class, 'index'])->name('admin.orders.index');
    Route::post('/orders', [SubcontractOrderController::class, 'store'])->name('admin.orders.store');
    Route::get('/orders/{id}', [SubcontractOrderController::class, 'show'])->whereNumber('id')->name('admin.orders.show');
    Route::put('/orders/{id}', [SubcontractOrderController::class, 'update'])->whereNumber('id')->name('admin.orders.update');
    Route::post('/orders/{id}/status', [SubcontractOrderController::class, 'updateStatus'])->whereNumber('id')->name('admin.orders.status');
    Route::post('/orders/{id}/productions', [SubcontractOrderController::class, 'storeProduction'])->whereNumber('id')->name('admin.orders.productions.store');
    Route::post('/orders/{id}/yarn', [SubcontractOrderController::class, 'receiveYarn'])->whereNumber('id')->name('admin.orders.yarn.store');
    Route::post('/orders/{id}/yarn-return', [SubcontractOrderController::class, 'returnYarn'])->whereNumber('id')->name('admin.orders.yarnReturn.store');
    Route::delete('/orders/{id}', [SubcontractOrderController::class, 'destroy'])->whereNumber('id')->name('admin.orders.destroy');

    Route::get('/floor-erp', [FloorErpController::class, 'index'])->name('admin.floor-erp.index');
    Route::post('/floor-erp/qc/{id}/sign', [FloorErpController::class, 'signQc'])->whereNumber('id')->name('admin.floor-erp.qc.sign');
    Route::post('/floor-erp/qc/{id}/action', [FloorErpController::class, 'updateQcAction'])->whereNumber('id')->name('admin.floor-erp.qc.action');
    Route::delete('/floor-erp/productions/{id}', [FloorErpController::class, 'destroyProduction'])->whereNumber('id')->name('admin.floor-erp.productions.destroy');
    Route::post('/floor-erp/challans', [FloorErpController::class, 'storeChallan'])->name('admin.floor-erp.challans.store');
    Route::post('/floor-erp/challans/{id}/sign', [FloorErpController::class, 'signChallan'])->whereNumber('id')->name('admin.floor-erp.challans.sign');
    Route::delete('/floor-erp/challans/{id}', [FloorErpController::class, 'destroyChallan'])->whereNumber('id')->name('admin.floor-erp.challans.destroy');

    Route::get('/billing', [BillingController::class, 'index'])->name('admin.bills.index');
    Route::post('/billing/bills', [BillingController::class, 'storeBill'])->name('admin.bills.store');
    Route::post('/billing/bills/{id}/payments', [BillingController::class, 'recordPayment'])->whereNumber('id')->name('admin.bills.payments.store');
    Route::post('/billing/bills/{id}/payments/{index}/clear', [BillingController::class, 'clearPendingPayment'])->whereNumber(['id', 'index'])->name('admin.bills.payments.clear');
    Route::delete('/billing/bills/{id}', [BillingController::class, 'destroyBill'])->whereNumber('id')->name('admin.bills.destroy');
    Route::post('/billing/expenses', [BillingController::class, 'storeExpense'])->name('admin.expenses.store');
    Route::put('/billing/expenses/{id}', [BillingController::class, 'updateExpense'])->whereNumber('id')->name('admin.expenses.update');
    Route::delete('/billing/expenses/{id}', [BillingController::class, 'destroyExpense'])->whereNumber('id')->name('admin.expenses.destroy');
    Route::post('/billing/store-items', [BillingController::class, 'storeItem'])->name('admin.store.items.store');
    Route::put('/billing/store-items/{id}', [BillingController::class, 'updateItem'])->whereNumber('id')->name('admin.store.items.update');
    Route::post('/billing/store-items/{id}/toggle-rfq', [BillingController::class, 'toggleItemRfq'])->whereNumber('id')->name('admin.store.items.toggleRfq');
    Route::post('/billing/store-items/{id}/movement', [BillingController::class, 'recordStockMovement'])->whereNumber('id')->name('admin.store.items.movement');
    Route::delete('/billing/store-items/{id}', [BillingController::class, 'destroyItem'])->whereNumber('id')->name('admin.store.items.destroy');

    Route::get('/workforce', [WorkforceController::class, 'index'])->name('admin.workforce.index');
    Route::post('/workforce/employees', [WorkforceController::class, 'storeEmployee'])->name('admin.workforce.employees.store');
    Route::put('/workforce/employees/{id}', [WorkforceController::class, 'updateEmployee'])->whereNumber('id')->name('admin.workforce.employees.update');
    Route::delete('/workforce/employees/{id}', [WorkforceController::class, 'destroyEmployee'])->whereNumber('id')->name('admin.workforce.employees.destroy');
    Route::post('/workforce/attendance', [WorkforceController::class, 'storeAttendance'])->name('admin.workforce.attendance.store');
    Route::delete('/workforce/attendance/{id}', [WorkforceController::class, 'destroyAttendance'])->whereNumber('id')->name('admin.workforce.attendance.destroy');
    Route::post('/workforce/parties', [WorkforceController::class, 'storeParty'])->name('admin.workforce.parties.store');
    Route::put('/workforce/parties/{id}', [WorkforceController::class, 'updateParty'])->whereNumber('id')->name('admin.workforce.parties.update');
    Route::post('/workforce/parties/{id}/toggle', [WorkforceController::class, 'toggleParty'])->whereNumber('id')->name('admin.workforce.parties.toggle');
    Route::delete('/workforce/parties/{id}', [WorkforceController::class, 'destroyParty'])->whereNumber('id')->name('admin.workforce.parties.destroy');

    Route::get('/threads', [MessageThreadController::class, 'index'])->name('admin.threads.index');
    Route::post('/threads', [MessageThreadController::class, 'store'])->name('admin.threads.store');
    Route::get('/threads/{id}', [MessageThreadController::class, 'show'])->whereNumber('id')->name('admin.threads.show');
    Route::post('/threads/{id}/reply', [MessageThreadController::class, 'reply'])->whereNumber('id')->name('admin.threads.reply');
    Route::post('/threads/{id}/mark-read', [MessageThreadController::class, 'markRead'])->whereNumber('id')->name('admin.threads.read');
    Route::delete('/threads/{id}', [MessageThreadController::class, 'destroy'])->whereNumber('id')->name('admin.threads.destroy');

    // Subcontract Marketplace (Posts & Quotations)
    Route::get('/posts', [PostController::class, 'index'])->name('admin.posts.index');
    Route::get('/posts/create', [PostController::class, 'create'])->name('admin.posts.create');
    Route::post('/posts', [PostController::class, 'store'])->name('admin.posts.store');
    Route::get('/posts/{id}', [PostController::class, 'show'])->whereNumber('id')->name('admin.posts.show');
    Route::get('/posts/{id}/edit', [PostController::class, 'edit'])->whereNumber('id')->name('admin.posts.edit');
    Route::put('/posts/{id}', [PostController::class, 'update'])->whereNumber('id')->name('admin.posts.update');
    Route::post('/posts/{id}/status', [PostController::class, 'updateStatus'])->whereNumber('id')->name('admin.posts.status');
    Route::post('/posts/{postId}/quotations', [PostController::class, 'storeQuotation'])->whereNumber('postId')->name('admin.posts.quotations.store');
    Route::post('/posts/{postId}/quotations/{quotationId}/status', [PostController::class, 'updateQuotationStatus'])->whereNumber(['postId', 'quotationId'])->name('admin.posts.quotations.status');
    Route::delete('/posts/{postId}/quotations/{quotationId}', [PostController::class, 'destroyQuotation'])->whereNumber(['postId', 'quotationId'])->name('admin.posts.quotations.destroy');
    Route::delete('/posts/{id}', [PostController::class, 'destroy'])->whereNumber('id')->name('admin.posts.destroy');

    // Free Machine Requests
    Route::get('/free-machine-requests', [FreeMachineRequestController::class, 'index'])->name('admin.free-machine-requests.index');
    Route::post('/free-machine-requests', [FreeMachineRequestController::class, 'store'])->name('admin.free-machine-requests.store');
    Route::put('/free-machine-requests/{id}', [FreeMachineRequestController::class, 'update'])->whereNumber('id')->name('admin.free-machine-requests.update');
    Route::delete('/free-machine-requests/{id}', [FreeMachineRequestController::class, 'destroy'])->whereNumber('id')->name('admin.free-machine-requests.destroy');

    // Suppliers & RFQs
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('admin.suppliers.index');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('admin.suppliers.store');
    Route::put('/suppliers/{id}', [SupplierController::class, 'update'])->whereNumber('id')->name('admin.suppliers.update');
    Route::post('/suppliers/{id}/toggle-verified', [SupplierController::class, 'toggleVerified'])->whereNumber('id')->name('admin.suppliers.toggleVerified');
    Route::post('/suppliers/{id}/toggle-sponsored', [SupplierController::class, 'toggleSponsored'])->whereNumber('id')->name('admin.suppliers.toggleSponsored');
    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy'])->whereNumber('id')->name('admin.suppliers.destroy');

    Route::get('/supplier-rfqs', [SupplierRfqController::class, 'index'])->name('admin.supplier-rfqs.index');
    Route::post('/supplier-rfqs', [SupplierRfqController::class, 'store'])->name('admin.supplier-rfqs.store');
    Route::put('/supplier-rfqs/{id}', [SupplierRfqController::class, 'update'])->whereNumber('id')->name('admin.supplier-rfqs.update');
    Route::delete('/supplier-rfqs/{id}', [SupplierRfqController::class, 'destroy'])->whereNumber('id')->name('admin.supplier-rfqs.destroy');

    // Vendors
    Route::get('/vendors', [VendorController::class, 'index'])->name('admin.vendors.index');
    Route::post('/vendors', [VendorController::class, 'store'])->name('admin.vendors.store');
    Route::put('/vendors/{id}', [VendorController::class, 'update'])->whereNumber('id')->name('admin.vendors.update');
    Route::post('/vendors/{id}/toggle-verified', [VendorController::class, 'toggleVerified'])->whereNumber('id')->name('admin.vendors.toggleVerified');
    Route::delete('/vendors/{id}', [VendorController::class, 'destroy'])->whereNumber('id')->name('admin.vendors.destroy');

    // Partners
    Route::get('/partners', [PartnerController::class, 'index'])->name('admin.partners.index');
    Route::post('/partners', [PartnerController::class, 'store'])->name('admin.partners.store');
    Route::put('/partners/{id}', [PartnerController::class, 'update'])->whereNumber('id')->name('admin.partners.update');
    Route::post('/partners/{id}/payout', [PartnerController::class, 'recordPayout'])->whereNumber('id')->name('admin.partners.payout');
    Route::delete('/partners/{id}', [PartnerController::class, 'destroy'])->whereNumber('id')->name('admin.partners.destroy');

    // Advertisements
    Route::get('/advertisements', [AdvertisementController::class, 'index'])->name('admin.advertisements.index');
    Route::post('/advertisements', [AdvertisementController::class, 'store'])->name('admin.advertisements.store');
    Route::put('/advertisements/{id}', [AdvertisementController::class, 'update'])->whereNumber('id')->name('admin.advertisements.update');
    Route::post('/advertisements/{id}/status', [AdvertisementController::class, 'updateStatus'])->whereNumber('id')->name('admin.advertisements.status');
    Route::delete('/advertisements/{id}', [AdvertisementController::class, 'destroy'])->whereNumber('id')->name('admin.advertisements.destroy');

    // Job Board & Applications
    Route::get('/jobs', [JobListingController::class, 'index'])->name('admin.jobs.index');
    Route::post('/jobs', [JobListingController::class, 'store'])->name('admin.jobs.store');
    Route::get('/jobs/{id}', [JobListingController::class, 'show'])->whereNumber('id')->name('admin.jobs.show');
    Route::put('/jobs/{id}', [JobListingController::class, 'update'])->whereNumber('id')->name('admin.jobs.update');
    Route::post('/jobs/{id}/toggle-new', [JobListingController::class, 'toggleNew'])->whereNumber('id')->name('admin.jobs.toggleNew');
    Route::delete('/jobs/{id}', [JobListingController::class, 'destroy'])->whereNumber('id')->name('admin.jobs.destroy');
    Route::delete('/jobs/{jobId}/applications/{applicationId}', [JobListingController::class, 'destroyApplication'])->whereNumber(['jobId', 'applicationId'])->name('admin.jobs.applications.destroy');

    // Users & Factories
    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])->whereNumber('id')->name('admin.users.update');
    Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->whereNumber('id')->name('admin.users.toggleStatus');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->whereNumber('id')->name('admin.users.destroy');

    Route::get('/factories', [FactoryController::class, 'index'])->name('admin.factories.index');
    Route::get('/factories/create', [FactoryController::class, 'create'])->name('admin.factories.create');
    Route::post('/factories', [FactoryController::class, 'store'])->name('admin.factories.store');
    Route::get('/factories/import', [FactoryController::class, 'importView'])->name('admin.factories.import');
    Route::post('/factories/import', [FactoryController::class, 'importStore'])->name('admin.factories.import.store');
    Route::get('/factories/template', [FactoryController::class, 'downloadTemplate'])->name('admin.factories.template');
    Route::get('/factories/{id}', [FactoryController::class, 'show'])->whereNumber('id')->name('admin.factories.show');
    Route::get('/factories/{id}/edit', [FactoryController::class, 'edit'])->whereNumber('id')->name('admin.factories.edit');
    Route::match(['put', 'post'], '/factories/{id}', [FactoryController::class, 'update'])->whereNumber('id')->name('admin.factories.update');
    Route::post('/factories/{id}/toggle-qr', [FactoryController::class, 'toggleQrSticker'])->whereNumber('id')->name('admin.factories.toggleQr');
    Route::post('/factories/{id}/extend-trial', [FactoryController::class, 'extendTrial'])->whereNumber('id')->name('admin.factories.extendTrial');
    Route::delete('/factories/{id}', [FactoryController::class, 'destroy'])->whereNumber('id')->name('admin.factories.destroy');

    Route::get('/factory-machines', [FactoryMachineController::class, 'index'])->name('admin.factory-machines.index');
    Route::post('/factory-machines', [FactoryMachineController::class, 'store'])->name('admin.factory-machines.store');
    Route::post('/factory-machines/import', [FactoryMachineController::class, 'importStore'])->name('admin.factory-machines.import');
    Route::get('/factory-machines/template', [FactoryMachineController::class, 'downloadTemplate'])->name('admin.factory-machines.template');
    Route::put('/factory-machines/{id}', [FactoryMachineController::class, 'update'])->whereNumber('id')->name('admin.factory-machines.update');
    Route::post('/factory-machines/{id}/toggle-broadcast', [FactoryMachineController::class, 'toggleBroadcast'])->whereNumber('id')->name('admin.factory-machines.toggleBroadcast');
    Route::delete('/factory-machines/{id}', [FactoryMachineController::class, 'destroy'])->whereNumber('id')->name('admin.factory-machines.destroy');
});
