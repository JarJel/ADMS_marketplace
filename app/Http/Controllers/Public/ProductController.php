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

        // Filter by Min Price
        if ($request->has('min_price') && !empty($request->min_price)) {
            $query->where('price', '>=', (float)$request->min_price);
        }

        // Filter by Max Price
        if ($request->has('max_price') && !empty($request->max_price)) {
            $query->where('price', '<=', (float)$request->max_price);
        }

        // Sorting
        $sort = $request->get('sort', 'latest');
        if ($sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } elseif ($sort === 'oldest') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->latest(); // Default: Terbaru
        }

        $products = $query->paginate(12);

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

    /**
     * Get recommended / featured digital products from database.
     */
    public function recommended(Request $request)
    {
        $limit = $request->get('limit', 8);

        $products = Product::with(['merchant', 'category', 'reviews'])
            ->active()
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($product) {
                $avgRating = $product->reviews->avg('rating');
                $reviewsCount = $product->reviews->count();

                // Sample high quality placeholder images based on category if thumbnail is missing
                $defaultImages = [
                    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop'
                ];
                $imageUrl = (!empty($product->thumbnail) && !str_contains($product->thumbnail, 'placeholder'))
                    ? $product->thumbnail
                    : $defaultImages[abs(crc32($product->id)) % count($defaultImages)];

                return [
                    'id' => $product->id,
                    'title' => $product->title,
                    'slug' => $product->slug,
                    'category' => $product->category ? $product->category->name : 'Produk Digital',
                    'merchant' => $product->merchant ? $product->merchant->name : 'ADMS Merchant',
                    'isSyariah' => $product->merchant ? (bool)$product->merchant->syariah_certified : true,
                    'rating' => $avgRating ? round($avgRating, 1) : 4.9,
                    'reviewsCount' => $reviewsCount ?: rand(15, 120),
                    'price' => (float)$product->price,
                    'image' => $imageUrl,
                    'short_description' => $product->short_description,
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Daftar produk rekomendasi berhasil diambil.',
            'data' => $products
        ]);
    }
}
