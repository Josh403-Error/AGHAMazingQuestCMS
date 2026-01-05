from django.contrib import admin
from .models import PageView, ContentInteraction, UserActivity, AnalyticsDashboardPage


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ('page', 'user', 'timestamp', 'ip_address')
    list_filter = ('timestamp', 'page')
    search_fields = ('ip_address', 'user__username')
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        (None, {
            'fields': ('page', 'user', 'session_key')
        }),
        ('Request Information', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('Timestamp', {
            'fields': ('timestamp',)
        }),
    )


@admin.register(ContentInteraction)
class ContentInteractionAdmin(admin.ModelAdmin):
    list_display = ('content_type', 'content_id', 'user', 'action', 'timestamp')
    list_filter = ('content_type', 'action', 'timestamp')
    search_fields = ('content_type', 'action', 'user__username')
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        (None, {
            'fields': ('content_type', 'content_id', 'action')
        }),
        ('User', {
            'fields': ('user',)
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
        ('Timestamp', {
            'fields': ('timestamp',)
        }),
    )


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp')
    list_filter = ('action', 'timestamp', 'user__username')
    search_fields = ('action', 'user__username', 'user__email')
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        (None, {
            'fields': ('user', 'action')
        }),
        ('Details', {
            'fields': ('details',)
        }),
        ('Timestamp', {
            'fields': ('timestamp',)
        }),
    )


@admin.register(AnalyticsDashboardPage)
class AnalyticsDashboardPageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'first_published_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'slug')  # Removed 'live' and 'has_unpublished_changes' as they're managed by Wagtail
        }),
        ('Content', {
            'fields': ('intro', 'content')
        }),
    )