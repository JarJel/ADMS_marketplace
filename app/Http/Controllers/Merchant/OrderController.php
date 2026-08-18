<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Get incoming orders.
     */
    public function getIncomingOrders(Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $query = Order::where('merchant_id', $merchant->id)
            ->with(['user', 'items.product']);

        // Filter: Order Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter: Payment Status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan masuk berhasil diambil.',
            'data' => $orders
        ], 200);
    }

    /**
     * Update order status.
     */
    public function updateOrderStatus(Request $request, $orderId)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $order = Order::where('merchant_id', $merchant->id)->find($orderId);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,paid,processed,shipped,completed,cancelled', // matches migration enum
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $order->status;
        $order->status = $request->status;

        // Automatically update payment status to paid if status transitions to paid or completed
        if (in_array($request->status, ['paid', 'completed'])) {
            $order->payment_status = 'paid';
        }

        $order->save();

        // Kirim notifikasi ke customer
        \App\Models\Notification::create([
            'user_id' => $order->user_id,
            'title' => 'Status Pesanan Diperbarui',
            'message' => "Status pesanan Anda #{$order->id} telah diperbarui menjadi '{$request->status}'.",
            'type' => 'order',
            'is_read' => false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui dari ' . $oldStatus . ' menjadi ' . $request->status . '.',
            'data' => $order
        ], 200);
    }
}
