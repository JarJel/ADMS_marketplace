<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AuthToken;
use Illuminate\Support\Facades\Auth;

class AuthenticateCustomToken
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $tokenString = $request->bearerToken();

        if (!$tokenString) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token tidak disediakan.'
            ], 401);
        }

        $hashedToken = hash('sha256', $tokenString);
        $tokenRecord = AuthToken::where('token', $hashedToken)
            ->where('expires_at', '>', now())
            ->first();

        if (!$tokenRecord || !$tokenRecord->user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token tidak valid atau kedaluwarsa.'
            ], 401);
        }

        // Integrity check: user status must be active
        if ($tokenRecord->user->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda telah ditangguhkan.'
            ], 403);
        }

        // Log the user into the current request context
        Auth::setUser($tokenRecord->user);

        return $next($request);
    }
}
