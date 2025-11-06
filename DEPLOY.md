# 🚀 Vercel'e Deploy Rehberi

## Adım 1: GitHub'a Yükle

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/santa-mission.git
git push -u origin main
```

## Adım 2: Vercel'e Deploy

### Yöntem 1: Vercel Dashboard (Kolay)
1. [vercel.com](https://vercel.com) adresine git
2. GitHub ile giriş yap
3. "Add New" > "Project" tıkla
4. GitHub repo'nu seç
5. "Deploy" butonuna tıkla

### Yöntem 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

## Adım 3: Environment Variables Ekle

Vercel Dashboard'da:
1. Project Settings > Environment Variables
2. Şu değişkenleri ekle:
   - `GOOGLE_CLIENT_ID`: (Google Cloud Console'dan aldığın Client ID)
   - `GOOGLE_CLIENT_SECRET`: (Google Cloud Console'dan aldığın Client Secret)
   - `NODE_ENV`: production
   - `FRONTEND_URL`: (Vercel'den aldığın URL, örn: https://santa-mission.vercel.app)
   - `BACKEND_URL`: (Vercel'den aldığın URL, örn: https://santa-mission.vercel.app)

## Adım 4: Google OAuth Güncelle

Google Cloud Console'da:
1. Credentials sayfasına git
2. OAuth client ID'yi düzenle
3. Authorized JavaScript origins ekle:
   - `https://your-project.vercel.app`
4. Authorized redirect URIs ekle:
   - `https://your-project.vercel.app/auth/google/callback`

## Adım 5: Frontend URL'leri Güncelle

Deploy edildikten sonra `script.js` dosyasındaki URL'leri güncelle:
- `http://localhost:3000` → `https://your-project.vercel.app`

Tekrar deploy et!

## ✅ Tamamlandı!

Siteniz canlıda: `https://your-project.vercel.app`
