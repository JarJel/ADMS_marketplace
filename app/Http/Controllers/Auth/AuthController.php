<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuthToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|in:user,merchant',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Integrity security: restrict admin role registration via public API
        $role = $request->input('role', 'user');

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $role,
            'status' => 'active',
        ]);

        // Generate email verification token
        $verifyToken = (string) mt_rand(100000, 999999);
        AuthToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $verifyToken),
            'type' => 'email_verification',
            'expires_at' => now()->addDay(),
        ]);

        // Send email
        Mail::to($user->email)->send(new VerifyEmailMail($user->name, $verifyToken));

        // Generate custom auth token
        $tokenString = Str::random(80);
        AuthToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $tokenString),
            'type' => 'refresh',
            'expires_at' => now()->addDays(30),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                ],
                'token' => $tokenString
            ]
        ], 201); // 201 Created
    }

    /**
     * Login user and create token.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Support login using either email or phone number
        $loginField = filter_var($request->email, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($loginField, $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kredensial yang diberikan salah.'
            ], 401);
        }

        // Safety check: Check if user status is suspended
        if ($user->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda telah ditangguhkan.'
            ], 403);
        }

        // Generate custom auth token
        $tokenString = Str::random(80);
        AuthToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $tokenString),
            'type' => 'refresh',
            'expires_at' => now()->addDays(30),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                ],
                'token' => $tokenString
            ]
        ]);
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request)
    {
        $tokenString = $request->bearerToken();

        if ($tokenString) {
            $hashedToken = hash('sha256', $tokenString);
            AuthToken::where('token', $hashedToken)->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $request->user()->load('merchant')
            ]
        ]);
    }

    /**
     * Send password reset link to user.
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Generate reset token (stored in auth_tokens with type 'reset_password')
        $tokenString = Str::random(60);
        AuthToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $tokenString),
            'type' => 'reset_password',
            'expires_at' => now()->addMinutes(60),
        ]);

        // Send email
        Mail::to($user->email)->send(new ResetPasswordMail($tokenString, $user));

        return response()->json([
            'status' => 'success',
            'message' => 'Link reset password telah dikirim ke email Anda.'
        ]);
    }

    /**
     * Reset user password using token.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $hashedToken = hash('sha256', $request->token);
        
        $tokenRecord = AuthToken::where('token', $hashedToken)
            ->where('type', 'reset_password')
            ->where('expires_at', '>', now())
            ->first();

        if (!$tokenRecord || !$tokenRecord->user || $tokenRecord->user->email !== $request->email) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token reset password tidak valid atau telah kedaluwarsa.'
            ], 400);
        }

        // Update password
        $user = $tokenRecord->user;
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Revoke/Delete reset token
        $tokenRecord->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Password Anda berhasil diperbarui.'
        ]);
    }

    /**
     * Verify email address.
     */
    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $hashedToken = hash('sha256', $request->token);

        $tokenRecord = AuthToken::where('token', $hashedToken)
            ->where('type', 'email_verification')
            ->where('expires_at', '>', now())
            ->first();

        if (!$tokenRecord || !$tokenRecord->user || $tokenRecord->user->email !== $request->email) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token verifikasi email tidak valid atau telah kedaluwarsa.'
            ], 400);
        }

        $user = $tokenRecord->user;
        $user->email_verified_at = now();
        $user->save();

        // Delete token
        $tokenRecord->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Email Anda berhasil diverifikasi. Akun Anda sekarang aktif.'
        ], 200);
    }
}
