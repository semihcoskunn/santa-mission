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
    
    try {
        if (event.httpMethod === 'POST') {
            // POST - Create/Update user
            const body = JSON.parse(event.body || '{}');
            const { userId, name, email, photo, firstName, lastName, username } = body;
            
            if (!userId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'userId required' })
                };
            }
            
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
        } else {
            // GET - Retrieve user
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
                Key: { userID: userId }
            });
            
            const response = await docClient.send(command);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(response.Item || {})
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
