const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate JWT token
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
}

// Check if user is admin
function isAdmin(req, res, next) {
    if (req.user.role === 'admin') return next();
    res.status(403).json({ error: 'Admin access required' });
}

// Check if user is active
async function isActive(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user.isActive) {
            return res.status(403).json({ error: 'Account suspended' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { authenticate, isAdmin, isActive };
