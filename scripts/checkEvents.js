const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const events = await Event.find({});
        console.log(`Found ${events.length} total events.`);

        events.forEach(event => {
            console.log(`- [${event.status}] ${event.title} (ID: ${event._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkEvents();
