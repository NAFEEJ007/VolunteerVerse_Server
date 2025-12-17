// Seed script for articles, questions, and gallery
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Article = require('./models/Article');
const Question = require('./models/Question');
const Gallery = require('./models/Gallery');
const User = require('./models/User');
const Event = require('./models/Event');

const sampleArticles = [
    {
        title: 'The Importance of Volunteering in Our Community',
        content: 'Volunteering is not just about giving time; it\'s about making a real difference in people\'s lives. When we volunteer, we contribute to building stronger, more resilient communities. From helping the elderly to teaching children, every act of kindness counts.',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500',
        status: 'approved'
    },
    {
        title: 'How Beach Cleanups Help Our Environment',
        content: 'Beach cleanups are more than just picking up trash. They protect marine life, prevent pollution, and raise awareness about environmental conservation. Join us in our mission to keep our beaches clean and our oceans healthy.',
        image: 'https://images.unsplash.com/photo-1618477460757-66f577b8912e?w=500',
        status: 'approved'
    },
    {
        title: 'Blood Donation: A Gift of Life',
        content: 'Every blood donation can save up to three lives. It\'s a simple act that takes less than an hour but has a profound impact. Learn about the blood donation process and how you can become a regular donor.',
        image: 'https://images.unsplash.com/photo-1615461065159-fea0960485d5?w=500',
        status: 'approved'
    }
];

const sampleQuestions = [
    {
        question: 'How can I become a regular volunteer?',
        status: 'approved',
        answers: [
            {
                text: 'Start by creating an account and browsing available events. Join events that match your interests and schedule. After completing a few events, you can become a regular volunteer!'
            }
        ]
    },
    {
        question: 'What should I bring to a beach cleanup event?',
        status: 'approved',
        answers: [
            {
                text: 'Bring gloves, a reusable water bottle, sunscreen, and comfortable clothes. We provide trash bags and tools.',
                comments: [
                    {
                        text: 'Don\'t forget a hat for sun protection!'
                    }
                ]
            }
        ]
    },
    {
        question: 'Can I volunteer if I\'m under 18?',
        status: 'approved',
        answers: [
            {
                text: 'Yes! Volunteers under 18 need parental consent. Some events welcome volunteers of all ages with adult supervision.'
            }
        ]
    }
];

const sampleGalleryImages = [
    {
        imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=500',
        caption: 'Community volunteers preparing food packages'
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=500',
        caption: 'Beach cleanup volunteers hard at work'
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500',
        caption: 'Volunteer team helping at local shelter'
    },
    {
        imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500',
        caption: 'Food distribution to homeless individuals'
    }
];

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding');

        // Find admin/organizer for authoring content
        let organizer = await User.findOne({ role: 'organizer' });

        if (!organizer) {
            organizer = await User.findOne({ role: 'admin' });
        }

        if (!organizer) {
            console.log('No organizer or admin found. Please run event seed first.');
            process.exit(1);
        }

        // Get a sample event for gallery
        const sampleEvent = await Event.findOne();

        // Clear existing data
        await Article.deleteMany({});
        await Question.deleteMany({});
        await Gallery.deleteMany({});
        console.log('Cleared existing articles, questions, and gallery');

        // Seed Articles
        const articlesWithAuthor = sampleArticles.map(article => ({
            ...article,
            author: organizer._id
        }));
        await Article.insertMany(articlesWithAuthor);
        console.log('Sample articles created');

        // Seed Questions
        const questionsWithAuthor = sampleQuestions.map(question => ({
            ...question,
            author: organizer._id,
            answers: question.answers?.map(answer => ({
                ...answer,
                author: organizer._id,
                comments: answer.comments?.map(comment => ({
                    ...comment,
                    author: organizer._id
                })) || []
            })) || []
        }));
        await Question.insertMany(questionsWithAuthor);
        console.log('Sample questions created');

        // Seed Gallery
        const galleryWithUploader = sampleGalleryImages.map(image => ({
            ...image,
            uploader: organizer._id,
            event: sampleEvent?._id
        }));
        await Gallery.insertMany(galleryWithUploader);
        console.log('Sample gallery images created');

        console.log('\n✅ All sample data created successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
