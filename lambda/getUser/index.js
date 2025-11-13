const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

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
    
    // POST - Create/Update user
    if (event.httpMethod === 'POST') {
        try {
            const body = event['body-json'] || JSON.parse(event.body || '{}');
            const { userId, name, email, photo } = body;
            
            if (!userId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'userId required' })
                };
            }
            
            const { firstName, lastName, username } = body;
            
            // Check if username is taken
            if (username) {
                const scanResponse = await docClient.send(new ScanCommand({
                    TableName: 'SantaUsers',
                    FilterExpression: 'username = :username AND userID <> :userId',
                    ExpressionAttributeValues: {
                        ':username': username,
                        ':userId': userId
                    }
                }));
                
                if (scanResponse.Items && scanResponse.Items.length > 0) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ success: false, error: 'Username already taken' })
                    };
                }
            }
            
            await docClient.send(new PutCommand({
                TableName: 'SantaUsers',
                Item: {
                    userID: userId,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    username: username || '',
                    name: name || `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous',
                    email: email || '',
                    photo: photo || ''
                }
            }));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
    
    // GET - Retrieve user
    try {
        const userId = event.queryStringParameters?.userId;
        
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'userId is required' })
            };
        }
        
        const command = new GetCommand({
            TableName: 'SantaUsers',
            Key: { userId }
        });
        
        const response = await docClient.send(command);
        
        if (!response.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, error: 'User not found' })
            };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response.Item || {})
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
