// Custom JavaScript for AGHAMazing Quest CMS Wagtail admin customization

document.addEventListener('DOMContentLoaded', function() {
    // Update the site name in the header
    const sitenameElements = document.querySelectorAll('.w-sitename');
    sitenameElements.forEach(function(el) {
        el.textContent = 'AGHAMazing Quest CMS';
    });
    
    // Update the site description if it exists
    const siteDescriptionElements = document.querySelectorAll('.w-header__desc');
    siteDescriptionElements.forEach(function(el) {
        el.textContent = 'DOST-STII Content Management System';
    });
    
    // Remove any existing branding text to avoid duplication
    const existingBranding = document.querySelector('.agh-branding-text');
    if (existingBranding) {
        existingBranding.remove();
    }
    
    // Add custom branding to the footer only if it doesn't already exist
    const footer = document.querySelector('footer') || document.querySelector('.w-footer');
    if (footer && !existingBranding) {
        const brandingText = document.createElement('div');
        brandingText.className = 'agh-branding-text';
        brandingText.textContent = 'AGHAMazing Quest CMS - Powered by DOST-STII';
        brandingText.style.textAlign = 'center';
        brandingText.style.marginTop = '10px';
        brandingText.style.paddingTop = '10px';
        brandingText.style.borderTop = '1px solid #1E1E1E';
        footer.appendChild(brandingText);
    }
    
    // Add custom logo if it doesn't already exist
    const headerLogo = document.querySelector('.w-header__logo');
    if (headerLogo) {
        // Create a pseudo-element like approach using an img tag
        const logoImg = document.createElement('img');
        logoImg.src = '/static/images/dost-stii-logo.png'; // Placeholder for the actual logo
        logoImg.alt = 'DOST-STII Logo';
        logoImg.style.height = '40px';
        logoImg.style.marginRight = '10px';
        logoImg.style.verticalAlign = 'middle';
        
        // Insert the logo at the beginning of the header
        headerLogo.insertBefore(logoImg, headerLogo.firstChild);
    }
    
    // Add ripple effect to buttons for STII branding
    const buttons = document.querySelectorAll('button, .button, input[type="submit"]');
    buttons.forEach(function(button) {
        button.classList.add('stii-branded-button');
    });
    
    // Customize the Wagtail "A fly in the web" text
    const wagtailBranding = document.querySelector('.version');
    if (wagtailBranding) {
        wagtailBranding.innerHTML = 'AGHAMazing Quest CMS v1.0<br><small>DOST-STII Edition</small>';
    }
});