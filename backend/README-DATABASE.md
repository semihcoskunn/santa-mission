# MySQL Veritabanı Kurulumu

## 1. MySQL Kurulumu

Eğer MySQL yüklü değilse:
- **Windows**: [MySQL Installer](https://dev.mysql.com/downloads/installer/) indir
- **XAMPP**: XAMPP kullanıyorsan MySQL zaten var

## 2. Veritabanını Oluştur

### Yöntem 1: Otomatik (Backend başlatınca)
Backend ilk çalıştığında tabloları otomatik oluşturur.

### Yöntem 2: Manuel (SQL Script)
```bash
# MySQL'e giriş yap
mysql -u root -p

# Script'i çalıştır
source setup-database.sql
```

### Yöntem 3: phpMyAdmin (XAMPP kullanıyorsan)
1. http://localhost/phpmyadmin aç
2. "SQL" sekmesine git
3. `setup-database.sql` dosyasının içeriğini yapıştır
4. "Go" butonuna tıkla

## 3. .env Dosyasını Düzenle

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=santa_game
```

## 4. NPM Paketlerini Yükle

```bash
cd backend
npm install
```

## 5. Backend'i Başlat

```bash
npm start
```

## Veritabanı Yapısı

### users
- Kullanıcı bilgileri (Google OAuth)
- Total score ve max streak

### game_sessions
- Oyun oturumları
- Günlük skorlar

### daily_quests
- Günlük görevler
- İlerleme ve ödül durumu

## API Endpoints

- `GET /api/user` - Kullanıcı bilgisi + istatistikler
- `POST /api/update-score` - Skor güncelle
- `GET /api/stats` - Kullanıcı istatistikleri
