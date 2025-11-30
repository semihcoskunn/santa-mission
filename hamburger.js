// Hamburger Menu
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const closeMenu = document.getElementById('closeMenu');
    
    if (hamburgerBtn && hamburgerMenu && closeMenu) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerMenu.classList.add('active');
        });
        
        closeMenu.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!hamburgerMenu.contains(e.target) && e.target !== hamburgerBtn) {
                hamburgerMenu.classList.remove('active');
            }
        });
    }
});
