function dropPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Brief timeout so you can see the animation spin once before dropping
        setTimeout(() => {
            preloader.classList.add('dropped');
        }, 600);
    }
}

// Safer check: If the document is already loaded, drop it immediately
if (document.readyState === 'complete') {
    dropPreloader();
} else {
    // Otherwise, wait for the load event
    window.addEventListener('load', dropPreloader);
}