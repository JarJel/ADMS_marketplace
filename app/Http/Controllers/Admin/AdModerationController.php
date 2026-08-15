<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdModerationController extends Controller
{
    /**
     * Get pending advertisements.
     */
    public function getPendingAds()
    {
        $ads = Advertisement::where('status', 'pending')
            ->with(['category', 'package', 'owner'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan iklan berhasil diambil.',
            'data' => $ads
        ], 200);
    }

    /**
     * Approve or reject advertisement.
     */
    public function verifyAd(Request $request, $id)
    {
        $admin = $request->user();
        $ad = Advertisement::find($id);

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Iklan tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:approved,rejected', // matches model status enum
            'reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = $request->status;
        $reason = $request->input('reason', 'Verifikasi Iklan');

        $ad->status = $status;

        if ($status === 'approved') {
            // Automatically calculate expiration based on the package duration days
            $ad->expires_at = now()->addDays($ad->duration_days);
        }

        $ad->save();

        // Create audit log
        AdminAuditLog::create([
            'admin_id' => $admin->id,
            'action' => $status === 'approved' ? 'approve_ad' : 'reject_ad',
            'target_type' => 'advertisement',
            'target_id' => $ad->id,
            'reason' => 'Status: ' . $status . '. Alasan: ' . $reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Iklan berhasil diverifikasi dengan status: ' . $status,
            'data' => $ad
        ], 200);
    }
}
