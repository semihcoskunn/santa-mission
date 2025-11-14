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
            
            window.location.reload();
        } else {
            // Profile incomplete, redirect to complete profile
            window.location.href = 'complete-profile.html';
        }
    } catch (error) {
        console.log('User not found or error:', error);
        // New user, redirect to complete profile
        window.location.href = 'complete-profile.html';
    }
}

// Çıkış
function logout() {
    // Google oturumunu kapat
    google.accounts.id.disableAutoSelect();
    localStorage.removeItem('santa_user');
    window.location.href = 'index.html';
}

// Kullanıcı kontrolü
function getCurrentUser() {
    const userStr = localStorage.getItem('santa_user');
    return userStr ? JSON.parse(userStr) : null;
}

loadGoogleSDK();
