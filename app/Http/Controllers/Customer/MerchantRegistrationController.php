<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MerchantRegistrationController extends Controller
{
    /**
     * Request merchant status registration.
     */
    public function registerMerchant(Request $request)
    {
        $user = $request->user();

        if ($user->merchant) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki toko/merchant terdaftar.'
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
            'message' => 'Pendaftaran merchant berhasil diajukan dan menunggu verifikasi',
            'data' => $merchant
        ], 200);
    }
}
