/**
 * This script handles all interactive functionality for the DailyOS dashboard,
 * including dynamic content loading via iframes and navigation state management.
 */

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentContainer = document.getElementById('content-container');

    /**
     * Updates the main content area with an iframe containing the specified page.
     * @param {string} embedPage - The file path or identifier for the page to embed.
     */
    function updateContent(embedPage) {
        // Clear the container to remove any previous iframe
        contentContainer.innerHTML = '';

        // Create the iframe
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', embedPage);
        iframe.setAttribute('frameborder', '0');
        iframe.className = 'embed-frame';

        // Append the new iframe to the container
        contentContainer.appendChild(iframe);
    }

    // Set up click event listeners for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the data-embed value (e.g., "home.html")
            const embedPage = this.getAttribute('data-embed');
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to the clicked link
            this.classList.add('active');
            
            // Update the content
            updateContent(embedPage);
        });
    });

    // Load the initial 'home' content on page load
    updateContent('home.html');
});
