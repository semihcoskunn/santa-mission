const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

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
        console.log('Event:', JSON.stringify(event));
        
        const body = JSON.parse(event.body || '{}');
        const { userId, score } = body;
        
        if (!userId || score === undefined) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'userId and score required' })
            };
        }
        
        // Save score to SantaScores table
        await docClient.send(new PutCommand({
            TableName: 'SantaScores',
            Item: {
                userID: userId,
                timestamp: Date.now(),
                score: score
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
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
