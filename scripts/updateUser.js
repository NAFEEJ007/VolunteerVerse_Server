const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const updateDisplayName = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'nafeejtamjeed@gmail.com';
        const newName = 'Nafeej Tamjeed';

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        console.log('Found user:', user);

        if (!user.username) {
            console.log('User is missing username. Setting a default one.');
            user.username = 'nafeejtamjeed';
        }

        user.displayName = newName;
        await user.save();

        console.log(`Updated display name for ${email} to "${newName}"`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateDisplayName();
