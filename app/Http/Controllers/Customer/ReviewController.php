<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Review products only if ordered and completed.
     */
    public function storeReview(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $hasCompletedOrder = Order::where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('status', 'completed')
                  ->orWhere('payment_status', 'paid');
            })
            ->whereHas('items', function ($q) use ($request) {
                $q->where('product_id', $request->product_id);
            })
            ->exists();

        if (!$hasCompletedOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya dapat memberikan ulasan pada produk yang sudah dibeli dan dibayar.'
            ], 403);
        }

        $product = Product::find($request->product_id);

        $review = Review::create([
            'user_id' => $user->id,
            'merchant_id' => $product->merchant_id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ulasan berhasil disimpan',
            'data' => $review
        ], 200);
    }
}
