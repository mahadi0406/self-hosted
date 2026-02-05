<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PeerSwap Installer - Database Setup</title>
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
        <p>Configure your database connection</p>
    </div>

    <div class="steps">
        <div class="step completed">1. Requirements</div>
        <div class="step active">2. Database</div>
        <div class="step">3. Environment</div>
        <div class="step">4. Installation</div>
        <div class="step">5. Complete</div>
    </div>

    <?php if(!empty($errors)): ?>
        <div class="error-list">
            <strong>Database Connection Error:</strong>
            <ul>
                <?php foreach($errors as $error): ?>
                    <li><?php echo htmlspecialchars($error); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <div class="info-box">
        <strong>Note:</strong> Make sure your database exists before proceeding. The installer will not create the database for you.
    </div>

    <div class="card">
        <h2>Database Configuration</h2>

        <form method="POST" action="install.php?step=2">
            <div class="form-group">
                <label for="db_host">Database Host</label>
                <input type="text" id="db_host" name="db_host"
                       value="<?php echo htmlspecialchars($_POST['db_host'] ?? 'localhost'); ?>"
                       placeholder="localhost" required>
            </div>

            <div class="form-group">
                <label for="db_port">Database Port</label>
                <input type="number" id="db_port" name="db_port"
                       value="<?php echo htmlspecialchars($_POST['db_port'] ?? '3306'); ?>"
                       placeholder="3306" required>
            </div>

            <div class="form-group">
                <label for="db_database">Database Name</label>
                <input type="text" id="db_database" name="db_database"
                       value="<?php echo htmlspecialchars($_POST['db_database'] ?? ''); ?>"
                       placeholder="your_database_name" required>
            </div>

            <div class="form-group">
                <label for="db_username">Database Username</label>
                <input type="text" id="db_username" name="db_username"
                       value="<?php echo htmlspecialchars($_POST['db_username'] ?? ''); ?>"
                       placeholder="your_username" required>
            </div>

            <div class="form-group">
                <label for="db_password">Database Password</label>
                <input type="password" id="db_password" name="db_password"
                       value="<?php echo htmlspecialchars($_POST['db_password'] ?? ''); ?>"
                       placeholder="your_password">
            </div>

            <div class="actions">
                <a href="install.php?step=1" class="btn btn-secondary">← Previous</a>
                <button type="submit" class="btn">Test Connection & Continue →</button>
            </div>
        </form>
    </div>
</div>
</body>
</html>
