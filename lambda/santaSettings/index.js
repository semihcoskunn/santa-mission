const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const userId = event.queryStringParameters?.userId;
        
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'userId required' })
            };
        }

        // GET - Load settings
        if (event.httpMethod === 'GET') {
            const result = await docClient.send(new GetCommand({
                TableName: 'SantaSettings',
                Key: { userId }
            }));

            const settings = result.Item || {
                userId,
                notifications: true,
                sound: true,
                snow: true,
                autoStart: false
            };

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, settings })
            };
        }

        // PUT - Save settings
        if (event.httpMethod === 'PUT') {
            const body = JSON.parse(event.body);
            const { notifications, sound, snow, autoStart } = body;

            await docClient.send(new PutCommand({
                TableName: 'SantaSettings',
                Item: {
                    userId,
                    notifications: notifications !== false,
                    sound: snow !== false,
                    snow: snow !== false,
                    autoStart: autoStart === true,
                    updatedAt: new Date().toISOString()
                }
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
