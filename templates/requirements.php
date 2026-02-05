<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PeerSwap Installer - Requirements</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #1a202c;
            min-height: 100vh;
            padding: 2rem 0;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 0 2rem; }
        .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 2.5rem;
            margin-bottom: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .header { text-align: center; margin-bottom: 3rem; }
        .header h1 {
            color: white !important;
            margin-bottom: 0.5rem;
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #6c4fff 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            background-clip: text;
        }
        .header p { color: white; font-size: 1.1rem; }
        .requirement {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 0;
            border-bottom: 1px solid #e2e8f0;
            transition: all 0.2s ease;
        }
        .requirement:hover {
            background: rgba(108, 79, 255, 0.02);
            margin: 0 -1rem;
            padding: 1.25rem 1rem;
            border-radius: 8px;
        }
        .requirement:last-child { border-bottom: none; }
        .requirement span:first-child { font-weight: 500; color: #374151; }
        .status {
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .status.success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .status.error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        .btn {
            background: linear-gradient(135deg, #6c4fff 0%, #8b5cf6 100%);
            color: white;
            padding: 1rem 2.5rem;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(108, 79, 255, 0.3);
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(108, 79, 255, 0.4);
        }
        .btn:disabled, .btn.disabled {
            background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: 0 4px 12px rgba(156, 163, 175, 0.2);
        }
        .steps {
            display: flex;
            justify-content: center;
            margin-bottom: 3rem;
            background: rgba(255, 255, 255, 0.9);
            padding: 1rem;
            border-radius: 16px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .step {
            padding: 0.75rem 1.5rem;
            margin: 0 0.25rem;
            border-radius: 10px;
            background: rgba(148, 163, 184, 0.1);
            color: #64748b;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .step.active {
            background: linear-gradient(135deg, #6c4fff 0%, #8b5cf6 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(108, 79, 255, 0.3);
            transform: translateY(-2px);
        }
        .step.completed {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .error-list {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
        }
        .error-list strong { color: #991b1b; font-weight: 600; }
        .error-list ul { margin-left: 1rem; margin-top: 0.5rem; }
        .error-list li { color: #dc2626; margin-bottom: 0.25rem; }
        .card h2 {
            color: #1f2937;
            font-weight: 600;
            border-bottom: 2px solid #6c4fff;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
            display: inline-block;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>PeerSwap Installer</h1>
        <p>Welcome to the PeerSwap installation wizard</p>
    </div>

    <div class="steps">
        <div class="step active">1. Requirements</div>
        <div class="step">2. Database</div>
        <div class="step">3. Environment</div>
        <div class="step">4. Installation</div>
        <div class="step">5. Complete</div>
    </div>

    <?php if(!empty($errors)): ?>
        <div class="error-list">
            <strong>Errors found:</strong>
            <ul>
                <?php foreach($errors as $error): ?>
                    <li><?php echo htmlspecialchars($error); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <div class="card">
        <h2>System Requirements</h2>

        <div class="requirement">
            <span>PHP Version (>= 8.1.0)</span>
            <span class="status <?php echo $phpVersion ? 'success' : 'error'; ?>">
                <?php echo PHP_VERSION . ($phpVersion ? ' ✓' : ' ✗'); ?>
            </span>
        </div>

        <?php if (isset($extensions) && is_array($extensions)): ?>
            <?php foreach($extensions as $ext => $loaded): ?>
                <div class="requirement">
                    <span><?php echo htmlspecialchars($ext); ?> Extension</span>
                    <span class="status <?php echo $loaded ? 'success' : 'error'; ?>">
                        <?php echo $loaded ? 'Enabled ✓' : 'Missing ✗'; ?>
                    </span>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <div class="card">
        <h2>Directory Permissions</h2>

        <?php if (isset($writableDirectories) && is_array($writableDirectories)): ?>
            <?php foreach($writableDirectories as $dir => $writable): ?>
                <div class="requirement">
                    <span><?php echo htmlspecialchars($dir); ?></span>
                    <span class="status <?php echo $writable ? 'success' : 'error'; ?>">
                        <?php echo $writable ? 'Writable ✓' : 'Not Writable ✗'; ?>
                    </span>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <div style="text-align: center;">
        <?php
        $allPassed = $phpVersion;

        if (isset($extensions) && is_array($extensions)) {
            $allPassed = $allPassed && !in_array(false, $extensions);
        }

        if (isset($writableDirectories) && is_array($writableDirectories)) {
            $allPassed = $allPassed && !in_array(false, $writableDirectories);
        }
        ?>

        <?php if ($allPassed): ?>
            <a href="install.php?step=2" class="btn">Next: Database Setup →</a>
        <?php else: ?>
            <span class="btn disabled">Please fix the issues above before continuing</span>
            <br><br>
            <a href="install.php?step=1" class="btn" style="background: linear-gradient(135deg, #64748b 0%, #475569 100%);">Refresh Requirements Check</a>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
