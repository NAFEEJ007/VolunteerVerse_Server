const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkCertificateNames = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'volunteer' }, 'email username displayName');

        console.log('Checking certificate name resolution for volunteers:');
        users.forEach(user => {
            let volunteerName = user.displayName;

            if (!volunteerName || volunteerName === 'undefined') {
                volunteerName = user.username;
            }

            if (!volunteerName || volunteerName === 'undefined') {
                volunteerName = user.email.split('@')[0];
            }

            console.log(`Email: ${user.email}`);
            console.log(`  Original DisplayName: "${user.displayName}"`);
            console.log(`  Original Username: "${user.username}"`);
            console.log(`  Resolved Name: "${volunteerName}"`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkCertificateNames();
