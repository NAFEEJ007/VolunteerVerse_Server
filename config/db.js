const mongoose = require('mongoose');

let cachedConnection = null;

/**
 * Connect to MongoDB with connection caching for serverless environments
 * This prevents creating new connections on every serverless function invocation
 */
async function connectDB() {
    // If we have a cached connection and it's ready, return it
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log('Using cached MongoDB connection');
        return cachedConnection;
    }

    // If connection is in progress, wait for it
    if (mongoose.connection.readyState === 2) {
        console.log('MongoDB connection in progress, waiting...');
        await new Promise((resolve) => {
            mongoose.connection.once('connected', resolve);
        });
        return mongoose.connection;
    }

    try {
        console.log('Creating new MongoDB connection...');

        const opts = {
            serverSelectionTimeoutMS: 30000, // Increase timeout for serverless cold starts
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Limit pool size for serverless
            minPoolSize: 1,
            maxIdleTimeMS: 10000,
        };

        await mongoose.connect(process.env.MONGODB_URI, opts);

        cachedConnection = mongoose.connection;
        console.log('MongoDB Connected Successfully');

        // Handle connection errors
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            cachedConnection = null;
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
            cachedConnection = null;
        });

        return cachedConnection;
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        cachedConnection = null;
        throw error;
    }
}

module.exports = connectDB;
