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
        brandingText.style.color = '#ccc';
        brandingText.style.fontSize = '0.9em';
        footer.appendChild(brandingText);
    }
    
    // Add custom logo if it doesn't already exist
    const headerLogo = document.querySelector('.w-header__logo');
    if (headerLogo) {
        // Check if logo already exists
        const existingLogo = headerLogo.querySelector('.agh-logo');
        if (!existingLogo) {
            // Create a pseudo-element like approach using an img tag
            const logoImg = document.createElement('img');
            logoImg.src = '/static/images/dost-stii-logo.png'; // Placeholder for the actual logo
            logoImg.alt = 'DOST-STII Logo';
            logoImg.style.height = '40px';
            logoImg.style.marginRight = '10px';
            logoImg.style.verticalAlign = 'middle';
            logoImg.className = 'agh-logo';
            
            // Check if image loads properly, if not, remove it
            logoImg.onerror = function() {
                this.remove();
            };
            
            // Insert the logo at the beginning of the header
            headerLogo.insertBefore(logoImg, headerLogo.firstChild);
        }
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
    
    // Add loading states to important buttons
    const importantButtons = document.querySelectorAll('.button, .c-button, .w-button');
    importantButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Add loading state if the form is being submitted
            if (this.closest('form')) {
                this.classList.add('loading');
                this.setAttribute('disabled', 'disabled');
                
                // Remove loading after a delay or when page changes
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.removeAttribute('disabled');
                }, 3000); // Remove after 3 seconds max
            }
        });
    });
    
    // Add tooltips to action buttons if title attribute is present
    const actionButtons = document.querySelectorAll('[title]');
    actionButtons.forEach(function(btn) {
        // Add basic tooltip functionality
        btn.addEventListener('mouseenter', function() {
            // Create tooltip if not exists
            if (!this.querySelector('.tooltip')) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.title;
                tooltip.style.position = 'absolute';
                tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '5px 10px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.fontSize = '12px';
                tooltip.style.zIndex = '1000';
                tooltip.style.whiteSpace = 'nowrap';
                tooltip.style.top = 'calc(100% + 5px)';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.display = 'none';
                
                this.appendChild(tooltip);
                
                // Show tooltip
                setTimeout(() => {
                    tooltip.style.display = 'block';
                }, 10);
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
    
    // Add keyboard shortcuts for common actions
    document.addEventListener('keydown', function(e) {
        // Only trigger shortcuts if not in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Alt + C to create content
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            const createContentBtn = document.querySelector('.action-btn[href*="add_subpage"]');
            if (createContentBtn) {
                createContentBtn.click();
            }
        }
        
        // Alt + B to browse content
        if (e.altKey && e.key === 'b') {
            e.preventDefault();
            const browseContentBtn = document.querySelector('.action-btn[href*="explore"]');
            if (browseContentBtn) {
                browseContentBtn.click();
            }
        }
    });
});