<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Promo Codes
    |--------------------------------------------------------------------------
    | Format: 'CODE' => ['discount' => amount_in_rupiah, 'label' => 'desc']
    | discount is a flat Rupiah deduction from the order subtotal.
    */
    'codes' => [
        'ADMSBARU' => ['discount' => 10000, 'label' => 'Diskon Member Baru'],
        'RAMADAN24' => ['discount' => 25000, 'label' => 'Promo Ramadan'],
    ],
];
