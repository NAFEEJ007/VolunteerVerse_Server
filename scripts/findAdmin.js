const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const findAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('No admin user found.');
        } else {
            console.log('Admin found:', admin.email);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findAdmin();
