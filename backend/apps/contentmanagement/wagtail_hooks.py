from wagtail import hooks
from wagtail.admin.menu import MenuItem
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import HomePage, MediaPage


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
        _('Content Management'),
        reverse('wagtailadmin_explore_root'),
        name='content',
        icon_name='folder-open-inverse',
        order=100
    )
    
    filtered_menu_items.append(content_menu)
    
    # The analytics dashboard is now properly registered in the analyticsmanagement app
    
    # Replace the original menu items
    menu_items[:] = filtered_menu_items


hooks.register('construct_main_menu', modify_main_menu)


# Since Wagtail 7.2.1 doesn't support modeladmin, we'll need to implement
# model management through Django admin or Wagtail's native page management
# For now, we'll just keep the menu customization hooks