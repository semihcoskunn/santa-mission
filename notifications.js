const user = getCurrentUser();
if (!user) {
    window.location.href = 'index.html';
}

// Load notifications from API
async function loadNotifications() {
    try {
        const response = await fetch(`https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod/notifications?userId=${user.userId}`);
        let data = await response.json();
        
        if (data.body) {
            data = JSON.parse(data.body);
        }
        
        if (data.success && data.notifications && data.notifications.length > 0) {
            const notificationsList = document.getElementById('notificationsList');
            notificationsList.innerHTML = '';
            
            data.notifications.forEach(notif => {
                const timeAgo = getTimeAgo(notif.timestamp);
                const icon = getNotificationIcon(notif.type);
                const badge = notif.read ? '' : '<span class="notification-badge">YENİ</span>';
                
                const item = document.createElement('div');
                item.className = 'notification-item';
                item.innerHTML = `
                    <div class="notification-icon">${icon}</div>
                    <div class="notification-content">
                        <h3>${notif.title} ${badge}</h3>
                        <p>${notif.message}</p>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                    <button class="delete-btn" onclick="deleteNotification('${notif.userID}', ${notif.timestamp})">🗑️</button>
                `;
                notificationsList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Notifications load error:', error);
    }
}

function getNotificationIcon(type) {
    const icons = {
        welcome: '🎉',
        quest: '🏆',
        leaderboard: '⭐',
        achievement: '🎁',
        system: '🔔'
    };
    return icons[type] || '🔔';
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
}

async function deleteNotification(userId, timestamp) {
    try {
        const response = await fetch('https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod/notifications', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, timestamp })
        });
        let data = await response.json();
        if (data.body) data = JSON.parse(data.body);
        if (data.success) loadNotifications();
    } catch (error) {
        console.error('Delete error:', error);
    }
}

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

loadNotifications();
