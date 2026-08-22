<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\Order;
use App\Models\Advertisement;
use App\Models\Withdrawal;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OverviewController extends Controller
{
    public function getStats(Request $request)
    {
        $totalUsers      = User::count();
        $totalMerchants  = Merchant::count();
        $totalProducts   = Product::count();
        $totalOrders     = Order::count();
        $activeAds       = Advertisement::where('status', 'approved')->count();

        $gmv             = Order::whereIn('payment_status', ['paid'])->sum('total_amount');
        
        // Get dynamic commission fee
        $feePercent = 5;
        $commissionPath = storage_path('app/commission.json');
        if (file_exists($commissionPath)) {
            $commissionData = json_decode(file_get_contents($commissionPath), true);
            $feePercent = $commissionData['fee_percent'] ?? 5;
        }
        $platformRevenue = $gmv * ($feePercent / 100);

        $pendingMerchants  = Merchant::where('is_verified', false)->count();
        $pendingProducts   = Product::where('status', 'pending')->count();
        $pendingWithdrawals = Withdrawal::where('status', 'pending')->count();
        $pendingAds        = Advertisement::where('status', 'pending')->count();

        // Last 7 days order totals for chart
        $chartData = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total')
            )
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $d   = now()->subDays($i)->format('Y-m-d');
            $lbl = now()->subDays($i)->locale('id')->isoFormat('ddd');
            $days[] = [
                'label' => $lbl,
                'value' => (float) ($chartData[$d]->total ?? 0),
            ];
        }

        // Recent activity from audit logs
        $recentActivity = AdminAuditLog::with('admin:id,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($log) => [
                'action'    => $log->action,
                'admin'     => $log->admin?->name ?? 'Admin',
                'target'    => $log->target_type,
                'created_at' => $log->created_at->diffForHumans(),
            ]);

        $now = now();
        $thisMonthGmv = Order::where('payment_status', 'paid')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)->sum('total_amount');

        $lastMonthDate = now()->subMonth();
        $lastMonthGmv = Order::where('payment_status', 'paid')
            ->whereYear('created_at', $lastMonthDate->year)
            ->whereMonth('created_at', $lastMonthDate->month)->sum('total_amount');
        $gmvGrowth = $lastMonthGmv > 0 ? round(($thisMonthGmv - $lastMonthGmv) / $lastMonthGmv * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'totalUsers'         => $totalUsers,
                'totalMerchants'     => $totalMerchants,
                'totalProducts'      => $totalProducts,
                'totalOrders'        => $totalOrders,
                'activeAds'          => $activeAds,
                'gmv'                => $gmv,
                'platformRevenue'    => $platformRevenue,
                'feePercent'         => $feePercent,
                'gmvGrowth'          => $gmvGrowth,
                'pendingMerchants'   => $pendingMerchants,
                'pendingProducts'    => $pendingProducts,
                'pendingWithdrawals' => $pendingWithdrawals,
                'pendingAds'         => $pendingAds,
                'chartData'          => $days,
                'recentActivity'     => $recentActivity,
            ],
        ]);
    }

    public function getAnalytics(Request $request)
    {
        // Monthly revenue for current year
        $year = now()->year;
        
        $monthlyRaw = Order::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total_amount) as total')
            )
            ->whereYear('created_at', $year)
            ->where('payment_status', 'paid')
            ->groupBy('month')
            ->pluck('total', 'month');

        $months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
        $maxVal = $monthlyRaw->max() ?: 1;
        $revenueData = [];
        foreach ($months as $i => $lbl) {
            $total = (float) ($monthlyRaw[$i + 1] ?? 0);
            $revenueData[] = [
                'label' => $lbl,
                'value' => round($total / $maxVal * 100, 1),
                'raw'   => $total,
            ];
        }

        // Category distribution by number of products
        $categoryData = Product::select('categories.name as name', DB::raw('count(*) as count'))
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('count')
            ->take(5)
            ->get();

        $catTotal = $categoryData->sum('count') ?: 1;
        $colors = ['bg-indigo-500','bg-blue-500','bg-cyan-500','bg-emerald-500','bg-amber-500'];
        $categoryStats = $categoryData->values()->map(fn($c, $idx) => [
            'name'  => $c->name,
            'value' => round($c->count / $catTotal * 100),
            'color' => $colors[$idx] ?? 'bg-slate-500',
        ]);

        // KPI totals
        $gmv          = Order::where('payment_status', 'paid')->sum('total_amount');
        // Get dynamic commission fee
        $feePercent = 5;
        $commissionPath = storage_path('app/commission.json');
        if (file_exists($commissionPath)) {
            $commissionData = json_decode(file_get_contents($commissionPath), true);
            $feePercent = $commissionData['fee_percent'] ?? 5;
        }
        $revenue = $gmv * ($feePercent / 100);
        $totalOrders  = Order::count();
        $activeUsers  = User::where('status', 'active')->count();

        // Compare with previous month
        $now = now();
        $thisMonth = Order::where('payment_status', 'paid')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)->sum('total_amount');

        $lastMonthDate = now()->subMonth();
        $lastMonth = Order::where('payment_status', 'paid')
            ->whereYear('created_at', $lastMonthDate->year)
            ->whereMonth('created_at', $lastMonthDate->month)->sum('total_amount');
        $gmvGrowth = $lastMonth > 0 ? round(($thisMonth - $lastMonth) / $lastMonth * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'data'    => [
                'kpi' => [
                    'gmv'          => $gmv,
                    'gmvGrowth'    => $gmvGrowth,
                    'revenue'      => $revenue,
                    'totalOrders'  => $totalOrders,
                    'activeUsers'  => $activeUsers,
                ],
                'revenueData'  => $revenueData,
                'categoryData' => $categoryStats,
            ],
        ]);
    }

    public function getProducts(Request $request)
    {
        $search = $request->input('search', '');
        $status = $request->input('status', 'all');
        $page = $request->input('page', 1);

        $cacheKey = "admin_products_search_" . md5("{$search}_{$status}_{$page}");

        $data = cache()->remember($cacheKey, 3, function () use ($request) {
            $query = Product::with(['merchant:id,name', 'category:id,name'])
                ->withCount('reviews');

            if ($request->filled('search')) {
                $q = $request->search;
                $query->where(function ($sq) use ($q) {
                    $sq->where('title', 'like', "%$q%");
                });
            }

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            return [
                'success' => true,
                'data'    => $query->latest()->paginate(20)->toArray(),
            ];
        });

        return response()->json($data);
    }

    public function toggleProductStatus(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $status  = $request->input('status');

        $allowed = ['active', 'inactive', 'pending', 'banned'];
        if (!in_array($status, $allowed)) {
            return response()->json(['success' => false, 'message' => 'Status tidak valid.'], 422);
        }

        $product->status = $status;
        $product->save();

        AdminAuditLog::create([
            'admin_id'    => $request->user()->id,
            'action'      => 'update_product_status',
            'target_type' => 'product',
            'target_id'   => $product->id,
            'reason'      => "Status diubah ke: $status",
        ]);

        return response()->json(['success' => true, 'data' => $product]);
    }


    public function getAds(Request $request)
    {
        $query = Advertisement::with(['merchant:id,name', 'category:id,name', 'media', 'package']);

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sq) use ($q) {
                $sq->where('title', 'like', "%$q%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $ads = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $ads,
        ]);
    }

    public function toggleAdStatus(Request $request, $id)
    {
        $ad = Advertisement::findOrFail($id);
        $status = $request->input('status');

        $allowed = ['approved', 'rejected', 'pending'];
        if (!in_array($status, $allowed)) {
            return response()->json(['success' => false, 'message' => 'Status tidak valid.'], 422);
        }

        $ad->status = $status;
        $ad->save();

        AdminAuditLog::create([
            'admin_id'    => $request->user()->id,
            'action'      => 'update_ad_status',
            'target_type' => 'advertisement',
            'target_id'   => $ad->id,
            'reason'      => "Status diubah ke: $status",
        ]);

        return response()->json(['success' => true, 'data' => $ad]);
    }

    public function createAd(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'price'       => 'required|numeric|min:0',
            'location'    => 'required|string|max:255',
            'status'      => 'required|in:approved,pending,rejected',
        ]);

        $ad = Advertisement::create(array_merge($validated, [
            'owner_id' => $request->user()->id,
        ]));

        AdminAuditLog::create([
            'admin_id'    => $request->user()->id,
            'action'      => 'create_ad',
            'target_type' => 'advertisement',
            'target_id'   => $ad->id,
            'reason'      => 'Admin membuat iklan baru',
        ]);

        return response()->json(['success' => true, 'data' => $ad->load('category')]);
    }

    public function updateAd(Request $request, $id)
    {
        $ad = Advertisement::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'price'       => 'required|numeric|min:0',
            'location'    => 'required|string|max:255',
            'status'      => 'required|in:approved,pending,rejected',
        ]);

        $ad->update($validated);

        AdminAuditLog::create([
            'admin_id'    => $request->user()->id,
            'action'      => 'update_ad',
            'target_type' => 'advertisement',
            'target_id'   => $ad->id,
            'reason'      => 'Admin memperbarui iklan',
        ]);

        return response()->json(['success' => true, 'data' => $ad->load(['category', 'merchant', 'media'])]);
    }

    public function deleteAd(Request $request, $id)
    {
        $ad = Advertisement::findOrFail($id);
        
        AdminAuditLog::create([
            'admin_id'    => $request->user()->id,
            'action'      => 'delete_ad',
            'target_type' => 'advertisement',
            'target_id'   => $ad->id,
            'reason'      => 'Admin menghapus iklan',
        ]);

        $ad->delete();

        return response()->json(['success' => true, 'message' => 'Iklan berhasil dihapus']);
    }
}
