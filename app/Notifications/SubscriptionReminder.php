<?php

namespace App\Notifications;

use App\Models\PackageSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public $subscription;

    /**
     * Create a new notification instance.
     */
    public function __construct(PackageSubscription $subscription)
    {
        $this->subscription = $subscription;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $package = $this->subscription->package;
        $days = 3;
        
        return (new MailMessage)
                    ->subject('Peringatan: Paket Langganan Akan Berakhir')
                    ->greeting('Halo, ' . $notifiable->name . '!')
                    ->line('Ini adalah pengingat bahwa paket langganan iklan premium Anda (' . $package->name . ') akan segera berakhir.')
                    ->line('Paket Anda akan kedaluwarsa pada: ' . $this->subscription->expires_at->format('d M Y H:i'))
                    ->line('Sisa waktu masa aktif paket Anda adalah ' . $days . ' hari lagi.')
                    ->action('Perpanjang Sekarang', url('/pricing'))
                    ->line('Terima kasih telah menggunakan platform kami!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'subscription_reminder',
            'title' => 'Paket Langganan Akan Berakhir',
            'message' => 'Paket ' . $this->subscription->package->name . ' Anda akan kedaluwarsa dalam 3 hari. Segera perpanjang agar tetap bisa menikmati fitur premium.',
            'action_url' => '/pricing',
            'subscription_id' => $this->subscription->id,
            'expires_at' => $this->subscription->expires_at,
        ];
    }
}
