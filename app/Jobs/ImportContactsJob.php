<?php

namespace App\Jobs;

use App\Concerns\UploadedFile;
use App\Models\Contact;
use App\Models\ContactList;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ImportContactsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, UploadedFile;

    public int $tries   = 1;
    public int $timeout = 3600; // 1 hour — supports millions of rows

    public function __construct(
        public string $filePath,
        public array  $listIds = [],
    ) {}

    public function handle(): void
    {
        $fullPath = 'assets/files/' . $this->filePath;

        if (!file_exists($fullPath)) {
            Log::error("ImportContactsJob: file not found at {$fullPath}");
            return;
        }

        $handle = fopen($fullPath, 'r');
        if (!$handle) return;

        $rawHeader = fgetcsv($handle);
        if (!$rawHeader) {
            fclose($handle);
            $this->removeFile($this->filePath);
            return;
        }

        $header    = array_map(fn($h) => strtolower(trim($h)), $rawHeader);
        $batch     = [];
        $listBatch = [];
        $imported  = 0;
        $skipped   = 0;

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) !== count($header)) { $skipped++; continue; }

            $data       = array_combine($header, $row);
            $phone      = !empty($data['phone'])       ? trim($data['phone'])       : null;
            $telegramId = !empty($data['telegram_id']) ? trim($data['telegram_id']) : null;

            if (!$phone && !$telegramId) { $skipped++; continue; }

            $batch[] = [
                'phone'      => $phone,
                'telegramId' => $telegramId,
                'name'       => trim($data['name']      ?? 'Unknown') ?: 'Unknown',
                'email'      => !empty($data['email'])    ? trim($data['email'])    : null,
                'country'    => !empty($data['country'])  ? trim($data['country'])  : null,
                'language'   => !empty($data['language']) ? trim($data['language']) : 'en',
            ];

            // Process in batches of 500 to keep memory flat
            if (count($batch) >= 500) {
                $imported += $this->processBatch($batch, $listBatch);
                $batch = [];
            }
        }

        // Flush remaining rows
        if (!empty($batch)) {
            $imported += $this->processBatch($batch, $listBatch);
        }

        fclose($handle);
        $this->removeFile($this->filePath);

        // Recalculate contact list counts once after all inserts
        if (!empty($this->listIds)) {
            ContactList::whereIn('id', $this->listIds)->each(function ($list) {
                $list->update([
                    'contacts_count' => $list->contacts()->where('status', 'active')->count(),
                ]);
            });
        }

        Log::info("ImportContactsJob complete. Imported: {$imported}, Skipped: {$skipped}");
    }

    private function processBatch(array $batch, array &$listBatch): int
    {
        $imported = 0;

        foreach ($batch as $row) {
            // Check for duplicate phone or telegram_id
            $exists = Contact::where(function ($q) use ($row) {
                if ($row['phone'])      $q->orWhere('phone',       $row['phone']);
                if ($row['telegramId']) $q->orWhere('telegram_id', $row['telegramId']);
            })->exists();

            if ($exists) continue;

            $contact = Contact::create([
                'name'        => $row['name'],
                'phone'       => $row['phone'],
                'telegram_id' => $row['telegramId'],
                'email'       => $row['email'],
                'country'     => $row['country'],
                'language'    => $row['language'],
            ]);

            if (!empty($this->listIds)) {
                $contact->lists()->sync($this->listIds);
            }

            $imported++;
        }

        return $imported;
    }

    public function failed(\Throwable $e): void
    {
        Log::error('ImportContactsJob failed: ' . $e->getMessage());
        $this->removeFile($this->filePath);
    }
}
