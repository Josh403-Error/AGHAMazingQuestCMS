#!/usr/bin/env python3
"""
Script to create a test user for AGHAMazing Quest CMS.
This script can be run from the command line to create a test user
with predefined credentials for development and testing purposes.
"""

import os
import sys
import django
from django.conf import settings

# Add the project root to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

# Setup Django with unified settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.unified')

django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction

User = get_user_model()

def create_test_user(username="testuser", email="testuser@example.com", password="testpassword123"):
    """
    Create a test user with the specified credentials.
    
    Args:
        username (str): Username for the test user
        email (str): Email for the test user
        password (str): Password for the test user
    
    Returns:
        User: The created user object or None if creation failed
    """
    try:
        with transaction.atomic():
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                print(f"User '{username}' already exists.")
                return User.objects.get(username=username)
            
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name="Test",
                last_name="User"
            )
            
            print(f"Successfully created test user:")
            print(f"  Username: {user.username}")
            print(f"  Email: {user.email}")
            print(f"  Name: {user.first_name} {user.last_name}")
            print(f"  Password: {password} (remember to change in production!)")
            
            return user
    except Exception as e:
        print(f"Error creating test user: {e}")
        return None

def assign_user_to_group(user, group_name):
    """
    Assign a user to a specific group.
    
    Args:
        user (User): The user to assign
        group_name (str): The name of the group to assign the user to
    """
    try:
        group, created = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)
        if created:
            print(f"Created and assigned user to new group: {group_name}")
        else:
            print(f"Assigned user to existing group: {group_name}")
    except Exception as e:
        print(f"Error assigning user to group: {e}")

def main():
    """Main function to create a test user."""
    print("AGHAMazing Quest CMS - Test User Creation Script")
    print("=" * 50)
    
    # Create the basic test user
    user = create_test_user()
    
    if user:
        # Optionally assign to groups (uncomment as needed)
        # assign_user_to_group(user, "Editor")
        # assign_user_to_group(user, "Reviewer")
        # assign_user_to_group(user, "Administrator")
        
        print("\nLogin credentials:")
        print(f"  Username: testuser")
        print(f"  Password: testpassword123")
        print("\nNote: Remember to change these credentials in production!")
        return 0
    else:
        print("Failed to create test user.")
        return 1

if __name__ == "__main__":
    sys.exit(main())