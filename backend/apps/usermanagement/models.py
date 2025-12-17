from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db.models import Q


class BaseEntity(models.Model):
    """
    Base entity with UUID primary key, timestamps, and soft delete support
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def soft_delete(self):
        """Soft delete the entity"""
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """Restore a soft deleted entity"""
        self.deleted_at = None
        self.save()

    def is_deleted(self):
        """Check if entity is soft deleted"""
        return self.deleted_at is not None


class Role(BaseEntity):
    """
    Role model with permissions
    """
    name = models.CharField(max_length=45, unique=True)
    description = models.TextField(blank=True, null=True)
    permissions = models.JSONField(default=list)

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(name__regex=r'^[a-z_]+$'),
                name='role_name_valid_characters'
            )
        ]


class User(BaseEntity):
    """
    Custom user model with extended fields
    """
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(max_length=45, unique=True)
    password_hash = models.TextField()
    first_name = models.CharField(max_length=45)
    last_name = models.CharField(max_length=45)
    avatar_url = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict)
    last_login_at = models.DateTimeField(blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.RESTRICT)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(email__regex=r'^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$'),
                name='user_email_valid_format'
            ),
            models.CheckConstraint(
                condition=Q(username__regex=r'^[a-z0-9_]{3,45}$'),
                name='user_username_valid_format'
            )
        ]