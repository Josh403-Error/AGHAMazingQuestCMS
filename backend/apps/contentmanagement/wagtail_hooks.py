# Custom hooks to customize Wagtail admin for AGHAMazing Quest CMS
from django.templatetags.static import static
from django.utils.html import format_html
from wagtail import hooks


@hooks.register('insert_global_admin_css')
def global_admin_css():
    """Add custom CSS to the Wagtail admin interface"""
    return format_html('<link rel="stylesheet" href="{}">', static('css/custom-admin.css'))


@hooks.register('insert_global_admin_js')
def global_admin_js():
    """Add custom JavaScript to the Wagtail admin interface"""
    return format_html('<script src="{}"></script>', static('js/custom-admin.js'))


@hooks.register('construct_main_menu')
def modify_content_management_menu(request, menu_items, all_permissions=None):
    """Modify menu items to reflect AGHAMazing Quest CMS branding"""
    # You can customize menu items here if needed
    pass


@hooks.register('construct_homepage')
def modify_homepage_panels(request, panels):
    """Modify homepage panels to reflect AGHAMazing Quest CMS branding"""
    for panel in panels:
        # You can customize homepage panels here if needed
        pass


# Custom branding JavaScript
@hooks.register('insert_editor_js')
def editor_js():
    """Add custom JavaScript to the page editor"""
    return format_html('<script src="{}"></script>', static('js/custom-admin.js'))