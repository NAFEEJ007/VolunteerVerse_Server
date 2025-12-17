// Seed script to create sample events
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Event = require('./models/Event');
const User = require('./models/User');

const sampleEvents = [
    {
        title: 'Community Blood Donation Drive',
        description: 'Help save lives by donating blood at our community blood drive. All blood types needed!',
        category: 'Healthcare',
        date: new Date('2025-12-15'),
        location: 'City Community Center',
        image: 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=500',
        capacity: 50,
        status: 'approved',
        fundraiserLink: ''
    },
    {
        title: 'Beach Cleanup Initiative',
        description: 'Join us for a day of cleaning our local beaches and protecting marine life.',
        category: 'Environment',
        date: new Date('2025-12-20'),
        location: 'Sunny Beach',
        image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=500',
        capacity: 100,
        status: 'approved',
        fundraiserLink: ''
    },
    {
        title: 'Free Tutoring for Underprivileged Children',
        description: 'Volunteer to teach and mentor children from underprivileged backgrounds.',
        category: 'Education',
        date: new Date('2025-12-18'),
        location: 'Hope Learning Center',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500',
        capacity: 20,
        status: 'approved',
        fundraiserLink: ''
    },
    {
        title: 'Food Distribution for Homeless',
        description: 'Help us distribute free meals to homeless individuals in our community.',
        category: 'Community Service',
        date: new Date('2025-12-22'),
        location: 'Downtown Shelter',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500',
        capacity: 30,
        status: 'approved',
        fundraiserLink: ''
    },
    {
        title: 'Senior Citizens Companionship Program',
        description: 'Spend time with elderly residents at local nursing homes and bring joy to their day.',
        category: 'Community Service',
        date: new Date('2025-12-25'),
        location: 'Sunshine Senior Home',
        image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=500',
        capacity: 15,
        status: 'approved',
        fundraiserLink: ''
    }
];

async function seedEvents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding');

        // Find or create a sample organizer
        let organizer = await User.findOne({ role: 'organizer' });

        if (!organizer) {
            // Create a sample organizer if none exists
            organizer = new User({
                uid: 'sample-organizer-uid',
                email: 'organizer@volunteerverse.com',
                role: 'organizer',
                displayName: 'Sample Organizer'
            });
            await organizer.save();
            console.log('Created sample organizer');
        }

        // Clear existing events
        await Event.deleteMany({});
        console.log('Cleared existing events');

        // Add organizer to each event
        const eventsWithOrganizer = sampleEvents.map(event => ({
            ...event,
            organizer: organizer._id,
            volunteers: [],
            requests: []
        }));

        // Insert sample events
        await Event.insertMany(eventsWithOrganizer);
        console.log('Sample events created successfully!');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding events:', error);
        process.exit(1);
    }
}

seedEvents();
