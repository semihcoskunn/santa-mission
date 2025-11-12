const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;
        const { score, streak } = JSON.parse(event.body);
        
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
