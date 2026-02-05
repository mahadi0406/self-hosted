<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Newsletter</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .content {
            margin-bottom: 30px;
        }
        .footer {
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
        }
        .unsubscribe {
            margin-top: 20px;
        }
        .unsubscribe a {
            color: #6c757d;
            text-decoration: none;
        }
        .unsubscribe a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <div class="logo">{{ config('app.name') }}</div>
    </div>

    <div class="content">
        @php echo $content ?? 'Default email content' @endphp
    </div>

    <div class="footer">
        <p>Thank you for subscribing to our newsletter!</p>

        <div class="unsubscribe">
            <p>
                Don't want to receive these emails?
                <a href="{{ $unsubscribeUrl }}">Unsubscribe here</a>
            </p>
        </div>
    </div>
</div>
</body>
</html>
