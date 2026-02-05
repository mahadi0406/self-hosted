<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PeerSwap Installer - Installing</title>
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
        .header p { color: #64748b; font-size: 1.1rem; }
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
        .progress-container { text-align: center; }
        .spinner {
            border: 4px solid rgba(108, 79, 255, 0.1);
            border-top: 4px solid #6c4fff;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 2rem auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .progress-text {
            font-size: 1.2rem;
            color: #4a5568;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        .installation-steps {
            text-align: left;
            max-width: 400px;
            margin: 2rem auto;
        }
        .installation-step {
            padding: 0.75rem 0;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
        }
        .installation-step:last-child { border-bottom: none; }
        .step-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 1rem;
            display: inline-block;
        }
        .step-icon.pending { background: #e2e8f0; }
        .step-icon.running {
            background: #6c4fff;
            animation: pulse 1.5s infinite;
            box-shadow: 0 0 10px rgba(108, 79, 255, 0.3);
        }
        .step-icon.completed {
            background: #10b981;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
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
        .btn-secondary {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            box-shadow: 0 8px 25px rgba(100, 116, 139, 0.3);
        }
        .btn-secondary:hover {
            box-shadow: 0 12px 35px rgba(100, 116, 139, 0.4);
        }
    </style>
    <?php if (empty($errors)): ?>
        <script>
            setTimeout(function() {
                if (document.querySelector('.spinner')) {
                    window.location.reload();
                }
            }, 3000);
        </script>
    <?php endif; ?>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>PeerSwap Installer</h1>
        <p>Installing your application</p>
    </div>

    <div class="steps">
        <div class="step completed">1. Requirements</div>
        <div class="step completed">2. Database</div>
        <div class="step completed">3. Environment</div>
        <div class="step active">4. Installation</div>
        <div class="step">5. Complete</div>
    </div>

    <?php if(!empty($errors)): ?>
        <div class="error-list">
            <strong>Installation Error:</strong>
            <ul>
                <?php foreach($errors as $error): ?>
                    <li><?php echo htmlspecialchars($error); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="install.php?step=3" class="btn btn-secondary">← Try Again</a>
            <a href="install.php?step=1" class="btn" style="margin-left: 1rem;">Start Over</a>
        </div>

    <?php else: ?>

        <div class="card">
            <div class="progress-container">
                <div class="spinner"></div>
                <div class="progress-text">Installing Laravel Application...</div>
                <p style="color: #64748b; margin-bottom: 2rem;">This may take a few minutes. Please do not close this window.</p>

                <div class="installation-steps">
                    <div class="installation-step">
                        <span class="step-icon completed"></span>
                        <span>Validating configuration</span>
                    </div>
                    <div class="installation-step">
                        <span class="step-icon running"></span>
                        <span>Running database migrations</span>
                    </div>
                    <div class="installation-step">
                        <span class="step-icon pending"></span>
                        <span>Clearing application cache</span>
                    </div>
                    <div class="installation-step">
                        <span class="step-icon pending"></span>
                        <span>Creating admin account</span>
                    </div>
                    <div class="installation-step">
                        <span class="step-icon pending"></span>
                        <span>Finalizing installation</span>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>
</body>
</html>
