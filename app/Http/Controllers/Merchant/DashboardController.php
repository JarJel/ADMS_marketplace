<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Advertisement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        // 5. Ad Performance (views vs clicks)
        $adPerformance = Advertisement::where('merchant_id', $merchant->id)
            ->where('status', 'approved')
            ->select('id', 'title', 'views_count', 'clicks_count')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get();

        // 6. Top Selling Products
        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.merchant_id', $merchant->id)
            ->whereIn('orders.status', ['completed'])
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->with('product') // Requires product relationship in OrderItem
            ->take(5)
            ->get();

        // 7. Visitor Demographics (Mock Data)
        $visitorDemographics = [
            ['city' => 'Jakarta', 'percentage' => 45],
            ['city' => 'Bandung', 'percentage' => 25],
            ['city' => 'Surabaya', 'percentage' => 15],
            ['city' => 'Yogyakarta', 'percentage' => 10],
            ['city' => 'Lainnya', 'percentage' => 5],
        ];

        // 8. Recent Orders
        $recentOrders = Order::where('merchant_id', $merchant->id)
            ->with('user:id,name')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($o) => [
                'id'         => 'ORD-' . strtoupper(substr($o->id, 0, 6)),
                'customer'   => $o->user?->name ?? 'Anonim',
                'date'       => $o->created_at->diffForHumans(),
                'total'      => 'Rp ' . number_format($o->total_amount, 0, ',', '.'),
                'status'     => $o->status,
            ]);

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
                'recent_reviews' => $recentReviews,
                'ad_performance' => $adPerformance,
                'top_products' => $topProducts,
                'visitor_demographics' => $visitorDemographics,
                'recent_orders' => $recentOrders,
            ]
        ], 200);
    }
}
