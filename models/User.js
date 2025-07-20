const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: 'https://i.imgur.com/JRqk1W1.png' },
    githubUsername: String,
    whatsappNumber: String,
    coins: { type: Number, default: 100 },
    lastClaim: Date,
    referrals: [String],
    referredBy: String,
    redeemedVouchers: [String],
    role: { type: String, default: 'user' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
