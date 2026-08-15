<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AuthToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_successfully()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Ahmad Riza',
            'email' => 'ahmad@example.com',
            'phone' => '081299887766',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'role' => 'merchant',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'phone', 'role', 'status'],
                    'token'
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'ahmad@example.com',
            'role' => 'merchant',
        ]);
    }

    public function test_user_cannot_register_with_existing_email()
    {
        User::factory()->create([
            'email' => 'ahmad@example.com',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Ahmad Riza',
            'email' => 'ahmad@example.com',
            'phone' => '081299887766',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login_with_email()
    {
        $user = User::factory()->create([
            'email' => 'ahmad@example.com',
            'password' => Hash::make('rahasia123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'ahmad@example.com',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'phone', 'role', 'status'],
                    'token'
                ]
            ]);
    }

    public function test_user_can_login_with_phone()
    {
        $user = User::factory()->create([
            'phone' => '081299887766',
            'password' => Hash::make('rahasia123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => '081299887766',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(200);
    }

    public function test_login_fails_with_incorrect_password()
    {
        $user = User::factory()->create([
            'email' => 'ahmad@example.com',
            'password' => Hash::make('rahasia123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'ahmad@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonFragment(['status' => 'error']);
    }

    public function test_suspended_user_cannot_login()
    {
        $user = User::factory()->create([
            'email' => 'suspended@example.com',
            'password' => Hash::make('rahasia123'),
            'status' => 'suspended',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'suspended@example.com',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(403)
            ->assertJsonFragment(['status' => 'error', 'message' => 'Akun Anda telah ditangguhkan.']);
    }

    public function test_authenticated_user_can_access_me_route()
    {
        $user = User::factory()->create([
            'email' => 'ahmad@example.com',
            'status' => 'active',
        ]);

        $token = 'somerandomtokenstring1234567890';
        AuthToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $token),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonFragment(['email' => 'ahmad@example.com']);
    }

    public function test_unauthenticated_user_cannot_access_me_route()
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    public function test_user_can_logout_successfully()
    {
        $user = User::factory()->create([
            'email' => 'ahmad@example.com',
        ]);

        $token = 'somerandomtokenstring1234567890';
        AuthToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $token),
            'type' => 'refresh',
            'expires_at' => now()->addDays(1),
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Logout berhasil']);
        $this->assertDatabaseMissing('auth_tokens', [
            'token' => hash('sha256', $token),
        ]);
    }

    public function test_forgot_password_sends_email_with_token()
    {
        \Illuminate\Support\Facades\Mail::fake();

        $user = User::factory()->create([
            'email' => 'ahmad@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'ahmad@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Link reset password telah dikirim ke email Anda.']);

        $this->assertDatabaseHas('auth_tokens', [
            'user_id' => $user->id,
            'type' => 'reset_password',
        ]);

        \Illuminate\Support\Facades\Mail::assertSent(\App\Mail\ResetPasswordMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_reset_password_with_valid_token_updates_password()
    {
        $user = User::factory()->create([
            'email' => 'ahmad@example.com',
            'password' => Hash::make('oldpassword123'),
        ]);

        $token = 'resettoken123456';
        AuthToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $token),
            'type' => 'reset_password',
            'expires_at' => now()->addMinutes(30),
        ]);

        $response = $this->postJson('/api/reset-password', [
            'email' => 'ahmad@example.com',
            'token' => $token,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Password Anda berhasil diperbarui.']);

        $this->assertDatabaseMissing('auth_tokens', [
            'token' => hash('sha256', $token),
        ]);

        // Attempt login with new password
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'ahmad@example.com',
            'password' => 'newpassword123',
        ]);
        $loginResponse->assertStatus(200);
    }

    public function test_reset_password_with_invalid_or_expired_token_fails()
    {
        $user = User::factory()->create([
            'email' => 'ahmad@example.com',
        ]);

        $response = $this->postJson('/api/reset-password', [
            'email' => 'ahmad@example.com',
            'token' => 'invalidtoken',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(400)
            ->assertJsonFragment(['message' => 'Token reset password tidak valid atau telah kedaluwarsa.']);
    }
}
