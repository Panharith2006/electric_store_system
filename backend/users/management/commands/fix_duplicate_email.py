from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
    help = (
        "Ensure a given email is preserved only on an admin account and "
        "clear or delete it from any regular user accounts that share it."
    )

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email address to deduplicate')
        parser.add_argument(
            '--action',
            choices=['clear', 'delete'],
            default='clear',
            help='Whether to clear the email field from duplicates or delete the duplicate users',
        )

    def handle(self, *args, **options):
        email = options['email']
        action = options['action']

        from users.models import User

        qs = User.objects.filter(email__iexact=email)
        total = qs.count()
        if total == 0:
            self.stdout.write(self.style.NOTICE(f'No users found with email: {email}'))
            return

        # Prefer an existing admin with that email
        admin_qs = qs.filter(role=User.Role.ADMIN)
        admin = admin_qs.first() if admin_qs.exists() else None

        # All users except the chosen admin (if present)
        if admin:
            non_admin_qs = qs.exclude(pk=admin.pk)
        else:
            non_admin_qs = qs

        non_admin_count = non_admin_qs.count()
        if non_admin_count == 0:
            self.stdout.write(self.style.SUCCESS(f'No non-admin users with email {email}. Admin preserved: {admin.username if admin else "(none)"}'))
            return

        if action == 'clear':
            # Clear email field on non-admin users
            updated = non_admin_qs.update(email='')
            self.stdout.write(self.style.SUCCESS(f'Cleared email for {updated} user(s) (non-admin)'))
        else:
            # Delete non-admin users
            ids = list(non_admin_qs.values_list('id', flat=True))
            non_admin_qs.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {len(ids)} user(s): {ids}'))

        if admin:
            self.stdout.write(self.style.SUCCESS(f'Admin account retained: {admin.username} (id={admin.pk})'))
        else:
            self.stdout.write(self.style.WARNING('No admin account had that email; consider assigning it to an admin manually.'))
