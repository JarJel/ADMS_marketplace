<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    /**
     * Validate a promo code and return its discount value.
     * Codes are stored in config/promo.php for easy management.
     */
    public function validate(Request $request)
    {
        $request->validate(['code' => 'required|string|max:50']);
        $code = strtoupper(trim($request->code));

        $codes = config('promo.codes', []);

        if (!isset($codes[$code])) {
            return response()->json([
                'success' => false,
                'message' => 'Kode promo tidak valid atau telah kadaluarsa.',
            ], 422);
        }

        return response()->json([
            'success'  => true,
            'message'  => 'Kode promo berhasil digunakan!',
            'data'     => [
                'code'     => $code,
                'discount' => $codes[$code]['discount'],
                'label'    => $codes[$code]['label'] ?? "Diskon $code",
            ],
        ]);
    }
}
