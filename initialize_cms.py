#!/usr/bin/env python
"""
Initialization script for AGHAMazingQuestCMS
This script will:
1. Create necessary database tables
2. Create default roles
3. Create a superuser if one doesn't exist
4. Run any necessary setup commands
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model
from django.db import IntegrityError

# Setup Django - change to backend directory
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

def main():
    # Run migrations to create all tables
    print("Applying database migrations...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations'])
    except Exception as e:
        print(f"Note: Migration creation completed or not needed: {e}")
    
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Create default roles
    print("Creating default roles...")
    from apps.usermanagement.models import Role
    
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
            print(f"Created role: {role.name}")
        else:
            print(f"Role already exists: {role.name}")
    
    # Create superuser if one doesn't exist
    User = get_user_model()
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    if not User.objects.filter(email=admin_email).exists():
        try:
            admin_role = Role.objects.get(name='Admin')
            superuser = User.objects.create_user(
                email=admin_email,
                username=os.environ.get('ADMIN_USERNAME', 'admin'),
                password=admin_password,
                first_name=os.environ.get('ADMIN_FIRST_NAME', 'Admin'),
                last_name=os.environ.get('ADMIN_LAST_NAME', 'User'),
                role=admin_role,
                is_staff=True,
                is_superuser=True
            )
            print(f"Superuser created: {admin_email}")
        except Role.DoesNotExist:
            print("Error: Admin role does not exist")
        except IntegrityError:
            print("Error: Superuser already exists")
    else:
        print("Superuser already exists")
    
    # Collect static files
    print("Collecting static files...")
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
    
    print("\nInitialization completed successfully!")
    print("You can now run the development server with: python manage.py runserver")


if __name__ == '__main__':
    main()