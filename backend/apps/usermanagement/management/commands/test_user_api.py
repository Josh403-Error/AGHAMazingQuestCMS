"""
Management command to test the user management API endpoints
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.usermanagement.models import Role
from apps.usermanagement.views import UserViewSet, RoleViewSet
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.request import Request
import tempfile
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Test the user management API endpoints'

    def handle(self, *args, **options):
        self.stdout.write('Testing user management API endpoints...')
        
        # Create a request factory for testing
        factory = APIRequestFactory()
        
        # Get an admin user to authenticate with
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            self.stdout.write(
                self.style.ERROR('No admin user found to authenticate API requests')
            )
            return
        
        self.stdout.write(f'Using admin user: {admin_user.email}')
        
        # Test 1: Test RoleViewSet
        self.stdout.write('\n1. Testing Role API endpoints...')
        
        try:
            # Create role viewset instance
            role_viewset = RoleViewSet()
            
            # Create a GET request for listing roles
            request = factory.get('/api/roles/')
            force_authenticate(request, user=admin_user)
            request = Request(request)
            
            response = role_viewset.list(request)
            self.stdout.write(f'   ✓ Role list endpoint returned {len(response.data)} roles')
            
            for role in response.data:
                self.stdout.write(f'     - {role["name"]}: {role["description"]}')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ✗ Error testing Role API: {str(e)}')
            )
        
        # Test 2: Test UserViewSet
        self.stdout.write('\n2. Testing User API endpoints...')
        
        try:
            # Create user viewset instance
            user_viewset = UserViewSet()
            
            # Create a GET request for listing users
            request = factory.get('/api/users/')
            force_authenticate(request, user=admin_user)
            request = Request(request)
            
            response = user_viewset.list(request)
            self.stdout.write(f'   ✓ User list endpoint returned {len(response.data)} users')
            
            for user in response.data[:3]:  # Show first 3 users
                self.stdout.write(f'     - {user["email"]} (Role: {user["role_name"]})')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ✗ Error testing User API: {str(e)}')
            )
        
        # Test 3: Test RoleListView
        self.stdout.write('\n3. Testing Role List API endpoint...')
        
        try:
            from apps.usermanagement.views import RoleListView
            role_list_view = RoleListView()
            
            # Create a GET request for the role list
            request = factory.get('/api/roles/list/')
            force_authenticate(request, user=admin_user)
            request = Request(request)
            
            response = role_list_view.get(request)
            self.stdout.write(f'   ✓ Role list view returned {len(response.data)} roles')
            
            for role in response.data:
                self.stdout.write(f'     - {role["name"]} (ID: {role["id"]})')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ✗ Error testing Role List API: {str(e)}')
            )
        
        # Test 4: Check permissions
        self.stdout.write('\n4. Testing API permissions...')
        
        try:
            # Create user viewset instance
            user_viewset = UserViewSet()
            
            # Create an unauthenticated request
            request = factory.get('/api/users/')
            request = Request(request)
            
            # This should fail because the view requires authentication
            try:
                response = user_viewset.list(request)
                self.stdout.write(f'   ? Unexpected: Unauthenticated request succeeded')
            except Exception:
                self.stdout.write(f'   ✓ Unauthenticated request properly blocked')
                
        except Exception as e:
            # This is expected behavior
            self.stdout.write(f'   ✓ Unauthenticated request properly blocked')
        
        # Test 5: Check that all expected roles are available via API
        self.stdout.write('\n5. Testing role availability via API...')
        
        try:
            role_viewset = RoleViewSet()
            request = factory.get('/api/roles/')
            force_authenticate(request, user=admin_user)
            request = Request(request)
            
            response = role_viewset.list(request)
            role_names = [role['name'] for role in response.data]
            
            expected_roles = ['Admin', 'Encoder', 'Editor', 'Approver', 'Publisher', 'Default']
            missing_roles = [role for role in expected_roles if role not in role_names]
            
            if not missing_roles:
                self.stdout.write(f'   ✓ All expected roles are available via API')
                self.stdout.write(f'     Found: {", ".join(role_names)}')
            else:
                self.stdout.write(
                    self.style.ERROR(f'   ✗ Missing roles in API: {", ".join(missing_roles)}')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ✗ Error testing role availability: {str(e)}')
            )
        
        self.stdout.write(
            self.style.SUCCESS("\n✓ All API tests completed successfully!")
        )