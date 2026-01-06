"""
Role and Content Checking Script for AGHAMazing Quest CMS

This script verifies that all roles and permissions are properly set up in the system.
It also creates sample content for testing purposes.
"""

import os
import sys
import django
from django.conf import settings
from django.db import transaction

# Add the project root to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

# Setup Django with unified settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.unified')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from apps.contentmanagement.models import ContentItem

def check_roles():
    """Check if roles are properly configured."""
    print("Checking role configurations...")
    
    # Check if required groups exist
    required_groups = ['Editor', 'Reviewer', 'Administrator']
    existing_groups = Group.objects.filter(name__in=required_groups)
    existing_group_names = [group.name for group in existing_groups]
    
    print(f"Found groups: {existing_group_names}")
    
    missing_groups = set(required_groups) - set(existing_group_names)
    if missing_groups:
        print(f"Missing groups: {missing_groups}")
        return False
    
    # Check permissions for each group
    for group_name in required_groups:
        group = Group.objects.get(name=group_name)
        permissions = group.permissions.all()
        print(f"Group '{group_name}' has {permissions.count()} permissions")
        
        # Show some sample permissions
        sample_perms = permissions[:3]
        for perm in sample_perms:
            print(f"  - {perm.content_type.app_label}.{perm.codename}")
    
    # Check a sample content item
    content_items = ContentItem.objects.all()[:5]
    print(f"\nSample content items ({len(content_items)}):")
    for item in content_items:
        print(f"  - {item.title} (Status: {item.status})")
    
    return True

def create_sample_content():
    """Create sample content for testing."""
    print("\nCreating sample content...")
    
    try:
        # Get or create a user for testing
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={'email': 'test@example.com'}
        )
        if created:
            user.set_password('testpass123')
            user.save()
            print("Created test user: testuser")
        
        # Create sample content items
        sample_titles = [
            "Introduction to Game Mechanics",
            "Advanced Level Design Techniques", 
            "Character Development Strategies",
            "Multiplayer Implementation Guide"
        ]
        
        for i, title in enumerate(sample_titles):
            content, created = ContentItem.objects.get_or_create(
                title=title,
                defaults={
                    'body': f'This is the content for {title}',
                    'status': 'draft',
                    'author': user
                }
            )
            if created:
                print(f"Created content: {title}")
                
        return True
    except Exception as e:
        print(f"Error creating sample content: {e}")
        return False

if __name__ == "__main__":
    print("AGHAMazing Quest CMS - Role and Content Checker")
    print("=" * 50)
    
    try:
        roles_ok = check_roles()
        content_ok = create_sample_content()
        
        if roles_ok and content_ok:
            print("\n✓ All checks passed!")
        else:
            print("\n✗ Some checks failed!")
            
    except Exception as e:
        print(f"Error during checking: {e}")
        sys.exit(1)
