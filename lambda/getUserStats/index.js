const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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
                body: JSON.stringify({ error: 'userId required' })
            };
        }
        
        const command = new QueryCommand({
            TableName: 'SantaScores',
            KeyConditionExpression: 'userID = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        });
        
        const response = await docClient.send(command);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                totalGames: response.Items?.length || 0,
                games: response.Items || []
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
