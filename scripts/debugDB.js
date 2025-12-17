const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const listDatabases = async () => {
    try {
        // Connect without specifying DB to get admin access if possible or just list dbs
        const client = await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Use the native driver to list databases
        const admin = mongoose.connection.db.admin();
        const result = await admin.listDatabases();

        console.log('Available Databases:');
        for (const dbInfo of result.databases) {
            const dbName = dbInfo.name;
            console.log(`\nDatabase: ${dbName}`);

            // Switch to this database
            const db = mongoose.connection.useDb(dbName).db;
            const collections = await db.listCollections().toArray();

            const eventCollection = collections.find(c => c.name === 'events');
            if (eventCollection) {
                const count = await db.collection('events').countDocuments();
                console.log(`  - events collection found: ${count} documents`);
            } else {
                console.log('  - No events collection');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listDatabases();
