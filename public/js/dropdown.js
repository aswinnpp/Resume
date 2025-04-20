// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dropdowns');
    
    // Get all dropdown toggles
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    console.log('Found dropdown toggles:', dropdownToggles.length);
    
    // Initialize each dropdown toggle
    dropdownToggles.forEach(function(toggle) {
        console.log('Initializing dropdown for:', toggle.id);
        
        // Create a new Bootstrap dropdown instance
        const dropdown = new bootstrap.Dropdown(toggle, {
            autoClose: true
        });
        
        // Add click event to the toggle
        toggle.addEventListener('click', function(e) {
            console.log('Dropdown toggle clicked');
            e.preventDefault();
            dropdown.toggle();
        });
    });
    
    // Handle logout link specifically
    const logoutLink = document.querySelector('a[href="/logout"]');
    if (logoutLink) {
        console.log('Logout link found');
        logoutLink.addEventListener('click', function(e) {
            console.log('Logout link clicked');
            // Don't prevent default - let the link work normally
        });
    } else {
        console.log('Logout link not found');
    }
}); 