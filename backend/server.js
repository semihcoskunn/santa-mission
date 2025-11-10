const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
const { initDatabase } = require('./database');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Veritabanını başlat
initDatabase();

app.use(cors({ 
    origin: ['https://semihcoskun.com.tr', 'http://localhost:5500', 'http://127.0.0.1:5500'], 
    credentials: true 
}));

app.use(session({ 
    secret: process.env.SESSION_SECRET || 'santa-secret-key-2025', 
    resave: false, 
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 saat
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here') {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://santa-mission.onrender.com/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await User.findOrCreate(profile);
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
      }
    ));
} else {
    console.log('⚠️  Google OAuth yapılandırılmamış. .env dosyasını düzenleyin.');
}

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const mongoose = require('mongoose');
        const User = mongoose.model('User');
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
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
        failureRedirect: 'https://semihcoskun.com.tr'
    }),
    (req, res) => {
        res.redirect('https://semihcoskun.com.tr?login=success');
    }
);

app.get('/api/user', async (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ 
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                photo: req.user.photo,
                total_score: req.user.total_score,
                max_streak: req.user.max_streak
            }
        });
    } else {
        res.status(401).json({ success: false, error: 'Not authenticated' });
    }
});

app.post('/api/update-score', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    try {
        const { score, streak } = req.body;
        await User.updateScore(req.user._id, score, streak);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/stats', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    try {
        const stats = await User.getStats(req.user._id);
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await User.getLeaderboard();
        res.json({ success: true, leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/my-rank', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    try {
        const rank = await User.getUserRank(req.user._id);
        res.json({ success: true, rank });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/daily-quests', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    try {
        const quests = await User.getDailyQuests(req.user._id);
        res.json({ success: true, quests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/update-quest', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    try {
        const { type, value } = req.body;
        await User.updateQuestProgress(req.user._id, type, value);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/claim-quest', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    try {
        const { questId } = req.body;
        const result = await User.claimQuest(req.user._id, questId);
        if (result) {
            res.json({ success: true, reward: result.reward, total_score: result.total_score });
        } else {
            res.status(400).json({ success: false, error: 'Quest not available' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: err });
        res.redirect('https://semihcoskun.com.tr');
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
                <li>✅ GET /api/daily-quests - Günlük görevler</li>
                <li>✅ POST /api/update-quest - Görev ilerlemesi</li>
                <li>✅ POST /api/claim-quest - Görev ödülü al</li>
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
