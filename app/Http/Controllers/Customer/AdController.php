<?php

namespace App\Http\Controllers\Customer;

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
     * Get user's advertisements
     */
    public function getAds(Request $request)
    {
        $ads = Advertisement::where('user_id', $request->user()->id)
            ->with(['category', 'package'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $ads
        ]);
    }

    /**
     * Create listing/advertisement.
     */
    public function createAd(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'location' => 'required|string',
            'whatsapp' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $images = $request->file('images', []);
        if (count($images) > 2) {
            return response()->json([
                'success' => false,
                'message' => 'Maksimal gambar untuk iklan gratis adalah 2.'
            ], 400);
        }

        $freePackage = Package::where('type', 'free')->first();
        if (!$freePackage) {
            return response()->json([
                'success' => false,
                'message' => 'Sistem belum memiliki Paket Gratis.'
            ], 500);
        }

        DB::beginTransaction();

        try {
            $ad = Advertisement::create([
                'title' => $request->title,
                'category_id' => $request->category_id,
                'description' => $request->description,
                'price' => $request->price,
                'location' => $request->location,
                'contact_name' => $user->name,
                'whatsapp' => $request->whatsapp,
                'condition' => 'baru',
                'duration_days' => $freePackage->duration_days,
                'package_id' => $freePackage->id,
                'status' => 'pending',
                'owner_id' => $user->id,
            ]);

            foreach ($images as $key => $imageFile) {
                $path = $imageFile->store('ads', 'public');
                $media = new Media([
                    'url' => Storage::url($path),
                    'type' => 'ad_image',
                    'sort_order' => $key
                ]);
                $ad->media()->save($media);
            }

            // Kirim notifikasi ke user
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'title' => 'Pengajuan Iklan Baru',
                'message' => "Iklan Anda yang berjudul '{$ad->title}' telah berhasil diajukan dan sedang menunggu moderasi tim ADMS.",
                'type' => 'ad_status',
                'is_read' => false
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Iklan berhasil dibuat dan menunggu persetujuan',
                'data' => $ad->load('media')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat iklan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request ad upgrade.
     */
    public function upgradeAd(Request $request, $id)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'package_id' => 'required|exists:packages,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $ad = Advertisement::where('owner_id', $user->id)->find($id);

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Iklan tidak ditemukan'
            ], 404);
        }

        $package = Package::find($request->package_id);

        if ($package->type !== 'premium') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya paket premium yang bisa dipilih untuk upgrade.'
            ], 400);
        }

        $ad->update([
            'package_id' => $package->id,
            'duration_days' => $package->duration_days,
            'status' => 'pending', 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan upgrade iklan diajukan. Total biaya: Rp' . number_format($package->price, 0, ',', '.'),
            'data' => $ad->load('package')
        ], 200);
    }
}
