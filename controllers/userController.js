const User = require('../models/User');

// Create or get user
const createUser = async (req, res) => {
    try {
        console.log('createUser request body:', req.body);
        const { uid, email, username, role, displayName, photoURL } = req.body;

        // Check if user exists
        let user = await User.findOne({ uid });

        if (user) {
            // Update user if displayName or role is missing or different
            let needsUpdate = false;

            if (displayName && user.displayName !== displayName) {
                user.displayName = displayName;
                needsUpdate = true;
            }

            if (role && user.role !== role) {
                user.role = role;
                needsUpdate = true;
            }

            if (username && !user.username.includes('gmail')) {
                // Optional: update username if needed
            }

            if (needsUpdate) {
                await user.save();
            }
            return res.status(200).json(user);
        }

        // Create new user
        user = new User({
            uid,
            email,
            username,
            role: role || 'volunteer',
            displayName,
            photoURL
        });

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createUser,
    getCurrentUser,
    getUserById
};
