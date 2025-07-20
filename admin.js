const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Deployment = require('../models/Deployment');
const AdminSettings = require('../models/AdminSettings');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get admin dashboard stats
router.get('/', authenticate, isAdmin, async (req, res) => {
    try {
        const [totalUsers, activeUsers, totalDeployments, settings] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            Deployment.countDocuments(),
            AdminSettings.findOne()
        ]);
        
        res.json({
            totalUsers,
            activeUsers,
            totalDeployments,
            herokuKeys: settings.herokuApiKeys,
            activeHerokuKey: settings.herokuApiKeys[settings.activeHerokuKeyIndex],
            maintenance: settings.maintenance,
            maintenanceMessage: settings.maintenanceMessage,
            githubRepo: settings.githubRepo
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Heroku API keys
router.put('/heroku-keys', authenticate, isAdmin, async (req, res) => {
    try {
        const { keys } = req.body;
        
        const settings = await AdminSettings.findOneAndUpdate(
            {},
            { herokuApiKeys: keys },
            { new: true, upsert: true }
        );
        
        res.json(settings);
    } catch (error) {
        console.error('Update Heroku keys error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update GitHub repo
router.put('/github-repo', authenticate, isAdmin, async (req, res) => {
    try {
        const { repo } = req.body;
        
        const settings = await AdminSettings.findOneAndUpdate(
            {},
            { githubRepo: repo },
            { new: true, upsert: true }
        );
        
        res.json(settings);
    } catch (error) {
        console.error('Update GitHub repo error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Toggle maintenance mode
router.put('/maintenance', authenticate, isAdmin, async (req, res) => {
    try {
        const { maintenance, message } = req.body;
        
        const settings = await AdminSettings.findOneAndUpdate(
            {},
            { maintenance, maintenanceMessage: message },
            { new: true, upsert: true }
        );
        
        res.json(settings);
    } catch (error) {
        console.error('Toggle maintenance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -__v')
            .sort({ createdAt: -1 });
            
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Ban/unban user
router.put('/users/:id/ban', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: req.body.ban },
            { new: true }
        ).select('-password -__v');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all deployments
router.get('/deployments', authenticate, isAdmin, async (req, res) => {
    try {
        const deployments = await Deployment.find()
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });
            
        res.json(deployments);
    } catch (error) {
        console.error('Get deployments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update coin settings
router.put('/coin-settings', authenticate, isAdmin, async (req, res) => {
    try {
        const settings = await AdminSettings.findOneAndUpdate(
            {},
            { coinSettings: req.body },
            { new: true, upsert: true }
        );
        
        res.json(settings.coinSettings);
    } catch (error) {
        console.error('Update coin settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
