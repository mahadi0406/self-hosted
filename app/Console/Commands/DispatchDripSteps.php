<?php

namespace App\Console\Commands;

use App\Jobs\SendDripStepJob;
use App\Models\Contact;
use App\Models\DripEnrollment;
use App\Models\DripSequence;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DispatchDripSteps extends Command
{
    protected $signature   = 'drip:dispatch-steps';
    protected $description = 'Dispatch drip sequence steps that are due to send';

    public function handle(): void
    {
        $sequences = DripSequence::where('status', 'active')
            ->with(['steps' => fn($q) => $q->orderBy('step_order'), 'channel'])
            ->get();

        $dispatched = 0;

        foreach ($sequences as $sequence) {
            $enrollments = DripEnrollment::where('drip_sequence_id', $sequence->id)
                ->where('status', 'active')
                ->get();

            foreach ($sequence->steps as $step) {
                foreach ($enrollments as $enrollment) {
                    $alreadySent = DB::table('drip_step_logs')
                        ->where('drip_step_id', $step->id)
                        ->where('contact_id',   $enrollment->contact_id)
                        ->exists();

                    if ($alreadySent) continue;

                    $sendAfter = $enrollment->enrolled_at
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
