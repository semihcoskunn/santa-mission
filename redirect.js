// Redirect .html URLs to clean URLs
(function() {
    const path = window.location.pathname;
    
    // If URL ends with .html, remove it
    if (path.endsWith('.html')) {
        const cleanPath = path.replace('.html', '');
        // Special case: /index should redirect to /
        if (cleanPath === '/index') {
            window.location.replace('/' + window.location.search + window.location.hash);
        } else {
            window.location.replace(cleanPath + window.location.search + window.location.hash);
        }
    }
    // If URL is /index (without .html), redirect to /
    else if (path === '/index') {
        window.location.replace('/' + window.location.search + window.location.hash);
    }
})();
