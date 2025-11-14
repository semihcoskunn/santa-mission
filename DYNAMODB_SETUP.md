# DynamoDB Table Setup

## SantaNotifications Table

AWS Console → DynamoDB → Create table:

**Table name:** `SantaNotifications`

**Partition key:** `userID` (String)

**Sort key:** `timestamp` (Number)

**Settings:** Use default settings

---

## Lambda Function Setup

1. AWS Console → Lambda → Create function
2. Function name: `getNotifications`
3. Runtime: Node.js 20.x
4. Copy code from `lambda/getNotifications/index.js`
5. Add DynamoDB permissions to Lambda role

## API Gateway Setup

1. AWS Console → API Gateway → Your API
2. Create resource: `/notifications`
3. Create methods: GET, POST, OPTIONS
4. Integration type: Lambda Function
5. Lambda Function: `getNotifications`
6. Enable CORS
7. Deploy API

## Test Notification Creation

```javascript
fetch('https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: '108189782237785764259',
        type: 'welcome',
        title: 'Hoş Geldin!',
        message: 'Santa\'nın Gizli Görevi\'ne katıldığın için teşekkürler!'
    })
}).then(r => r.json()).then(d => console.log(d))
```
