const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

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
        const username = event.queryStringParameters?.username || event.params?.querystring?.username;
        
        if (!username) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ available: false, error: 'username required' })
            };
        }
        
        const response = await docClient.send(new ScanCommand({
            TableName: 'SantaUsers',
            FilterExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username
            }
        }));
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ available: !response.Items || response.Items.length === 0 })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ available: false, error: error.message })
        };
    }
};
