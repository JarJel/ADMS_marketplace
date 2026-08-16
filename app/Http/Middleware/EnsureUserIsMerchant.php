<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsMerchant
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Allow merchant or admin roles
        if ($user->role !== 'merchant' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda bukan merchant.'
            ], 403);
        }

        // Prevent accessing other endpoints if merchant profile does not exist yet
        $routeName = $request->route() ? $request->route()->getName() : null;
        if ($routeName !== 'merchant.store.register') {
            if (!$user->merchant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Toko belum terdaftar. Silakan daftarkan toko Anda terlebih dahulu.'
                ], 404);
            }
        }

        return $next($request);
    }
}
