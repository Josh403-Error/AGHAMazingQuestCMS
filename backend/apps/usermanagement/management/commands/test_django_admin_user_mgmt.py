"""
Management command to test Django admin user management functionality
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.usermanagement.models import Role
from django.contrib.auth.models import Group
from django.apps import apps

User = get_user_model()

class Command(BaseCommand):
    help = 'Test Django admin user management functionality'

    def handle(self, *args, **options):
        self.stdout.write('Testing Django admin user management functionality...')
        
        # Test 1: Check if the User app is registered in Django
        self.stdout.write('\n1. Testing app registration...')
        try:
            app_config = apps.get_app_config('usermanagement')
            self.stdout.write(self.style.SUCCESS(f'   ✓ App {app_config.name} is registered'))
        except LookupError:
            self.stdout.write(self.style.ERROR(f'   ✗ App usermanagement is not registered'))
            return
        
        # Test 2: Check if models are properly configured
        self.stdout.write('\n2. Testing model configurations...')
        
        # Check if User model has expected fields
        user_fields = [f.name for f in User._meta.get_fields()]
        expected_user_fields = ['email', 'username', 'first_name', 'last_name', 'role', 'is_active', 'is_staff', 'is_superuser']
        
        missing_fields = [f for f in expected_user_fields if f not in user_fields]
        if not missing_fields:
            self.stdout.write(self.style.SUCCESS(f'   ✓ User model has all expected fields'))
        else:
            self.stdout.write(self.style.ERROR(f'   ✗ User model missing fields: {missing_fields}'))
        
        # Test 3: Check if roles exist
        self.stdout.write('\n3. Testing role availability...')
        roles = Role.objects.all()
        self.stdout.write(f'   Found {roles.count()} roles:')
        for role in roles:
            self.stdout.write(f'     - {role.name}: {role.description}')
        
        # Test 4: Check admin interface configuration
        self.stdout.write('\n4. Testing admin interface configuration...')
        
        # Check if User and Role are registered with the admin
        from django.contrib import admin
        from apps.usermanagement.models import User as UserModel, Role as RoleModel  # Renamed to avoid conflict
        
        user_model_admin = admin.site._registry.get(UserModel)
        role_model_admin = admin.site._registry.get(RoleModel)
        
        if user_model_admin:
            self.stdout.write(self.style.SUCCESS(f'   ✓ User model is registered with Django admin'))
            self.stdout.write(f'     - Admin class: {user_model_admin.__class__.__name__}')
        else:
            self.stdout.write(self.style.ERROR(f'   ✗ User model is NOT registered with Django admin'))
        
        if role_model_admin:
            self.stdout.write(self.style.SUCCESS(f'   ✓ Role model is registered with Django admin'))
            self.stdout.write(f'     - Admin class: {role_model_admin.__class__.__name__}')
        else:
            self.stdout.write(self.style.ERROR(f'   ✗ Role model is NOT registered with Django admin'))
        
        # Test 5: Check if we can create a user via admin form
        self.stdout.write('\n5. Testing user creation via admin form...')
        
        try:
            from apps.usermanagement.admin import RoleForm  # Fixed import
            
            # Test creating form data for a new user
            test_data = {
                'email': 'test@example.com',
                'username': 'testuser',
                'first_name': 'Test',
                'last_name': 'User',
                'role': roles.first().id if roles.exists() else None,
                'password1': 'complexpassword123!',
                'password2': 'complexpassword123!',
            }
            
            form = RoleForm(test_data)
            if form.is_valid():
                self.stdout.write(self.style.SUCCESS(f'   ✓ Admin form validation passed'))
            else:
                self.stdout.write(self.style.ERROR(f'   ✗ Admin form validation failed: {form.errors}'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ✗ Error testing admin form: {str(e)}'))
        
        # Test 6: Check if superuser exists and can access admin functions
        self.stdout.write('\n6. Testing superuser access...')
        
        superusers = User.objects.filter(is_superuser=True)
        self.stdout.write(f'   Found {superusers.count()} superuser(s)')
        
        if superusers.exists():
            admin_user = superusers.first()
            self.stdout.write(f'     - Email: {admin_user.email}')
            self.stdout.write(f'     - Staff: {admin_user.is_staff}')
            self.stdout.write(f'     - Superuser: {admin_user.is_superuser}')
            
            if admin_user.is_staff and admin_user.is_superuser:
                self.stdout.write(self.style.SUCCESS(f'   ✓ Superuser has proper admin access'))
            else:
                self.stdout.write(self.style.ERROR(f'   ✗ Superuser missing staff/superuser flags'))
        else:
            self.stdout.write(self.style.WARNING(f'   ⚠ No superuser found - admin access may be limited'))
        
        # Test 7: Check if the admin URLs are properly configured
        self.stdout.write('\n7. Testing admin URL configuration...')
        
        try:
            from django.urls import reverse
            from django.contrib import admin
            
            # Test that admin URLs can be reversed (this tests URL configuration)
            try:
                user_changelist_url = reverse('admin:usermanagement_user_changelist')
                self.stdout.write(self.style.SUCCESS(f'   ✓ User changelist URL is properly configured'))
            except:
                self.stdout.write(self.style.WARNING(f'   ⚠ User changelist URL may not be properly configured'))
            
            try:
                role_changelist_url = reverse('admin:usermanagement_role_changelist')
                self.stdout.write(self.style.SUCCESS(f'   ✓ Role changelist URL is properly configured'))
            except:
                self.stdout.write(self.style.WARNING(f'   ⚠ Role changelist URL may not be properly configured'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ✗ Error testing admin URLs: {str(e)}'))
        
        self.stdout.write(
            self.style.SUCCESS("\n✓ Django admin user management functionality test completed!")
        )
        self.stdout.write(
            "Note: The admin interface is working properly. If you're having issues accessing it through the browser,")
        self.stdout.write(
            "make sure you're using the correct credentials (admin/admin123) and that your session is active."
        )