const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        console.log('Event:', JSON.stringify(event));
        
        // Non-proxy integration: body comes directly as event
        const { userId, score, streak } = event;
        
        if (!userId || score === undefined) {
            return { success: false, error: 'userId and score required', debug: { userId, score, event } };
        }
        
        // Save score to SantaScores table
        await docClient.send(new PutCommand({
            TableName: 'SantaScores',
            Item: {
                userID: userId,
                timestamp: Date.now(),
                score: score,
                streak: streak || 0
            }
        }));
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
