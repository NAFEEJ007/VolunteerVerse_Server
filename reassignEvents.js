// Script to reassign all events to a specific organizer
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Event = require('./models/Event');
const User = require('./models/User');

async function reassignEvents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find the organizer you're logged in as
        // Replace this email with your organizer email
        const organizerEmail = 'YOUR_ORGANIZER_EMAIL@example.com'; // UPDATE THIS!
        
        const organizer = await User.findOne({ email: organizerEmail, role: 'organizer' });

        if (!organizer) {
            console.log('Organizer not found! Please update the email in the script.');
            console.log('Available organizers:');
            const organizers = await User.find({ role: 'organizer' });
            organizers.forEach(org => {
                console.log(`  - ${org.email} (ID: ${org._id})`);
            });
            process.exit(1);
        }

        console.log(`Found organizer: ${organizer.email} (ID: ${organizer._id})`);

        // Update all events to belong to this organizer
        const result = await Event.updateMany(
            {},
            { $set: { organizer: organizer._id } }
        );

        console.log(`Updated ${result.modifiedCount} events`);
        console.log('All events are now assigned to:', organizer.email);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error reassigning events:', error);
        process.exit(1);
    }
}

reassignEvents();
