const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    try {
        if (event.httpMethod === 'POST') {
            // POST - Create notification
            const body = JSON.parse(event.body || '{}');
            const { userId, type, title, message } = body;
            
            if (!userId || !type || !title || !message) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Missing required fields' })
                };
            }
            
            const timestamp = Date.now();
            
            await docClient.send(new PutCommand({
                TableName: 'SantaNotifications',
                Item: {
                    userID: userId,
                    timestamp: timestamp,
                    type: type,
                    title: title,
                    message: message,
                    read: false
                }
            }));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } else {
            // GET - Retrieve notifications for user
            const userId = event.queryStringParameters?.userId;
            
            if (!userId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'userId required' })
                };
            }
            
            const command = new QueryCommand({
                TableName: 'SantaNotifications',
                KeyConditionExpression: 'userID = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                ScanIndexForward: false, // Sort by timestamp descending
                Limit: 50
            });
            
            const response = await docClient.send(command);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    notifications: response.Items || []
                })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
