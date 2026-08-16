<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    /**
     * Get list of all users.
     */
    public function getUsers(Request $request)
    {
        $query = User::query();

        // Filter: role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter: status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search: name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        $users = $query->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengguna berhasil diambil.',
            'data' => $users
        ], 200);
    }

    /**
     * Toggle user status (active/suspended).
     */
    public function toggleUserStatus(Request $request, $id)
    {
        $admin = $request->user();
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required_if:status,suspended|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $user->status;
        $newStatus = $oldStatus === 'active' ? 'suspended' : 'active';
        $reason = $request->input('reason', 'Mengubah status pengguna');

        $user->status = $newStatus;
        $user->save();

        // Log action to admin_audit_logs
        AdminAuditLog::create([
            'admin_id' => $admin->id,
            'action' => $newStatus === 'suspended' ? 'suspend_user' : 'activate_user',
            'target_type' => 'user',
            'target_id' => $user->id,
            'reason' => $reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pengguna berhasil diperbarui menjadi ' . $newStatus . '.',
            'data' => $user
        ], 200);
    }
}
