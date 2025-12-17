// Seed script for notices and polls
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Notice = require('./models/Notice');
const Poll = require('./models/Poll');
const User = require('./models/User');

const sampleNotices = [
    {
        title: 'Welcome to VolunteerVerse!',
        content: 'We are excited to have you join our community of volunteers. Together, we can make a difference in our community through various volunteering activities.',
        type: 'announcement'
    },
    {
        title: 'Important: Safety Guidelines',
        content: 'Please review the safety guidelines before participating in any events. Your safety is our top priority. Always wear appropriate protective gear and follow event organizer instructions.',
        type: 'alert'
    },
    {
        title: 'New Beach Cleanup Event',
        content: 'Join us this weekend for a beach cleanup event! We will be cleaning Sunny Beach on Saturday morning. Bring gloves and reusable water bottles.',
        type: 'info'
    }
];

const samplePolls = [
    {
        question: 'What type of volunteering events are you most interested in?',
        options: [
            { text: 'Environmental (Beach cleanup, Tree planting)', votes: 0 },
            { text: 'Healthcare (Blood donation, Health camps)', votes: 0 },
            { text: 'Education (Teaching, Tutoring)', votes: 0 },
            { text: 'Community Service (Food distribution, Elder care)', votes: 0 }
        ],
        voters: []
    },
    {
        question: 'What is the best time for weekend events?',
        options: [
            { text: 'Early morning (7-9 AM)', votes: 0 },
            { text: 'Mid-morning (9-11 AM)', votes: 0 },
            { text: 'Afternoon (2-4 PM)', votes: 0 },
            { text: 'Evening (4-6 PM)', votes: 0 }
        ],
        voters: []
    }
];

async function seedNotices() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding notices');

        // Find organizer or admin for authoring content
        let organizer = await User.findOne({ role: 'organizer' });

        if (!organizer) {
            organizer = await User.findOne({ role: 'admin' });
        }

        if (!organizer) {
            console.log('No organizer or admin found. Please run user seed first.');
            process.exit(1);
        }

        // Clear existing notices and polls
        await Notice.deleteMany({});
        await Poll.deleteMany({});
        console.log('Cleared existing notices and polls');

        // Seed Notices
        const noticesWithAuthor = sampleNotices.map(notice => ({
            ...notice,
            author: organizer._id,
            readBy: [] // Initialize as empty - no one has read yet
        }));
        await Notice.insertMany(noticesWithAuthor);
        console.log('Sample notices created');

        // Seed Polls
        const pollsWithOrganizer = samplePolls.map(poll => ({
            ...poll,
            organizer: organizer._id,
            readBy: [] // Initialize as empty - no one has read yet
        }));
        await Poll.insertMany(pollsWithOrganizer);
        console.log('Sample polls created');

        console.log('\n✅ All sample notices and polls created successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding notices:', error);
        process.exit(1);
    }
}

seedNotices();
