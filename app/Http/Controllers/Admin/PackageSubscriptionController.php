<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PackageSubscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PackageSubscriptionController extends Controller
{
    /**
     * Get all package subscriptions.
     */
    public function index()
    {
        $subscriptions = PackageSubscription::with(['user', 'package'])
            ->orderBy('created_at', 'desc')
            ->take(150)
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    /**
     * Approve a package subscription order.
     */
    public function approve($id)
    {
        $subscription = PackageSubscription::with('package')->find($id);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan langganan tidak ditemukan.'
            ], 404);
        }

        if ($subscription->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah diproses sebelumnya.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update subscription
            $startsAt = now();
            $expiresAt = now()->addDays($subscription->package->duration_days);

            $subscription->update([
                'status' => 'active',
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt
            ]);

            // Apply package to user
            $user = User::find($subscription->user_id);
            $user->update([
                'active_package_id' => $subscription->package_id,
                'package_expires_at' => $expiresAt
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil diverifikasi. Paket telah aktif untuk pengguna ini.',
                'data' => $subscription
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memverifikasi pesanan.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a package subscription order.
     */
    public function reject($id)
    {
        $subscription = PackageSubscription::find($id);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan langganan tidak ditemukan.'
            ], 404);
        }

        if ($subscription->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah diproses sebelumnya.'
            ], 400);
        }

        $subscription->update([
            'status' => 'rejected'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan paket telah ditolak.'
        ]);
    }
}
