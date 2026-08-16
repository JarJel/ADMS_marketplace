<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\WishlistController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\ReviewController;
use App\Http\Controllers\Customer\AdController;
use App\Http\Controllers\Customer\MerchantRegistrationController;
use App\Http\Controllers\Customer\CartController;

use App\Http\Controllers\Merchant\StoreController as MerchantStoreController;
use App\Http\Controllers\Merchant\ProductController as MerchantProductController;
use App\Http\Controllers\Merchant\AdController as MerchantAdController;
use App\Http\Controllers\Merchant\OrderController as MerchantOrderController;
use App\Http\Controllers\Merchant\DashboardController as MerchantDashboardController;
use App\Http\Controllers\Merchant\WithdrawalController as MerchantWithdrawalController;

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\MerchantModerationController;
use App\Http\Controllers\Admin\ProductModerationController;
use App\Http\Controllers\Admin\AdModerationController;
use App\Http\Controllers\Admin\CategoryAndPackageController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\WithdrawalController as AdminWithdrawalController;

use Illuminate\Support\Facades\Route;
use App\Models\Merchant;

Route::get('/hello', function () {
    return response()->json([
        'message' => 'Hello from Laravel API!',
        'status' => 'success'
    ]);
});

Route::get('/public/merchants', function () {
    $merchants = Merchant::where('is_verified', true)->with('owner')->get();
    return response()->json([
        'success' => true,
        'message' => 'Daftar merchant terverifikasi berhasil diambil.',
        'data' => $merchants
    ]);
});

Route::get('/public/ads', function () {
    $ads = \App\Models\Advertisement::where('status', 'approved')
        ->with(['category', 'media'])
        ->get()
        ->map(function ($ad) {
            return [
                'id' => $ad->id,
                'title' => $ad->title,
                'category' => $ad->category->name,
                'condition' => ucfirst($ad->condition),
                'price' => (float)$ad->price,
                'location' => $ad->location,
                'advertiser' => $ad->contact_name,
                'whatsapp' => $ad->whatsapp,
                'image' => $ad->media->first()?->url ?? 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop',
                'desc' => $ad->description,
                'date' => $ad->created_at->format('Y-m-d')
            ];
        });
    return response()->json([
        'success' => true,
        'message' => 'Daftar iklan baris berhasil diambil.',
        'data' => $ads
    ]);
});

// Public Auth Routes (With Rate Limiting)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
});

// Protected Routes (Custom Token Auth)
Route::middleware('auth.custom')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Customer Profile
    Route::put('/customer/profile', [ProfileController::class, 'updateProfile']);
    Route::post('/customer/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    // Wishlist
    Route::get('/customer/wishlist', [WishlistController::class, 'getWishlist']);
    Route::post('/customer/wishlist/toggle', [WishlistController::class, 'toggleWishlist']);

    // Cart management
    Route::get('/customer/cart', [CartController::class, 'getCart']);
    Route::post('/customer/cart', [CartController::class, 'addToCart']);
    Route::delete('/customer/cart/{id}', [CartController::class, 'removeFromCart']);

    // Orders & Transactions
    Route::post('/customer/orders', [OrderController::class, 'createOrder']);
    Route::get('/customer/orders', [OrderController::class, 'getOrders']);
    Route::get('/customer/orders/{id}', [OrderController::class, 'getOrderDetail']);
    Route::get('/customer/orders/items/{orderItemId}/download', [OrderController::class, 'downloadProduct']);

    // Product Reviews
    Route::post('/customer/reviews', [ReviewController::class, 'storeReview']);

    // Advertisements
    Route::post('/customer/ads', [AdController::class, 'createAd']);
    Route::post('/customer/ads/{id}/upgrade', [AdController::class, 'upgradeAd']);

    // Merchant Registration (from customer perspective)
    Route::post('/customer/merchant/register', [MerchantRegistrationController::class, 'registerMerchant']);

    // ----------------------------------------------------
    // MERCHANT ROLE ENDPOINTS
    // ----------------------------------------------------
    
    // Register store (Only requires login, no merchant role check yet)
    Route::post('/merchant/register', [MerchantStoreController::class, 'registerStore'])->name('merchant.store.register');

    // Protected Merchant Actions (Requires login & merchant role & verified store profile check)
    Route::middleware('auth.merchant')->group(function () {
        // Store profile & status
        Route::post('/merchant/store/update', [MerchantStoreController::class, 'updateStore']);
        Route::post('/merchant/store/toggle', [MerchantStoreController::class, 'toggleStoreStatus']);

        // Products management
        Route::get('/merchant/products', [MerchantProductController::class, 'getProducts']);
        Route::post('/merchant/products', [MerchantProductController::class, 'storeProduct']);
        Route::put('/merchant/products/{id}', [MerchantProductController::class, 'updateProduct']);
        Route::delete('/merchant/products/{id}', [MerchantProductController::class, 'deleteProduct']);

        // Ads management
        Route::get('/merchant/ads', [MerchantAdController::class, 'getAds']);
        Route::post('/merchant/ads', [MerchantAdController::class, 'storeAd']);
        Route::get('/merchant/ads/{id}/stats', [MerchantAdController::class, 'getAdStats']);

        // Incoming Orders
        Route::get('/merchant/orders', [MerchantOrderController::class, 'getIncomingOrders']);
        Route::put('/merchant/orders/{id}/status', [MerchantOrderController::class, 'updateOrderStatus']);

        // Dashboard Stats & Graph data
        Route::get('/merchant/dashboard', [MerchantDashboardController::class, 'getDashboardStats']);

        // Payout/Withdrawal request
        Route::post('/merchant/withdrawals', [MerchantWithdrawalController::class, 'requestWithdrawal']);
    });

    // ----------------------------------------------------
    // ADMIN ROLE ENDPOINTS
    // ----------------------------------------------------
    Route::middleware('auth.admin')->group(function () {
        // User Management
        Route::get('/admin/users', [UserManagementController::class, 'getUsers']);
        Route::post('/admin/users/{id}/toggle-status', [UserManagementController::class, 'toggleUserStatus']);

        // Merchant Moderation
        Route::get('/admin/merchants/pending', [MerchantModerationController::class, 'getPendingMerchants']);
        Route::post('/admin/merchants/{id}/verify', [MerchantModerationController::class, 'verifyMerchant']);

        // Product Moderation
        Route::get('/admin/products/pending', [ProductModerationController::class, 'getPendingProducts']);
        Route::post('/admin/products/{id}/verify', [ProductModerationController::class, 'verifyProduct']);

        // Ad Moderation
        Route::get('/admin/ads/pending', [AdModerationController::class, 'getPendingAds']);
        Route::post('/admin/ads/{id}/verify', [AdModerationController::class, 'verifyAd']);

        // Category & Package Management
        Route::post('/admin/categories', [CategoryAndPackageController::class, 'storeCategory']);
        Route::put('/admin/categories/{id}', [CategoryAndPackageController::class, 'updateCategory']);
        Route::put('/admin/packages/{id}', [CategoryAndPackageController::class, 'updateAdPackage']);

        // Audit Logs
        Route::get('/admin/audit-logs', [AuditLogController::class, 'getAuditLogs']);

        // Withdrawal Payout Moderation
        Route::get('/admin/withdrawals/pending', [AdminWithdrawalController::class, 'getPendingWithdrawals']);
        Route::post('/admin/withdrawals/{id}/verify', [AdminWithdrawalController::class, 'verifyWithdrawal']);
    });
});
