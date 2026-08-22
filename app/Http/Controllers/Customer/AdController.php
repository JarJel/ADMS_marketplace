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
        $ads = Advertisement::where('owner_id', $request->user()->id)
            ->whereNotIn('status', ['rejected', 'banned'])
            ->with(['category', 'package', 'media', 'merchant'])
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
            'category_id' => 'required',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'location' => 'required|string',
            'whatsapp' => 'required|string',
            'contact_name' => 'required|string',
            'condition' => 'nullable|string',
            'website_url' => 'nullable|url',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp,heic|max:10240',
        ]);

        if ($validator->fails()) {
            $errorString = implode(', ', $validator->errors()->all());
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . $errorString,
                'errors' => $validator->errors()
            ], 422);
        }

        $images = $request->file('images', []);
        
        $isPremium = false;
        $activePackage = null;
        if ($user->active_package_id && $user->package_expires_at && $user->package_expires_at > now()) {
            $isPremium = true;
            $activePackage = Package::find($user->active_package_id);
        }

        $maxImages = $isPremium ? 5 : 2;

        if (count($images) > $maxImages) {
            return response()->json([
                'success' => false,
                'message' => "Maksimal gambar untuk iklan " . ($isPremium ? 'premium' : 'gratis') . " adalah {$maxImages}."
            ], 400);
        }

        if (!$isPremium || !$activePackage) {
            $activePackage = Package::where('type', 'free')->first();
            if (!$activePackage) {
                // Temporary mock package if none exists for testing
                $activePackage = (object) ['id' => 1, 'duration_days' => 7];
            }
        }

        // --- SISTEM MODERASI OTOMATIS ---
        $moderationService = new \App\Services\AdModerationService();
        $moderationResult = $moderationService->analyze(
            $request->title,
            $request->description,
            $request->website_url
        );

        DB::beginTransaction();

        try {
            $ad = Advertisement::create([
                'title' => $request->title,
                'category_id' => $request->category_id,
                'description' => $request->description,
                'price' => $request->price,
                'location' => $request->location,
                'contact_name' => $request->contact_name,
                'whatsapp' => $request->whatsapp,
                'condition' => $request->condition ?? 'Baru',
                'website_url' => $request->website_url,
                'duration_days' => $activePackage->duration_days,
                'package_id' => $activePackage->id,
                'status' => $moderationResult['status'],
                'moderation_note' => $moderationResult['reason'],
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
     * Update an existing advertisement.
     */
    public function updateAd(Request $request, $id)
    {
        $user = $request->user();

        $ad = Advertisement::where('owner_id', $user->id)->find($id);
        if (!$ad) {
            return response()->json(['success' => false, 'message' => 'Iklan tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title'        => 'sometimes|required|string|max:255',
            'category_id'  => 'sometimes|required',
            'description'  => 'sometimes|required|string',
            'price'        => 'nullable|numeric|min:0',
            'location'     => 'sometimes|required|string',
            'whatsapp'     => 'sometimes|required|string',
            'contact_name' => 'sometimes|required|string',
            'condition'    => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        // --- SISTEM MODERASI OTOMATIS ---
        $titleToCheck = $request->title ?? $ad->title;
        $descToCheck = $request->description ?? $ad->description;
        $urlToCheck = $request->website_url ?? $ad->website_url;
        
        $moderationService = new \App\Services\AdModerationService();
        $moderationResult = $moderationService->analyze($titleToCheck, $descToCheck, $urlToCheck);

        $updateData = $request->only(['title', 'category_id', 'description', 'price', 'location', 'whatsapp', 'contact_name', 'condition', 'website_url']);
        
        // Hanya ubah status jika hasil moderasi bukan approved, atau jika butuh direview ulang
        if ($moderationResult['status'] !== 'approved') {
            $updateData['status'] = $moderationResult['status'];
            $updateData['moderation_note'] = $moderationResult['reason'];
        }

        $ad->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Iklan berhasil diperbarui',
            'data'    => $ad->load(['category', 'package']),
        ]);
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
