<?php

namespace App\Concerns;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

trait UploadedFile
{
    public function move(\Illuminate\Http\UploadedFile $file, string $directory = null, ?string $isRemoveFile = null): ?string
    {
        try {

            $directory = 'assets/files/';

            if (!file_exists($directory)) {
                mkdir($directory, 0777, true);
            }

            if ($isRemoveFile && file_exists($directory . '/' . $isRemoveFile) && is_file($directory . '/' . $isRemoveFile)) {
                @unlink($directory . '/' . $isRemoveFile);
            }

            $name = Str::random() . '.' . $file->getClientOriginalExtension();

            $file->move($directory, $name);
            $this->setFilePermissions($directory . '/' . $name);
            return $name;
        }catch (\Exception $exception){
            Log::error('=== File Upload Failed ===', [
                'error_message' => $exception->getMessage(),
                'error_code' => $exception->getCode(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
                'original_filename' => isset($file) ? $file->getClientOriginalName() : 'N/A',
                'directory' => isset($directory) ? $directory : 'N/A',
                'generated_name' => isset($name) ? $name : 'N/A'
            ]);
            return null;
        }
    }


    public function removeFile(string $filePath, string $directory = null): void
    {
        $directory = $directory ?? 'assets/files/';
        if ($filePath && file_exists($directory . '/' . $filePath) && is_file($directory . '/' . $filePath)) {
            @unlink($directory . '/' . $filePath);
        }
    }

    public function fileExists(string $filename, string $directory = null): bool
    {
        try {
            $directory = $directory ?? 'assets/files/';
            $filePath = $directory . $filename;

            return file_exists($filePath) && is_file($filePath);

        } catch (\Exception $exception) {
            return false;
        }
    }

    public function download(string $filename, string $directory = null): \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\Response
    {
        try {
            $directory = $directory ?? 'assets/files/';
            $filePath = $directory . $filename;
            if (!file_exists($filePath) || !is_file($filePath)) {
                abort(404, 'File not found');
            }
            $originalName = $filename;
            return response()->download($filePath, $originalName);

        } catch (\Exception $exception) {
            abort(500, 'Error downloading file');
        }
    }

    public function fullPath(string $filename, string $directory = null): string
    {
        try {
            $directory = $directory ?? 'assets/files/';
            $directory = rtrim($directory, '/') . '/';

            return asset($directory . $filename);

        } catch (\Exception $exception) {
            return '';
        }
    }


    private function setFilePermissions(string $filePath): void
    {
        chmod($filePath, 0777);
    }

}
