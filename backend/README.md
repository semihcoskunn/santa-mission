# Santa'nın Gizli Görevi - Backend

## Google OAuth Kurulumu

### 1. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine git
2. Yeni bir proje oluştur veya mevcut projeyi seç
3. Sol menüden **APIs & Services** > **Credentials** seç

### 2. OAuth 2.0 Client ID Oluşturma

1. **Create Credentials** > **OAuth client ID** seç
2. Application type: **Web application**
3. Name: `Santa Mission App`
4. **Authorized JavaScript origins** ekle:
   - `http://localhost:8080`
   - `http://localhost:3000`
5. **Authorized redirect URIs** ekle:
   - `http://localhost:3000/auth/google/callback`
6. **Create** butonuna tıkla
7. Client ID ve Client Secret'i kopyala

### 3. .env Dosyasını Yapılandırma

`.env` dosyasını aç ve Google credentials'ı ekle:

```
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
PORT=3000
```

### 4. Bağımlılıkları Yükleme

```bash
cd backend
npm install
```

### 5. Sunucuyu Başlatma

```bash
npm start
```

veya development modunda:

```bash
npm run dev
```

Backend `http://localhost:3000` adresinde çalışacak.

## API Endpoints

- `GET /auth/google` - Google OAuth girişi başlat
- `GET /auth/google/callback` - Google OAuth callback
- `GET /api/user` - Giriş yapmış kullanıcı bilgisi
- `GET /logout` - Çıkış yap
