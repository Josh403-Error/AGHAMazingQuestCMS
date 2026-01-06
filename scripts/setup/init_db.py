import os
import sys
import django
from django.conf import settings

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.unified')

django.setup()

from apps.usermanagement.models import Role, User

def init_db():
    # Create roles
    admin_role, created = Role.objects.get_or_create(
        name='Admin',
        defaults={
            'description': 'Administrator role with full access',
            'permissions': ['manage_users', 'manage_content', 'manage_roles']
        }
    )
    
    super_admin_role, created = Role.objects.get_or_create(
        name='Super Admin',
        defaults={
            'description': 'Super administrator role with ultimate access',
            'permissions': ['manage_everything']
        }
    )
    
    user_role, created = Role.objects.get_or_create(
        name='User',
        defaults={
            'description': 'Regular user role',
            'permissions': ['view_content']
        }
    )
    
    print(f"Created roles: Admin, Super Admin, User")
    
    # Create superuser
    if not User.objects.filter(email='admin@example.com').exists():
        superuser = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            first_name='Admin',
            last_name='User',
            password='password123',
            role=admin_role,
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        print(f"Created superuser: {superuser.email}")
    else:
        print("Superuser already exists")

if __name__ == '__main__':
    init_db()