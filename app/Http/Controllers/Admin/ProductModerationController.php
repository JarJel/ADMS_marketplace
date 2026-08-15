<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductModerationController extends Controller
{
    /**
     * Get pending products.
     */
    public function getPendingProducts()
    {
        $products = Product::where('status', 'pending')
            ->with(['merchant', 'category'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan produk berhasil diambil.',
            'data' => $products
        ], 200);
    }

    /**
     * Approve or reject product submission.
     */
    public function verifyProduct(Request $request, $id)
    {
        $admin = $request->user();
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:active,rejected', // matches model status enum
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
        $reason = $request->input('reason', 'Verifikasi Produk');

        $product->status = $status;
        $product->save();

        // Create audit log
        AdminAuditLog::create([
            'admin_id' => $admin->id,
            'action' => $status === 'active' ? 'approve_product' : 'reject_product',
            'target_type' => 'product',
            'target_id' => $product->id,
            'reason' => 'Status: ' . $status . '. Alasan: ' . $reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diverifikasi dengan status: ' . $status,
            'data' => $product
        ], 200);
    }
}
