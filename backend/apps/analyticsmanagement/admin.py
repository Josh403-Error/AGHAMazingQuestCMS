from django.contrib import admin
from .models import Analytics


@admin.register(Analytics)
class AnalyticsAdmin(admin.ModelAdmin):
    list_display = ('metric_name', 'metric_type', 'user', 'content', 'timestamp')
    list_filter = ('metric_type', 'timestamp', 'created_at')
    search_fields = ('metric_name', 'metric_value')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('metric_name', 'metric_value', 'metric_type')
        }),
        ('Relationships', {
            'fields': ('user', 'content')
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
        ('Timestamps', {
            'fields': ('timestamp', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )