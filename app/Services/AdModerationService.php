<?php

namespace App\Services;

class AdModerationService
{
    /**
     * Analisis iklan untuk mendeteksi unsur perjudian.
     *
     * @param string $title
     * @param string $description
     * @param string|null $websiteUrl
     * @return array ['status' => 'approved|review|rejected', 'reason' => 'string|null', 'score' => int]
     */
    public function analyze(string $title, ?string $description, ?string $websiteUrl = null): array
    {
        $score = 0;

        // Gabungkan semua teks relevan
        $fullText = $title . ' ' . ($description ?? '') . ' ' . ($websiteUrl ?? '');
        
        // 1. Text Normalization
        $normalizedText = $this->normalizeText($fullText);

        $gamblingKeywords = config('moderation.gambling_keywords', []);
        $ambiguousKeywords = config('moderation.ambiguous_keywords', []);
        $weights = config('moderation.risk_weights', []);

        // 2. Exact/Normalized Keyword Matching
        foreach ($gamblingKeywords as $keyword) {
            $normalizedKeyword = $this->normalizeText($keyword);
            
            // Cek di teks normalisasi
            if (str_contains($normalizedText, $normalizedKeyword)) {
                $score += $weights['exact_gambling_keyword'] ?? 60;
                // Jika sudah melewati batas block, bisa langsung break untuk efisiensi
                if ($score >= (config('moderation.thresholds.block_min') ?? 60)) {
                    break;
                }
            }
        }

        // 3. Ambiguous Keyword Matching (Contextual)
        $ambiguousMatches = 0;
        foreach ($ambiguousKeywords as $keyword) {
            $normalizedKeyword = $this->normalizeText($keyword);
            if (str_contains($normalizedText, $normalizedKeyword)) {
                $ambiguousMatches++;
                $score += $weights['ambiguous_keyword'] ?? 15;
            }
        }

        // 4. URL Check (Basic)
        if ($websiteUrl) {
            $suspiciousDomains = ['slot', 'judi', 'toto', 'togel', 'bet', 'win', 'gacor'];
            foreach ($suspiciousDomains as $domainKeyword) {
                if (str_contains(strtolower($websiteUrl), $domainKeyword)) {
                    $score += $weights['suspicious_url'] ?? 40;
                    break;
                }
            }
        }

        // 5. Kesimpulan (Risk Scoring)
        $thresholds = config('moderation.thresholds');
        
        $status = 'approved'; // Revert back to auto-approve for clean ads
        $reason = null;

        if ($score >= $thresholds['block_min']) {
            $status = 'rejected'; // Gunakan rejected karena kita map ke DB
            $reason = 'Promosi Perjudian Online';
        } elseif ($score >= $thresholds['review_min']) {
            $status = 'pending';
            $reason = 'Konten memerlukan pemeriksaan manual';
        }

        return [
            'status' => $status,
            'reason' => $reason,
            'score' => $score
        ];
    }

    /**
     * Normalisasi teks untuk mengalahkan penyamaran (leetspeak, spasi, simbol).
     */
    private function normalizeText(string $text): string
    {
        // 1. Lowercase
        $text = strtolower($text);

        // 2. Leetspeak mapping
        $leetspeakMap = config('moderation.leetspeak_map', []);
        $text = strtr($text, $leetspeakMap);

        // 3. Hapus spasi dan karakter khusus (simbol, titik, koma, dsb)
        // Menyisakan hanya huruf dan angka
        $text = preg_replace('/[^a-z0-9]/', '', $text);

        return $text;
    }
}
