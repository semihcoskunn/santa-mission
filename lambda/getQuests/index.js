const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    try {
        const userId = event.queryStringParameters?.userId || event.params?.querystring?.userId;
        
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'userId required' })
            };
        }
        
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (event.httpMethod === 'GET') {
            // Get user's quests for today
            const response = await docClient.send(new GetCommand({
                TableName: 'SantaQuests',
                Key: { userID: userId, date: today }
            }));
            
            if (!response.Item) {
                // Create new quests for today
                const newQuests = {
                    userID: userId,
                    date: today,
                    collect5: { progress: 0, claimed: false },
                    collect10: { progress: 0, claimed: false },
                    combo5: { progress: 0, claimed: false },
                    score200: { progress: 0, claimed: false }
                };
                
                await docClient.send(new PutCommand({
                    TableName: 'SantaQuests',
                    Item: newQuests
                }));
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, quests: newQuests })
                };
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, quests: response.Item })
            };
            
        } else if (event.httpMethod === 'PUT') {
            // Update quest progress or claim reward
            const body = JSON.parse(event.body || '{}');
            const { questId, progress, claimed, rewardPoints } = body;
            
            if (!questId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'questId required' })
                };
            }
            
            const updateExpression = [];
            const expressionAttributeValues = {};
            
            if (progress !== undefined) {
                updateExpression.push(`${questId}.progress = :progress`);
                expressionAttributeValues[':progress'] = progress;
            }
            
            if (claimed !== undefined) {
                updateExpression.push(`${questId}.claimed = :claimed`);
                expressionAttributeValues[':claimed'] = claimed;
            }
            
            await docClient.send(new UpdateCommand({
                TableName: 'SantaQuests',
                Key: { userID: userId, date: today },
                UpdateExpression: `SET ${updateExpression.join(', ')}`,
                ExpressionAttributeValues: expressionAttributeValues
            }));
            
            // If claiming reward, update user's total score
            if (claimed && rewardPoints) {
                await docClient.send(new UpdateCommand({
                    TableName: 'SantaScores',
                    Key: { userID: userId },
                    UpdateExpression: 'ADD totalScore :reward',
                    ExpressionAttributeValues: { ':reward': rewardPoints }
                }));
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }
        
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
