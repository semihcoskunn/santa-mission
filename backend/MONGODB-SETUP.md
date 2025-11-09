# MongoDB Atlas Kurulum (Ücretsiz)

## 1. MongoDB Atlas Hesabı Aç

1. https://www.mongodb.com/cloud/atlas/register git
2. **Sign up** → Email veya Google ile kayıt ol
3. **Create a deployment** → **M0 FREE** seç
4. Provider: **AWS**, Region: **Frankfurt** (eu-central-1)
5. Cluster Name: `santa-game`
6. **Create Deployment**

## 2. Database User Oluştur

1. **Security** → **Database Access**
2. **Add New Database User**
3. Username: `santa_admin`
4. Password: Güçlü bir şifre oluştur (kaydet!)
5. **Add User**

## 3. Network Access Ayarla

1. **Security** → **Network Access**
2. **Add IP Address**
3. **Allow Access from Anywhere** (0.0.0.0/0)
4. **Confirm**

## 4. Connection String Al

1. **Database** → **Connect**
2. **Drivers** seç
3. **Node.js** seç
4. Connection string'i kopyala:
```
mongodb+srv://santa_admin:<password>@santa-game.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## 5. .env Dosyasını Güncelle

`backend/.env` dosyasında:
```env
MONGODB_URI=mongodb+srv://santa_admin:ŞIFREN@santa-game.xxxxx.mongodb.net/santa_game?retryWrites=true&w=majority
```

`<password>` yerine şifreni yaz!

## 6. Backend'i Başlat

```bash
cd backend
npm install
npm start
```

✅ MongoDB bağlantısı başarılı mesajını göreceksin!

## Ücretsiz Plan Limitleri

- ✅ 512MB depolama
- ✅ Shared RAM
- ✅ Sınırsız bağlantı
- ✅ 100K kullanıcı için YETER
