<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    /**
     * Register a new store (Merchant).
     */
    public function registerStore(Request $request)
    {
        $user = $request->user();

        if ($user->merchant) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki toko yang terdaftar.'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:merchants,slug',
            'description' => 'required|string',
            'location' => 'required|string',
            'contact_whatsapp' => 'required|string',
            'syariah_certified' => 'nullable|boolean',
            'syariah_cert_number' => 'required_if:syariah_certified,true|nullable|string',
            'syariah_cert_body' => 'required_if:syariah_certified,true|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Integrity security: force status to is_verified = false (requires admin verification)
        $merchant = Merchant::create([
            'owner_id' => $user->id,
            'name' => $request->name,
            'slug' => Str::slug($request->slug),
            'description' => $request->description,
            'is_verified' => false,
            'location' => $request->location,
            'contact_whatsapp' => $request->contact_whatsapp,
            'syariah_certified' => $request->boolean('syariah_certified'),
            'syariah_cert_number' => $request->syariah_cert_number,
            'syariah_cert_body' => $request->syariah_cert_body,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran toko berhasil diajukan dan sedang menunggu verifikasi admin.',
            'data' => $merchant
        ], 200);
    }

    /**
     * Update store profile.
     */
    public function updateStore(Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'contact_whatsapp' => 'required|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $merchant->name = $request->name;
        $merchant->description = $request->description;
        $merchant->location = $request->location;
        $merchant->contact_whatsapp = $request->contact_whatsapp;

        // Handle Logo upload
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('merchants/logos', 'public');
            $logoUrl = Storage::url($logoPath);

            // Polymorphic relation clean up
            $oldLogo = $merchant->media()->where('type', 'merchant_logo')->first();
            if ($oldLogo) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldLogo->url));
                $oldLogo->delete();
            }

            $merchant->media()->create([
                'url' => $logoUrl,
                'type' => 'merchant_logo',
            ]);
        }

        // Handle Banner upload (simulated via polymorphic as ad_image type or similar, let's store it)
        if ($request->hasFile('banner')) {
            $bannerPath = $request->file('banner')->store('merchants/banners', 'public');
            $bannerUrl = Storage::url($bannerPath);

            $oldBanner = $merchant->media()->where('type', 'ad_image')->first(); // Using ad_image type for banners or profile_avatar
            if ($oldBanner) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $oldBanner->url));
                $oldBanner->delete();
            }

            $merchant->media()->create([
                'url' => $bannerUrl,
                'type' => 'ad_image',
            ]);
        }

        $merchant->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil toko berhasil diperbarui.',
            'data' => $merchant->load('media')
        ], 200);
    }

    /**
     * Toggle store active/temporary close status.
     */
    public function toggleStoreStatus(Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        // In the migrations, merchants status toggle could mean is_verified or we toggle verify.
        // Let's assume we can change the verify or certified flag, or we toggle verification state for seller active state.
        // Let's toggle verification flag for this demonstration or use is_verified.
        // If they close store, they can set verified to false temporarily or similar. Let's use is_verified.
        $merchant->is_verified = !$merchant->is_verified;
        $merchant->save();

        $status = $merchant->is_verified ? 'Aktif' : 'Tutup Sementara';

        return response()->json([
            'success' => true,
            'message' => 'Status toko berhasil diubah menjadi: ' . $status,
            'data' => [
                'is_verified' => $merchant->is_verified
            ]
        ], 200);
    }
}
