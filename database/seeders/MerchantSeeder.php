<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Merchant;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MerchantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $merchantsData = [
            [
                'name' => 'Amanah Creative',
                'email' => 'amanahcreative@example.com',
                'store_name' => 'Amanah Creative Studio',
                'description' => 'Penyedia template Canva kreatif dan syariah untuk UMKM Indonesia.',
                'whatsapp' => '6281234567890',
                'syariah' => true,
            ],
            [
                'name' => 'Afifah Tech',
                'email' => 'afifahtech@example.com',
                'store_name' => 'Afifah Tech Solutions',
                'description' => 'Source code aplikasi kasir, sistem POS, dan web apps siap pakai.',
                'whatsapp' => '6281298765432',
                'syariah' => true,
            ],
            [
                'name' => 'Deni Book Store',
                'email' => 'denibook@example.com',
                'store_name' => 'Deni E-Book Store',
                'description' => 'Koleksi E-Book edukasi, bisnis, dan self-development terbaik.',
                'whatsapp' => '6281355556666',
                'syariah' => false,
            ],
            [
                'name' => 'AI Studio Bandung',
                'email' => 'aistudio@example.com',
                'store_name' => 'AI Prompt Studio',
                'description' => 'Generator prompt AI ChatGPT, Midjourney, dan copywriting.',
                'whatsapp' => '6281244449999',
                'syariah' => true,
            ]
        ];

        foreach ($merchantsData as $data) {
            // Check if user already exists
            $user = User::where('email', $data['email'])->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make('password123'),
                    'phone' => $data['whatsapp'],
                    'role' => 'merchant',
                    'status' => 'active',
                ]);
            }

            // Check if merchant already exists
            $merchant = Merchant::where('owner_id', $user->id)->first();
            
            if (!$merchant) {
                Merchant::create([
                    'owner_id' => $user->id,
                    'name' => $data['store_name'],
                    'slug' => Str::slug($data['store_name']),
                    'description' => $data['description'],
                    'contact_whatsapp' => $data['whatsapp'],
                    'is_verified' => true,
                    'syariah_certified' => $data['syariah'],
                    'location' => 'Jakarta, Indonesia'
                ]);
            }
        }
    }
}
