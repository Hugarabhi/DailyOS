/**
 * This script handles all interactive functionality for the DailyOS dashboard,
 * including dynamic content loading via iframes and navigation state management.
 */

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentContainer = document.getElementById('content-container');

    // Function to update the content based on the data-embed attribute
    function updateContent(embedPage) {
        // Clear the container
        contentContainer.innerHTML = '';

        // Create the iframe
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', 'about:blank'); // Use about:blank to avoid security errors
        iframe.setAttribute('frameborder', '0');
        iframe.className = 'embed-frame';

        // Write content into the iframe's document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Determine the content to embed based on the data attribute
        let embedContent = '';
        switch (embedPage) {
            case 'home':
                embedContent = '<h2>Welcome to DailyOS</h2><p>Your modern financial management system. Select a link from the menu to get started!</p>';
                break;
            case 'dashboard':
                embedContent = '<h2>Dashboard</h2><p>This is your dashboard, now embedded as a separate page.</p>';
                break;
            case 'goals':
                embedContent = '<h2>Personal Goals</h2><p>Here are your financial goals.</p>';
                break;
            case 'tasks':
                embedContent = '<h2>To-Do List</h2><p>Your tasks and reminders.</p>';
                break;
            case 'transactions':
                embedContent = '<h2>Transactions</h2><p>A list of your financial transactions.</p>';
                break;
            case 'analytics':
                embedContent = '<h2>Analytics</h2><p>Detailed financial analytics.</p>';
                break;
            case 'settings':
                embedContent = '<h2>Settings</h2><p>App and profile settings.</p>';
                break;
            case 'about':
                embedContent = '<h2>About Us</h2><p>Learn more about DailyOS.</p>';
                break;
            default:
                embedContent = '<h2>Page not found</h2><p>Please select a valid page from the menu.</p>';
                break;
        }

        // Write the HTML to the iframe
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <style>
                    body {
                        background: transparent;
                        color: white;
                        font-family: sans-serif;
                        padding: 2rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        text-align: center;
                    }
                    h2 {
                        font-size: 2rem;
                        font-weight: bold;
                        margin-bottom: 0.5rem;
                    }
                    p {
                        font-size: 1rem;
                        color: rgba(255, 255, 255, 0.5);
                    }
                </style>
            </head>
            <body>
                <div class="content">
                    ${embedContent}
                </div>
            </body>
            </html>
        `);
        iframeDoc.close();
        
        // Append the new iframe to the container
        contentContainer.appendChild(iframe);
    }

    // Set up click event listeners for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the data-embed value from the clicked link
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
    updateContent('home');
});
