<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get list of active products with filters and pagination.
     */
    public function index(Request $request)
    {
        $query = Product::with(['merchant', 'category'])
            ->active();

        // Search by title
        if ($request->has('search') && !empty($request->search)) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by category_id
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by merchant_id
        if ($request->has('merchant_id') && !empty($request->merchant_id)) {
            $query->where('merchant_id', $request->merchant_id);
        }

        $products = $query->latest()->paginate(12);

        return response()->json([
            'success' => true,
            'message' => 'Daftar produk berhasil diambil.',
            'data' => $products
        ]);
    }

    /**
     * Get detail of a specific product.
     */
    public function show($id)
    {
        $product = Product::with([
            'merchant.owner', 
            'category', 
            'media',
            'reviews.user' // Load reviews and their authors
        ])->active()->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan atau tidak aktif.'
            ], 404);
        }
        
        // Calculate average rating
        $averageRating = $product->reviews()->avg('rating');
        $product->setAttribute('average_rating', $averageRating ? round($averageRating, 1) : 0);
        $product->setAttribute('reviews_count', $product->reviews()->count());

        return response()->json([
            'success' => true,
            'message' => 'Detail produk berhasil diambil.',
            'data' => $product
        ]);
    }
}
