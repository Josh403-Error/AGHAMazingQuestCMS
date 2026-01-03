from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Role


class RoleForm(forms.ModelForm):
    """Custom form to handle role assignment during user creation."""
    
    class Meta:
        model = User
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ensure the role field is required and populated with available roles
        if 'role' in self.fields:
            self.fields['role'].required = True
            # Order roles by name for better UX
            self.fields['role'].queryset = Role.objects.all().order_by('name')


class CustomUserCreationForm(UserCreationForm):
    """Custom user creation form that includes role field."""
    
    role = forms.ModelChoiceField(queryset=Role.objects.all().order_by('name'), required=True)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'role')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make email required in the creation form
        self.fields['email'].required = True


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = RoleForm
    add_form = CustomUserCreationForm
    
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active', 'role', 'created_at')
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'avatar_url')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Role', {'fields': ('role',)}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    ordering = ('email',)