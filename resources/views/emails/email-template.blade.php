<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $site_name }} - Email Notification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            background-color: #0f1419;
            color: #e8eaed;
            line-height: 1.6;
            padding: 20px 0;
            margin: 0;
        }

        .email-wrapper {
            width: 100%;
            background-color: #0f1419;
            padding: 20px 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1f2e 0%, #16213e 100%);
            border-radius: 16px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            border: 1px solid #2d3748;
        }

        /* Header Styles */
        .header {
            background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
            padding: 40px 30px;
            text-align: center;
            border-bottom: 2px solid #374151;
            position: relative;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #a855f7, #7c3aed, #8b5cf6);
        }

        .logo {
            font-size: 36px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 8px;
            letter-spacing: -1px;
        }

        .logo .highlight {
            color: #a855f7;
            background: linear-gradient(135deg, #a855f7, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .tagline {
            color: #94a3b8;
            font-size: 14px;
            font-weight: 500;
            margin-top: 8px;
            letter-spacing: 0.5px;
        }

        /* Content Styles */
        .content {
            padding: 40px 30px;
            background: #1a1f2e;
        }

        .greeting {
            font-size: 20px;
            color: #ffffff;
            margin-bottom: 24px;
            font-weight: 600;
        }

        .email-body {
            color: #cbd5e1;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 32px;
        }

        .email-body h1 {
            color: #ffffff;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 700;
            border-bottom: 2px solid #374151;
            padding-bottom: 10px;
        }

        .email-body h2 {
            color: #e2e8f0;
            font-size: 20px;
            margin: 24px 0 16px 0;
            font-weight: 600;
        }

        .email-body p {
            margin-bottom: 16px;
            color: #cbd5e1;
        }

        .email-body a {
            color: #a855f7;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }

        .email-body a:hover {
            color: #c084fc;
            text-decoration: underline;
        }

        /* Button Styles */
        .button-container {
            text-align: center;
            margin: 32px 0;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
            color: #ffffff !important;
            text-decoration: none !important;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
            border: none;
            cursor: pointer;
            letter-spacing: 0.5px;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(168, 85, 247, 0.4);
            background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
        }

        /* Info Box Styles */
        .info-box {
            background: rgba(45, 55, 72, 0.6);
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #a855f7;
        }

        .info-box-title {
            color: #ffffff;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 8px;
        }

        .info-box-content {
            color: #cbd5e1;
            font-size: 14px;
            line-height: 1.6;
        }

        /* Alert Styles */
        .alert {
            padding: 16px 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 500;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid #10b981;
            color: #10b981;
        }

        .alert-warning {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid #f59e0b;
            color: #f59e0b;
        }

        .alert-danger {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid #ef4444;
            color: #ef4444;
        }

        .alert-info {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid #3b82f6;
            color: #3b82f6;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            margin: 24px 0;
        }

        .stat-card {
            background: rgba(45, 55, 72, 0.5);
            border: 1px solid #374151;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 4px;
        }

        .stat-label {
            color: #9ca3af;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Transaction Details */
        .transaction-details {
            background: rgba(17, 24, 39, 0.8);
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }

        .transaction-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #374151;
        }

        .transaction-row:last-child {
            border-bottom: none;
            font-weight: 700;
            color: #ffffff;
        }

        .transaction-label {
            color: #9ca3af;
            font-size: 14px;
        }

        .transaction-value {
            color: #e2e8f0;
            font-weight: 600;
        }

        /* Footer Styles */
        .footer {
            background: #111827;
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #374151;
        }

        .footer-content {
            max-width: 400px;
            margin: 0 auto;
        }

        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 20px;
            line-height: 1.6;
        }

        .footer-links {
            margin: 20px 0;
        }

        .footer-links a {
            color: #a855f7;
            text-decoration: none;
            margin: 0 12px;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .footer-links a:hover {
            color: #c084fc;
        }

        .footer-copyright {
            color: #4b5563;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #374151;
        }

        .security-notice {
            background: rgba(45, 55, 72, 0.3);
            border: 1px solid #374151;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            font-size: 14px;
            color: #9ca3af;
            text-align: center;
        }

        /* Responsive Design */
        @media (max-width: 640px) {
            body {
                padding: 10px 0;
            }

            .email-container {
                margin: 0 10px;
                border-radius: 12px;
            }

            .header, .content, .footer {
                padding: 24px 20px;
            }

            .logo {
                font-size: 28px;
            }

            .greeting {
                font-size: 18px;
            }

            .email-body {
                font-size: 15px;
            }

            .cta-button {
                padding: 14px 24px;
                font-size: 15px;
            }

            .stats-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }

            .transaction-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }
        }

        @media (prefers-color-scheme: dark) {
            .email-container {
                border: 1px solid #4b5563;
            }
        }

        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                {{ $site_name }}
            </div>
            <div class="tagline">{{ $site_description }}</div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="email-body">
                @php echo $body ?? 'Default email content' @endphp
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <strong>Security Notice:</strong> {{ env('APP_NAME') }} will never ask for your password or sensitive information via email.
                Always verify the sender and URL before clicking any links.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-text">
                    This email was sent from {{ $site_name }} Investment Platform.
                    If you have any questions or concerns, please don't hesitate to contact our support team.
                </div>

                <div class="footer-copyright">
                    © {{ date('Y') }} {{ $site_name }}  Web3 DeFi Investment & Staking Platform All rights reserved.<br>
                    This email was sent to you because you have an account with {{ $site_name }}.
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
