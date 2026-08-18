<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Media;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdController extends Controller
{
    /**
     * Get advertisements.
     */
    public function getAds(Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        // Ads associated with the merchant, ordered by newest first
        $ads = Advertisement::where('merchant_id', $merchant->id)->with(['category', 'package'])->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar iklan berhasil diambil.',
            'data' => $ads
        ], 200);
    }

    /**
     * Store new advertisement.
     */
    public function storeAd(Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'location' => 'required|string',
            'whatsapp' => 'required|string',
            'package_id' => 'required|exists:packages,id',
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $package = Package::find($request->package_id);

        DB::beginTransaction();

        try {
            $ad = Advertisement::create([
                'title' => $request->title,
                'category_id' => $request->category_id,
                'description' => $request->description,
                'price' => $request->price,
                'location' => $request->location,
                'contact_name' => $merchant->name,
                'whatsapp' => $request->whatsapp,
                'condition' => 'baru',
                'duration_days' => $package->duration_days,
                'package_id' => $package->id,
                'status' => 'pending', // Waiting admin approval
                'merchant_id' => $merchant->id,
                'owner_id' => $user->id,
            ]);

            // Save images
            $images = $request->file('images', []);
            foreach ($images as $key => $imageFile) {
                $path = $imageFile->store('ads', 'public');
                $media = new Media([
                    'url' => Storage::url($path),
                    'type' => 'ad_image',
                    'sort_order' => $key
                ]);
                $ad->media()->save($media);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Iklan baris merchant berhasil diajukan.',
                'data' => $ad->load('media')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memasang iklan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics of specific ad.
     */
    public function getAdStats($id, Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $ad = Advertisement::where('merchant_id', $merchant->id)->find($id);

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Iklan tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Statistik iklan berhasil diambil.',
            'data' => [
                'views_count' => $ad->views_count,
                'clicks_count' => $ad->clicks_count,
            ]
        ], 200);
    }
}
