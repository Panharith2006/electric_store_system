# Email (SMTP) / Transactional Provider Setup

This file explains how to configure email delivery so OTPs are sent to real inboxes (not just the console).

Important: the project already uses Django's `send_mail()` in `users.views.SendOTPView`.
By default the app uses the console email backend in development. To deliver to real
mailboxes, configure SMTP or a transactional provider and restart the backend.

## Options

Option A — SMTP (e.g. Gmail)
1. Use an App Password for Gmail (recommended) or configure your SMTP provider.
2. Add these variables to the project's `.env` (project root):

```dotenv
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

3. Restart the backend:

```powershell
cd "d:\Year 3\WCT\Electric-Store-Management-System\backend"
venv\Scripts\Activate.ps1
python manage.py runserver
```

Notes about Gmail:
- Use an App Password (recommended) if your Google account has 2FA.
- For testing, SendGrid or Mailgun are easier than enabling less-secure options.

Option B — SendGrid / Mailgun (recommended for production)
1. Create an account with SendGrid or Mailgun and obtain an API key.
2. You can either configure SMTP in the `.env` (same as above) or use `django-anymail`.

Example (SendGrid + Anymail):

```dotenv
ANYMAIL_PROVIDER=sendgrid
ANYMAIL_API_KEY=your-sendgrid-api-key
EMAIL_BACKEND=anymail.backends.sendgrid.EmailBackend
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

Install Anymail:

```powershell
pip install django-anymail
```

Add `anymail` to `INSTALLED_APPS` if you use it (the settings file already includes
support to enable Anymail when `ANYMAIL_API_KEY` and `ANYMAIL_PROVIDER` are set).

## PowerShell temporary environment example (current session only)

```powershell
$env:EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
$env:EMAIL_HOST = 'smtp.gmail.com'
$env:EMAIL_PORT = '587'
$env:EMAIL_USE_TLS = 'True'
$env:EMAIL_HOST_USER = 'your-email@gmail.com'
$env:EMAIL_HOST_PASSWORD = 'your-app-password'
$env:DEFAULT_FROM_EMAIL = 'noreply@yourdomain.com'
# then run the server
# python manage.py runserver
```

## Security & Debug behavior
- Do NOT commit credentials to the repository. Use `.env` or a secret manager.
- For development the project previously returned `otp_code` in the SendOTP response
  to make testing easier. The server now only includes `otp_code` in the HTTP
  response when `DEBUG=True` to avoid leaking codes in production.

## Troubleshooting
- If you still see the OTP in responses, confirm `DEBUG=False` in your `.env` and
  that the server has been restarted.
- Check Django logs (console) for SMTP errors — they often reveal authentication
  or provider-specific issues.

If you want, I can:
- Add an endpoint to re-send OTP and wire the frontend `onResend` to it (so the
  OTP button triggers a real email); or
- Implement a small test command `python manage.py send_test_email` to verify SMTP.

Which of these would you like me to do next?