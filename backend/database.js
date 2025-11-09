const mongoose = require('mongoose');
require('dotenv').config();

async function initDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/santa_game');
        console.log('✅ MongoDB bağlantısı başarılı!');
    } catch (error) {
        console.error('❌ MongoDB bağlantı hatası:', error.message);
    }
}

module.exports = { mongoose, initDatabase };
