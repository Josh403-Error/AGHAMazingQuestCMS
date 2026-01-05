from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class APIIntegration(models.Model):
    """
    Model to manage API integrations for external applications like mobile apps
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Name of the integration (e.g. 'AR Mobile App')")
    description = models.TextField(blank=True, null=True, help_text="Description of the integration")
    api_key = models.CharField(max_length=255, unique=True, help_text="Unique API key for authentication")
    is_active = models.BooleanField(default=True, help_text="Whether this integration is active")
    allowed_endpoints = models.TextField(
        blank=True, 
        help_text="Comma-separated list of allowed endpoints (leave empty for all)"
    )
    ip_whitelist = models.TextField(
        blank=True, 
        help_text="Comma-separated list of allowed IP addresses (leave empty for no restrictions)"
    )
    rate_limit = models.IntegerField(
        default=1000, 
        help_text="Number of requests allowed per hour"
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_integrations'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.api_key:  # Generate API key if not provided
            import secrets
            self.api_key = secrets.token_urlsafe(32)
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'api_integration'
        verbose_name = 'API Integration'
        verbose_name_plural = 'API Integrations'


class APIIntegrationLog(models.Model):
    """
    Model to log API integration requests for monitoring and analytics
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    integration = models.ForeignKey(
        APIIntegration, 
        on_delete=models.CASCADE,
        related_name='logs'
    )
    endpoint = models.CharField(max_length=255, help_text="The endpoint that was accessed")
    method = models.CharField(max_length=10, help_text="HTTP method used")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    response_status = models.IntegerField(help_text="HTTP response status code")
    request_time = models.DateTimeField(default=timezone.now)
    response_time = models.FloatField(help_text="Response time in seconds", default=0.0)

    class Meta:
        db_table = 'api_integration_log'
        verbose_name = 'API Integration Log'
        verbose_name_plural = 'API Integration Logs'
        ordering = ['-request_time']