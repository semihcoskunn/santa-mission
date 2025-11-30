// Hamburger Menu
(function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const closeMenu = document.getElementById('closeMenu');
    
    if (hamburgerBtn && hamburgerMenu) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerMenu.classList.toggle('active');
        });
        
        if (closeMenu) {
            closeMenu.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
            });
        }
        
        document.addEventListener('click', (e) => {
            if (!hamburgerMenu.contains(e.target) && e.target !== hamburgerBtn) {
                hamburgerMenu.classList.remove('active');
            }
        });
    }
})();
