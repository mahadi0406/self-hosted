<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\EmailValidationService;
use App\Models\ValidationResult;
use App\Models\SavedList;
use App\Jobs\ProcessBulkValidation;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ValidationController extends Controller
{

    public function __construct(protected readonly EmailValidationService $validationService){}


    /**
     * @return Response
     */
    public function single(): Response
    {
        return Inertia::render('Admin/Validation/Single');
    }


    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function validateSingle(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $email = $request->input('email');
        $result = $this->validationService->validate($email);
        ValidationResult::create([
            'email' => $email,
            'is_valid' => $result['valid'],
            'score' => $result['score'],
            'checks' => $result['checks'],
            'status' => $result['valid'] ? 'valid' : 'invalid',
            'suggestion' => $result['suggestion'] ?? null,
        ]);

        return back()->with('success', $result);
    }

    /**
     * @return Response
     */
    public function bulk(): Response
    {
        $lists = SavedList::latest()->get();
        return Inertia::render('Admin/Validation/Bulk', [
            'lists' => $lists
        ]);
    }


    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function processBulk(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
            'list_name' => 'required|string|max:255',
            'tags' => 'nullable|string'
        ]);

        try {
            $file = $request->file('file');
            $listName = $request->input('list_name');
            $tags = $request->input('tags');

            $path = $file->store('temp-uploads');
            $emails = $this->readCsvFile(Storage::path($path));

            $emails = array_unique($emails);
            $totalEmails = count($emails);

            if ($totalEmails === 0) {
                Storage::delete($path);
                return response()->json([
                    'success' => false,
                    'message' => 'No valid emails found in the file'
                ], 422);
            }

            $list = SavedList::create([
                'name' => $listName,
                'total_emails' => $totalEmails,
                'valid_emails' => 0,
                'invalid_emails' => 0,
                'tags' => $tags,
                'status' => 'processing'
            ]);

            ProcessBulkValidation::dispatch($list->id, $emails);
            Storage::delete($path);

            return response()->json([
                'success' => true,
                'message' => 'Bulk validation started successfully',
                'list_id' => $list->id,
                'total_emails' => $totalEmails
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process file: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * @param Request $request
     * @return Response
     */
    public function history(Request $request): Response
    {
        $query = ValidationResult::query()->with('list');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $query->where('email', 'like', '%' . $request->search . '%');
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $validations = $query->latest()
            ->paginate(20)
            ->withQueryString();

        $total = ValidationResult::count();
        $valid = ValidationResult::where('status', 'valid')->count();
        $invalid = ValidationResult::where('status', 'invalid')->count();
        $risky = ValidationResult::where('status', 'risky')->count();

        $stats = [
            'total' => $total,
            'valid' => $valid,
            'invalid' => $invalid,
            'risky' => $risky,
            'valid_percentage' => $total > 0 ? round(($valid / $total) * 100, 2) : 0,
            'invalid_percentage' => $total > 0 ? round(($invalid / $total) * 100, 2) : 0,
            'risky_percentage' => $total > 0 ? round(($risky / $total) * 100, 2) : 0,
        ];

        return Inertia::render('Admin/Validation/History', [
            'validations' => $validations,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to'])
        ]);
    }

    /**
     * @param $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        $validation = ValidationResult::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $validation
        ]);
    }


    /**
     * @param $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $validation = ValidationResult::findOrFail($id);
        $validation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Validation deleted successfully'
        ]);
    }


    /**
     * @param Request $request
     * @return JsonResponse|StreamedResponse
     */
    public function export(Request $request): JsonResponse|StreamedResponse
    {
        $request->validate([
            'format' => 'required|in:csv,excel,json',
            'ids' => 'nullable|array',
            'ids.*' => 'exists:validation_results,id'
        ]);

        $query = ValidationResult::query();

        if ($request->has('ids') && count($request->ids) > 0) {
            $query->whereIn('id', $request->ids);
        }

        $validations = $query->get();
        $format = $request->input('format');

        return match ($format) {
            'csv' => $this->exportCsv($validations),
            'excel' => $this->exportExcel($validations),
            'json' => $this->exportJson($validations),
            default => response()->json(['success' => false], 400),
        };
    }


    /**
     * @param $listId
     * @return JsonResponse
     */
    public function bulkStatus($listId): JsonResponse
    {
        $list = SavedList::with('results')->findOrFail($listId);

        return response()->json([
            'success' => true,
            'data' => [
                'list' => $list,
                'progress' => [
                    'total' => $list->total_emails,
                    'processed' => $list->results()->count(),
                    'valid' => $list->valid_emails,
                    'invalid' => $list->invalid_emails,
                    'percentage' => $list->total_emails > 0
                        ? round(($list->results()->count() / $list->total_emails) * 100, 2)
                        : 0
                ]
            ]
        ]);
    }


    /**
     * @param $filePath
     * @return array
     */
    private function readCsvFile($filePath): array
    {
        $emails = [];

        if (($handle = fopen($filePath, 'r')) !== false) {
            $firstLine = fgetcsv($handle);
            if (!filter_var($firstLine[0], FILTER_VALIDATE_EMAIL)) {
                // First line is header, continue
            } else {
                // First line is email, add it
                $emails[] = trim($firstLine[0]);
            }

            while (($data = fgetcsv($handle)) !== false) {
                if (isset($data[0]) && !empty(trim($data[0]))) {
                    $email = trim($data[0]);
                    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $emails[] = $email;
                    }
                }
            }
            fclose($handle);
        }

        return $emails;
    }

    /**
     * @param $validations
     * @return StreamedResponse
     */
    private function exportCsv($validations): StreamedResponse
    {
        $filename = 'validation-results-' . now()->format('Y-m-d-His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($validations) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Email', 'Status', 'Score', 'Is Valid', 'Suggestion', 'Validated At']);

            foreach ($validations as $validation) {
                fputcsv($file, [
                    $validation->email,
                    $validation->status,
                    $validation->score,
                    $validation->is_valid ? 'Yes' : 'No',
                    $validation->suggestion ?? 'N/A',
                    $validation->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }


    /**
     * @param $validations
     * @return StreamedResponse
     */
    private function exportExcel($validations): StreamedResponse
    {
        // You can use PhpSpreadsheet or similar
        // For now, return CSV with .xlsx extension
        return $this->exportCsv($validations);
    }


    /**
     * @param $validations
     * @return JsonResponse
     */
    private function exportJson($validations): JsonResponse
    {
        $filename = 'validation-results-' . now()->format('Y-m-d-His') . '.json';
        return response()->json($validations->toArray())
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
}
