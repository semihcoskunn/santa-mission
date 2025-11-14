// Oyun Sayfası
class GameManager {
    constructor() {
        this.score = 0;
        this.isLoggedIn = false;
        this.activeIcon = null;
        this.combo = 0;
        this.streak = 0;
        this.lastCollectTime = 0;
        this.comboTimeout = null;
        this.userId = null;
        this.init();
    }

    init() {
        this.createSnowfall();
        this.setupLoginButton();
        this.checkUserStatus();
    }

    setupLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeModal = document.getElementById('closeModal');
        
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => {
                if (!this.isLoggedIn) {
                    loginModal.classList.add('active');
                }
            });
            
            closeModal.addEventListener('click', () => {
                loginModal.classList.remove('active');
            });
            
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    loginModal.classList.remove('active');
                }
            });
            

        }
    }

    async checkUserStatus() {
        // LocalStorage'dan kullanıcı bilgisini al
        const user = getCurrentUser();
        if (user) {
            await this.loadUserFromDatabase(user.userId);
        }
    }
    
    async loadUserFromDatabase(userId) {
        try {
            const response = await fetch(`https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod/user?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                const user = getCurrentUser();
                const fullUser = {
                    ...user,
                    total_score: data.total_score || 0,
                    max_streak: data.max_streak || 0
                };
                this.updateUIForLoggedInUser(fullUser);
            }
        } catch (error) {
            console.log('Kullanıcı verileri yüklenemedi:', error);
            const user = getCurrentUser();
            if (user) this.updateUIForLoggedInUser(user);
        }
    }

    updateUIForLoggedInUser(user) {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const statusMessage = document.getElementById('statusMessage');
        
        this.isLoggedIn = true;
        this.userId = user.userId;
        
        // LocalStorage'dan skoru yükle
        const savedGame = localStorage.getItem(`game_${this.userId}`);
        if (savedGame) {
            const gameData = JSON.parse(savedGame);
            this.score = gameData.score || 0;
            this.streak = gameData.streak || 0;
        } else {
            this.score = user.total_score || 0;
            this.streak = user.max_streak || 0;
        }
        
        if (loginBtn && userMenu) {
            loginBtn.textContent = user.name;
            loginBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            
            document.getElementById('userAvatar').src = user.photo || '';
            document.getElementById('userName').textContent = user.name || '';
            document.getElementById('userEmail').textContent = user.email || '';
            
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
        
        // Oyunu başlat
        statusMessage.textContent = 'Oyun başladı! Hediyeleri yakala! 🎮';
        this.startGame();
    }

    startGame() {
        this.updateScoreDisplay();
        this.setupQuests();
        this.loadQuests();
        
        const firstDelay = Math.random() * 30000;
        setTimeout(() => {
            this.spawnRandomIcon();
            setInterval(() => this.spawnRandomIcon(), 20000);
        }, firstDelay);
    }
    
    setupQuests() {
        const toggleBtn = document.getElementById('toggleQuests');
        const questsContent = document.getElementById('questsContent');
        
        if (toggleBtn && questsContent) {
            toggleBtn.addEventListener('click', () => {
                questsContent.classList.toggle('collapsed');
                toggleBtn.textContent = questsContent.classList.contains('collapsed') ? '+' : '−';
            });
        }
        
        document.querySelectorAll('.quest-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('completed') && !item.classList.contains('claimed')) {
                    const questId = item.dataset.quest;
                    this.claimQuest(questId, item);
                }
            });
        });
    }
    
    loadQuests() {
        const savedQuests = localStorage.getItem(`quests_${this.userId}`);
        this.quests = savedQuests ? JSON.parse(savedQuests) : {
            collect5: { progress: 0, claimed: false },
            collect10: { progress: 0, claimed: false },
            combo5: { progress: 0, claimed: false },
            score200: { progress: 0, claimed: false }
        };
        this.updateQuestsUI();
    }
    
    saveQuests() {
        localStorage.setItem(`quests_${this.userId}`, JSON.stringify(this.quests));
    }
    
    updateQuestProgress(type, value = 1) {
        if (!this.quests) return;
        
        if (type === 'collect') {
            this.quests.collect5.progress = Math.min(this.quests.collect5.progress + 1, 5);
            this.quests.collect10.progress = Math.min(this.quests.collect10.progress + 1, 10);
        } else if (type === 'combo') {
            this.quests.combo5.progress = Math.min(this.quests.combo5.progress + 1, 5);
        } else if (type === 'score') {
            this.quests.score200.progress = Math.min(this.quests.score200.progress + value, 200);
        }
        
        this.saveQuests();
        this.updateQuestsUI();
    }
    
    updateQuestsUI() {
        if (!this.quests) return;
        
        const configs = {
            collect5: { max: 5 },
            collect10: { max: 10 },
            combo5: { max: 5 },
            score200: { max: 200 }
        };
        
        Object.keys(configs).forEach(questId => {
            const quest = this.quests[questId];
            const config = configs[questId];
            const item = document.querySelector(`[data-quest="${questId}"]`);
            
            if (item) {
                const progress = Math.min(quest.progress, config.max);
                item.querySelector('.quest-progress-mini').textContent = `${progress}/${config.max}`;
                
                if (quest.claimed) {
                    item.classList.add('claimed');
                    item.querySelector('.quest-progress-mini').textContent = '✓';
                } else if (progress >= config.max) {
                    item.classList.add('completed');
                }
            }
        });
    }
    
    claimQuest(questId, item) {
        const rewards = {
            collect5: 50,
            collect10: 100,
            combo5: 150,
            score200: 200
        };
        
        const reward = rewards[questId];
        this.score += reward;
        this.quests[questId].claimed = true;
        
        this.saveQuests();
        this.updateQuestsUI();
        this.updateScoreDisplay(reward);
        this.showCombo(1, reward);
    }

    spawnRandomIcon() {
        if (!this.isLoggedIn || this.activeIcon) return;
        
        const icons = [
            { emoji: '🎁', points: 10, name: 'Hediye', weight: 80 },
            { emoji: '🦌', points: 25, name: 'Ren Geyik', weight: 15 },
            { emoji: '⭐', points: 50, name: 'Yıldız', weight: 5 }
        ];
        
        const totalWeight = icons.reduce((sum, icon) => sum + icon.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedIcon = icons[0];
        
        for (const icon of icons) {
            if (random < icon.weight) {
                selectedIcon = icon;
                break;
            }
            random -= icon.weight;
        }
        
        this.spawnIcon(selectedIcon);
    }

    spawnIcon(iconData) {
        if (this.activeIcon) return;
        
        const icon = document.createElement('div');
        icon.className = 'gift-box';
        icon.innerHTML = iconData.emoji;
        
        const margin = 100;
        const topMargin = 200;
        const bottomMargin = 150;
        const x = margin + Math.random() * (window.innerWidth - margin * 2 - 60);
        const y = topMargin + Math.random() * (window.innerHeight - topMargin - bottomMargin - 60);
        
        icon.style.left = x + 'px';
        icon.style.top = y + 'px';
        
        this.activeIcon = icon;
        
        icon.addEventListener('click', () => {
            this.collectIcon(icon, iconData);
        });
        
        document.body.appendChild(icon);
        
        setTimeout(() => {
            if (icon.parentNode) {
                icon.remove();
                this.activeIcon = null;
            }
        }, 10000);
    }

    async collectIcon(icon, iconData) {
        if (!icon.parentNode || icon.dataset.collected) return;
        icon.dataset.collected = 'true';
        icon.style.pointerEvents = 'none';
        
        const rect = icon.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        const now = Date.now();
        if (now - this.lastCollectTime < 5000) {
            this.combo++;
            this.streak++;
        } else {
            this.combo = 1;
            this.streak++;
        }
        this.lastCollectTime = now;
        
        let comboMultiplier = 1;
        if (this.streak >= 10) {
            comboMultiplier = 2;
        }
        const totalPoints = iconData.points * comboMultiplier;
        this.score += totalPoints;
        
        // Veritabanına kaydet
        await this.saveScoreToDatabase(totalPoints, this.streak);
        
        this.createParticles(x, y, iconData.emoji);
        this.playSound(this.combo > 1 ? 'combo' : 'collect');
        
        if (comboMultiplier > 1) {
            this.showCombo(comboMultiplier, totalPoints);
            this.updateQuestProgress('combo');
        }
        
        this.updateQuestProgress('collect');
        this.updateQuestProgress('score', totalPoints);
        this.updateScoreDisplay(totalPoints);
        
        icon.style.animation = 'collectPulse 0.3s ease';
        setTimeout(() => {
            icon.remove();
            this.activeIcon = null;
        }, 300);
        
        clearTimeout(this.comboTimeout);
        this.comboTimeout = setTimeout(() => {
            this.combo = 0;
        }, 5000);
    }
    
    async saveScoreToDatabase(score, streak) {
        // LocalStorage'a kaydet
        localStorage.setItem(`game_${this.userId}`, JSON.stringify({
            score: this.score,
            streak: this.streak
        }));
        
        // DynamoDB'ye kaydet
        try {
            const user = getCurrentUser();
            await fetch('https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod/update-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: this.userId,
                    score: this.score,
                    streak: this.streak,
                    name: user?.name || 'Unknown',
                    email: user?.email || '',
                    photo: user?.photo || ''
                })
            });
        } catch (error) {
            console.log('Skor kaydedilemedi:', error);
        }
    }

    updateScoreDisplay(earnedPoints = 0) {
        let scoreEl = document.getElementById('scoreDisplay');
        if (!scoreEl) {
            scoreEl = document.createElement('div');
            scoreEl.id = 'scoreDisplay';
            scoreEl.className = 'score-display';
            document.body.appendChild(scoreEl);
        }
        scoreEl.innerHTML = `
            <div class="score-value" id="scoreValue">${this.score}</div>
            <div class="score-label">Puan</div>
            <div class="streak-container">
                <span class="streak-icon">🔥</span>
                <span class="streak-count">${this.streak}</span>
            </div>
        `;
        
        if (earnedPoints > 0) {
            const scoreValue = document.getElementById('scoreValue');
            scoreValue.style.animation = 'none';
            setTimeout(() => {
                scoreValue.style.animation = 'scorePulse 0.5s ease';
            }, 10);
            
            const plusPoints = document.createElement('div');
            plusPoints.className = 'plus-points';
            plusPoints.textContent = `+${earnedPoints}`;
            scoreEl.appendChild(plusPoints);
            
            setTimeout(() => plusPoints.remove(), 1500);
        }
    }

    showCombo(multiplier, points) {
        const comboEl = document.createElement('div');
        comboEl.className = 'combo-display';
        comboEl.innerHTML = `
            <div class="combo-text">COMBO x${multiplier}!</div>
            <div class="combo-points">+${points}</div>
        `;
        document.body.appendChild(comboEl);
        setTimeout(() => comboEl.remove(), 2000);
    }
    

    createParticles(x, y, emoji) {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emoji;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            const angle = (Math.PI * 2 * i) / 8;
            const velocity = 100 + Math.random() * 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }
    
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'collect') {
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            } else if (type === 'combo') {
                oscillator.frequency.value = 1200;
                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            }
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {}
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
    new GameManager();
});
