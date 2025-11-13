const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
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
