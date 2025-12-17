from django.contrib import admin
from .models_pg import Content, ContentCategory, ContentAnalytics, ContentApproval, MediaLibrary


@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'content_type', 'author', 'created_at')
    search_fields = ('title', 'body')
    list_filter = ('status', 'content_type', 'created_at')


@admin.register(ContentCategory)
class ContentCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name', 'description')


@admin.register(ContentAnalytics)
class ContentAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('view_count', 'engagement_score', 'conversion_rate', 'report_generated_at')
    list_filter = ('report_generated_at',)


@admin.register(ContentApproval)
class ContentApprovalAdmin(admin.ModelAdmin):
    list_display = ('content', 'approver', 'status', 'approved_at')
    list_filter = ('status', 'approved_at')


@admin.register(MediaLibrary)
class MediaLibraryAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'file_size', 'mime_type', 'uploader')
    search_fields = ('file_name', 'description')
    list_filter = ('mime_type', 'created_at')