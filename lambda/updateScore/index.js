const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const { userId, score, streak } = JSON.parse(event.body);
        
        if (!userId) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ success: false, error: 'userId is required' })
            };
        }
        
        const command = new UpdateCommand({
            TableName: 'SantaUsers',
            Key: { userId },
            UpdateExpression: 'ADD total_score :score SET max_streak = if_not_exists(max_streak, :zero) + :streak',
            ExpressionAttributeValues: {
                ':score': score,
                ':streak': streak,
                ':zero': 0
            },
            ReturnValues: 'ALL_NEW'
        });
        
        await docClient.send(command);
        
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
