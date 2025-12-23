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


@hooks.register('register_admin_menu_item')
def register_branding_menu_item():
    """Add a custom menu item for branding"""
    from wagtail.admin.menu import MenuItem
    from django.urls import reverse
    
    return MenuItem(
        'AGHAMazing Quest CMS',
        reverse('wagtailadmin_home'),
        classname='icon icon-cog',  # Changed from 'classnames' to 'classname'
        order=1000
    )


@hooks.register('construct_homepage')
def modify_homepage(request, context):
    """Modify the Wagtail admin homepage to reflect AGHAMazing Quest branding"""
    # Customize the homepage context here if needed
    pass


@hooks.register('insert_editor_css')
def editor_css():
    """Add custom CSS to the page editor interface"""
    return format_html('<link rel="stylesheet" href="{}">', static('css/custom-admin.css'))