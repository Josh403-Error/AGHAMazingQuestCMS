from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from apps.usermanagement.models import Role
from apps.contentmanagement.models import Content


class Command(BaseCommand):
    help = 'Initialize the CMS with default roles and a superuser'

    def handle(self, *args, **options):
        # Create default roles
        self.stdout.write('Creating default roles...')
        roles_data = [
            {'name': 'Admin', 'description': 'System administrator with full access'},
            {'name': 'Encoder', 'description': 'Can create content'},
            {'name': 'Editor', 'description': 'Can create and edit content'},
            {'name': 'Approver', 'description': 'Can approve content for publication'},
            {'name': 'Publisher', 'description': 'Can publish content'},
        ]

        for role_data in roles_data:
            role, created = Role.objects.get_or_create(
                name=role_data['name'],
                defaults={
                    'description': role_data['description'],
                    'permissions': []  # Empty permissions list by default
                }
            )
            if created:
                self.stdout.write(f"Created role: {role.name}")
            else:
                self.stdout.write(f"Role already exists: {role.name}")

        # Create superuser if one doesn't exist
        User = get_user_model()
        admin_email = 'admin@example.com'
        admin_password = 'admin123'

        if not User.objects.filter(email=admin_email).exists():
            try:
                admin_role = Role.objects.get(name='Admin')
                superuser = User.objects.create_user(
                    email=admin_email,
                    username='admin',
                    password=admin_password,
                    first_name='Admin',
                    last_name='User',
                    role=admin_role,
                    is_staff=True,
                    is_superuser=True
                )
                self.stdout.write(f"Superuser created: {admin_email}")
            except Role.DoesNotExist:
                self.stdout.write("Error: Admin role does not exist")
            except IntegrityError:
                self.stdout.write("Error: Superuser already exists")
        else:
            self.stdout.write("Superuser already exists")

        self.stdout.write(
            self.style.SUCCESS('Initialization completed successfully!')
        )