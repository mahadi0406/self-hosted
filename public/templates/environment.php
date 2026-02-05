<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PeerSwap Installer - Environment Setup</title>
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
        .form-group { margin-bottom: 1.5rem; }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #374151;
        }
        .form-group input {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.8);
        }
        .form-group input:focus {
            outline: none;
            border-color: #6c4fff;
            box-shadow: 0 0 0 3px rgba(108, 79, 255, 0.1);
            background: white;
        }
        .form-group small {
            color: #64748b;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            display: block;
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
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .btn-secondary {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            box-shadow: 0 8px 25px rgba(100, 116, 139, 0.3);
        }
        .btn-secondary:hover {
            box-shadow: 0 12px 35px rgba(100, 116, 139, 0.4);
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
        .actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2rem;
        }
        .info-box {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            color: #1e40af;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        .info-box strong {
            font-weight: 600;
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
        .success-list {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
        }
        .success-list strong { color: #166534; font-weight: 600; }
        .card h2 {
            color: #1f2937;
            font-weight: 600;
            border-bottom: 2px solid #6c4fff;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
            display: inline-block;
        }
        .loading {
            display: none;
            align-items: center;
            gap: 0.5rem;
            color: #6c4fff;
        }
        .loading.show {
            display: flex;
        }
        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e2e8f0;
            border-top: 2px solid #6c4fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>PeerSwap Installer</h1>
        <p>Configure your application settings</p>
    </div>

    <div class="steps">
        <div class="step completed">1. Requirements</div>
        <div class="step completed">2. Database</div>
        <div class="step active">3. Environment</div>
        <div class="step">4. Installation</div>
        <div class="step">5. Complete</div>
    </div>

    <?php if(!empty($errors)): ?>
        <div class="error-list">
            <strong>Configuration Error:</strong>
            <ul>
                <?php foreach($errors as $error): ?>
                    <li><?php echo htmlspecialchars($error); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <?php if(isset($_SESSION['license_verified']) && $_SESSION['license_verified']): ?>
        <div class="success-list">
            <strong>License Verified:</strong> Your purchase code has been successfully verified and registered.
        </div>
    <?php endif; ?>

    <div class="info-box">
        <strong>Application Setup:</strong> Configure your application settings, verify your purchase code, and create an admin account.
    </div>

    <form method="POST" action="install.php?step=3" id="mainForm">
        <div class="card">
            <h2>License Verification</h2>

            <div class="form-group">
                <label for="purchase_code">Purchase Code</label>
                <input type="text" id="purchase_code" name="purchase_code"
                       value="<?php echo htmlspecialchars($_POST['purchase_code'] ?? ''); ?>"
                       placeholder="Enter your purchase code from CodeCanyon" required>
                <small>Your purchase code from CodeCanyon (e.g., 12345678-1234-1234-1234-123456789012)</small>
            </div>

            <div class="form-group">
                <label for="buyer_email">Buyer Email</label>
                <input type="email" id="buyer_email" name="buyer_email"
                       value="<?php echo htmlspecialchars($_POST['buyer_email'] ?? ''); ?>"
                       placeholder="Email used for CodeCanyon purchase" required>
                <small>The email address associated with your CodeCanyon account</small>
            </div>

            <div class="loading" id="licenseLoading">
                <div class="spinner"></div>
                <span>Verifying license...</span>
            </div>
        </div>

        <div class="card">
            <h2>Application Configuration</h2>

            <div class="form-group">
                <label for="app_name">Application Name</label>
                <input type="text" id="app_name" name="app_name"
                       value="<?php echo htmlspecialchars($_POST['app_name'] ?? 'TokenHive'); ?>"
                       placeholder="My Laravel App" required>
                <small>The name of your application</small>
            </div>

            <div class="form-group">
                <label for="app_url">Application URL</label>
                <input type="url" id="app_url" name="app_url"
                       value="<?php echo htmlspecialchars($_POST['app_url'] ?? 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost')); ?>"
                       placeholder="https://yourdomain.com" required>
                <small>The full URL where your application will be accessible</small>
            </div>
        </div>

        <div class="card">
            <h2>Admin Account</h2>

            <div class="form-group">
                <label for="admin_email">Admin Email</label>
                <input type="email" id="admin_email" name="admin_email"
                       value="<?php echo htmlspecialchars($_POST['admin_email'] ?? ''); ?>"
                       placeholder="admin@yourdomain.com" required>
                <small>Email address for the administrator account</small>
            </div>

            <div class="form-group">
                <label for="admin_password">Admin Password</label>
                <input type="password" id="admin_password" name="admin_password"
                       value="<?php echo htmlspecialchars($_POST['admin_password'] ?? ''); ?>"
                       placeholder="Choose a strong password" required minlength="8">
                <small>Minimum 8 characters required</small>
            </div>

            <div class="form-group">
                <label for="admin_password_confirm">Confirm Password</label>
                <input type="password" id="admin_password_confirm" name="admin_password_confirm"
                       value="<?php echo htmlspecialchars($_POST['admin_password_confirm'] ?? ''); ?>"
                       placeholder="Confirm your password" required minlength="8">
                <small>Re-enter the password to confirm</small>
            </div>

            <div class="actions">
                <a href="install.php?step=2" class="btn btn-secondary">← Previous</a>
                <button type="submit" class="btn" id="submitBtn">Continue Installation →</button>
            </div>
        </div>
    </form>
</div>

<script>
    document.getElementById('mainForm').addEventListener('submit', function(e) {
        const password = document.getElementById('admin_password').value;
        const confirmPassword = document.getElementById('admin_password_confirm').value;
        const purchaseCode = document.getElementById('purchase_code').value;
        const buyerEmail = document.getElementById('buyer_email').value;

        if (!purchaseCode.trim()) {
            e.preventDefault();
            alert('Please enter your purchase code.');
            document.getElementById('purchase_code').focus();
            return false;
        }

        if (!buyerEmail.trim()) {
            e.preventDefault();
            alert('Please enter your buyer email.');
            document.getElementById('buyer_email').focus();
            return false;
        }

        if (password !== confirmPassword) {
            e.preventDefault();
            alert('Passwords do not match. Please try again.');
            document.getElementById('admin_password_confirm').focus();
            return false;
        }

        if (password.length < 8) {
            e.preventDefault();
            alert('Password must be at least 8 characters long.');
            document.getElementById('admin_password').focus();
            return false;
        }

        // Show loading state
        document.getElementById('licenseLoading').classList.add('show');
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('submitBtn').textContent = 'Verifying License...';
    });

    document.getElementById('admin_password_confirm').addEventListener('input', function() {
        const password = document.getElementById('admin_password').value;
        const confirmPassword = this.value;

        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                this.style.borderColor = '#10b981';
            } else {
                this.style.borderColor = '#ef4444';
            }
        } else {
            this.style.borderColor = '#e2e8f0';
        }
    });
</script>
</body>
</html>
