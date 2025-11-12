const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const command = new ScanCommand({
            TableName: 'SantaUsers',
            ProjectionExpression: 'userId, #n, photo, total_score, max_streak',
            ExpressionAttributeNames: { '#n': 'name' }
        });
        
        const response = await docClient.send(command);
        
        const leaderboard = response.Items
            .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
            .slice(0, 100);
        
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                leaderboard
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
