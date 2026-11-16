<?php

namespace App\Notifications;

use App\Models\SubcontractPost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewSubcontractMatchNotification extends Notification
{
    use Queueable;

    public function __construct(
        public SubcontractPost $post,
        public string $matchReason = 'ফ্যাব্রিক ও স্পেসিফিকেশন ম্যাচ'
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = (string) config('app.frontend_url', 'http://silposetu.test');
        $url = rtrim($frontendUrl, '/').'/feed/'.$this->post->id;
        $posterName = $this->post->factory?->name ?? $this->post->user?->name ?? 'শিল্পসেতু মেম্বার';
        $location = $this->post->location ?? 'বাংলাদেশ';

        return (new MailMessage)
            ->subject("নতুন সাবকন্ট্রাক্ট কাজের সুযোগ: {$this->post->title} ({$location})")
            ->view('emails.subcontract_matched', [
                'post' => $this->post,
                'matchReason' => $this->matchReason,
                'recipient' => $notifiable,
                'url' => $url,
                'posterName' => $posterName,
            ]);
    }
}
