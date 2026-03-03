<?php

namespace App\Console\Commands;

use App\Models\DripSequence;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;


class DispatchDripSteps extends Command
{
    protected $signature   = 'drip:dispatch-steps';
    protected $description = 'Dispatch drip sequence steps that are due to send';

    public function handle(): void
    {
        $sequences  = DripSequence::where('status', 'active')
            ->with(['steps' => fn($q) => $q->orderBy('step_order'), 'channel'])
            ->get();

        $dispatched = 0;

        foreach ($sequences as $sequence) {
            // Contacts enrolled in this sequence
            $enrollments = DB::table('drip_sequence_contacts')
                ->where('drip_sequence_id', $sequence->id)
                ->get();

            foreach ($sequence->steps as $step) {
                foreach ($enrollments as $enrollment) {
                    // Already sent this step to this contact?
                    $alreadySent = DB::table('drip_step_logs')
                        ->where('drip_step_id', $step->id)
                        ->where('contact_id',   $enrollment->contact_id)
                        ->exists();

                    if ($alreadySent) continue;

                    // Is it time to send this step?
                    $sendAfter = \Carbon\Carbon::parse($enrollment->enrolled_at)
                        ->addDays($step->delay_days)
                        ->addHours($step->delay_hours ?? 0);

                    if (now()->greaterThanOrEqualTo($sendAfter)) {
                        $contact = Contact::find($enrollment->contact_id);
                        if ($contact && $contact->status === 'active') {
                            SendDripStepJob::dispatch($step, $contact, $sequence);
                            $dispatched++;
                        }
                    }
                }
            }
        }

        $this->info("Drip steps dispatched: {$dispatched}");
    }
}
