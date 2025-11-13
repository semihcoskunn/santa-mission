// Common functions for all pages
function initPage() {
    checkUserStatus();
    createSnowfall();
}

function checkUserStatus() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (user && loginBtn) {
        loginBtn.textContent = user.name || user.username || 'User';
        loginBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        
        if (userMenu) {
            document.getElementById('userAvatar').src = user.photo;
            document.getElementById('userName').textContent = user.name || user.username;
            document.getElementById('userEmail').textContent = user.email;
            
            loginBtn.onclick = (e) => {
                e.stopPropagation();
                userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
            };
            
            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target) && e.target !== loginBtn) {
                    userMenu.style.display = 'none';
                }
            });
            
            document.getElementById('profileBtn').onclick = (e) => {
                e.preventDefault();
                window.location.href = '/profile';
            };
            
            document.getElementById('notificationsBtn').onclick = (e) => {
                e.preventDefault();
                window.location.href = '/notifications';
            };
            
            document.getElementById('settingsBtn').onclick = (e) => {
                e.preventDefault();
                window.location.href = '/settings';
            };
            
            document.getElementById('logoutBtn').onclick = (e) => {
                e.preventDefault();
                if (confirm('Çıkış yapmak istiyor musunuz?')) {
                    logout();
                }
            };
        }
    }
}

function createSnowfall() {
    const snowfall = document.querySelector('.snowfall');
    if (!snowfall) return;
    
    const snowflakeTypes = ['❄', '❅', '✻'];
    for (let i = 0; i < 80; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakeTypes[i % 3];
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = (Math.random() * 8 + 6) + 's';
        snowflake.style.animationDelay = '0s';
        snowflake.style.fontSize = (Math.random() * 10 + 15) + 'px';
        snowflake.style.opacity = Math.random() * 0.6 + 0.3;
        snowfall.appendChild(snowflake);
    }
}

document.addEventListener('DOMContentLoaded', initPage);
