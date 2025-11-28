# Settings Database Setup

## 1. DynamoDB Tablosu Oluştur

AWS Console > DynamoDB > Tables > Create table

**Tablo Ayarları:**
- Table name: `SantaSettings`
- Partition key: `userId` (String)
- Table settings: Default settings
- Read/write capacity: On-demand

## 2. Lambda Fonksiyonu Oluştur

AWS Console > Lambda > Create function

**Fonksiyon Ayarları:**
- Function name: `santa-settings`
- Runtime: Node.js 20.x
- Architecture: x86_64
- Execution role: Create new role with basic Lambda permissions

**Kod:**
- `lambda/settings.js` dosyasındaki kodu kopyala yapıştır

**Environment variables:**
Yok (region hardcoded: eu-central-1)

**Permissions:**
Lambda execution role'e şu policy'yi ekle:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem"
            ],
            "Resource": "arn:aws:dynamodb:eu-central-1:*:table/SantaSettings"
        }
    ]
}
```

## 3. API Gateway Entegrasyonu

Mevcut API Gateway'e yeni route ekle:

**Route:**
- Path: `/settings`
- Methods: GET, PUT, OPTIONS
- Integration: Lambda function (santa-settings)
- CORS: Enabled

**Deploy:**
- Stage: prod

## 4. Test

```bash
# GET settings
curl "https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod/settings?userId=test123"

# PUT settings
curl -X PUT "https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod/settings?userId=test123" \
  -H "Content-Type: application/json" \
  -d '{"notifications":true,"sound":true,"snow":true,"autoStart":false}'
```

## 5. Deployment

```bash
git add -A
git commit -m "Move settings to database"
git push
```

## Notlar

- Ayarlar artık database'de saklanıyor
- LocalStorage sadece cache olarak kullanılıyor
- Farklı cihazlarda senkronize oluyor
- Offline durumda localStorage fallback var
