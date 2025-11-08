// Dil değiştirme sistemi
class LanguageManager {
    constructor() {
        this.currentLang = 'tr';
        this.init();
    }

    init() {
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
            const messages = {
                tr: 'Görev yakında başlayacak! 🎅✨',
                en: 'Mission starting soon! 🎅✨'
            };
            alert(messages[this.currentLang]);
        });
    }

    setupLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeModal = document.getElementById('closeModal');
        
        // Kullanıcı durumunu kontrol et
        this.checkUserStatus();
        
        if (loginBtn && loginModal) {
            // Modal aç
            loginBtn.addEventListener('click', () => {
                loginModal.classList.add('active');
            });
            
            // Modal kapat (X butonu)
            closeModal.addEventListener('click', () => {
                loginModal.classList.remove('active');
            });
            
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
                    const backendUrl = 'https://hybridizable-russel-abridgeable.ngrok-free.dev';
                    console.log('Backend URL:', backendUrl);
                    window.location.href = `${backendUrl}/auth/google`;
                });
            }
        }
    }

    async checkUserStatus() {
        try {
            const backendUrl = 'https://hybridizable-russel-abridgeable.ngrok-free.dev';
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
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => this.checkUserStatus(), 500);
        }
    }

    updateUIForLoggedInUser(user) {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const loginModal = document.getElementById('loginModal');
        
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
                alert(this.currentLang === 'tr' ? 'Profil sayfası yakında!' : 'Profile page coming soon!');
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
                    const backendUrl = 'https://hybridizable-russel-abridgeable.ngrok-free.dev';
                    window.location.href = `${backendUrl}/logout`;
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

