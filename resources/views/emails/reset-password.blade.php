<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Password - ADMS Syariah</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 40px 0;
            color: #333333;
        }
        .container {
            max-width: 570px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e8eeb;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(50, 50, 93, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2e7d32;
            font-size: 24px;
            font-weight: 700;
            margin: 0;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .btn-container {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            background-color: #2e7d32;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 5px;
            display: inline-block;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .footer {
            margin-top: 40px;
            border-top: 1px solid #eeeeee;
            padding-top: 20px;
            font-size: 13px;
            color: #777777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ADMS Syariah</h1>
        </div>
        <div class="content">
            <p>Assalamualaikum {{ $user->name }},</p>
            <p>Kami menerima permintaan untuk menyetel ulang kata sandi akun ADMS Anda. Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini.</p>
            <p>Untuk menyetel ulang kata sandi Anda, klik tombol di bawah ini (tautan berlaku selama 60 menit):</p>
            <div class="btn-container">
                <a href="{{ config('app.url') }}/reset-password?token={{ $token }}&email={{ urlencode($user->email) }}" class="btn">Reset Password</a>
            </div>
            <p>Atau Anda dapat menyalin kode token reset berikut secara manual:</p>
            <p style="background-color: #f1f1f1; padding: 10px; font-family: monospace; font-size: 16px; text-align: center; border-radius: 4px; font-weight: bold;">
                {{ $token }}
            </p>
            <p>Jazakumullah khairan,<br>Tim ADMS Syariah</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} ADMS Syariah. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
    </div>
</body>
</html>
