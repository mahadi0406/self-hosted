<?php

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

class LaravelInstaller {

    private array $requirements = [
        'php' => '8.1.0',
        'extensions' => [
            'BCMath', 'Ctype', 'Fileinfo', 'JSON', 'Mbstring',
            'OpenSSL', 'PDO', 'Tokenizer', 'XML', 'cURL', 'ZIP'
        ]
    ];

    private array $errors = [];
    private int $step = 1;
    private string $laravelRoot;

    private string $licenseApiUrl = 'https://kloudinnovation.com/api/license/register';
    private string $apiToken = 'B77MsI9905rTCtdoWy8v06WkeMgrsiXDpZH3WDpO';

    public function __construct() {
        $this->step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
        $this->laravelRoot = dirname(__DIR__);
    }

    public function run(): void
    {
        switch($this->step) {
            case 1:
                $this->checkRequirements();
                break;
            case 2:
                $this->databaseSetup();
                break;
            case 3:
                $this->environmentSetup();
                break;
            case 4:
                $this->finalizeInstallation();
                break;
            case 5:
                $this->completionPage();
                break;
            default:
                $this->checkRequirements();
        }
    }

    private function checkRequirements(): void
    {
        $phpVersion = version_compare(PHP_VERSION, $this->requirements['php'], '>=');
        $extensions = [];

        foreach($this->requirements['extensions'] as $ext) {
            $extensions[$ext] = extension_loaded($ext);
        }

        $writableDirectories = $this->checkWritableDirectories();
        $envPermissions = $this->checkEnvPermissions();
        $errors = $this->getErrors();

        $installer = $this;

        $this->renderTemplate('requirements', compact(
            'phpVersion',
            'extensions',
            'writableDirectories',
            'envPermissions',
            'errors',
            'installer'
        ));
    }

    private function checkEnvPermissions(): array
    {
        $envPath = $this->laravelRoot . '/.env';
        $envExamplePath = $this->laravelRoot . '/.env.example';

        $permissions = [
            'laravel_root_writable' => is_writable($this->laravelRoot),
            'env_exists' => file_exists($envPath),
            'env_writable' => file_exists($envPath) ? is_writable($envPath) : true,
            'env_example_exists' => file_exists($envExamplePath),
            'can_create_env' => !file_exists($envPath) && is_writable($this->laravelRoot)
        ];

        if (!$permissions['laravel_root_writable']) {
            $this->errors[] = "Laravel root directory not writable (needed for .env file): {$this->laravelRoot}";
        }

        if ($permissions['env_exists'] && !$permissions['env_writable']) {
            $this->errors[] = ".env file exists but is not writable: {$envPath}";
        }

        if (!$permissions['env_example_exists']) {
            $this->errors[] = ".env.example file missing (recommended for reference)";
        }

        return $permissions;
    }

    private function checkWritableDirectories(): array
    {
        $directories = [
            'storage',
            'storage/app',
            'storage/framework',
            'storage/framework/cache',
            'storage/framework/sessions',
            'storage/framework/views',
            'storage/logs',
            'bootstrap/cache',
        ];

        $writable = [];
        foreach($directories as $dir) {
            $fullPath = $this->laravelRoot . '/' . $dir;

            if (!is_dir($fullPath)) {
                @mkdir($fullPath, 0755, true);
            }

            $writable[$dir] = is_writable($fullPath);
            if (!$writable[$dir]) {
                $this->errors[] = "Directory not writable: $dir (Please run: chmod -R 775 {$fullPath})";
            }
        }

        return $writable;
    }

    private function databaseSetup(): void
    {
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->processDatabaseForm();
        }

        $errors = $this->getErrors();
        $this->renderTemplate('database', compact('errors'));
    }

    private function processDatabaseForm(): void
    {
        $host = $_POST['db_host'] ?? '';
        $database = $_POST['db_database'] ?? '';
        $username = $_POST['db_username'] ?? '';
        $password = $_POST['db_password'] ?? '';
        $port = $_POST['db_port'] ?? '3306';

        if (empty($host) || empty($database) || empty($username)) {
            $this->errors[] = 'Please fill in all required database fields.';
            return;
        }

        try {
            $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $pdo->query('SELECT 1');

            $_SESSION['db_config'] = [
                'host' => $host,
                'database' => $database,
                'username' => $username,
                'password' => $password,
                'port' => $port
            ];

            header('Location: install.php?step=3');
            exit;

        } catch(PDOException $e) {
            $this->errors[] = 'Database connection failed: ' . $e->getMessage();
        }
    }

    private function environmentSetup(): void
    {
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->processEnvironmentForm();
        }

        $errors = $this->getErrors();
        $this->renderTemplate('environment', compact('errors'));
    }

    private function processEnvironmentForm(): void
    {
        $purchaseCode = $_POST['purchase_code'] ?? '';
        $buyerEmail = $_POST['buyer_email'] ?? '';
        $appName = $_POST['app_name'] ?? 'TokenHive';
        $appUrl = $_POST['app_url'] ?? '';
        $adminEmail = $_POST['admin_email'] ?? '';
        $adminPassword = $_POST['admin_password'] ?? '';
        $adminPasswordConfirm = $_POST['admin_password_confirm'] ?? '';

        if (empty($purchaseCode) || empty($buyerEmail) || empty($appName) || empty($appUrl) || empty($adminEmail) || empty($adminPassword)) {
            $this->errors[] = 'Please fill in all required fields.';
            return;
        }

        if ($adminPassword !== $adminPasswordConfirm) {
            $this->errors[] = 'Password confirmation does not match.';
            return;
        }

        if (strlen($adminPassword) < 8) {
            $this->errors[] = 'Password must be at least 8 characters long.';
            return;
        }

        if (!filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) {
            $this->errors[] = 'Please enter a valid email address.';
            return;
        }

        if (!filter_var($buyerEmail, FILTER_VALIDATE_EMAIL)) {
            $this->errors[] = 'Please enter a valid buyer email address.';
            return;
        }

        $licenseVerification = $this->verifyLicense($purchaseCode, $buyerEmail, 'PeerSwap');
        if (!$licenseVerification['success']) {
            $this->errors[] = $licenseVerification['message'];
            return;
        }

        if (!empty($this->errors)) {
            return;
        }

        try {
            $this->createEnvFile($appName, $appUrl, $purchaseCode);
            $_SESSION['admin_config'] = [
                'email' => $adminEmail,
                'password' => $adminPassword
            ];

            $_SESSION['license_verified'] = true;
            $_SESSION['purchase_code'] = $purchaseCode;

            header('Location: install.php?step=4');
            exit;
        } catch (Exception $e) {
            $this->errors[] = 'Failed to create environment file: ' . $e->getMessage();
        }
    }

    private function verifyLicense(string $purchaseCode, string $buyerEmail, string $productName): array
    {
        try {
            $postData = [
                'purchase_code' => $purchaseCode,
                'buyer_email' => $buyerEmail,
                'product_name' => $productName
            ];

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $this->licenseApiUrl,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($postData),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Authorization: Bearer ' . $this->apiToken,
                    'Accept: application/json'
                ],
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_FOLLOWLOCATION => true
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                return [
                    'success' => false,
                    'message' => 'License verification failed: ' . $curlError
                ];
            }

            if ($httpCode !== 200) {
                $errorData = json_decode($response, true);
                $errorMessage = $errorData['message'] ?? 'License verification failed';

                if ($httpCode === 429) {
                    $errorMessage = 'Too many verification attempts. Please try again later.';
                } elseif ($httpCode === 401) {
                    $errorMessage = 'Invalid purchase code or buyer email.';
                } elseif ($httpCode === 400) {
                    $errorMessage = 'Invalid license data provided.';
                }

                return [
                    'success' => false,
                    'message' => $errorMessage
                ];
            }

            $responseData = json_decode($response, true);

            if (!$responseData || !isset($responseData['success']) || !$responseData['success']) {
                return [
                    'success' => false,
                    'message' => $responseData['message'] ?? 'License verification failed'
                ];
            }

            return [
                'success' => true,
                'message' => 'License verified successfully',
                'data' => $responseData
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'License verification error: ' . $e->getMessage()
            ];
        }
    }

    private function createEnvFile($appName, $appUrl): void
    {
        $dbConfig = $_SESSION['db_config'];
        $appKey = 'base64:' . base64_encode(random_bytes(32));

        if (!is_writable($this->laravelRoot)) {
            throw new Exception("Laravel root directory is not writable. Please set permissions: chmod 775 {$this->laravelRoot}");
        }

        $envContent = "APP_NAME=\"{$appName}\"
APP_ENV=production
APP_KEY={$appKey}
APP_DEBUG=true
APP_URL={$appUrl}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST={$dbConfig['host']}
DB_PORT={$dbConfig['port']}
DB_DATABASE={$dbConfig['database']}
DB_USERNAME={$dbConfig['username']}
DB_PASSWORD={$dbConfig['password']}

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120
APP_CURRENT_VERSION=1.0.0

MEMCACHED_HOST=127.0.0.1
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=\"hello@example.com\"
MAIL_FROM_NAME=\"\${APP_NAME}\"

VITE_PUSHER_APP_KEY=\"\${PUSHER_APP_KEY}\"
VITE_PUSHER_HOST=\"\${PUSHER_HOST}\"
VITE_PUSHER_PORT=\"\${PUSHER_PORT}\"
VITE_PUSHER_SCHEME=\"\${PUSHER_SCHEME}\"
VITE_PUSHER_APP_CLUSTER=\"\${PUSHER_APP_CLUSTER}\"";

        $envPath = $this->laravelRoot . '/.env';
        $result = @file_put_contents($envPath, $envContent);
        if ($result === false) {
            $error = error_get_last();
            throw new Exception("Could not write .env file to: {$envPath}\nError: " . ($error['message'] ?? 'Unknown error') . "\nPlease ensure the directory has write permissions (chmod 775)");
        }

        @chmod($envPath, 0644);
    }

    private function finalizeInstallation(): void
    {
        if (!isset($_SESSION['db_config']) || !isset($_SESSION['admin_config'])) {
            $this->errors[] = 'Installation session expired. Please start over.';
            $this->renderTemplate('installation', ['errors' => $this->errors]);
            return;
        }

        try {
            if (!file_exists($this->laravelRoot . '/artisan')) {
                throw new Exception('Laravel artisan command not found at: ' . $this->laravelRoot . '/artisan');
            }

            if (!is_dir($this->laravelRoot . '/vendor')) {
                throw new Exception('Vendor directory not found. Please run "composer install" first or ensure vendor files are included in the package.');
            }

            $currentDir = getcwd();
            chdir($this->laravelRoot);

            if (file_exists($this->laravelRoot . '/vendor/autoload.php')) {
                require_once $this->laravelRoot . '/vendor/autoload.php';
                $app = require_once $this->laravelRoot . '/bootstrap/app.php';

                $kernel = $app->make('Illuminate\Contracts\Console\Kernel');
                $kernel->call('migrate', ['--force' => true]);
                $kernel->call('db:seed', ['--force' => true]);
                $kernel->call('config:clear');
                $kernel->call('cache:clear');
                $kernel->call('view:clear');
                $kernel->call('route:clear');
            }

            chdir($currentDir);
            $this->createAdminUser();
            file_put_contents($this->laravelRoot . '/storage/installed', date('Y-m-d H:i:s'));
            header('Location: install.php?step=5');
            exit;

        } catch(Exception $e) {
            $this->errors[] = 'Installation failed: ' . $e->getMessage();
            if (isset($currentDir)) {
                chdir($currentDir);
            }
        }

        $errors = $this->getErrors();
        $this->renderTemplate('installation', compact('errors'));
    }

    private function createAdminUser(): void
    {
        $adminConfig = $_SESSION['admin_config'];

        try {
            $dbConfig = $_SESSION['db_config'];
            $pdo = new PDO(
                "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}",
                $dbConfig['username'],
                $dbConfig['password']
            );
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $tableExists = $pdo->query("SHOW TABLES LIKE 'users'")->rowCount() > 0;
            if (!$tableExists) {
                throw new Exception('Users table does not exist. Please ensure migrations have been run.');
            }

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
            $stmt->execute([$adminConfig['email']]);

            if ($stmt->fetchColumn() > 0) {
                throw new Exception('Admin user with this email already exists.');
            }

            $uid = $this->generateUuid();
            $hashedPassword = password_hash($adminConfig['password'], PASSWORD_DEFAULT);
            $rememberToken = $this->generateRandomString(10);
            $currentTimestamp = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("
            INSERT INTO users (
                uid,
                name,
                email,
                email_verified_at,
                password,
                role,
                status,
                kyc_status,
                last_login_at,
                avatar,
                is_admin,
                remember_token,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

            $stmt->execute([
                $uid,
                $adminConfig['name'] ?? 'Admin User',
                $adminConfig['email'],
                $currentTimestamp,
                $hashedPassword,
                'admin',
                1,
                'approved',
                $currentTimestamp,
                null,
                1,
                $rememberToken,
                $currentTimestamp,
                $currentTimestamp
            ]);

            echo "Admin user created successfully with UID: " . $uid;

        } catch(Exception $e) {
            throw new Exception("Failed to create admin user: " . $e->getMessage());
        }
    }

    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    private function generateRandomString(int $length = 10): string
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';

        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }

        return $randomString;
    }

    private function completionPage(): void
    {
        $appUrl = '';
        if (file_exists($this->laravelRoot . '/.env')) {
            $envContent = file_get_contents($this->laravelRoot . '/.env');
            if (preg_match('/APP_URL=(.+)/', $envContent, $matches)) {
                $appUrl = trim($matches[1]);
            }
        }

        $this->renderTemplate('complete', compact('appUrl'));
        $this->cleanupInstaller();
        session_destroy();
    }

    private function cleanupInstaller(): void
    {
        $files = [
            'install.php',
            'templates/requirements.php',
            'templates/database.php',
            'templates/environment.php',
            'templates/installation.php',
            'templates/complete.php'
        ];

        foreach($files as $file) {
            $fullPath = $this->laravelRoot . '/' . $file;
            if(file_exists($fullPath)) {
                @unlink($fullPath);
            }
        }

        $templatesDir = $this->laravelRoot . '/templates';
        if(is_dir($templatesDir) && count(scandir($templatesDir)) == 2) {
            @rmdir($templatesDir);
        }
    }

    private function renderTemplate($template, $variables = []): void
    {
        extract($variables);
        $templatePath = $this->laravelRoot . "/templates/{$template}.php";

        if (!file_exists($templatePath)) {
            die("Template file not found: {$templatePath}");
        }

        include $templatePath;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}

$installer = new LaravelInstaller();
$installer->run();
?>
