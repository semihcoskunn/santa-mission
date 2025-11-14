const user = getCurrentUser();
if (!user) {
    window.location.href = 'index.html';
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('santa_settings') || '{}');
    
    document.getElementById('notificationsToggle').checked = settings.notifications !== false;
    document.getElementById('soundToggle').checked = settings.sound !== false;
    document.getElementById('snowToggle').checked = settings.snow !== false;
    document.getElementById('darkModeToggle').checked = settings.darkMode === true;
    document.getElementById('autoStartToggle').checked = settings.autoStart === true;
    
    applySettings(settings);
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        notifications: document.getElementById('notificationsToggle').checked,
        sound: document.getElementById('soundToggle').checked,
        snow: document.getElementById('snowToggle').checked,
        darkMode: document.getElementById('darkModeToggle').checked,
        autoStart: document.getElementById('autoStartToggle').checked
    };
    
    localStorage.setItem('santa_settings', JSON.stringify(settings));
    applySettings(settings);
}

// Apply settings
function applySettings(settings) {
    // Snow effect
    const snowfall = document.querySelector('.snowfall');
    if (snowfall) {
        snowfall.style.display = settings.snow !== false ? 'block' : 'none';
    }
    
    // Dark mode
    if (settings.darkMode) {
        document.body.style.filter = 'invert(0.9) hue-rotate(180deg)';
    } else {
        document.body.style.filter = 'none';
    }
}

// Add event listeners
document.getElementById('notificationsToggle').addEventListener('change', saveSettings);
document.getElementById('soundToggle').addEventListener('change', saveSettings);
document.getElementById('snowToggle').addEventListener('change', saveSettings);
document.getElementById('darkModeToggle').addEventListener('change', saveSettings);
document.getElementById('autoStartToggle').addEventListener('change', saveSettings);

// Update login button and setup menu
const loginBtn = document.getElementById('loginBtn');
const userMenu = document.getElementById('userMenu');
if (loginBtn && userMenu && user) {
    const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name;
    loginBtn.textContent = fullName;
    loginBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
    
    document.getElementById('userAvatar').src = user.photo;
    document.getElementById('userName').textContent = fullName;
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
        window.location.href = 'profile.html';
    };
    
    document.getElementById('notificationsBtn').onclick = (e) => {
        e.preventDefault();
        window.location.href = 'notifications.html';
    };
    
    document.getElementById('settingsBtn').onclick = (e) => {
        e.preventDefault();
        window.location.href = 'settings.html';
    };
    
    document.getElementById('logoutBtn').onclick = (e) => {
        e.preventDefault();
        if (confirm('Çıkış yapmak istiyor musunuz?')) {
            logout();
        }
    };
}

// Snowfall
const snowfall = document.querySelector('.snowfall');
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

loadSettings();
