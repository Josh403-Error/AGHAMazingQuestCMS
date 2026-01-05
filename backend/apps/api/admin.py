from django.contrib import admin
from django.utils.html import format_html
from .models import APIIntegration, APIIntegrationLog


@admin.register(APIIntegration)
class APIIntegrationAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'masked_api_key', 
        'is_active', 
        'rate_limit', 
        'created_by', 
        'created_at'
    )
    list_filter = ('is_active', 'created_at', 'created_by')
    search_fields = ('name', 'description', 'api_key')
    readonly_fields = ('id', 'api_key', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('id', 'name', 'description')
        }),
        ('Authentication', {
            'fields': ('api_key', 'masked_api_key'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('is_active', 'allowed_endpoints', 'ip_whitelist', 'rate_limit')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def masked_api_key(self, obj):
        if obj.api_key:
            # Show only first 8 characters followed by dots
            return f"{obj.api_key[:8]}..." if len(obj.api_key) > 8 else obj.api_key
        return "-"
    masked_api_key.short_description = 'API Key (masked)'

    def get_readonly_fields(self, request, obj=None):
        # Make api_key read-only after creation
        if obj:  # Editing an existing object
            return self.readonly_fields
        # For new objects, don't include api_key in readonly fields
        # so it can be generated automatically
        return ('id', 'created_at', 'updated_at')


@admin.register(APIIntegrationLog)
class APIIntegrationLogAdmin(admin.ModelAdmin):
    list_display = (
        'integration', 
        'endpoint', 
        'method', 
        'response_status', 
        'request_time', 
        'response_time_formatted'
    )
    list_filter = (
        'integration', 
        'method', 
        'response_status', 
        'request_time'
    )
    search_fields = (
        'integration__name', 
        'endpoint', 
        'ip_address'
    )
    readonly_fields = (
        'integration', 
        'endpoint', 
        'method', 
        'ip_address', 
        'user_agent', 
        'response_status', 
        'request_time', 
        'response_time'
    )
    date_hierarchy = 'request_time'
    
    def response_time_formatted(self, obj):
        return f"{obj.response_time:.3f}s"
    response_time_formatted.short_description = 'Response Time'
    response_time_formatted.admin_order_field = 'response_time'