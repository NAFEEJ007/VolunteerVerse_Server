const admin = require('../config/firebase');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        // Try to find the user in DB. If missing, create a lightweight User record
        // so server-side flows that expect req.user.dbId (like creating events)
        // will work even when the client user hasn't been synced yet.
        let dbUser = await User.findOne({ uid: decodedToken.uid });
        if (!dbUser) {
            // Derive a simple username that fits the schema: letters and spaces only.
            const fallback = decodedToken.name || decodedToken.email || 'user';
            // Keep letters and spaces
            let username = String(fallback).replace(/[^a-zA-Z\s]/g, '').trim();
            if (username.length < 2) {
                // fallback to email prefix with letters only
                const prefix = String(decodedToken.email || 'user').split('@')[0];
                username = prefix.replace(/[^a-zA-Z\s]/g, '').trim();
            }
            if (username.length < 2) {
                username = `user${Math.floor(Math.random() * 9000) + 1000}`;
            }

            try {
                dbUser = new User({
                    uid: decodedToken.uid,
                    email: decodedToken.email || `${decodedToken.uid}@no-email.local`,
                    username,
                    displayName: decodedToken.name || '',
                    photoURL: decodedToken.picture || '',
                    role: 'volunteer'
                });
                await dbUser.save();
                console.log('Created new DB user for uid:', decodedToken.uid, 'username:', username);
            } catch (createErr) {
                console.error('Error creating DB user for uid', decodedToken.uid, createErr);
                // Continue without dbUser; createEvent will then fail with a descriptive message
            }
        }

        if (dbUser) {
            req.user.role = dbUser.role;
            req.user.dbId = dbUser._id;
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ message: 'Unauthorized', error: error.message });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };
