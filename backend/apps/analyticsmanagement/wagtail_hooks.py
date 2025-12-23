from django.urls import reverse
from django.utils.html import format_html
from wagtail import hooks
from wagtail.admin.menu import MenuItem
from .admin_views import AnalyticsDashboardView


@hooks.register('register_admin_menu_item')
def register_analytics_menu_item():
    return MenuItem(
        'Analytics Dashboard',
        reverse('analyticsmanagement:analytics_dashboard'),
        classname='icon icon-chart',
        order=1000  # Place it at the end of the menu
    )


# Add custom CSS to style the analytics dashboard
@hooks.register('insert_global_admin_css')
def global_admin_css():
    return format_html('<link rel="stylesheet" href="{}">', '/static/css/analytics-admin.css')


# Add custom JavaScript for charts
@hooks.register('insert_global_admin_js')
def global_admin_js():
    return format_html('<script src="{}"></script>', 
                      'https://cdn.jsdelivr.net/npm/chart.js')