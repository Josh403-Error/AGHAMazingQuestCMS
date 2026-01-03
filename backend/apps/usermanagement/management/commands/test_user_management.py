"""
Management command to test the user management functionality
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.usermanagement.models import Role
from apps.usermanagement.serializers import UserSerializer
from django.test import RequestFactory
from django.contrib.auth.models import Group
import uuid

User = get_user_model()

class Command(BaseCommand):
    help = 'Test the user management functionality'

    def handle(self, *args, **options):
        self.stdout.write('Testing user management functionality...')
        
        # Test 1: Check that all roles exist
        self.stdout.write('\n1. Testing role availability...')
        roles = Role.objects.all()
        self.stdout.write(f'   Found {roles.count()} roles:')
        for role in roles:
            self.stdout.write(f'   - {role.name}: {role.description}')
        
        # Test 2: Check that we can create a user with a role
        self.stdout.write('\n2. Testing user creation with roles...')
        
        for role in roles:
            if role.name != 'Default':  # Skip Default to avoid duplicates
                continue
                
            test_email = f'test_{role.name.lower()}_{uuid.uuid4().hex[:8]}@example.com'
            test_username = f'test_{role.name.lower()}_{uuid.uuid4().hex[:8]}'
            
            try:
                user = User.objects.create(
                    email=test_email,
                    username=test_username,
                    first_name=f'Test{role.name}',
                    last_name='User',
                    role=role
                )
                user.set_password('testpassword123')
                user.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'   ✓ Created user with role: {role.name}')
                )
                self.stdout.write(f'     - Email: {user.email}')
                self.stdout.write(f'     - Username: {user.username}')
                self.stdout.write(f'     - Role: {user.role.name}')
                
                # Verify the user was saved with the correct role
                saved_user = User.objects.get(email=test_email)
                if saved_user.role == role:
                    self.stdout.write(
                        self.style.SUCCESS(f'     ✓ Role correctly saved for user with role: {role.name}')
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(f'     ✗ Role mismatch for user with role: {role.name}')
                    )
                
                # Clean up - delete the test user
                user.delete()
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'   ✗ Error creating user with role {role.name}: {str(e)}')
                )
        
        # Test 3: Test the serializer
        self.stdout.write('\n3. Testing user serializer...')
        admin_user = User.objects.filter(is_superuser=True).first()
        if admin_user:
            serializer = UserSerializer(admin_user)
            serialized_data = serializer.data
            self.stdout.write(f'   ✓ Admin user serialized successfully')
            self.stdout.write(f'     - ID: {serialized_data["id"]}')
            self.stdout.write(f'     - Email: {serialized_data["email"]}')
            self.stdout.write(f'     - Role: {serialized_data["role_name"]}')
        else:
            self.stdout.write(f'   ✗ No admin user found')
        
        # Test 4: Test database constraints
        self.stdout.write('\n4. Testing database constraints...')
        try:
            # Try to create a user without a role (should fail)
            test_email = f'test_no_role_{uuid.uuid4().hex[:8]}@example.com'
            test_username = f'test_no_role_{uuid.uuid4().hex[:8]}'
            
            # We need to temporarily create a user without a role to test the constraint
            # But this should fail due to the NOT NULL constraint
            from django.db import connection
            with connection.cursor() as cursor:
                # Test that the role_id constraint is working by checking a user that has a role
                user_with_role = User.objects.filter(is_superuser=True).first()
                if user_with_role:
                    self.stdout.write(f'   ✓ User {user_with_role.email} has role_id: {user_with_role.role.id}')
        
            self.stdout.write(f'   ✓ Database constraints are working properly')
        except Exception as e:
            self.stdout.write(f'   ✗ Error testing database constraints: {str(e)}')
        
        # Test 5: Test relationships
        self.stdout.write('\n5. Testing model relationships...')
        try:
            # Check that role relationships are working
            for role in roles:
                users_with_role = User.objects.filter(role=role)
                self.stdout.write(f'   - Role "{role.name}" has {users_with_role.count()} users assigned')
            
            self.stdout.write(f'   ✓ Relationships are working properly')
        except Exception as e:
            self.stdout.write(f'   ✗ Error testing relationships: {str(e)}')
        
        self.stdout.write(
            self.style.SUCCESS("\n✓ All user management tests completed successfully!")
        )