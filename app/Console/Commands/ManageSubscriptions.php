<?php

namespace App\Console\Commands;

use App\Models\Advertisement;
use App\Models\PackageSubscription;
use App\Notifications\SubscriptionReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ManageSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:manage';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage package subscriptions: send reminders and process expirations.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting subscription management process...');
        
        $this->sendReminders();
        $this->processExpirations();
        
        $this->info('Subscription management process completed.');
    }
    
    private function sendReminders()
    {
        $this->info('Checking for subscriptions expiring in 3 days...');
        
        $targetDateStart = Carbon::now()->addDays(3)->startOfDay();
        $targetDateEnd = Carbon::now()->addDays(3)->endOfDay();
        
        $expiringSubscriptions = PackageSubscription::with(['user', 'package'])
            ->where('status', 'active')
            ->whereBetween('expires_at', [$targetDateStart, $targetDateEnd])
            ->get();
            
        $count = 0;
        foreach ($expiringSubscriptions as $subscription) {
            if ($subscription->user) {
                $subscription->user->notify(new SubscriptionReminder($subscription));
                $count++;
            }
        }
        
        $this->info("Sent {$count} reminders.");
    }
    
    private function processExpirations()
    {
        $this->info('Checking for expired subscriptions...');
        
        $expiredSubscriptions = PackageSubscription::with('user')
            ->where('status', 'active')
            ->where('expires_at', '<=', Carbon::now())
            ->get();
            
        $count = 0;
        foreach ($expiredSubscriptions as $subscription) {
            // Mark subscription as expired
            $subscription->update(['status' => 'expired']);
            
            // Remove premium tag from user's active ads
            if ($subscription->user) {
                Advertisement::where('owner_id', $subscription->user_id)
                    ->whereNotNull('package_id')
                    ->update(['package_id' => null]);
            }
            
            $count++;
        }
        
        $this->info("Processed {$count} expirations.");
    }
}
