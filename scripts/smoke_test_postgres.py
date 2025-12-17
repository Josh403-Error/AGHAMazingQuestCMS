#!/usr/bin/env python3
"""
Smoke test script to verify PostgreSQL connectivity and basic functionality
"""

import os
import sys
import django
from django.conf import settings
from django.db import connection

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

def test_database_connection():
    """Test database connection."""
    print("Testing database connection...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version()")
            version = cursor.fetchone()
            print(f"✓ Database connection successful")
            print(f"  Database version: {version[0]}")
            return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def test_table_creation():
    """Test table creation."""
    print("\nTesting table creation...")
    try:
        # Import a model to trigger table creation check
        from apps.contentmanagement.models import ContentItem
        
        # Check if the table exists by counting records
        count = ContentItem.objects.count()
        print(f"✓ ContentItem table exists with {count} records")
        return True
    except Exception as e:
        print(f"✗ Table creation test failed: {e}")
        return False

def test_user_authentication():
    """Test user authentication."""
    print("\nTesting user authentication...")
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Try to get the admin user
        admin_user = User.objects.filter(is_superuser=True).first()
        if admin_user:
            print(f"✓ Superuser found: {admin_user.username}")
        else:
            print("ℹ No superuser found (this is OK for initial setup)")
        
        total_users = User.objects.count()
        print(f"  Total users: {total_users}")
        return True
    except Exception as e:
        print(f"✗ User authentication test failed: {e}")
        return False

def test_django_apps():
    """Test if all Django apps are properly loaded."""
    print("\nTesting Django applications...")
    try:
        apps = [
            'apps.authentication',
            'apps.contentmanagement', 
            'apps.usermanagement',
            'apps.analyticsmanagement'
        ]
        
        for app in apps:
            if app in settings.INSTALLED_APPS:
                print(f"✓ {app} is properly configured")
            else:
                print(f"✗ {app} is missing from INSTALLED_APPS")
                return False
                
        return True
    except Exception as e:
        print(f"✗ Django apps test failed: {e}")
        return False

def main():
    """Run all smoke tests."""
    print("AGHAMazing Quest CMS - PostgreSQL Smoke Test")
    print("=" * 50)
    
    tests = [
        test_database_connection,
        test_table_creation,
        test_user_authentication,
        test_django_apps
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"✗ Test {test.__name__} crashed: {e}")
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! PostgreSQL integration is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())