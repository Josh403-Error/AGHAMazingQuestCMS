from django.contrib.auth import get_user_model
from django import forms
from .models import Role
from wagtail import hooks
from wagtail.users.forms import UserCreationForm, UserEditForm


class CustomUserCreationForm(UserCreationForm):
    """Custom user creation form that includes the role and username fields."""
    
    username = forms.CharField(max_length=45, required=True)
    role = forms.ModelChoiceField(queryset=Role.objects.all().order_by('name'), required=True)

    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = tuple(UserCreationForm.Meta.fields) + ('username', 'role')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class CustomUserEditForm(UserEditForm):
    """Custom user edit form that includes the role field."""
    
    role = forms.ModelChoiceField(queryset=Role.objects.all().order_by('name'), required=True)

    class Meta(UserEditForm.Meta):
        model = get_user_model()
        fields = tuple(UserEditForm.Meta.fields) + ('role',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


# Register the custom forms with Wagtail
@hooks.register('register_user_create_form')
def register_user_create_form():
    return CustomUserCreationForm


@hooks.register('register_user_edit_form')
def register_user_edit_form():
    return CustomUserEditForm