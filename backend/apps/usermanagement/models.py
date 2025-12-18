from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

class Role(models.Model):
    """
    Custom Role model to match PostgreSQL schema
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=45, unique=True)
    description = models.TextField(blank=True, null=True)
    permissions = models.JSONField(default=list)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'role'

class User(AbstractUser):
    """
    Custom User model to match PostgreSQL schema
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=45, unique=True)
    password_hash = models.TextField()
    first_name = models.CharField(max_length=45)
    last_name = models.CharField(max_length=45)
    avatar_url = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict)
    last_login_at = models.DateTimeField(null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.RESTRICT, related_name='users')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'user'
