// Script to fix Turkish characters in DynamoDB
// Run this with: node fix-turkish-chars.js

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function fixUserData() {
    const userId = '108189782237785764259'; // Your user ID
    
    try {
        // Get current user data
        const getResponse = await docClient.send(new GetCommand({
            TableName: 'SantaUsers',
            Key: { userID: userId }
        }));
        
        console.log('Current data:', getResponse.Item);
        
        // Update with correct Turkish characters
        const updateResponse = await docClient.send(new PutCommand({
            TableName: 'SantaUsers',
            Item: {
                userID: userId,
                firstName: 'Semih',
                lastName: 'Coşkun', // Fixed: ş instead of s
                username: 'semihcoskun',
                name: 'Semih Coşkun',
                email: getResponse.Item.email,
                photo: getResponse.Item.photo,
                profileEdited: getResponse.Item.profileEdited
            }
        }));
        
        console.log('Updated successfully!');
        
        // Verify
        const verifyResponse = await docClient.send(new GetCommand({
            TableName: 'SantaUsers',
            Key: { userID: userId }
        }));
        
        console.log('New data:', verifyResponse.Item);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

fixUserData();
