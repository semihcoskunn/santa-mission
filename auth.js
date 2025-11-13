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
    
    // JWT token'ı decode et
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    const userData = {
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
        photo: payload.picture
    };
    
    // LocalStorage'a kaydet
    localStorage.setItem('santa_user', JSON.stringify(userData));
    
    // Database'e kullanıcıyı ekle (0 skor ile)
    try {
        await fetch(`${API_URL}/update-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userData.userId,
                name: userData.name,
                email: userData.email,
                photo: userData.photo,
                score: 0,
                streak: 0
            })
        });
    } catch (error) {
        console.error('Kullanıcı kaydedilemedi:', error);
    }
    
    // Sayfayı yenile
    window.location.reload();
}

// Çıkış
function logout() {
    localStorage.removeItem('santa_user');
    window.location.href = '/';
}

// Kullanıcı kontrolü
function getCurrentUser() {
    const userStr = localStorage.getItem('santa_user');
    return userStr ? JSON.parse(userStr) : null;
}

loadGoogleSDK();
