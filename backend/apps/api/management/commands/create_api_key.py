from django.core.management.base import BaseCommand
from apps.api.models import APIIntegration
from django.contrib.auth import get_user_model
import secrets

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates a new API key for external integrations'

    def add_arguments(self, parser):
        parser.add_argument('--name', type=str, help='Name for the API integration', required=True)
        parser.add_argument('--description', type=str, help='Description of the integration', default='')
        parser.add_argument('--rate-limit', type=int, help='Rate limit per hour (default: 1000)', default=1000)
        parser.add_argument('--user-id', type=str, help='ID of the user creating this integration', default=None)
        parser.add_argument('--active', action='store_true', help='Set integration as active (default: True)', default=True)
        parser.add_argument('--allowed-endpoints', type=str, help='Comma-separated list of allowed endpoints', default='')
        parser.add_argument('--ip-whitelist', type=str, help='Comma-separated list of allowed IP addresses', default='')

    def handle(self, *args, **options):
        # Get the user if provided
        user = None
        if options['user_id']:
            try:
                user = User.objects.get(id=options['user_id'])
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User with ID {options["user_id"]} does not exist')
                )
                return

        # Generate a secure API key
        api_key = secrets.token_urlsafe(32)

        # Create the API integration
        integration = APIIntegration.objects.create(
            name=options['name'],
            description=options['description'],
            api_key=api_key,
            rate_limit=options['rate_limit'],
            is_active=options['active'],
            allowed_endpoints=options['allowed_endpoints'],
            ip_whitelist=options['ip_whitelist'],
            created_by=user
        )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created API integration: {integration.name}')
        )
        self.stdout.write(f'API Key: {api_key}')
        self.stdout.write(
            'Please store this key securely as it will not be shown again.'
        )