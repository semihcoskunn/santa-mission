const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }
    
    try {
        const body = event['body-json'] || JSON.parse(event.body || '{}');
        const { userId, score, streak, name, email, photo } = body;
        
        if (!userId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({ success: false, error: 'userId required' })
            };
        }
        
        // Update score by adding to existing, update streak only if higher
        const command = new UpdateCommand({
            TableName: 'SantaUsers',
            Key: { userID: userId },
            UpdateExpression: 'SET #name = :name, email = :email, photo = :photo, total_score = if_not_exists(total_score, :zero) + :score, max_streak = if_not_exists(max_streak, :zero)',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': name || 'Anonymous',
                ':email': email || '',
                ':photo': photo || '',
                ':score': score || 0,
                ':zero': 0
            },
            ReturnValues: 'ALL_NEW'
        });
        
        const result = await docClient.send(command);
        
        // Update max_streak separately if current streak is higher
        if (streak && (!result.Attributes.max_streak || streak > result.Attributes.max_streak)) {
            await docClient.send(new UpdateCommand({
                TableName: 'SantaUsers',
                Key: { userID: userId },
                UpdateExpression: 'SET max_streak = :streak',
                ExpressionAttributeValues: {
                    ':streak': streak
                }
            }));
        }
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
