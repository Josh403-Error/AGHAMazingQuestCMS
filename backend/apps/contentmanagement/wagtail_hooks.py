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


# Register the new models to be accessible in Wagtail admin
from wagtail.modeladmin.options import ModelAdmin, modeladmin_register
from .models import MediaLibrary, ContentCategory


class MediaLibraryAdmin(ModelAdmin):
    model = MediaLibrary
    menu_label = 'Media Library'
    menu_icon = 'image'  # change as needed
    add_to_settings_menu = False  # or True to add to Settings sub-menu
    exclude_from_explorer = False  # or True to exclude from navigation
    list_display = ('file_name', 'file_size', 'mime_type', 'uploader', 'created_at')
    list_filter = ('mime_type', 'created_at')
    search_fields = ('file_name', 'description')


class ContentCategoryAdmin(ModelAdmin):
    model = ContentCategory
    menu_label = 'Content Categories'
    menu_icon = 'folder-inverse'
    add_to_settings_menu = False
    exclude_from_explorer = False
    list_display = ('name', 'parent')
    list_filter = ('parent',)
    search_fields = ('name',)


# Now we register our custom model admins
modeladmin_register(MediaLibraryAdmin)
modeladmin_register(ContentCategoryAdmin)