<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\WishlistController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\ReviewController;
use App\Http\Controllers\Customer\AdController;
use App\Http\Controllers\Customer\MerchantRegistrationController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\NotificationController;
use App\Http\Controllers\Customer\PromoController;
use App\Http\Controllers\Customer\PackageOrderController;

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
use App\Http\Controllers\Admin\OverviewController as AdminOverviewController;
use App\Http\Controllers\Admin\PackageSubscriptionController as AdminPackageSubscriptionController;

use App\Http\Controllers\Public\ProductController as PublicProductController;
use App\Http\Controllers\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Public\AdController as PublicAdController;

use Illuminate\Support\Facades\Route;
use App\Models\Merchant;

Route::get('/payment-config', function () {
    return response()->json([
        'success' => true,
        'data'    => config('payment.bank_accounts', []),
    ]);
});

Route::get('/hello', function () {
    return response()->json([
        'message' => 'Hello from Laravel API!',
        'status' => 'success'
    ]);
});

Route::get('/public/service-catalog', function () {
    $path = storage_path('app/service_catalog.json');
    if (!file_exists($path)) {
        return response()->json(['success' => true, 'data' => []]);
    }
    return response()->json(['success' => true, 'data' => json_decode(file_get_contents($path), true)]);
});

Route::get('/public/packages', function () {
    $packages = \App\Models\Package::where('is_active', true)
        ->where('type', 'premium')
        ->get(['id', 'name', 'price', 'duration_days', 'benefits']);
    return response()->json(['success' => true, 'data' => $packages]);
});

Route::get('/public/stats', function () {
    return response()->json([
        'success' => true,
        'data'    => [
            'totalUsers'    => \App\Models\User::count(),
            'totalProducts' => \App\Models\Product::where('status', 'active')->count(),
            'activeAds'     => \App\Models\Advertisement::where('status', 'approved')->count(),
            'totalMerchants'=> \App\Models\Merchant::where('is_verified', true)->count(),
        ],
    ]);
});

Route::get('/public/categories', [PublicCategoryController::class, 'index']);
Route::get('/public/products', [PublicProductController::class, 'index']);
Route::get('/public/products/recommended', [PublicProductController::class, 'recommended']);
Route::get('/public/products/{id}', [PublicProductController::class, 'show']);

Route::post('/public/ads/{id}/click', [PublicAdController::class, 'trackClick']);

Route::get('/public/merchants', function () {
    $merchants = Merchant::where('is_verified', true)->with(['owner', 'products' => function($q) {
        $q->where('status', 'active')->latest()->take(3);
    }])->get();
    return response()->json([
        'success' => true,
        'message' => 'Daftar merchant terverifikasi berhasil diambil.',
        'data' => $merchants
    ]);
});

Route::get('/public/ads', function () {
    $ads = \App\Models\Advertisement::where('status', 'approved')
        ->with(['category', 'media', 'package'])
        ->get()
        ->map(function ($ad) {
            return [
                'id' => $ad->id,
                'title' => $ad->title,
                'category' => $ad->category?->name ?? 'Umum',
                'condition' => ucfirst($ad->condition ?? 'bekas'),
                'price' => (float)$ad->price,
                'location' => $ad->location,
                'advertiser' => $ad->contact_name,
                'whatsapp' => $ad->whatsapp,
                'image' => $ad->media->first()?->url ?? 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop',
                'desc' => $ad->description,
                'date' => $ad->created_at->format('Y-m-d'),
                'is_premium' => $ad->package && $ad->package->type !== 'free'
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

    // Notifications
    Route::get('/customer/notifications', [NotificationController::class, 'index']);
    Route::post('/customer/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/customer/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Promo code validation
    Route::post('/customer/promo/validate', [PromoController::class, 'validate']);

    // Cart management
    Route::get('/customer/cart', [CartController::class, 'getCart']);
    Route::post('/customer/cart', [CartController::class, 'addToCart']);
    Route::delete('/customer/cart/{id}', [CartController::class, 'removeFromCart']);

    // Orders & Transactions
    Route::post('/customer/orders', [OrderController::class, 'createOrder']);
    Route::get('/customer/orders', [OrderController::class, 'getOrders']);
    Route::get('/customer/orders/{id}', [OrderController::class, 'getOrderDetail']);
    Route::get('/customer/orders/items/{orderItemId}/download', [OrderController::class, 'downloadProduct']);

    // Package Subscriptions
    Route::get('/customer/package-subscriptions', [PackageOrderController::class, 'index']);
    Route::post('/customer/package-checkout', [PackageOrderController::class, 'checkout']);

    // Product Reviews
    Route::post('/customer/reviews', [ReviewController::class, 'storeReview']);

    // Advertisements
    Route::get('/customer/ads', [AdController::class, 'getAds']);
    Route::post('/customer/ads', [AdController::class, 'createAd']);
    Route::put('/customer/ads/{id}', [AdController::class, 'updateAd']);
    Route::post('/customer/ads/{id}/upgrade', [AdController::class, 'upgradeAd']);

    // Merchant Registration (from customer perspective)
    Route::post('/customer/merchant/register', [MerchantRegistrationController::class, 'registerMerchant']);

    // ----------------------------------------------------
    // MERCHANT ROLE ENDPOINTS
    // ----------------------------------------------------
    
    // Register store (Only requires login, no merchant role check yet)
    Route::post('/merchant/register', [MerchantStoreController::class, 'registerStore'])->name('merchant.store.register');
    Route::get('/merchant/me', [MerchantStoreController::class, 'getMyMerchant']);

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

        // Package Verification
        Route::get('/admin/package-subscriptions', [AdminPackageSubscriptionController::class, 'index']);
        Route::post('/admin/package-subscriptions/{id}/approve', [AdminPackageSubscriptionController::class, 'approve']);
        Route::post('/admin/package-subscriptions/{id}/reject', [AdminPackageSubscriptionController::class, 'reject']);

        // Audit Logs
        Route::get('/admin/audit-logs', [AuditLogController::class, 'getAuditLogs']);

        // Withdrawal Payout Moderation
        Route::get('/admin/withdrawals/pending', [AdminWithdrawalController::class, 'getPendingWithdrawals']);
        Route::post('/admin/withdrawals/{id}/verify', [AdminWithdrawalController::class, 'verifyWithdrawal']);

        // Overview Stats & Analytics
        Route::get('/admin/stats', [AdminOverviewController::class, 'getStats']);
        Route::get('/admin/analytics', [AdminOverviewController::class, 'getAnalytics']);

        // Service catalog (chatbot prices)
        Route::get('/admin/service-catalog', function () {
            $path = storage_path('app/service_catalog.json');
            if (!file_exists($path)) return response()->json(['success' => true, 'data' => []]);
            return response()->json(['success' => true, 'data' => json_decode(file_get_contents($path), true)]);
        });
        Route::post('/admin/service-catalog', function (\Illuminate\Http\Request $req) {
            $catalog = $req->input('catalog');
            if (!is_array($catalog)) return response()->json(['success' => false, 'message' => 'Format tidak valid.'], 422);
            file_put_contents(storage_path('app/service_catalog.json'), json_encode($catalog, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            return response()->json(['success' => true, 'message' => 'Katalog layanan berhasil diperbarui.']);
        });

        // Commission settings
        Route::get('/admin/commission', function () {
            $path = storage_path('app/commission.json');
            $data = file_exists($path) ? json_decode(file_get_contents($path), true) : ['fee_percent' => 5];
            return response()->json(['success' => true, 'data' => $data]);
        });
        Route::post('/admin/commission', function (\Illuminate\Http\Request $req) {
            $fee = max(0, min(100, (float) $req->input('fee_percent', 5)));
            $data = ['fee_percent' => $fee];
            file_put_contents(storage_path('app/commission.json'), json_encode($data, JSON_PRETTY_PRINT));
            return response()->json(['success' => true, 'message' => 'Fee komisi berhasil disimpan', 'data' => $data]);
        });

        // Site Settings
        Route::get('/admin/settings', function () {
            $path = storage_path('app/settings.json');
            $defaults = ['site_name' => 'ADMS Marketplace', 'contact_email' => 'support@adms.id', 'maintenance_mode' => false];
            $settings = file_exists($path) ? json_decode(file_get_contents($path), true) : $defaults;
            return response()->json(['success' => true, 'data' => $settings]);
        });
        Route::post('/admin/settings', function (\Illuminate\Http\Request $req) {
            $data = $req->only(['site_name', 'contact_email', 'maintenance_mode']);
            file_put_contents(storage_path('app/settings.json'), json_encode($data, JSON_PRETTY_PRINT));
            return response()->json(['success' => true, 'message' => 'Pengaturan berhasil disimpan', 'data' => $data]);
        });

        // Products (all, with filter)
        Route::get('/admin/products', [AdminOverviewController::class, 'getProducts']);
        Route::post('/admin/products/{id}/status', [AdminOverviewController::class, 'toggleProductStatus']);

        // Ads (all, with filter)
        Route::get('/admin/ads', [AdminOverviewController::class, 'getAds']);
        Route::post('/admin/ads/{id}/status', [AdminOverviewController::class, 'toggleAdStatus']);

        // Categories list
        Route::get('/admin/categories', function () {
            $cats = \App\Models\Category::withCount(['products', 'advertisements'])->orderBy('type')->get();
            return response()->json(['success' => true, 'data' => $cats]);
        });

        // All transactions/orders
        Route::get('/admin/transactions', function () {
            $orders = \App\Models\Order::with(['user:id,name,email'])
                ->latest()->take(100)->get()
                ->map(fn($o) => [
                    'id'             => $o->id,
                    'buyer'          => $o->user?->name ?? '-',
                    'email'          => $o->user?->email ?? '-',
                    'total'          => $o->total_amount,
                    'status'         => $o->status,
                    'payment_status' => $o->payment_status,
                    'created_at'     => $o->created_at->format('Y-m-d H:i'),
                ]);
            return response()->json(['success' => true, 'data' => $orders]);
        });

        // Ad packages list (all)
        Route::get('/admin/packages', function () {
            return response()->json(['success' => true, 'data' => \App\Models\Package::all()]);
        });
    });
});
