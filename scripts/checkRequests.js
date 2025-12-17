const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkRequests = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testOrganizer = await User.findOne({ email: 'testorganizer@gmail.com' });
        console.log('Test Organizer ID:', testOrganizer._id);

        // Find events with PENDING requests
        const events = await Event.find({ 'requests.status': 'pending' });
        console.log(`Found ${events.length} events with PENDING requests.`);

        events.forEach(e => {
            console.log(`Event: ${e.title}`);
            console.log(`Organizer: ${e.organizer}`);
            const pending = e.requests.filter(r => r.status === 'pending');
            console.log('Pending Requests:', JSON.stringify(pending, null, 2));
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkRequests();
