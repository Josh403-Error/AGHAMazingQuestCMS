from django.db import models
from django.contrib.auth import get_user_model
from wagtail.admin.panels import FieldPanel
from wagtail.models import Page
from wagtail.fields import RichTextField
import json

User = get_user_model()


class AnalyticsDashboardPage(Page):
    """
    A custom Wagtail page to display analytics dashboard with charts
    """
    intro = models.CharField(
        max_length=255,
        blank=True,
        help_text="Introductory text for the analytics dashboard"
    )
    
    content = RichTextField(
        blank=True,
        help_text="Additional content for the analytics dashboard"
    )
    
    content_panels = Page.content_panels + [
        FieldPanel('intro'),
        FieldPanel('content'),
    ]
    
    # Explicitly set the page to be a singleton
    max_count = 1

    def get_context(self, request):
        context = super().get_context(request)
        
        # Get analytics data
        from .views import get_analytics_data
        context['analytics_data'] = get_analytics_data()
        
        return context


class PageView(models.Model):
    """
    Model to track page views and interactions
    """
    page = models.ForeignKey('wagtailcore.Page', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_key = models.CharField(max_length=40, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Page View"
        verbose_name_plural = "Page Views"
        ordering = ['-timestamp']
        
    def __str__(self):
        page_title = self.page.title if self.page else "Unknown Page"
        return f"View of {page_title} at {self.timestamp}"


class ContentInteraction(models.Model):
    """
    Model to track user interactions with content
    """
    CONTENT_TYPES = [
        ('page', 'Page'),
        ('document', 'Document'),
        ('image', 'Image'),
        ('form_submission', 'Form Submission'),
    ]
    
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    content_id = models.PositiveIntegerField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50, help_text="Action performed (view, download, submit, etc.)")
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        verbose_name = "Content Interaction"
        verbose_name_plural = "Content Interactions"
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.action} on {self.content_type} {self.content_id}"


class UserActivity(models.Model):
    """
    Model to track user activities
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict, blank=True)
    
    class Meta:
        verbose_name = "User Activity"
        verbose_name_plural = "User Activities"
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.timestamp}"