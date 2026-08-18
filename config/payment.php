<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Bank Transfer Accounts
    |--------------------------------------------------------------------------
    | Update these with the real business bank accounts.
    */
    'bank_accounts' => [
        'bsi' => [
            'name'    => 'Bank Syariah Indonesia (BSI)',
            'number'  => env('PAYMENT_BSI_ACCOUNT', '7198-2026-9900'),
            'account_name' => env('PAYMENT_ACCOUNT_NAME', 'PT. Armada Digital Marketing Syariah'),
        ],
        'bca' => [
            'name'    => 'Bank BCA',
            'number'  => env('PAYMENT_BCA_ACCOUNT', '8940-2026-1100'),
            'account_name' => env('PAYMENT_ACCOUNT_NAME', 'PT. Armada Digital Marketing Syariah'),
        ],
    ],
];
