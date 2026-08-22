<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryAndPackageController extends Controller
{
    /**
     * Create new Category.
     */
    public function storeCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug',
            'type' => 'required|string|in:product,advertisement',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->slug),
            'type' => $request->type,
            'parent_id' => $request->parent_id,
            'icon' => $request->icon,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dibuat.',
            'data' => $category
        ], 200);
    }

    /**
     * Update Category.
     */
    public function updateCategory(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug,' . $id,
            'type' => 'required|string|in:product,advertisement',
            'parent_id' => 'nullable|exists:categories,id|different:id',
            'icon' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->slug),
            'type' => $request->type,
            'parent_id' => $request->parent_id,
            'icon' => $request->icon,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui.',
            'data' => $category
        ], 200);
    }

    /**
     * Create a new ad package.
     */
    public function storeAdPackage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'type' => 'required|string|in:free,premium',
            'benefits' => 'nullable|array',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $package = new Package();
            $package->name = $request->name;
            $package->price = $request->price;
            $package->duration_days = $request->duration_days;
            $package->type = $request->type;
            $package->benefits = $request->benefits;
            $package->is_active = $request->is_active;
            $package->save();

            return response()->json([
                'success' => true,
                'message' => 'Paket iklan berhasil ditambahkan.',
                'data' => $package
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update ad package pricing, duration, or benefits.
     */
    public function updateAdPackage(Request $request, $id)
    {
        $package = Package::find($id);

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Paket tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'type' => 'required|string|in:free,premium',
            'benefits' => 'nullable|array',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $package->update([
            'name' => $request->name,
            'price' => $request->price,
            'duration_days' => $request->duration_days,
            'type' => $request->type,
            'benefits' => $request->benefits,
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Paket promosi iklan berhasil diperbarui.',
            'data' => $package
        ], 200);
    }

    /**
     * Delete a category.
     */
    public function deleteCategory($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan.'
            ], 404);
        }

        try {
            // Prevent deletion if category is in use
            if ($category->products()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh produk.'
                ], 400);
            }

            if ($category->advertisements()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh iklan.'
                ], 400);
            }

            // Also check for child categories if nested categories are used
            if ($category->children()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kategori tidak dapat dihapus karena memiliki sub-kategori.'
                ], 400);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat menghapus kategori: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an ad package.
     */
    public function deleteAdPackage($id)
    {
        $package = Package::find($id);

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Paket tidak ditemukan.'
            ], 404);
        }

        try {
            // Check if there are active advertisements using this package
            // Assuming advertisements relationship exists as defined in the model
            if ($package->advertisements()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paket tidak dapat dihapus karena masih digunakan oleh iklan aktif.'
                ], 400);
            }

            $package->delete();

            return response()->json([
                'success' => true,
                'message' => 'Paket berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat menghapus paket: ' . $e->getMessage()
            ], 500);
        }
    }
}
