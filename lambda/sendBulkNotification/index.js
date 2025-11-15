const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    try {
        const body = JSON.parse(event.body || '{}');
        const { type, title, message } = body;
        
        if (!type || !title || !message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Missing required fields' })
            };
        }
        
        // Get all users
        const scanResponse = await docClient.send(new ScanCommand({
            TableName: 'SantaUsers',
            ProjectionExpression: 'userID'
        }));
        
        const users = scanResponse.Items || [];
        const timestamp = Date.now();
        
        // Send notification to each user
        const promises = users.map(user => 
            docClient.send(new PutCommand({
                TableName: 'SantaNotifications',
                Item: {
                    userID: user.userID,
                    timestamp: timestamp,
                    type: type,
                    title: title,
                    message: message,
                    read: false
                }
            }))
        );
        
        await Promise.all(promises);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                userCount: users.length 
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
