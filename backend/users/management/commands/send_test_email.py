from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = 'Send a test email or SMS to verify SMTP/Twilio configuration'

    def add_arguments(self, parser):
        parser.add_argument('--to', type=str, help='Email address to send test email to')
        parser.add_argument('--phone', type=str, help='Phone number to send test SMS to (E.164)')
        parser.add_argument('--subject', type=str, default='Test Email from Electric Store', help='Subject')
        parser.add_argument('--message', type=str, default='This is a test message sent from the Electric Store backend.', help='Message body')

    def handle(self, *args, **options):
        to = options.get('to')
        phone = options.get('phone')
        subject = options.get('subject')
        message = options.get('message')

        if not to and not phone:
            self.stderr.write(self.style.ERROR('Please provide --to (email) or --phone (sms).'))
            return

        if to:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None) or 'noreply@localhost'
            try:
                send_mail(subject, message, from_email, [to], fail_silently=False)
                self.stdout.write(self.style.SUCCESS(f'Test email sent to {to} (from {from_email})'))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Failed to send email: {e}'))

        if phone:
            # Attempt to send via Twilio if configured
            sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
            token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
            from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
            if not (sid and token and from_number):
                self.stderr.write(self.style.ERROR('Twilio not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER).'))
            else:
                try:
                    from importlib import import_module
                    twilio_rest = import_module('twilio.rest')
                    Client = twilio_rest.Client
                    client = Client(sid, token)
                    msg = client.messages.create(body=message, from_=from_number, to=phone)
                    self.stdout.write(self.style.SUCCESS(f'Test SMS sent to {phone} (sid={msg.sid})'))
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f'Failed to send SMS: {e}'))
