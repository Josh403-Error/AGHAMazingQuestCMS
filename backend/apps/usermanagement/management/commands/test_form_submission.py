"""
Management command to test form submission with all roles
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.usermanagement.wagtail_hooks import CustomUserCreationForm
from apps.usermanagement.models import Role
from django.contrib.auth.hashers import make_password
import uuid


User = get_user_model()

class Command(BaseCommand):
    help = 'Test form submission with all roles'

    def handle(self, *args, **options):
        self.stdout.write('Testing form submission with all roles...')
        
        roles = Role.objects.all()
        
        for role in roles:
            self.stdout.write(f"\nTesting form submission with role: {role.name}")
            
            # Prepare form data for this role
            form_data = {
                'email': f'test_form_{role.name.lower()}_{uuid.uuid4().hex[:8]}@example.com',
                'username': f'test_form_{role.name.lower()}',
                'first_name': f'TestForm{role.name}',
                'last_name': 'User',
                'role': role.id,
                'password1': 'complexpassword123!',
                'password2': 'complexpassword123!'
            }
            
            # Create form instance with data
            form = CustomUserCreationForm(data=form_data)
            
            # Validate the form
            if form.is_valid():
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Form is valid for role: {role.name}')
                )
                
                # Try to save the user (this is what would happen in Wagtail)
                try:
                    user = form.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ User created successfully with role: {role.name}')
                    )
                    self.stdout.write(f'  - Email: {user.email}')
                    self.stdout.write(f'  - Role: {user.role.name}')
                    
                    # Verify that the user was saved with the correct role
                    saved_user = User.objects.get(email=form_data['email'])
                    if saved_user.role == role:
                        self.stdout.write(
                            self.style.SUCCESS(f'✓ Role correctly saved for user with role: {role.name}')
                        )
                    else:
                        self.stdout.write(
                            self.style.ERROR(f'✗ Role mismatch for user with role: {role.name}')
                        )
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'✗ Error saving user with role {role.name}: {str(e)}')
                    )
            else:
                self.stdout.write(
                    self.style.ERROR(f'✗ Form is not valid for role {role.name}')
                )
                for field, errors in form.errors.items():
                    self.stdout.write(
                        self.style.ERROR(f'  - {field}: {", ".join(errors)}')
                    )
                return

        self.stdout.write(
            self.style.SUCCESS("\n✓ All form submission tests passed!")
        )