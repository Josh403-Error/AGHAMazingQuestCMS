from django.urls import reverse
from django.utils.html import format_html
from wagtail import hooks
from wagtail.admin.menu import MenuItem
from django.shortcuts import redirect
from django.urls import path
from apps.contentmanagement.views import custom_dashboard




def modify_main_menu(request, menu_items, all_permissions=None):
    """
    Customizes the main admin menu with organized structure
    """
    # Remove some default items to organize better
    filtered_menu_items = []
    for item in menu_items:
        # Keep important items, organize others differently
        if item.name not in ['settings', 'reports']:  # Remove or reorganize these
            filtered_menu_items.append(item)
    
    # Add custom menu items in organized sections
    content_menu = MenuItem(
        'Content Management',
        reverse('wagtailadmin_explore_root'),
        name='content',
        icon_name='folder-open-inverse',
        order=100
    )
    
    filtered_menu_items.append(content_menu)
    
    # The analytics dashboard is properly registered in the analyticsmanagement app
    
    # Replace the original menu items
    menu_items[:] = filtered_menu_items


hooks.register('construct_main_menu', modify_main_menu)


@hooks.register('insert_global_admin_css')
def global_admin_css():
    return format_html('<link rel="stylesheet" href="{}">', '/static/css/admin/custom-admin.css')


@hooks.register('insert_global_admin_js')
def global_admin_js():
    return format_html('<script src="{}"></script>', '/static/js/custom-admin.js')