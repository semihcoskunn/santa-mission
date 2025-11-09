const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    google_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: String,
    total_score: { type: Number, default: 0 },
    max_streak: { type: Number, default: 0 },
    daily_quests: {
        date: String,
        collect5: { progress: { type: Number, default: 0 }, claimed: { type: Boolean, default: false } },
        collect10: { progress: { type: Number, default: 0 }, claimed: { type: Boolean, default: false } },
        combo5: { progress: { type: Number, default: 0 }, claimed: { type: Boolean, default: false } },
        score200: { progress: { type: Number, default: 0 }, claimed: { type: Boolean, default: false } }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

class UserService {
    static async findOrCreate(googleProfile) {
        try {
            let user = await User.findOne({ google_id: googleProfile.id });
            
            if (!user) {
                user = await User.create({
                    google_id: googleProfile.id,
                    name: googleProfile.displayName,
                    email: googleProfile.emails[0].value,
                    photo: googleProfile.photos[0].value
                });
            }
            
            return user;
        } catch (error) {
            console.error('User findOrCreate error:', error);
            throw error;
        }
    }
    
    static async updateScore(userId, score, streak) {
        try {
            await User.findByIdAndUpdate(userId, {
                $inc: { total_score: score },
                $max: { max_streak: streak }
            });
        } catch (error) {
            console.error('Update score error:', error);
            throw error;
        }
    }
    
    static async getStats(userId) {
        try {
            const user = await User.findById(userId);
            return {
                total_score: user?.total_score || 0,
                max_streak: user?.max_streak || 0
            };
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    }
    
    static async getLeaderboard() {
        try {
            const users = await User.find()
                .sort({ total_score: -1 })
                .limit(100)
                .select('name photo total_score max_streak');
            return users;
        } catch (error) {
            console.error('Get leaderboard error:', error);
            throw error;
        }
    }
    
    static async getUserRank(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return null;
            
            const rank = await User.countDocuments({ total_score: { $gt: user.total_score } }) + 1;
            return {
                rank,
                total_score: user.total_score,
                name: user.name
            };
        } catch (error) {
            console.error('Get user rank error:', error);
            throw error;
        }
    }
    
    static async updateQuestProgress(userId, type, value = 1) {
        try {
            const user = await User.findById(userId);
            if (!user) return;
            
            const today = new Date().toDateString();
            if (!user.daily_quests || user.daily_quests.date !== today) {
                user.daily_quests = {
                    date: today,
                    collect5: { progress: 0, claimed: false },
                    collect10: { progress: 0, claimed: false },
                    combo5: { progress: 0, claimed: false },
                    score200: { progress: 0, claimed: false }
                };
            }
            
            if (type === 'collect') {
                if (!user.daily_quests.collect5.claimed) user.daily_quests.collect5.progress++;
                if (!user.daily_quests.collect10.claimed) user.daily_quests.collect10.progress++;
            } else if (type === 'combo') {
                if (!user.daily_quests.combo5.claimed) user.daily_quests.combo5.progress++;
            } else if (type === 'score') {
                if (!user.daily_quests.score200.claimed) user.daily_quests.score200.progress += value;
            }
            
            await user.save();
        } catch (error) {
            console.error('Update quest progress error:', error);
            throw error;
        }
    }
    
    static async claimQuest(userId, questId) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.daily_quests) return null;
            
            const configs = { collect5: 5, collect10: 10, combo5: 5, score200: 200 };
            const rewards = { collect5: 50, collect10: 100, combo5: 150, score200: 200 };
            
            const quest = user.daily_quests[questId];
            if (!quest || quest.claimed || quest.progress < configs[questId]) {
                return null;
            }
            
            quest.claimed = true;
            user.total_score += rewards[questId];
            await user.save();
            
            return { reward: rewards[questId], total_score: user.total_score };
        } catch (error) {
            console.error('Claim quest error:', error);
            throw error;
        }
    }
    
    static async getDailyQuests(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return null;
            
            const today = new Date().toDateString();
            if (!user.daily_quests || user.daily_quests.date !== today) {
                user.daily_quests = {
                    date: today,
                    collect5: { progress: 0, claimed: false },
                    collect10: { progress: 0, claimed: false },
                    combo5: { progress: 0, claimed: false },
                    score200: { progress: 0, claimed: false }
                };
                await user.save();
            }
            
            return user.daily_quests;
        } catch (error) {
            console.error('Get daily quests error:', error);
            throw error;
        }
    }
}

module.exports = UserService;
