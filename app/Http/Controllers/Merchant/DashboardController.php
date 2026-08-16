<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get merchant dashboard statistics.
     */
    public function getDashboardStats(Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        // 1. Total Revenue from COMPLETED or PAID orders
        $totalRevenue = Order::where('merchant_id', $merchant->id)
            ->where(function ($q) {
                $q->where('status', 'completed')
                  ->orWhere('payment_status', 'paid');
            })
            ->sum('total_amount');

        // 2. Total Active Products
        $totalActiveProducts = Product::where('merchant_id', $merchant->id)
            ->where('status', 'active')
            ->count();

        // 3. Incoming Orders count (Pending vs Completed)
        $pendingOrdersCount = Order::where('merchant_id', $merchant->id)
            ->where('status', 'pending')
            ->count();

        $completedOrdersCount = Order::where('merchant_id', $merchant->id)
            ->where('status', 'completed')
            ->count();

        // 4. Recent Reviews from customers
        $recentReviews = Review::where('merchant_id', $merchant->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Statistik dasbor berhasil diambil.',
            'data' => [
                'total_revenue' => (float) $totalRevenue,
                'total_active_products' => $totalActiveProducts,
                'orders_stats' => [
                    'pending' => $pendingOrdersCount,
                    'completed' => $completedOrdersCount,
                ],
                'recent_reviews' => $recentReviews
            ]
        ], 200);
    }
}
