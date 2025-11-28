// Google Sign-In
const GOOGLE_CLIENT_ID = '795368355462-ci2fsn6o37aig5do8670jm6sr3hr4786.apps.googleusercontent.com';
const API_URL = 'https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod';

// Google SDK yükle
function loadGoogleSDK() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Google ile giriş
async function handleGoogleSignIn(response) {
    const credential = response.credential;
    
    // JWT token'ı decode et (UTF-8 desteği ile)
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    
    const userData = {
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
        photo: payload.picture
    };
    
    // LocalStorage'a kaydet
    localStorage.setItem('santa_user', JSON.stringify(userData));
    
    // Check if user profile is complete
    try {
        const response = await fetch(`${API_URL}/user?userId=${userData.userId}`);
        let data = await response.json();
        console.log('Auth check raw data:', data);
        
        // API Gateway returns Lambda response with body field
        if (data.body) {
            data = JSON.parse(data.body);
        }
        
        console.log('Auth check parsed data:', data);
        
        if (data.username && data.username.trim() !== '') {
            // Profile complete, reload page
            userData.profileCompleted = true;
            userData.firstName = data.firstName;
            userData.lastName = data.lastName;
            userData.username = data.username;
            localStorage.setItem('santa_user', JSON.stringify(userData));
            
            // Create welcome notification if first login
            const hasWelcomeNotif = localStorage.getItem(`welcome_${userData.userId}`);
            if (!hasWelcomeNotif) {
                fetch(`${API_URL}/notifications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userData.userId,
                        type: 'welcome',
                        title: 'Hoş Geldin!',
                        message: 'Santa\'nın Gizli Görevi\'ne katıldığın için teşekkürler! Hediyeleri topla ve liderlik tablosunda yüksel.'
                    })
                }).catch(e => console.log('Notification error:', e));
                localStorage.setItem(`welcome_${userData.userId}`, 'true');
            }
            
            // Check auto-start setting from database
            fetch(`${API_URL}/settings?userId=${userData.userId}`)
                .then(res => res.json())
                .then(data => {
                    const settings = data.settings || {};
                    localStorage.setItem('santa_settings', JSON.stringify(settings));
                    if (settings.autoStart) {
                        window.location.href = '/game';
                    } else {
                        window.location.reload();
                    }
                })
                .catch(() => {
                    // Fallback to localStorage
                    const settings = JSON.parse(localStorage.getItem('santa_settings') || '{}');
                    if (settings.autoStart) {
                        window.location.href = '/game';
                    } else {
                        window.location.reload();
                    }
                });
        } else {
            // Profile incomplete, redirect to complete profile
            window.location.href = '/complete-profile';
        }
    } catch (error) {
        console.log('User not found or error:', error);
        // New user, redirect to complete profile
        window.location.href = '/complete-profile';
    }
}

// Çıkış
function logout() {
    showLogoutModal();
}

function showLogoutModal() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:rgba(255,255,255,0.95);border-radius:20px;padding:40px;max-width:400px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <div style="font-size:3rem;margin-bottom:20px;">🎅</div>
            <h2 style="color:#1e3c72;margin-bottom:15px;font-family:'Mountains of Christmas',cursive;font-size:1.8rem;">Çıkış Yap</h2>
            <p style="color:#666;margin-bottom:30px;font-size:1rem;">Çıkış yapmak istediğinize emin misiniz?</p>
            <div style="display:flex;gap:15px;">
                <button onclick="confirmLogout()" style="flex:1;background:#e74c3c;border:none;color:white;padding:12px;font-size:1rem;font-weight:700;border-radius:10px;cursor:pointer;box-shadow:0 4px 15px rgba(231,76,60,0.3);">Çıkış Yap</button>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="flex:1;background:#95a5a6;border:none;color:white;padding:12px;font-size:1rem;font-weight:700;border-radius:10px;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.2);">İptal</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmLogout() {
    google.accounts.id.disableAutoSelect();
    localStorage.removeItem('santa_user');
    window.location.href = '/';
}

// Kullanıcı kontrolü
function getCurrentUser() {
    const userStr = localStorage.getItem('santa_user');
    return userStr ? JSON.parse(userStr) : null;
}

// Disable Google One Tap if user is already logged in
window.addEventListener('load', () => {
    const user = getCurrentUser();
    if (user && user.profileCompleted) {
        // User is logged in, disable One Tap
        if (window.google && google.accounts && google.accounts.id) {
            google.accounts.id.cancel();
        }
    }
});

loadGoogleSDK();
