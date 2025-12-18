from django.contrib import admin
from .models import Content


@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
	list_display = ('title', 'status', 'author', 'created_at')
	search_fields = ('title', 'body')
	list_filter = ('status', 'created_at')