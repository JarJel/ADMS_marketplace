<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;

class AdController extends Controller
{
    /**
     * Get all active public ads
     */
    public function index(Request $request)
    {
        // Only fetch ads that are active
        $query = Ad::where('status', 'active')->with(['user', 'adPackage']);

        // Optional category filter
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search query
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('desc', 'like', "%{$search}%");
            });
        }

        $ads = $query->orderBy('created_at', 'desc')->get();

        // Increment views count for all returned ads (impression tracking)
        // In a real app, this might be too heavy or should use a job.
        // For this MVP, we'll increment views for the fetched ones
        // Ad::whereIn('id', $ads->pluck('id'))->increment('views_count');

        return response()->json([
            'success' => true,
            'message' => 'Daftar iklan aktif berhasil diambil.',
            'data' => $ads
        ]);
    }

    /**
     * Track an ad click
     */
    public function trackClick($id)
    {
        $ad = Ad::where('status', 'active')->find($id);

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
}
