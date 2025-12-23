from django.db.models.signals import post_save
from django.dispatch import receiver
from wagtail.models import Page
from .models import PageView


# This signal handler would track page views automatically
# We would need to implement middleware to trigger this
def track_page_view(request, page):
    """
    Helper function to track page views
    This would be called from appropriate views or middleware
    """
    if request.user.is_authenticated:
        user = request.user
    else:
        user = None
        
    PageView.objects.create(
        page=page,
        user=user,
        session_key=request.session.session_key or '',
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
    )


def get_client_ip(request):
    """
    Helper function to get client IP address
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip