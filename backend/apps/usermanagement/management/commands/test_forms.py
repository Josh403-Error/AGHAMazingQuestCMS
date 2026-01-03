"""
Management command to test the Wagtail forms
"""
from django.core.management.base import BaseCommand
from apps.usermanagement.wagtail_hooks import CustomUserCreationForm, CustomUserEditForm
from apps.usermanagement.models import Role


class Command(BaseCommand):
    help = 'Test the Wagtail user creation and edit forms'

    def handle(self, *args, **options):
        self.stdout.write('Testing CustomUserCreationForm...')
        
        # Test CustomUserCreationForm
        creation_form = CustomUserCreationForm()
        self.stdout.write(f'CustomUserCreationForm fields count: {len(creation_form.fields)}')
        self.stdout.write('CustomUserCreationForm field names: ' + ', '.join(creation_form.fields.keys()))
        
        # Check if role field exists
        if 'role' in creation_form.fields:
            self.stdout.write(
                self.style.SUCCESS('✓ Role field exists in CustomUserCreationForm')
            )
            self.stdout.write(f'  - Field type: {type(creation_form.fields["role"])}')
            self.stdout.write(f'  - Required: {creation_form.fields["role"].required}')
            self.stdout.write(f'  - Role queryset count: {creation_form.fields["role"].queryset.count()}')
        else:
            self.stdout.write(
                self.style.ERROR('✗ Role field does not exist in CustomUserCreationForm')
            )
        
        # Check if username field exists
        if 'username' in creation_form.fields:
            self.stdout.write(
                self.style.SUCCESS('✓ Username field exists in CustomUserCreationForm')
            )
            self.stdout.write(f'  - Field type: {type(creation_form.fields["username"])}')
            self.stdout.write(f'  - Required: {creation_form.fields["username"].required}')
        else:
            self.stdout.write(
                self.style.ERROR('✗ Username field does not exist in CustomUserCreationForm')
            )
        
        self.stdout.write('')
        self.stdout.write('Testing CustomUserEditForm...')
        
        # Test CustomUserEditForm
        edit_form = CustomUserEditForm()
        self.stdout.write(f'CustomUserEditForm fields count: {len(edit_form.fields)}')
        self.stdout.write('CustomUserEditForm field names: ' + ', '.join(edit_form.fields.keys()))
        
        # Check if role field exists
        if 'role' in edit_form.fields:
            self.stdout.write(
                self.style.SUCCESS('✓ Role field exists in CustomUserEditForm')
            )
            self.stdout.write(f'  - Field type: {type(edit_form.fields["role"])}')
            self.stdout.write(f'  - Required: {edit_form.fields["role"].required}')
            self.stdout.write(f'  - Role queryset count: {edit_form.fields["role"].queryset.count()}')
        else:
            self.stdout.write(
                self.style.ERROR('✗ Role field does not exist in CustomUserEditForm')
            )
        
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS('Form testing completed!')
        )