// Dil değiştirme sistemi
class LanguageManager {
    constructor() {
        this.currentLang = 'tr';
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        this.checkUserStatus();
        this.createSnowfall();
        this.setupLanguageSwitcher();
        this.setupMissionButton();
        this.setupLoginButton();
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
            const user = getCurrentUser();
            if (user && user.profileCompleted) {
                const settings = JSON.parse(localStorage.getItem('santa_settings') || '{}');
                if (settings.autoStart) {
                    window.location.href = '/game';
                } else {
                    window.location.href = '/game';
                }
            } else {
                window.location.href = '/game';
            }
        });
    }

    setupLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeModal = document.getElementById('closeModal');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const closeMenu = document.getElementById('closeMenu');
        
        // Hamburger menü
        if (hamburgerBtn && hamburgerMenu) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                hamburgerMenu.classList.toggle('active');
            });
            
            if (closeMenu) {
                closeMenu.addEventListener('click', () => {
                    hamburgerMenu.classList.remove('active');
                });
            }
            
            document.addEventListener('click', (e) => {
                if (!hamburgerMenu.contains(e.target) && e.target !== hamburgerBtn) {
                    hamburgerMenu.classList.remove('active');
                }
            });
        }
        
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
        }
    }

    checkUserStatus() {
        const user = getCurrentUser();
        if (user) {
            this.updateUIForLoggedInUser(user);
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
                window.location.href = '/profile';
            };
            
            const notifBtn = document.getElementById('notificationsBtn');
            if (notifBtn) {
                notifBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = '/notifications';
                };
            }
            
            const settingsBtn = document.getElementById('settingsBtn');
            if (settingsBtn) {
                settingsBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = '/settings';
                };
            }
            
            document.getElementById('logoutBtn').onclick = (e) => {
                e.preventDefault();
                logout();
            };
        }
    }

    createSnowfall() {
        const snowfall = document.querySelector('.snowfall');
        if (!snowfall) return;
        
        const snowflakeCount = 80;
        const snowflakeTypes = ['❄', '❅', '✻'];

        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.textContent = snowflakeTypes[i % 3];
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.top = Math.random() * -100 + '%';
            snowflake.style.animationDuration = (Math.random() * 8 + 6) + 's';
            snowflake.style.animationDelay = '0s';
            snowflake.style.fontSize = (Math.random() * 10 + 15) + 'px';
            snowflake.style.opacity = Math.random() * 0.6 + 0.3;
            snowfall.appendChild(snowflake);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new LanguageManager());

