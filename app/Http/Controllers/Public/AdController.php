<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdController extends Controller
{
    /**
     * Get detail of a specific advertisement.
     */
    public function show($idOrSlug)
    {
        $query = Advertisement::with(['category', 'media', 'package', 'merchant'])
            ->where('status', 'approved');

        if (is_string($idOrSlug) && preg_match('/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i', $idOrSlug)) {
            $ad = $query->find($idOrSlug);
        } else {
            $ad = $query->where('slug', $idOrSlug)->first();
        }

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Iklan tidak ditemukan atau tidak aktif.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail iklan berhasil diambil.',
            'data' => [
                'id' => $ad->id,
                'title' => $ad->title,
                'slug' => $ad->slug,
                'category' => $ad->category?->name ?? 'Umum',
                'category_id' => $ad->category_id,
                'subcategory' => $ad->subcategory,
                'condition' => ucfirst($ad->condition ?? 'bekas'),
                'price' => (float)$ad->price,
                'location' => $ad->location,
                'advertiser' => $ad->contact_name,
                'whatsapp' => $ad->whatsapp,
                'image' => $ad->media->first()?->url ?? 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop',
                'desc' => $ad->description,
                'date' => $ad->created_at->format('Y-m-d'),
                'is_premium' => $ad->package && $ad->package->type !== 'free',
                'views_count' => $ad->views_count,
                'clicks_count' => $ad->clicks_count
            ]
        ]);
    }

    /**
     * Track an ad click
     */
    public function trackClick($idOrSlug)
    {
        $query = Advertisement::where('status', 'approved');

        if (is_string($idOrSlug) && preg_match('/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i', $idOrSlug)) {
            $ad = $query->find($idOrSlug);
        } else {
            $ad = $query->where('slug', $idOrSlug)->first();
        }

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Iklan tidak ditemukan atau tidak aktif.'
            ], 404);
        }

        $ad->increment('clicks_count');

        return response()->json([
            'success' => true,
            'message' => 'Klik iklan berhasil dicatat.',
            'data' => $ad
        ]);
    }

    /**
     * Search advertisements for autocomplete dropdown.
     */
    public function search(Request $request)
    {
        $q = $request->input('q', '');
        
        if (strlen($q) < 2) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $ads = Advertisement::where('status', 'approved')
            ->where(function($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                      ->orWhere('description', 'like', "%{$q}%")
                      ->orWhere('subcategory', 'like', "%{$q}%")
                      ->orWhereHas('category', function($catQuery) use ($q) {
                          $catQuery->where('name', 'like', "%{$q}%");
                      });
            })
            ->with(['category', 'media'])
            ->take(8)
            ->get()
            ->map(fn($ad) => [
                'id' => $ad->id,
                'title' => $ad->title,
                'slug' => $ad->slug,
                'category' => $ad->category?->name ?? 'Umum',
                'price' => (float)$ad->price,
                'image' => $ad->media->first()?->url ?? 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop',
            ]);

        return response()->json([
            'success' => true,
            'data' => $ads
        ]);
    }
}
