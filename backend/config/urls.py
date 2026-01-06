"""
Root URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls
from apps.contentmanagement import urls as content_urls
from apps.usermanagement import urls as user_urls
from apps.analyticsmanagement import urls as analytics_urls
from apps.api import urls as api_urls
from apps.contentmanagement.views import custom_dashboard

urlpatterns = [
    # Admin URLs
    path('django-admin/', admin.site.urls),
    
    # Authentication endpoints
    path('auth/', include('apps.authentication.urls')),
    
    # Custom API endpoints
    path('api/', include('apps.api.urls')),
    
    # Custom dashboard at /dashboard/
    path('dashboard/', custom_dashboard, name='custom_dashboard'),
    
    # Wagtail CMS admin interface
    path('cms/', include(wagtailadmin_urls)),
    
    # Document management
    path('documents/', include(wagtaildocs_urls)),
    
    # User management
    path('users/', include(user_urls)),
    
    # Analytics
    path('analytics/', include(analytics_urls)),
    
    # Content management
    path('content/', include(content_urls)),
    
    ]

# Only include the main Wagtail frontend URLs if needed for public-facing pages
# This avoids conflicts with the admin authentication
if getattr(settings, 'ENABLE_WAGTAIL_FRONTEND', False):
    urlpatterns += [
        # Include Wagtail frontend URLs at the end to avoid conflicts
        path('', include(wagtail_urls)),
    ]
else:
    # Add a default homepage if not using Wagtail frontend
    from django.views.generic.base import RedirectView
    urlpatterns += [
        path('', RedirectView.as_view(url='/cms/', permanent=True), name='home'),
    ]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Add debug toolbar URLs if in DEBUG mode
    if settings.DEBUG and 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns