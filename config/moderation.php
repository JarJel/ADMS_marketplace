<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Treshold Moderasi (Risk Score)
    |--------------------------------------------------------------------------
    |
    | Batas nilai untuk menentukan tindakan terhadap iklan.
    | 0 - aman_max : APPROVED
    | review_min - review_max : REVIEW
    | block_min - 100 : BLOCKED
    |
    */
    'thresholds' => [
        'aman_max' => 29,
        'review_min' => 30,
        'review_max' => 59,
        'block_min' => 60,
    ],

    /*
    |--------------------------------------------------------------------------
    | Bobot Skor Risiko (Risk Weights)
    |--------------------------------------------------------------------------
    |
    | Penambahan skor berdasarkan jenis temuan pada iklan.
    |
    */
    'risk_weights' => [
        'exact_gambling_keyword' => 60, // Langsung block
        'ambiguous_keyword' => 15,      // Perlu tambahan indikator lain untuk review/block
        'suspicious_url' => 40,         // Domain mencurigakan
    ],

    /*
    |--------------------------------------------------------------------------
    | Kata Kunci Perjudian Online (Gambling Keywords)
    |--------------------------------------------------------------------------
    |
    | Kata kunci spesifik yang sangat berkaitan dengan aktivitas perjudian.
    |
    */
    'gambling_keywords' => [
        'judi', 'judol', 'judi online', 'togel', 'togel online', 'slot online', 
        'casino', 'kasino', 'taruhan', 'taruhan online', 'betting', 'sportsbook', 
        'poker online', 'jackpot', 'maxwin', 'gacor', 'rtp', 'scatter', 'free spin', 
        'bandar judi', 'agen judi', 'situs judi', 'link judi', 'game slot', 
        'slot gacor', 'gampang menang', 'menang besar'
    ],

    /*
    |--------------------------------------------------------------------------
    | Kata Kunci Ambigu (Ambiguous Keywords)
    |--------------------------------------------------------------------------
    |
    | Kata yang tidak selalu berarti perjudian, tetapi sering digunakan dalam konteks judol.
    |
    */
    'ambiguous_keywords' => [
        'deposit', 'withdraw', 'bonus', 'spin', 'betting'
    ],

    /*
    |--------------------------------------------------------------------------
    | Peta Substitusi Leetspeak (Leetspeak Mapping)
    |--------------------------------------------------------------------------
    |
    | Karakter penyamaran yang sering digunakan untuk menghindari filter kata kunci.
    |
    */
    'leetspeak_map' => [
        '0' => 'o',
        '1' => 'i',
        '3' => 'e',
        '4' => 'a',
        '5' => 's',
        '7' => 't',
        '@' => 'a',
        '$' => 's',
    ],

    /*
    |--------------------------------------------------------------------------
    | OCR Enabled
    |--------------------------------------------------------------------------
    |
    | Mengaktifkan deteksi teks pada gambar jika layanan OCR tersedia.
    | Setel ke false jika belum terintegrasi dengan Google Vision/AWS Rekognition.
    |
    */
    'ocr_enabled' => false,
];
