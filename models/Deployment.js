const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appName: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'pending' },
    lastPaid: Date,
    config: Object,
    logs: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deployment', deploymentSchema);
