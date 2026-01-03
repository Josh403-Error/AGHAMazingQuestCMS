"""
Test script to verify that users can be created with each role without IntegrityError
"""
import os
import sys
import django
from django.conf import settings

# Add the project directory to the Python path
sys.path.append('/app')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.unified')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model
from apps.usermanagement.models import Role
from django.contrib.auth.hashers import make_password
import uuid

User = get_user_model()

def test_role_creation():
    print("Testing user creation for each role...")
    
    # Get all roles
    roles = Role.objects.all()
    
    for role in roles:
        print(f"\nTesting role: {role.name}")
        
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
            
            print(f"✓ Successfully created user with role: {role.name}")
            print(f"  - Email: {user.email}")
            print(f"  - Role ID: {user.role.id}")
            print(f"  - Role Name: {user.role.name}")
            
            # Verify the user was saved with the role
            saved_user = User.objects.get(email=user_email)
            if saved_user.role == role:
                print(f"✓ Role correctly saved for user with role: {role.name}")
            else:
                print(f"✗ Role mismatch for user with role: {role.name}")
                
        except Exception as e:
            print(f"✗ Error creating user with role {role.name}: {str(e)}")
            return False
    
    print("\n✓ All role creation tests passed!")
    return True

if __name__ == "__main__":
    test_role_creation()