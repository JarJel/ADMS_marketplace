<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WithdrawalController extends Controller
{
    /**
     * Get pending withdrawals.
     */
    public function getPendingWithdrawals()
    {
        $withdrawals = Withdrawal::where('status', 'pending')
            ->with('merchant')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan penarikan dana berhasil diambil.',
            'data' => $withdrawals
        ], 200);
    }

    /**
     * Verify withdrawal request (approve/reject).
     */
    public function verifyWithdrawal(Request $request, $id)
    {
        $admin = $request->user();
        $withdrawal = Withdrawal::find($id);

        if (!$withdrawal) {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan penarikan dana tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:approved,rejected',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = $request->status;
        $notes = $request->input('notes', 'Verifikasi penarikan dana');

        $withdrawal->status = $status;
        $withdrawal->notes = $notes;
        $withdrawal->save();

        // Log audit action
        AdminAuditLog::create([
            'admin_id' => $admin->id,
            'action' => $status === 'approved' ? 'approve_withdrawal' : 'reject_withdrawal',
            'target_type' => 'merchant',
            'target_id' => $withdrawal->merchant_id,
            'reason' => 'Status: ' . $status . '. Catatan: ' . $notes . '. Withdrawal ID: ' . $withdrawal->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penarikan dana berhasil diverifikasi dengan status: ' . $status,
            'data' => $withdrawal
        ], 200);
    }
}
