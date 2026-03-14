<?php

namespace App\Services;

use Exception;
use InvalidArgumentException;

class DefaultImageService
{
    private const DEFAULT_WIDTH = 1200;
    private const DEFAULT_HEIGHT = 630;
    private const DEFAULT_FONT_SIZE = 60;
    private const MIN_FONT_SIZE = 24;
    private const MAX_FONT_SIZE = 200;
    private const FONT_SIZE_RATIO = 8;
    private const BOLD_ITERATIONS = 4;
    private const BUILTIN_FONT_SIZE = 5;

    private const BG_COLOR = [255, 255, 255];
    private const TEXT_COLOR = [60, 60, 60];

    // Cache settings
    private const CACHE_MAX_AGE = 31536000;

    /**
     * Generate a default image with specified parameters
     *
     * @param string $type Image type identifier
     * @param int $width Image width in pixels
     * @param int $height Image height in pixels
     * @param string|null $text Custom text to display
     * @return void
     * @throws InvalidArgumentException
     * @throws Exception
     */
    public static function generate(
        string $type = 'default',
        int $width = self::DEFAULT_WIDTH,
        int $height = self::DEFAULT_HEIGHT,
        ?string $text = null
    ): void {
        self::validateDimensions($width, $height);
        $image = self::createImage($width, $height);

        try {
            $displayText = $text ?? self::generateDimensionText($width, $height);
            self::renderText($image, $displayText, $width, $height);
            self::outputImage($image);

        } finally {
            if (is_resource($image)) {
                imagedestroy($image);
            }
        }
    }

    /**
     * Get image URL with fallback to default image generator
     *
     * @param string|null $imagePath Path to the image file
     * @param string $type Image type
     * @param int $width Image width
     * @param int $height Image height
     * @return string
     */
    public static function getImageUrl(
        ?string $imagePath,
        string $type = 'default',
        int $width = self::DEFAULT_WIDTH,
        int $height = self::DEFAULT_HEIGHT
    ): string {
        // Check if image exists and is valid
        if (self::isValidImagePath($imagePath)) {
            return asset($imagePath);
        }

        // Return route to default image generator
        return route('default.image', compact('type', 'width', 'height'));
    }

    /**
     * Validate image dimensions
     *
     * @param int $width
     * @param int $height
     * @throws InvalidArgumentException
     */
    private static function validateDimensions(int $width, int $height): void
    {
        if ($width <= 0 || $height <= 0) {
            throw new InvalidArgumentException('Width and height must be positive integers');
        }

        if ($width > 5000 || $height > 5000) {
            throw new InvalidArgumentException('Image dimensions too large (max 5000x5000)');
        }
    }

    /**
     * Create image resource with background
     *
     * @param int $width
     * @param int $height
     * @return resource
     * @throws Exception
     */
    private static function createImage(int $width, int $height)
    {
        $image = imagecreatetruecolor($width, $height);

        if (!$image) {
            throw new Exception('Failed to create image resource');
        }

        // Set background color
        $backgroundColor = imagecolorallocate($image, ...self::BG_COLOR);
        imagefilledrectangle($image, 0, 0, $width - 1, $height - 1, $backgroundColor);

        return $image;
    }

    /**
     * Generate dimension text
     *
     * @param int $width
     * @param int $height
     * @return string
     */
    private static function generateDimensionText(int $width, int $height): string
    {
        return sprintf('%d × %d', $width, $height);
    }

    /**
     * Render text on image
     *
     * @param resource $image
     * @param string $text
     * @param int $width
     * @param int $height
     * @throws Exception
     */
    private static function renderText($image, string $text, int $width, int $height): void
    {
        $textColor = imagecolorallocate($image, ...self::TEXT_COLOR);
        $fontFile = self::getFontPath();

        if (self::isFontAvailable($fontFile)) {
            self::renderTtfText($image, $text, $width, $height, $textColor, $fontFile);
        } else {
            self::renderBuiltinText($image, $text, $width, $height, $textColor);
        }
    }

    /**
     * Get font file path
     *
     * @return string
     */
    private static function getFontPath(): string
    {
        return public_path('fonts/RobotoMono-Regular.ttf');
    }

    /**
     * Check if TTF font is available
     *
     * @param string $fontFile
     * @return bool
     */
    private static function isFontAvailable(string $fontFile): bool
    {
        return file_exists($fontFile) && is_readable($fontFile);
    }

    /**
     * Render text using TTF font
     *
     * @param resource $image
     * @param string $text
     * @param int $width
     * @param int $height
     * @param int $textColor
     * @param string $fontFile
     */
    private static function renderTtfText($image, string $text, int $width, int $height, int $textColor, string $fontFile): void
    {
        $fontSize = self::calculateFontSize($width, $height);
        $textBox = imagettfbbox($fontSize, 0, $fontFile, $text);

        $textWidth = $textBox[2] - $textBox[0];
        $textHeight = $textBox[1] - $textBox[7];

        $x = ($width - $textWidth) / 2;
        $y = ($height + $textHeight) / 2;

        imagettftext($image, $fontSize, 0, $x, $y, $textColor, $fontFile, $text);
    }

    /**
     * Render text using built-in font with bold effect
     *
     * @param resource $image
     * @param string $text
     * @param int $width
     * @param int $height
     * @param int $textColor
     */
    private static function renderBuiltinText($image, string $text, int $width, int $height, int $textColor): void
    {
        $textLength = strlen($text);
        $charWidth = imagefontwidth(self::BUILTIN_FONT_SIZE);
        $charHeight = imagefontheight(self::BUILTIN_FONT_SIZE);

        $textWidth = $textLength * $charWidth;
        $x = ($width - $textWidth) / 2;
        $y = ($height - $charHeight) / 2;

        for ($i = 0; $i < self::BOLD_ITERATIONS; $i++) {
            for ($j = 0; $j < self::BOLD_ITERATIONS; $j++) {
                imagestring($image, self::BUILTIN_FONT_SIZE, $x + $i, $y + $j, $text, $textColor);
            }
        }
    }

    /**
     * Calculate appropriate font size based on image dimensions
     *
     * @param int $width
     * @param int $height
     * @return int
     */
    private static function calculateFontSize(int $width, int $height): int
    {
        $calculatedSize = min($width, $height) / self::FONT_SIZE_RATIO;

        return (int) max(
            self::MIN_FONT_SIZE,
            min(self::MAX_FONT_SIZE, max(self::DEFAULT_FONT_SIZE, $calculatedSize))
        );
    }

    /**
     * Output image with proper headers
     *
     * @param resource $image
     */
    private static function outputImage($image): void
    {
        header('Content-Type: image/png');
        header('Cache-Control: public, max-age=' . self::CACHE_MAX_AGE);
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + self::CACHE_MAX_AGE) . ' GMT');
        imagepng($image);
    }

    /**
     * Check if image path is valid and file exists
     *
     * @param string|null $imagePath
     * @return bool
     */
    private static function isValidImagePath(?string $imagePath): bool
    {
        if (!$imagePath) {
            return false;
        }

        $fullPath = public_path($imagePath);
        return file_exists($fullPath) && is_readable($fullPath);
    }
}
