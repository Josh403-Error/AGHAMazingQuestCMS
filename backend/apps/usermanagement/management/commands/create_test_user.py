from django.core.management.base import BaseCommand
from apps.usermanagement.models import Role, User

class Command(BaseCommand):
    help = 'Create a test user with a default role'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='testuser', help='Username for the test user')
        parser.add_argument('--email', type=str, default='testuser@example.com', help='Email for the test user')
        parser.add_argument('--password', type=str, default='testpassword123', help='Password for the test user')
        parser.add_argument('--first_name', type=str, default='Test', help='First name for the test user')
        parser.add_argument('--last_name', type=str, default='User', help='Last name for the test user')

    def handle(self, *args, **options):
        # Create a default role if none exists
        if not Role.objects.exists():
            default_role = Role.objects.create(
                name='Default',
                description='Default role for users'
            )
            self.stdout.write(self.style.SUCCESS(f'Created default role: {default_role.name}'))
        else:
            default_role = Role.objects.first()
            self.stdout.write(self.style.SUCCESS(f'Using existing role: {default_role.name}'))

        # Create a test user if one doesn't already exist
        username = options['username']
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                email=options['email'],
                password=options['password'],
                first_name=options['first_name'],
                last_name=options['last_name'],
                role=default_role
            )
            self.stdout.write(self.style.SUCCESS(f'Created test user: {username}'))
        else:
            self.stdout.write(self.style.WARNING(f'Test user {username} already exists'))