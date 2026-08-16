<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WithdrawalController extends Controller
{
    /**
     * Request payout withdrawal.
     */
    public function requestWithdrawal(Request $request)
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:10000', // Minimum Rp10.000
            'bank_name' => 'required|string|max:100',
            'bank_account_name' => 'required|string|max:100',
            'bank_account_number' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Dynamically compute current balance
        $totalCompletedSales = Order::where('merchant_id', $merchant->id)
            ->where(function ($q) {
                $q->where('status', 'completed')
                  ->orWhere('payment_status', 'paid');
            })
            ->sum('total_amount');

        $totalApprovedWithdrawals = Withdrawal::where('merchant_id', $merchant->id)
            ->where('status', 'approved')
            ->sum('amount');

        $currentBalance = $totalCompletedSales - $totalApprovedWithdrawals;

        if ($request->amount > $currentBalance) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo tidak mencukupi. Saldo Anda saat ini: Rp' . number_format($currentBalance, 0, ',', '.')
            ], 400);
        }

        $withdrawal = Withdrawal::create([
            'merchant_id' => $merchant->id,
            'amount' => $request->amount,
            'bank_name' => $request->bank_name,
            'bank_account_name' => $request->bank_account_name,
            'bank_account_number' => $request->bank_account_number,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan penarikan dana berhasil diajukan dan sedang diproses.',
            'data' => $withdrawal
        ], 200);
    }
}
