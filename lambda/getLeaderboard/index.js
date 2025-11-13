const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

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
        // Get all users
        const usersResponse = await docClient.send(new ScanCommand({
            TableName: 'SantaUsers',
            ProjectionExpression: 'userID, username, photo',
        }));
        
        // Get all scores
        const scoresResponse = await docClient.send(new ScanCommand({
            TableName: 'SantaScores'
        }));
        
        // Calculate total scores and max streaks per user
        const userStats = {};
        scoresResponse.Items.forEach(score => {
            if (!userStats[score.userID]) {
                userStats[score.userID] = { total_score: 0, max_streak: 0 };
            }
            userStats[score.userID].total_score += score.score || 0;
            userStats[score.userID].max_streak = Math.max(userStats[score.userID].max_streak, score.streak || 0);
        });
        
        // Combine user info with stats
        const leaderboard = usersResponse.Items
            .map(user => ({
                userID: user.userID,
                name: user.username || 'User',
                photo: user.photo,
                total_score: userStats[user.userID]?.total_score || 0,
                max_streak: userStats[user.userID]?.max_streak || 0
            }))
            .filter(user => user.total_score > 0)
            .sort((a, b) => b.total_score - a.total_score)
            .slice(0, 1000);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                leaderboard
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
