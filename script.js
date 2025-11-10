// Dil değiştirme sistemi
class LanguageManager {
    constructor() {
        this.currentLang = 'tr';
        this.score = 0;
        this.isLoggedIn = false;
        this.giftInterval = null;
        this.init();
    }

    init() {
        this.createSnowfall();
        this.setupLanguageSwitcher();
        this.setupMissionButton();
        this.setupLoginButton();
    }

    setupGiftGame() {
        // Sadece giriş yapmış kullanıcılar için
        if (this.isLoggedIn && !this.giftInterval) {
            this.activeIcon = null; // Şu anda aktif ikon var mı?
            this.scheduleNextIcon();
            this.updateScoreDisplay();
        }
    }

    scheduleNextIcon() {
        if (!this.isLoggedIn) return;
        
        // Rastgele ikon seç
        const icons = [
            { emoji: '🎁', points: 5, name: 'Hediye', weight: 60 },  // 60% şans
            { emoji: '🦌', points: 10, name: 'Ren Geyik', weight: 30 }, // 30% şans
            { emoji: '⭐', points: 20, name: 'Yıldız', weight: 10 }  // 10% şans
        ];
        
        // Ağırlıklı rastgele seçim
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
        
        // Süreyi belirle (TEST MODU)
        let delay;
        if (selectedIcon.emoji === '🎁') {
            delay = 5000; // 5 saniye (TEST)
        } else if (selectedIcon.emoji === '🦌') {
            delay = 15000; // 15 saniye (TEST)
        } else {
            delay = 30000; // 30 saniye (TEST)
        }
        
        setTimeout(() => {
            if (!this.activeIcon) {
                this.spawnIcon(selectedIcon);
            }
            this.scheduleNextIcon();
        }, delay);
    }

    spawnIcon(iconData) {
        if (this.activeIcon) return; // Zaten bir ikon varsa çıkarma
        
        const icon = document.createElement('div');
        icon.className = 'gift-box';
        icon.innerHTML = iconData.emoji;
        icon.style.left = Math.random() * (window.innerWidth - 60) + 'px';
        icon.style.top = Math.random() * (window.innerHeight - 60) + 'px';
        icon.dataset.points = iconData.points;
        icon.dataset.name = iconData.name;
        
        this.activeIcon = icon;
        
        icon.addEventListener('click', () => {
            this.collectIcon(icon, iconData);
        });
        
        document.body.appendChild(icon);
        
        // 10 saniye sonra kaybolsun
        setTimeout(() => {
            if (icon.parentNode) {
                icon.remove();
                this.activeIcon = null;
            }
        }, 10000);
    }

    collectIcon(icon, iconData) {
        this.score += iconData.points;
        this.updateScoreDisplay();
        
        // Animasyon
        icon.style.animation = 'giftCollect 0.5s ease-out';
        setTimeout(() => {
            icon.remove();
            this.activeIcon = null;
        }, 500);
        
        // Bildirim
        this.showNotification(`+${iconData.points} Puan! ${iconData.emoji}`);
    }

    updateScoreDisplay() {
        let scoreEl = document.getElementById('scoreDisplay');
        if (!scoreEl) {
            scoreEl = document.createElement('div');
            scoreEl.id = 'scoreDisplay';
            scoreEl.className = 'score-display';
            document.body.appendChild(scoreEl);
        }
        scoreEl.innerHTML = `<span style="font-size: 20px; font-weight: 700;">${this.score}</span> <span style="opacity: 0.9;">Puan</span>`;
    }

    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'gift-notification';
        notif.textContent = message;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.remove(), 2000);
    }

    setupLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.switchLanguage(lang);
                
                // Aktif buton stilini güncelle
                langButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    switchLanguage(lang) {
        this.currentLang = lang;
        const elements = document.querySelectorAll('[data-tr][data-en]');
        
        elements.forEach(element => {
            const text = element.dataset[lang];
            if (text) {
                element.textContent = text;
            }
        });

        // HTML lang attribute güncelle
        document.documentElement.lang = lang;
    }

    setupMissionButton() {
        const ctaButton = document.querySelector('.cta-button');
        ctaButton.addEventListener('click', () => {
            window.location.href = 'game.html';
        });
    }

    setupLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeModal = document.getElementById('closeModal');
        
        // Kullanıcı durumunu kontrol et
        this.checkUserStatus();
        
        if (loginBtn && loginModal) {
            // Modal aç (sadece giriş yapılmamışsa)
            loginBtn.addEventListener('click', () => {
                if (!this.isLoggedIn) {
                    loginModal.classList.add('active');
                }
            });
            
            // Modal kapat (X butonu)
            if (closeModal) {
                closeModal.addEventListener('click', () => {
                    loginModal.classList.remove('active');
                });
            }
            
            // Modal kapat (dışarı tıklama)
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    loginModal.classList.remove('active');
                }
            });
            
            // Google giriş butonu
            const googleBtn = document.querySelector('.google-btn');
            if (googleBtn) {
                googleBtn.addEventListener('click', () => {
                    const backendUrl = 'https://santa-mission.onrender.com';
                    console.log('Backend URL:', backendUrl);
                    window.location.href = `${backendUrl}/auth/google`;
                });
            }
        }
    }

    async checkUserStatus() {
        try {
            const backendUrl = 'https://santa-mission.onrender.com';
            const response = await fetch(`${backendUrl}/api/user`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.updateUIForLoggedInUser(data.user);
                }
            }
        } catch (error) {
            console.log('Backend bağlantısı yok veya kullanıcı giriş yapmamış');
        }
        
        // URL'de login=success varsa kontrol et
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'success') {
            const userDataEncoded = urlParams.get('data');
            if (userDataEncoded) {
                try {
                    const userDataStr = atob(userDataEncoded);
                    const userData = JSON.parse(userDataStr);
                    localStorage.setItem('santa_user', JSON.stringify(userData));
                    this.updateUIForLoggedInUser(userData);
                    console.log('✅ Giriş başarılı:', userData.name);
                } catch (e) {
                    console.error('❌ Giriş hatası:', e);
                }
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // localStorage'dan kullanıcıyı kontrol et
        const savedUser = localStorage.getItem('santa_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                this.updateUIForLoggedInUser(userData);
            } catch (e) {
                localStorage.removeItem('santa_user');
            }
        }
    }

    updateUIForLoggedInUser(user) {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const loginModal = document.getElementById('loginModal');
        
        // Kullanıcı giriş yaptı
        this.isLoggedIn = true;
        
        if (loginBtn && userMenu) {
            loginBtn.textContent = user.name;
            loginBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            
            // Profil bilgilerini doldur
            document.getElementById('userAvatar').src = user.photo;
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            
            // Login butonuna tıklayınca menüyü aç/kapat
            loginBtn.onclick = (e) => {
                e.stopPropagation();
                loginModal.classList.remove('active');
                userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
            };
            
            // Menü dışına tıklayınca kapat
            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target) && e.target !== loginBtn) {
                    userMenu.style.display = 'none';
                }
            });
            
            // Menü butonları
            document.getElementById('profileBtn').onclick = (e) => {
                e.preventDefault();
                window.location.href = 'profile.html';
            };
            
            document.getElementById('notificationsBtn').onclick = (e) => {
                e.preventDefault();
                alert(this.currentLang === 'tr' ? 'Bildirimler yakında!' : 'Notifications coming soon!');
            };
            
            document.getElementById('settingsBtn').onclick = (e) => {
                e.preventDefault();
                alert(this.currentLang === 'tr' ? 'Ayarlar yakında!' : 'Settings coming soon!');
            };
            
            document.getElementById('logoutBtn').onclick = (e) => {
                e.preventDefault();
                if (confirm(this.currentLang === 'tr' ? 'Çıkış yapmak istiyor musunuz?' : 'Do you want to logout?')) {
                    localStorage.removeItem('santa_user');
                    window.location.href = 'index.html';
                }
            };
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
            
            // Rastgele pozisyon ve animasyon süresi
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = Math.random() * 8 + 6 + 's';
            snowflake.style.animationDelay = Math.random() * 5 + 's';
            snowflake.style.fontSize = Math.random() * 20 + 15 + 'px';
            snowflake.style.opacity = Math.random() * 0.9 + 0.3;
            
            // Bazı kar tanelerine özel efektler
            if (Math.random() > 0.7) {
                snowflake.style.filter = 'blur(1px)';
            }
            
            snowfall.appendChild(snowflake);
        }
        
        // Sürekli yeni kar taneleri ekle
        setInterval(() => {
            if (snowfall.children.length < 150) {
                const snowflake = document.createElement('div');
                snowflake.classList.add('snowflake');
                snowflake.innerHTML = snowflakeTypes[Math.floor(Math.random() * snowflakeTypes.length)];
                snowflake.style.left = Math.random() * 100 + '%';
                snowflake.style.animationDuration = Math.random() * 8 + 6 + 's';
                snowflake.style.fontSize = Math.random() * 20 + 15 + 'px';
                snowflake.style.opacity = Math.random() * 0.9 + 0.3;
                snowfall.appendChild(snowflake);
                
                // Eski kar tanelerini temizle
                setTimeout(() => {
                    if (snowflake.parentNode) {
                        snowflake.remove();
                    }
                }, 15000);
            }
        }, 300);
    }
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    new LanguageManager();
    
    // Smooth scroll efekti
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Scroll efektleri
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    const speed = scrolled * 0.5;
    
    if (parallax && scrolled < window.innerHeight) {
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

