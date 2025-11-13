const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        // Non-proxy integration: check if it's GET or POST
        const isGet = event.userId !== undefined; // GET has userId in query
        
        if (!isGet) {
            // POST - Create/Update user
            const { userId, name, email, photo, firstName, lastName, username } = event;
            
            if (!userId) {
                return { success: false, error: 'userId required' };
            }
            
            // Check if username is taken
            if (username) {
                const scanResponse = await docClient.send(new ScanCommand({
                    TableName: 'SantaUsers',
                    FilterExpression: 'username = :username AND userID <> :userId',
                    ExpressionAttributeValues: {
                        ':username': username,
                        ':userId': userId
                    }
                }));
                
                if (scanResponse.Items && scanResponse.Items.length > 0) {
                    return { success: false, error: 'Username already taken' };
                }
            }
            
            await docClient.send(new PutCommand({
                TableName: 'SantaUsers',
                Item: {
                    userID: userId,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    username: username || '',
                    name: name || `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous',
                    email: email || '',
                    photo: photo || ''
                }
            }));
            
            return { success: true };
        } else {
            // GET - Retrieve user
            const userId = event.userId;
            
            if (!userId) {
                return { success: false, error: 'userId is required' };
            }
            
            const command = new GetCommand({
                TableName: 'SantaUsers',
                Key: { userID: userId }
            });
            
            const response = await docClient.send(command);
            
            return response.Item || {};
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};
