<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PeerSwap Installer - Complete</title>
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
        .step.completed {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .success-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }
        .success-icon::after {
            content: '✓';
            color: white;
            font-size: 2rem;
            font-weight: bold;
        }
        .success-message { text-align: center; margin-bottom: 2rem; }
        .success-message h2 {
            color: #2d3748;
            margin-bottom: 1rem;
            font-size: 1.8rem;
            font-weight: 600;
        }
        .success-message p { color: #64748b; }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 2rem 0;
        }
        .info-item {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        .info-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .info-item strong {
            color: #374151;
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        .info-item span { color: #64748b; }
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
            margin: 0.5rem;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(108, 79, 255, 0.4);
        }
        .btn-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }
        .btn-success:hover {
            box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
        }
        .actions { text-align: center; margin-top: 2rem; }
        .warning-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            color: #92400e;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
        }
        .warning-box strong {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>PeerSwap Installer</h1>
        <p>Installation completed successfully!</p>
    </div>

    <div class="steps">
        <div class="step completed">1. Requirements</div>
        <div class="step completed">2. Database</div>
        <div class="step completed">3. Environment</div>
        <div class="step completed">4. Installation</div>
        <div class="step completed">5. Complete</div>
    </div>

    <div class="card">
        <div class="success-icon"></div>

        <div class="success-message">
            <h2>Installation Complete!</h2>
            <p>Your PeerSwap – Web3 P2P Trading & Spot Exchange Platform with Escrow has been successfully installed and configured.</p>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <strong>Application URL</strong>
                <span><?php echo htmlspecialchars($_SESSION['db_config']['host'] ?? $_SERVER['HTTP_HOST'] ?? 'Your Domain'); ?></span>
            </div>
            <div class="info-item">
                <strong>Admin Email</strong>
                <span><?php echo htmlspecialchars($_SESSION['admin_config']['email'] ?? 'Admin Email'); ?></span>
            </div>
            <div class="info-item">
                <strong>Framework</strong>
                <span>Laravel</span>
            </div>
            <div class="info-item">
                <strong>Installation Date</strong>
                <span><?php echo date('F j, Y \a\t g:i A'); ?></span>
            </div>
        </div>
    </div>

    <div class="actions">
        <a href="/" class="btn btn-success">Visit Your Application</a>
        <a href="<?php echo rtrim((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'], '/'); ?>/admin" class="btn">Access Admin Panel</a>
    </div>

    <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.3); color: white;">
        <p>Thank you for choosing our PeerSwap – Web3 P2P Trading & Spot Exchange Platform with Escrow Platform</p>
        <p style="margin-top: 0.5rem;">Need help? Check the documentation or contact support.</p>
    </div>
</div>
</body>
</html>
