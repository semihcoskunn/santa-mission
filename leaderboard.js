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
        }
    }
    
    async checkUserStatus() {
        this.user = getCurrentUser();
        if (this.user) {
            this.updateUIForLoggedInUser();
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
    }

    async loadLeaderboard() {
        try {
            const response = await fetch('https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod/leaderboard');
            const rawData = await response.json();
            
            // Handle non-proxy response
            let data;
            if (rawData.body) {
                data = JSON.parse(rawData.body);
            } else {
                data = rawData;
            }
            
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
        
        const myRank = this.leaderboard.findIndex(u => u.userID === this.user.userId) + 1;
        if (myRank > 0) {
            this.myRank = {
                rank: myRank,
                total_score: this.leaderboard[myRank - 1].total_score
            };
            this.renderMyRank();
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

        // Geri kalan liste (4-1000)
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
        score.textContent = user.total_score || 0;
    }

    createLeaderboardItem(user, rank) {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        item.innerHTML = `
            <div class="item-rank">#${rank}</div>
            <img class="item-avatar" src="${user.photo || 'https://via.placeholder.com/50'}" alt="${user.name}">
            <div class="item-info">
                <div class="item-name">${user.name}</div>
                <div class="item-streak">🔥 ${user.max_streak || 0} Streak</div>
            </div>
            <div class="item-score">${user.total_score || 0}</div>
        `;
        
        return item;
    }

    createSnowfall() {
        const snowfall = document.querySelector('.snowfall');
        if (!snowfall) return;
        
        const snowflakeTypes = ['❄', '❅', '✻'];
        for (let i = 0; i < 80; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.textContent = snowflakeTypes[i % 3];
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = (Math.random() * 8 + 6) + 's';
            snowflake.style.animationDelay = (Math.random() * 5) + 's';
            snowflake.style.fontSize = (Math.random() * 10 + 15) + 'px';
            snowflake.style.opacity = Math.random() * 0.6 + 0.3;
            snowfall.appendChild(snowflake);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LeaderboardManager();
});
