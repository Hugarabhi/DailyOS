document.addEventListener('DOMContentLoaded', function() {
            const navLinks = document.querySelectorAll('.nav-links a');
            const embedContainer = document.querySelector('.embed-container');
            
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all links
                    navLinks.forEach(l => l.classList.remove('active'));
                    
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Get the URL to embed
                    const embedUrl = this.getAttribute('data-embed');
                    
                    // Create iframe
                    const iframe = document.createElement('iframe');
                    iframe.setAttribute('src', embedUrl);
                    iframe.setAttribute('frameborder', '0');
                    iframe.className = 'embed-frame';
                    
                    // Clear container and add iframe
                    embedContainer.innerHTML = '';
                    embedContainer.appendChild(iframe);
                });
            });
        });