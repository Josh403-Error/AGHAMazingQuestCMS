"""
Unified URL configuration for the headless CMS
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.documents import urls as wagtaildocs_urls
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # Wagtail Admin
    path('cms/', include(wagtailadmin_urls)),
    path('documents/', include(wagtaildocs_urls)),
    
    # Core app URLs
    path('api/auth/', include('apps.authentication.urls')),
    path('api/content/', include('apps.contentmanagement.urls')),
    path('api/users/', include('apps.usermanagement.urls')),
    path('api/analytics/', include('apps.analyticsmanagement.urls')),
    
    # Include Wagtail patterns at the end to catch all other routes
    path('', include(wagtail_urls)),
]

# Serve static and media files in development
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)