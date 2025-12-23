# Wagtail Admin Customization for AGHAMazing Quest CMS

This document explains how the Wagtail admin interface has been customized to reflect the DOST-STII branding.

## Branding Implementation

The Wagtail admin interface has been customized with the following DOST-STII brand elements:

### Colors (from STII_BRAND_GUIDE_2021_Version_1)
- Yale Blue: `#004A98` (Primary color)
- White: `#FFFFFF` (Secondary color)
- Red Pigment: `#ED262A` (Accent color)
- Eerie Black: `#1E1E1E` (Dark text)

### Customization Files

1. **CSS File**: `/backend/static/css/custom-admin.css`
   - Custom styles for the Wagtail admin interface
   - Implements the DOST-STII color scheme
   - Customizes headers, buttons, forms, and navigation

2. **JavaScript File**: `/backend/static/js/custom-admin.js`
   - Dynamically updates site name and branding
   - Adds custom elements to the footer
   - Handles custom logo implementation

3. **Wagtail Hooks**:
   - `/backend/apps/contentmanagement/wagtail_hooks.py`
   - `/backend/apps/branding/wagtail_hooks.py`
   - Register custom CSS and JS files
   - Customize menu items and interface elements

## Logo Implementation

The customization references two logos that should be placed in `/backend/static/images/`:
- `dost-stii-logo.png` - DOST-STII logo
- `apcseal.png` - APC seal

To add the logos:
1. Place the logo files in `/backend/static/images/`
2. Ensure they are named as referenced in the CSS: `dost-stii-logo.png`
3. Restart the Django server to see the changes

## Adding the Logos

To properly implement the logos, follow these steps:

1. Obtain the DOST-STII logo and APC seal images
2. Place them in the `/backend/static/images/` directory
3. Name them appropriately:
   - DOST-STII logo: `dost-stii-logo.png`
4. Ensure the images are in PNG format with transparent backgrounds for best results

## Custom Menu Item

The customization adds a "AGHAMazing Quest CMS" menu item to the Wagtail admin interface.

## Typography

The customization implements fonts recommended in the brand guide:
- Primary: Gotham (if available)
- Alternative: Montserrat
- Fallback: Arial

## Testing the Customization

To see the customization:
1. Ensure the branding app is added to `INSTALLED_APPS` in settings
2. Place your logo files in the static directory
3. Run the Django development server
4. Navigate to the Wagtail admin interface (typically at `/admin/`)

## Troubleshooting

If the customizations don't appear:
1. Verify that the branding app is in `INSTALLED_APPS`
2. Check that static files are properly collected (`python manage.py collectstatic`)
3. Ensure the static files are accessible
4. Clear browser cache to see CSS changes
5. Check browser console for JavaScript errors