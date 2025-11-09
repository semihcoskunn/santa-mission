class ProfileManager {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        this.createSnowfall();
        this.setupLoginButton();
        this.checkUserStatus();
    }

    setupLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (!this.user) {
                    window.location.href = 'index.html';
                }
            });
        }
    }

    async checkUserStatus() {
        try {
            const response = await fetch('http://localhost:3000/api/user', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.user = data.user;
                    this.updateProfile();
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.log('Backend bağlantısı yok');
            window.location.href = 'index.html';
        }
    }

    updateProfile() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        
        if (loginBtn && userMenu) {
            loginBtn.textContent = this.user.name;
            loginBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            
            document.getElementById('userAvatar').src = this.user.photo;
            document.getElementById('userName').textContent = this.user.name;
            document.getElementById('userEmail').textContent = this.user.email;
            
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
                alert('Bildirimler yakında!');
            };
            
            document.getElementById('settingsBtn').onclick = (e) => {
                e.preventDefault();
                alert('Ayarlar yakında!');
            };
            
            document.getElementById('logoutBtn').onclick = (e) => {
                e.preventDefault();
                if (confirm('Çıkış yapmak istiyor musunuz?')) {
                    window.location.href = 'http://localhost:3000/logout';
                }
            };
        }

        // Profil bilgilerini doldur
        document.getElementById('profileAvatarLarge').style.backgroundImage = `url(${this.user.photo})`;
        document.getElementById('profileName').textContent = this.user.name;
        document.getElementById('profileEmail').textContent = this.user.email;

        // İstatistikleri yükle
        this.loadStats();
    }

    async loadStats() {
        try {
            // Backend'den istatistikleri yükle
            const response = await fetch('http://localhost:3000/api/user', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    document.getElementById('totalScore').textContent = data.user.total_score || 0;
                    document.getElementById('totalStreak').textContent = data.user.max_streak || 0;
                }
            }
            
            // Sıralamayı yükle
            const rankResponse = await fetch('http://localhost:3000/api/my-rank', {
                credentials: 'include'
            });
            
            if (rankResponse.ok) {
                const rankData = await rankResponse.json();
                if (rankData.success && rankData.rank) {
                    document.getElementById('userRank').textContent = `#${rankData.rank.rank}`;
                } else {
                    document.getElementById('userRank').textContent = '#-';
                }
            }
        } catch (error) {
            console.error('Stats yüklenemedi:', error);
            document.getElementById('totalScore').textContent = '0';
            document.getElementById('totalStreak').textContent = '0';
            document.getElementById('userRank').textContent = '#-';
        }
    }

    createSnowfall() {
        const snowfall = document.querySelector('.snowfall');
        const snowflakeCount = 120;
        const snowflakeTypes = ['❄', '❅', '✻', '✼', '❆'];

        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.innerHTML = snowflakeTypes[Math.floor(Math.random() * snowflakeTypes.length)];
            
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = Math.random() * 8 + 6 + 's';
            snowflake.style.animationDelay = Math.random() * 5 + 's';
            snowflake.style.fontSize = Math.random() * 20 + 15 + 'px';
            snowflake.style.opacity = Math.random() * 0.9 + 0.3;
            
            if (Math.random() > 0.7) {
                snowflake.style.filter = 'blur(1px)';
            }
            
            snowfall.appendChild(snowflake);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
