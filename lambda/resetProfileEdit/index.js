const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    try {
        const body = JSON.parse(event.body || '{}');
        const { userId } = body;
        
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'userId required' })
            };
        }
        
        // Reset profileEdited flag to allow editing again
        await docClient.send(new UpdateCommand({
            TableName: 'SantaUsers',
            Key: { userID: userId },
            UpdateExpression: 'SET profileEdited = :false',
            ExpressionAttributeValues: {
                ':false': false
            }
        }));
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Profile edit flag reset' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
