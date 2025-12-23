from django.utils.deprecation import MiddlewareMixin
from django.urls import resolve
from wagtail.models import Page
from .models import PageView
from .signals import track_page_view, get_client_ip


class AnalyticsMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # Only track successful responses
        if response.status_code == 200:
            # Check if this is a Wagtail page
            try:
                # Get the current resolver match
                resolver_match = resolve(request.path_info)
                
                # Check if it's a Wagtail serving view
                if resolver_match.url_name in ['wagtail_serve', 'wagtailadmin_home']:
                    # Get the page if possible
                    page = getattr(request, 'current_page', None)
                    if page:
                        track_page_view(request, page)
                        
            except:
                # If path doesn't resolve, continue without tracking
                pass
                
        return response