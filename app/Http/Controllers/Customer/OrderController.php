<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Create order inside a DB transaction.
     */
    public function createOrder(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'merchant_id' => 'required|exists:merchants,id',
            'payment_method' => 'required|string',
            'shipping_address' => 'nullable|string',
            'notes' => 'nullable|string',
            // Cart checkout option
            'checkout_from_cart' => 'nullable|boolean',
            // Direct multi-item checkout option
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            // Fallback single product checkout
            'product_id' => 'required_without_all:checkout_from_cart,items|exists:products,id',
            'quantity' => 'required_without_all:checkout_from_cart,items|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $checkoutItems = [];

        if ($request->boolean('checkout_from_cart')) {
            $cartItems = \App\Models\CartItem::where('user_id', $user->id)->with('product')->get();
            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Keranjang belanja kosong.'
                ], 400);
            }
            foreach ($cartItems as $ci) {
                $checkoutItems[] = [
                    'product' => $ci->product,
                    'quantity' => $ci->quantity,
                    'cart_item' => $ci
                ];
            }
        } elseif ($request->filled('items')) {
            foreach ($request->items as $item) {
                $prod = Product::find($item['product_id']);
                $checkoutItems[] = [
                    'product' => $prod,
                    'quantity' => $item['quantity']
                ];
            }
        } else {
            $prod = Product::find($request->product_id);
            $checkoutItems[] = [
                'product' => $prod,
                'quantity' => $request->quantity
            ];
        }

        // Validate stock
        foreach ($checkoutItems as $ci) {
            if ($ci['product']->stock < $ci['quantity']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok produk "' . $ci['product']->title . '" tidak mencukupi.'
                ], 400);
            }
        }

        DB::beginTransaction();

        try {
            $totalAmount = 0;
            foreach ($checkoutItems as $ci) {
                $totalAmount += $ci['product']->price * $ci['quantity'];
            }

            $order = Order::create([
                'user_id' => $user->id,
                'merchant_id' => $request->merchant_id,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_status' => 'unpaid',
                'shipping_address' => $request->shipping_address,
                'notes' => $request->notes,
            ]);

            foreach ($checkoutItems as $ci) {
                $subtotal = $ci['product']->price * $ci['quantity'];
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $ci['product']->id,
                    'quantity' => $ci['quantity'],
                    'price_at_purchase' => $ci['product']->price,
                    'subtotal' => $subtotal,
                ]);

                $ci['product']->decrement('stock', $ci['quantity']);

                if (isset($ci['cart_item'])) {
                    $ci['cart_item']->delete();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat',
                'data' => $order->load('items.product')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pesanan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transaction history.
     */
    public function getOrders(Request $request)
    {
        $user = $request->user();

        $orders = Order::where('user_id', $user->id)
            ->with(['merchant', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat transaksi berhasil diambil',
            'data' => $orders
        ], 200);
    }

    /**
     * Get order details.
     */
    public function getOrderDetail($id, Request $request)
    {
        $user = $request->user();

        $order = Order::where('user_id', $user->id)
            ->with(['merchant', 'items.product'])
            ->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pesanan berhasil diambil',
            'data' => $order
        ], 200);
    }

    /**
     * Securely download digital products.
     */
    public function downloadProduct($orderItemId, Request $request)
    {
        $user = $request->user();

        $orderItem = OrderItem::with(['order', 'product'])->find($orderItemId);

        if (!$orderItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item produk tidak ditemukan'
            ], 404);
        }

        if ($orderItem->order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        }

        $isPaid = $orderItem->order->payment_status === 'paid';
        $isCompleted = in_array($orderItem->order->status, ['paid', 'completed']);

        if (!$isPaid && !$isCompleted) {
            return response()->json([
                'success' => false,
                'message' => 'Anda harus melunasi pembayaran sebelum mengunduh produk ini.'
            ], 403);
        }

        return response()->streamDownload(function () use ($orderItem) {
            echo "LINK DOWNLOAD DIGITAL: https://storage.adms-syariah.id/digital-assets/" . hash('sha256', $orderItem->id) . "\n";
            echo "Jazakumullah Khairan atas pembelian Anda untuk produk: " . $orderItem->product->title;
        }, 'digital-product-' . $orderItem->product_id . '.txt');
    }
}
