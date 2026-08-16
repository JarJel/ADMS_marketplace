<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MerchantModerationController extends Controller
{
    /**
     * Get pending merchant registration requests.
     */
    public function getPendingMerchants()
    {
        // Merchants with is_verified false are considered pending approval
        $merchants = Merchant::where('is_verified', false)
            ->with('owner')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan merchant berhasil diambil.',
            'data' => $merchants
        ], 200);
    }

    /**
     * Approve or reject merchant verification request.
     */
    public function verifyMerchant(Request $request, $id)
    {
        $admin = $request->user();
        $merchant = Merchant::with('owner')->find($id);

        if (!$merchant) {
            return response()->json([
                'success' => false,
                'message' => 'Merchant tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:VERIFIED,REJECTED',
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
        $notes = $request->input('notes', 'Verifikasi Merchant');

        DB::beginTransaction();

        try {
            if ($status === 'VERIFIED') {
                $merchant->is_verified = true;
                $merchant->save();

                // Upgrade the store owner's role to 'merchant'
                if ($merchant->owner) {
                    $merchant->owner->update([
                        'role' => 'merchant'
                    ]);
                }
            } else {
                // If rejected, we keep is_verified = false or we delete, let's keep is_verified false and update description/notes
                $merchant->is_verified = false;
                $merchant->save();
            }

            // Create audit log
            AdminAuditLog::create([
                'admin_id' => $admin->id,
                'action' => $status === 'VERIFIED' ? 'approve_merchant' : 'reject_merchant',
                'target_type' => 'merchant',
                'target_id' => $merchant->id,
                'reason' => 'Status: ' . $status . '. Notes: ' . $notes,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Verifikasi merchant berhasil diproses dengan status: ' . $status,
                'data' => $merchant->load('owner')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses verifikasi merchant: ' . $e->getMessage()
            ], 500);
        }
    }
}
