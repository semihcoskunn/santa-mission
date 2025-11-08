const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ 
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://semihcoskun.com.tr'
        : 'http://localhost:5500', 
    credentials: true 
}));

app.use(session({ 
    secret: 'santa-secret-key-2025', 
    resave: false, 
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here') {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://semihcoskun.com.tr/auth/google/callback'
        : 'http://localhost:3000/auth/google/callback'
      },
      (accessToken, refreshToken, profile, done) => {
        console.log('Google Profile:', profile);
        return done(null, profile);
      }
    ));
} else {
    console.log('⚠️  Google OAuth yapılandırılmamış. .env dosyasını düzenleyin.');
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Routes
app.get('/auth/google', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
        return res.send(`
            <html>
            <head><title>Google OAuth Kurulumu Gerekli</title></head>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
                <h1>🎅 Google OAuth Henüz Yapılandırılmadı</h1>
                <p>Backend çalışıyor ama Google girişi için yapılandırma gerekli.</p>
                <h3>Yapılacaklar:</h3>
                <ol style="text-align: left; max-width: 600px; margin: 20px auto;">
                    <li>Google Cloud Console'a git: <a href="https://console.cloud.google.com">console.cloud.google.com</a></li>
                    <li>Yeni proje oluştur</li>
                    <li>OAuth 2.0 Client ID oluştur</li>
                    <li>Redirect URI ekle: <code>http://localhost:3000/auth/google/callback</code></li>
                    <li>Client ID ve Secret'i <code>backend/.env</code> dosyasına ekle</li>
                    <li>Backend'i yeniden başlat</li>
                </ol>
                <p><a href="/" style="color: #e74c3c; font-weight: bold;">Ana Sayfaya Dön</a></p>
            </body>
            </html>
        `);
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: process.env.NODE_ENV === 'production' 
            ? 'https://semihcoskun.com.tr' 
            : 'http://localhost:5500'
    }),
    (req, res) => {
        const frontendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://semihcoskun.com.tr' 
            : 'http://localhost:5500';
        res.redirect(`${frontendUrl}?login=success`);
    }
);

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ 
            success: true,
            user: {
                id: req.user.id,
                name: req.user.displayName,
                email: req.user.emails[0].value,
                photo: req.user.photos[0].value
            }
        });
    } else {
        res.status(401).json({ success: false, error: 'Not authenticated' });
    }
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: err });
        const frontendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://semihcoskun.com.tr' 
            : 'http://localhost:5500';
        res.redirect(frontendUrl);
    });
});

module.exports = app;

// Ana sayfa
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>Santa Backend</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>🎅 Santa'nın Gizli Görevi - Backend</h1>
            <p>Backend başarıyla çalışıyor!</p>
            <h3>API Endpoints:</h3>
            <ul style="list-style: none; padding: 0;">
                <li>✅ GET /auth/google - Google ile giriş</li>
                <li>✅ GET /api/user - Kullanıcı bilgisi</li>
                <li>✅ GET /logout - Çıkış yap</li>
            </ul>
            <p style="margin-top: 30px;">
                <a href="http://localhost:8080" style="background: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Frontend'e Git</a>
            </p>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🎅 ========================================`);
    console.log(`   Santa Backend Başlatıldı!`);
    console.log(`========================================`);
    console.log(`📍 Backend: http://localhost:${PORT}`);
    console.log(`📍 Frontend: http://localhost:8080`);
    console.log(`========================================\n`);
    
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
        console.log(`⚠️  UYARI: Google OAuth yapılandırılmamış!`);
        console.log(`   .env dosyasını düzenleyin ve Google credentials ekleyin.\n`);
    } else {
        console.log(`✅ Google OAuth yapılandırıldı!\n`);
    }
});
