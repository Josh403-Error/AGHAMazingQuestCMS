from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from apps.contentmanagement.models import Content


class Analytics(models.Model):
    """
    Analytics model to track various metrics for the CMS
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    metric_name = models.CharField(max_length=255)
    metric_value = models.TextField()
    metric_type = models.CharField(max_length=100, default='general')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='analytics_records'
    )
    content = models.ForeignKey(
        Content, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='analytics_records'
    )
    timestamp = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.metric_name}: {self.metric_value}"

    class Meta:
        db_table = 'analytics'
        verbose_name_plural = "Analytics"
        ordering = ['-timestamp']