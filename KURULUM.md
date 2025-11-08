# 🎅 Santa'nın Gizli Görevi - Kurulum Rehberi

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- Google Cloud Console hesabı

## 🚀 Hızlı Başlangıç

### 1. Google OAuth Ayarları

1. [Google Cloud Console](https://console.cloud.google.com/) adresine git
2. Yeni proje oluştur: "Santa Mission"
3. **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**
4. Application type: **Web application**
5. Authorized JavaScript origins:
   - `http://localhost:8080`
   - `http://localhost:3000`
6. Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
7. Client ID ve Client Secret'i kopyala

### 2. Backend Kurulumu

```bash
cd backend
npm install
```

### 3. .env Dosyasını Düzenle

`backend/.env` dosyasını aç ve Google credentials'ı ekle:

```
GOOGLE_CLIENT_ID=senin_google_client_id
GOOGLE_CLIENT_SECRET=senin_google_client_secret
PORT=3000
```

### 4. Uygulamayı Başlat

**Backend'i başlat:**
```bash
cd backend
npm start
```

**Frontend'i başlat:**
- `index.html` dosyasını Live Server ile aç (VS Code eklentisi)
- veya başka bir HTTP sunucusu kullan (port 8080)

### 5. Tarayıcıda Aç

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`

## ✅ Test Et

1. Ana sayfada "Giriş Yap" butonuna tıkla
2. "Google ile Giriş" butonuna tıkla
3. Google hesabınla giriş yap
4. Ana sayfaya yönlendirileceksin ve adın görünecek

## 🔧 Sorun Giderme

**Backend bağlanamıyor:**
- Backend'in çalıştığından emin ol (`http://localhost:3000`)
- CORS ayarlarını kontrol et

**Google OAuth çalışmıyor:**
- `.env` dosyasındaki credentials'ı kontrol et
- Google Cloud Console'da redirect URI'ları kontrol et
- Tarayıcı console'unda hata mesajlarını kontrol et

## 📁 Proje Yapısı

```
Yılbaşı/
├── backend/
│   ├── server.js          # Express sunucusu
│   ├── package.json       # Bağımlılıklar
│   ├── .env              # Google credentials (GİZLİ!)
│   └── README.md         # Backend dokümantasyonu
├── index.html            # Ana sayfa
├── script.js             # Frontend JavaScript
├── style.css             # Stiller
└── KURULUM.md           # Bu dosya
```

## 🎄 Keyifli Kodlamalar!
