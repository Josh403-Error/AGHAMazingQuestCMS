"""
Management command to test creating users with each available role
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.usermanagement.models import Role
from django.contrib.auth.hashers import make_password
import uuid

User = get_user_model()

class Command(BaseCommand):
    help = 'Test creating users with each available role'

    def handle(self, *args, **options):
        self.stdout.write('Testing user creation for each role...')
        
        # Get all roles
        roles = Role.objects.all()
        
        for role in roles:
            self.stdout.write(f"\nTesting role: {role.name}")
            
            # Create a unique email for each test user
            user_email = f"test_{role.name.lower()}_{uuid.uuid4().hex[:8]}@example.com"
            
            try:
                # Create user with role
                user = User.objects.create(
                    email=user_email,
                    username=f"test_{role.name.lower()}",
                    password=make_password("testpassword123"),
                    first_name=f"Test{role.name}",
                    last_name="User",
                    role=role  # This is the critical part - ensuring the role is set
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Successfully created user with role: {role.name}')
                )
                self.stdout.write(f"  - Email: {user.email}")
                self.stdout.write(f"  - Role ID: {user.role.id}")
                self.stdout.write(f"  - Role Name: {user.role.name}")
                
                # Verify the user was saved with the role
                saved_user = User.objects.get(email=user_email)
                if saved_user.role == role:
                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Role correctly saved for user with role: {role.name}")
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(f"✗ Role mismatch for user with role: {role.name}")
                    )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error creating user with role {role.name}: {str(e)}')
                )
                return

        self.stdout.write(
            self.style.SUCCESS("\n✓ All role creation tests passed!")
        )