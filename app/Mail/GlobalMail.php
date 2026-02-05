<?php

namespace App\Mail;

use App\Models\Setting;
use App\Models\User;
use App\Services\MailConfigService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GlobalMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public string $emailSubject;
    public string $emailBody;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $subject, string $body)
    {
        $this->user = $user;
        $this->emailSubject = $subject;
        $this->emailBody = $body;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        MailConfigService::configure();
        return new Envelope(
            from: new Address(
                Setting::get('mail_from_address', 'noreply@gmail.com'),
                Setting::get('mail_from_name', 'MineInvest')
            ),
            to: [
                new Address($this->user->email, $this->user->name)
            ],
            subject: $this->emailSubject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $site_name = Setting::get('site_name');
        $site_description = Setting::get('site_description');

        return new Content(
            view: 'emails.email-template',
            with: [
                'user' => $this->user,
                'subject' => $this->emailSubject,
                'body' => $this->emailBody,
                'site_name' => $site_name,
                'site_description' => $site_description,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
