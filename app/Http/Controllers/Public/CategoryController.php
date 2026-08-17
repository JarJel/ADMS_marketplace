<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get all categories.
     * Optionally filter by type (product/advertisement)
     */
    public function index(Request $request)
    {
        $query = Category::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Return parent categories with their children
        $categories = $query->whereNull('parent_id')
            ->with('children')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori berhasil diambil.',
            'data' => $categories
        ]);
    }
}
