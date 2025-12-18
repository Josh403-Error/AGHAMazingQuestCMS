#!/usr/bin/env python3
import os
import sys
import django

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django settings
os.environ.setdefault('DJANGO_SECRET_KEY', 'my-secret-key')
os.environ.setdefault('DJANGO_DEBUG', 'True')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from django.contrib.auth.models import User

def create_test_user():
    # Check if user already exists
    if User.objects.filter(username='admin').exists():
        print("User 'admin' already exists")
        user = User.objects.get(username='admin')
    else:
        # Create superuser
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='password123'
        )
        print("Created superuser 'admin' with password 'password123'")
    
    return user

if __name__ == "__main__":
    create_test_user()