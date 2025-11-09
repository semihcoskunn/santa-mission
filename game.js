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
            
            const googleBtn = document.querySelector('.google-btn');
            if (googleBtn) {
                googleBtn.addEventListener('click', () => {
                    window.location.href = 'http://localhost:3000/auth/google';
                });
            }
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
                    this.updateUIForLoggedInUser(data.user);
                }
            }
        } catch (error) {
            console.log('Backend bağlantısı yok');
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'success') {
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => this.checkUserStatus(), 500);
        }
    }

    updateUIForLoggedInUser(user) {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const statusMessage = document.getElementById('statusMessage');
        
        this.isLoggedIn = true;
        
        if (loginBtn && userMenu) {
            loginBtn.textContent = user.name;
            loginBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            
            document.getElementById('userAvatar').src = user.photo;
            document.getElementById('userName').textContent = user.name;
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
        
        // Oyunu başlat
        statusMessage.textContent = 'Oyun başladı! Hediyeleri yakala! 🎮';
        this.startGame();
    }

    startGame() {
        this.updateScoreDisplay();
        this.scheduleNextIcon();
        this.setupQuests();
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
        
        this.loadQuests();
        
        document.querySelectorAll('.quest-item').forEach(item => {
            item.addEventListener('click', () => {
                const questId = item.dataset.quest;
                this.claimQuest(questId, item);
            });
        });
    }
    
    loadQuests() {
        const quests = JSON.parse(localStorage.getItem('dailyQuests') || '{}');
        const today = new Date().toDateString();
        
        if (quests.date !== today) {
            localStorage.setItem('dailyQuests', JSON.stringify({
                date: today,
                collect5: { progress: 0, claimed: false },
                collect10: { progress: 0, claimed: false },
                combo5: { progress: 0, claimed: false },
                score200: { progress: 0, claimed: false }
            }));
        }
        
        this.updateQuestsUI();
    }
    
    updateQuestsUI() {
        const quests = JSON.parse(localStorage.getItem('dailyQuests') || '{}');
        const configs = {
            collect5: { max: 5 },
            collect10: { max: 10 },
            combo5: { max: 5 },
            score200: { max: 200 }
        };
        
        Object.keys(configs).forEach(questId => {
            const quest = quests[questId] || { progress: 0, claimed: false };
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
        const quests = JSON.parse(localStorage.getItem('dailyQuests') || '{}');
        const rewards = { collect5: 50, collect10: 100, combo5: 150, score200: 200 };
        const configs = { collect5: 5, collect10: 10, combo5: 5, score200: 200 };
        
        if (quests[questId] && !quests[questId].claimed && quests[questId].progress >= configs[questId]) {
            quests[questId].claimed = true;
            localStorage.setItem('dailyQuests', JSON.stringify(quests));
            
            this.score += rewards[questId];
            this.updateScoreDisplay(rewards[questId]);
            
            const stats = JSON.parse(localStorage.getItem('userStats') || '{"score": 0, "streak": 0}');
            stats.score = (stats.score || 0) + rewards[questId];
            localStorage.setItem('userStats', JSON.stringify(stats));
            
            this.updateQuestsUI();
            
            this.showCombo(1, rewards[questId]);
        }
    }
    
    updateQuestProgress(type, value = 1) {
        const quests = JSON.parse(localStorage.getItem('dailyQuests') || '{}');
        
        if (type === 'collect') {
            quests.collect5 = quests.collect5 || { progress: 0, claimed: false };
            quests.collect10 = quests.collect10 || { progress: 0, claimed: false };
            if (!quests.collect5.claimed) quests.collect5.progress++;
            if (!quests.collect10.claimed) quests.collect10.progress++;
        } else if (type === 'combo') {
            quests.combo5 = quests.combo5 || { progress: 0, claimed: false };
            if (!quests.combo5.claimed) quests.combo5.progress++;
        } else if (type === 'score') {
            quests.score200 = quests.score200 || { progress: 0, claimed: false };
            if (!quests.score200.claimed) quests.score200.progress += value;
        }
        
        localStorage.setItem('dailyQuests', JSON.stringify(quests));
        this.updateQuestsUI();
    }

    scheduleNextIcon() {
        if (!this.isLoggedIn) return;
        
        const icons = [
            { emoji: '🎁', points: 10, name: 'Hediye', weight: 60 },
            { emoji: '🦌', points: 25, name: 'Ren Geyik', weight: 30 },
            { emoji: '⭐', points: 50, name: 'Yıldız', weight: 10 }
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
        
        let delay;
        if (selectedIcon.emoji === '🎁') {
            delay = 60000;
        } else if (selectedIcon.emoji === '🦌') {
            delay = 300000;
        } else {
            delay = 1800000;
        }
        
        setTimeout(() => {
            if (!this.activeIcon) {
                this.spawnIcon(selectedIcon);
            }
            this.scheduleNextIcon();
        }, delay);
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

    collectIcon(icon, iconData) {
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
    new GameManager();
});
