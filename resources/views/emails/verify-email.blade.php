<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verifikasi Email ADMS Syariah</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #2e7d32; margin-bottom: 5px;">ADMS Syariah</h2>
        <span style="font-size: 12px; color: #777;">Armada Digital Marketing Syariah</span>
    </div>
    
    <div style="background-color: #f9f9f9; border-top: 4px solid #2e7d32; padding: 30px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <p>Assalamu'alaikum <strong>{{ $name }}</strong>,</p>
        <p>Terima kasih telah mendaftar di platform ADMS Syariah. Untuk mengaktifkan akun Anda secara penuh, silakan lakukan verifikasi alamat email Anda.</p>
        
        <p>Silakan gunakan kode token verifikasi berikut:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #e8f5e9; border: 1px dashed #2e7d32; color: #2e7d32; font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 10px 25px; border-radius: 4px; display: inline-block;">
                {{ $token }}
            </span>
        </div>
        
        <p style="font-size: 13px; color: #555;">Token ini berlaku selama 1 (satu) hari. Jika Anda tidak merasa mendaftar di platform kami, abaikan email ini.</p>
    </div>

    <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #999;">
        <p>&copy; 2026 ADMS Syariah. Hak Cipta Dilindungi Undang-Undang.</p>
    </div>
</body>
</html>
