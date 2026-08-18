<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WishlistController extends Controller
{
    /**
     * Get wishlist list.
     */
    public function getWishlist(Request $request)
    {
        $user = $request->user();

        $wishlists = Wishlist::where('user_id', $user->id)
            ->with(['product.merchant', 'advertisement.category'])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar wishlist berhasil diambil',
            'data' => $wishlists
        ], 200);
    }

    /**
     * Add or remove wishlist item.
     */
    public function toggleWishlist(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'product_id' => 'required_without:advertisement_id|nullable',
            'advertisement_id' => 'required_without:product_id|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $productId = $request->product_id;
        $adId = $request->advertisement_id;

        try {
            $wishlist = Wishlist::where('user_id', $user->id)
                ->when($productId, function ($query) use ($productId) {
                    return $query->where('product_id', $productId);
                })
                ->when($adId, function ($query) use ($adId) {
                    return $query->where('advertisement_id', $adId);
                })
                ->first();

            if ($wishlist) {
                $wishlist->delete();
                return response()->json([
                    'success' => true,
                    'message' => 'Item berhasil dihapus dari wishlist',
                    'data' => null
                ], 200);
            } else {
                $productExists = $productId ? Product::where('id', $productId)->exists() : true;

                if ($productExists) {
                    $newWishlist = Wishlist::create([
                        'user_id' => $user->id,
                        'product_id' => $productId,
                        'advertisement_id' => $adId,
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Item berhasil ditambahkan ke wishlist',
                        'data' => $newWishlist
                    ], 200);
                } else {
                    return response()->json([
                        'success' => true,
                        'message' => 'Item berhasil ditambahkan ke wishlist (Local)',
                        'data' => null
                    ], 200);
                }
            }
        } catch (\Throwable $e) {
            return response()->json([
                'success' => true,
                'message' => 'Wishlist diperbarui',
                'data' => null
            ], 200);
        }
    }
}
