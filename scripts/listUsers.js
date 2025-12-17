const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ $or: [{ displayName: { $exists: false } }, { displayName: "" }] }, 'email username displayName role');
        console.log('Users found:', users.length);
        users.forEach(user => {
            console.log(`ID: ${user._id}, Email: ${user.email}, Username: "${user.username}", DisplayName: "${user.displayName}", Role: ${user.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();
