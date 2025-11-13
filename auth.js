// Google Sign-In
const GOOGLE_CLIENT_ID = '795368355462-ci2fsn6o37aig5do8670jm6sr3hr4786.apps.googleusercontent.com';
const API_URL = 'https://YOUR_NEW_API_ID.execute-api.eu-central-1.amazonaws.com/prod';

// Google SDK yükle
function loadGoogleSDK() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Google ile giriş
function handleGoogleSignIn(response) {
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
