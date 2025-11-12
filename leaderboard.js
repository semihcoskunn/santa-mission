class LeaderboardManager {
    constructor() {
        this.leaderboard = [];
        this.myRank = null;
        this.user = null;
        this.init();
    }

    async init() {
        this.createSnowfall();
        this.setupLoginButton();
        await this.checkUserStatus();
        await this.loadLeaderboard();
        await this.loadMyRank();
        
        // 5 dakikada bir güncelle
        setInterval(() => this.loadLeaderboard(), 5 * 60 * 1000);
    }
    
    setupLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeModal = document.getElementById('closeModal');
        
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => {
                if (!this.user) {
                    loginModal.classList.add('active');
                }
            });
            
            if (closeModal) {
                closeModal.addEventListener('click', () => {
                    loginModal.classList.remove('active');
                });
            }
            
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    loginModal.classList.remove('active');
                }
            });
            
            const googleBtn = document.querySelector('.google-btn');
            if (googleBtn) {
                googleBtn.addEventListener('click', () => {
                    window.location.href = 'https://santa-mission.onrender.com/auth/google';
                });
            }
        }
    }
    
    async checkUserStatus() {
        try {
            const response = await fetch('https://api.semihcoskun.com.tr/api/user', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.user = data.user;
                    this.updateUIForLoggedInUser();
                }
            }
        } catch (error) {
            console.log('Backend bağlantısı yok');
        }
    }
    
    updateUIForLoggedInUser() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const loginModal = document.getElementById('loginModal');
        
        if (loginBtn && userMenu) {
            loginBtn.textContent = this.user.name;
            loginBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            
            document.getElementById('userAvatar').src = this.user.photo;
            document.getElementById('userName').textContent = this.user.name;
            document.getElementById('userEmail').textContent = this.user.email;
            
            loginBtn.onclick = (e) => {
                e.stopPropagation();
                loginModal.classList.remove('active');
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
                    window.location.href = 'https://api.semihcoskun.com.tr/logout';
                }
            };
        }
    }

    async loadLeaderboard() {
        try {
            const response = await fetch('https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod/leaderboard');
            const data = await response.json();
            
            if (data.success) {
                this.leaderboard = data.leaderboard;
                this.renderLeaderboard();
            }
        } catch (error) {
            console.error('Liderlik tablosu yüklenemedi:', error);
        }
    }

    async loadMyRank() {
        if (!this.user) return;
        
        try {
            const response = await fetch('https://api.semihcoskun.com.tr/api/my-rank', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success && data.rank) {
                this.myRank = data.rank;
                this.renderMyRank();
            }
        } catch (error) {
            console.log('Sıralama bilgisi alınamadı');
        }
    }

    renderMyRank() {
        if (!this.myRank) return;
        
        const card = document.getElementById('myRankCard');
        const rankNumber = document.getElementById('myRankNumber');
        const rankScore = document.getElementById('myRankScore');
        
        card.style.display = 'flex';
        rankNumber.textContent = `#${this.myRank.rank}`;
        rankScore.textContent = `${this.myRank.total_score} Puan`;
    }

    renderLeaderboard() {
        // Top 3 Podium
        if (this.leaderboard[0]) {
            this.renderPodiumItem('rank1', this.leaderboard[0]);
        }
        if (this.leaderboard[1]) {
            this.renderPodiumItem('rank2', this.leaderboard[1]);
        }
        if (this.leaderboard[2]) {
            this.renderPodiumItem('rank3', this.leaderboard[2]);
        }

        // Geri kalan liste (4-100)
        const listContainer = document.getElementById('leaderboardList');
        listContainer.innerHTML = '';
        
        for (let i = 3; i < this.leaderboard.length; i++) {
            const user = this.leaderboard[i];
            const item = this.createLeaderboardItem(user, i + 1);
            listContainer.appendChild(item);
        }
    }

    renderPodiumItem(elementId, user) {
        const element = document.getElementById(elementId);
        const avatar = element.querySelector('.podium-avatar');
        const name = element.querySelector('.podium-name');
        const score = element.querySelector('.podium-score');
        
        avatar.src = user.photo || 'https://via.placeholder.com/80';
        name.textContent = user.name;
        score.textContent = user.total_score;
    }

    createLeaderboardItem(user, rank) {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        item.innerHTML = `
            <div class="item-rank">#${rank}</div>
            <img class="item-avatar" src="${user.photo || 'https://via.placeholder.com/50'}" alt="${user.name}">
            <div class="item-info">
                <div class="item-name">${user.name}</div>
                <div class="item-streak">🔥 ${user.max_streak} Streak</div>
            </div>
            <div class="item-score">${user.total_score}</div>
        `;
        
        return item;
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
    new LeaderboardManager();
});
