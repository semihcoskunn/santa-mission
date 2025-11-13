const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const username = event.username;
        
        if (!username) {
            return { available: false, error: 'username required' };
        }
        
        const response = await docClient.send(new ScanCommand({
            TableName: 'SantaUsers',
            FilterExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username
            }
        }));
        
        return { available: !response.Items || response.Items.length === 0 };
    } catch (error) {
        return { available: false, error: error.message };
    }
};
