const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Event = require('../models/Event');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const createRequest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const volunteerEmail = 'testuser3@gmail.com';
        const volunteer = await User.findOne({ email: volunteerEmail });
        if (!volunteer) {
            console.log('Volunteer not found');
            process.exit(1);
        }

        const events = await Event.find({});
        if (events.length === 0) {
            console.log('No events found');
            process.exit(1);
        }

        const event = events[1] || events[0]; // Use second event if available

        // Check if request already exists
        const existingRequest = event.requests.find(r => r.user.toString() === volunteer._id.toString());
        if (existingRequest) {
            console.log('Request already exists, removing it first...');
            event.requests.pull(existingRequest._id);
        }

        event.requests.push({
            user: volunteer._id,
            status: 'pending'
        });

        await event.save();
        console.log('Event request created for', event.title);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createRequest();
