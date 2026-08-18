<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Get merchant's products.
     */
    public function getProducts(Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $query = Product::where('merchant_id', $merchant->id);

        // Filter: Search name/title
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter: Category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->with('category')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar produk berhasil diambil.',
            'data' => $products
        ], 200);
    }

    /**
     * Add new digital product.
     */
    public function storeProduct(Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'price_type' => 'required|string|in:starting_from,contact_us', // matches migration enum
            'short_description' => 'required|string|max:255',
            'full_description' => 'required|string',
            'stock' => 'required|integer|min:0',
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle thumbnail upload
        $path = $request->file('thumbnail')->store('products/thumbnails', 'public');
        $thumbnailUrl = Storage::url($path);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'slug' => Str::slug($request->slug),
            'price' => $request->price,
            'price_type' => $request->price_type,
            'short_description' => $request->short_description,
            'full_description' => $request->full_description,
            'stock' => $request->stock,
            'thumbnail' => $thumbnailUrl,
            'status' => 'pending', // Default requires admin review
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produk digital berhasil diajukan dan menunggu persetujuan admin.',
            'data' => $product
        ], 200);
    }

    /**
     * Update product.
     */
    public function updateProduct(Request $request, $id)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $product = Product::where('merchant_id', $merchant->id)->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'price_type' => 'required|string|in:starting_from,contact_us',
            'short_description' => 'required|string|max:255',
            'full_description' => 'required|string',
            'stock' => 'required|integer|min:0',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $product->title = $request->title;
        $product->category_id = $request->category_id;
        $product->price = $request->price;
        $product->price_type = $request->price_type;
        $product->short_description = $request->short_description;
        $product->full_description = $request->full_description;
        $product->stock = $request->stock;

        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail file
            if ($product->thumbnail) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $product->thumbnail));
            }

            $path = $request->file('thumbnail')->store('products/thumbnails', 'public');
            $product->thumbnail = Storage::url($path);
        }

        $product->save();

        return response()->json([
            'success' => true,
            'message' => 'Detail produk berhasil diperbarui.',
            'data' => $product
        ], 200);
    }

    /**
     * Delete product (soft delete).
     */
    public function deleteProduct(Request $request, $id)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $product = Product::where('merchant_id', $merchant->id)->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan.'
            ], 404);
        }

        $product->delete(); // Uses SoftDeletes trait in model

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus.'
        ], 200);
    }
}
