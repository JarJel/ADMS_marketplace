<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\PackageSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PackageOrderController extends Controller
{
    /**
     * Get user's package subscriptions.
     */
    public function index(Request $request)
    {
        $subscriptions = PackageSubscription::with('package')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    /**
     * Create a pending package subscription order.
     */
    public function checkout(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'package_id' => 'required|exists:packages,id',
            'payment_method' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $package = Package::find($request->package_id);

        if (!$package->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Paket ini sudah tidak aktif.'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $subscription = PackageSubscription::create([
                'user_id' => $user->id,
                'package_id' => $package->id,
                'total_amount' => $package->price,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan paket berhasil dibuat. Menunggu konfirmasi admin.',
                'data' => $subscription
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses pesanan paket.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
