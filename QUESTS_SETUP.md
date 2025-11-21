# Günlük Görevler Sistemi Kurulumu

## 1. DynamoDB Tablosu Oluştur

**Tablo Adı:** `SantaQuests`

**Partition Key:** `userID` (String)
**Sort Key:** `date` (String) - Format: YYYY-MM-DD

**Attributes:**
```json
{
  "userID": "string",
  "date": "string",
  "collect5": {
    "progress": 0,
    "claimed": false
  },
  "collect10": {
    "progress": 0,
    "claimed": false
  },
  "combo5": {
    "progress": 0,
    "claimed": false
  },
  "score200": {
    "progress": 0,
    "claimed": false
  }
}
```

**TTL Ayarı:**
- TTL attribute: `expiresAt`
- Görevler 7 gün sonra otomatik silinir

## 2. Lambda Fonksiyonu Oluştur

**Fonksiyon Adı:** `SantaGetQuests`
**Runtime:** Node.js 20.x
**Kod:** `lambda/getQuests/index.js`

**IAM Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:eu-central-1:381492273658:table/SantaQuests",
        "arn:aws:dynamodb:eu-central-1:381492273658:table/SantaScores"
      ]
    }
  ]
}
```

## 3. API Gateway Endpoint

**Resource:** `/quests`
**Methods:** GET, PUT
**Integration:** Lambda Proxy (SantaGetQuests)

**GET:** Kullanıcının günlük görevlerini getir
- Query Parameter: `userId`
- Response: Görev listesi

**PUT:** Görev ilerlemesini güncelle veya ödül al
- Body: `{ questId, progress?, claimed?, rewardPoints? }`

## 4. EventBridge Rule (Günlük Sıfırlama)

**NOT:** Görevler otomatik sıfırlanır çünkü her gün yeni `date` key'i kullanılır.
Kullanıcı yeni gün giriş yaptığında otomatik olarak yeni görevler oluşturulur.

## 5. Frontend Entegrasyonu

`game.js` dosyasında:
- `loadQuests()` → API'den yükle
- `saveQuests()` → API'ye kaydet
- `claimQuest()` → Ödül puanını database'e ekle

## Nasıl Çalışır?

1. Kullanıcı oyuna giriş yapar
2. GET `/quests?userId=X` → Bugünün görevlerini getir
3. Görev yoksa otomatik oluşturulur (date = bugün)
4. Kullanıcı ikon toplar → PUT `/quests` ile progress güncellenir
5. Görev tamamlanır → Kullanıcı claim eder → PUT `/quests` ile claimed=true ve puan eklenir
6. Ertesi gün → Yeni date key'i ile yeni görevler oluşturulur

## Avantajlar

✅ Her gün otomatik yeni görevler
✅ Görev puanları kalıcı olarak database'e eklenir
✅ Eski görevler 7 gün sonra otomatik silinir (TTL)
✅ LocalStorage yerine database kullanımı
