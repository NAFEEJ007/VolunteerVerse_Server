const admin = require('firebase-admin');
const User = require('../models/User');

// Health check
exports.healthCheck = (req, res) => {
    res.send('VolunteerVerse API is running');
};

// Initialize system (e.g., create admin user)
exports.initializeSystem = async () => {
    try {
        // Check if admin user exists in MongoDB
        let adminUser = await User.findOne({ email: 'admin@gmail.com' });

        if (!adminUser) {
            console.log('Creating admin user...');

            // Create admin in Firebase
            let firebaseAdmin;
            try {
                firebaseAdmin = await admin.auth().getUserByEmail('admin@gmail.com');
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    firebaseAdmin = await admin.auth().createUser({
                        email: 'admin@gmail.com',
                        password: 'admin123456',
                        displayName: 'Admin'
                    });
                } else {
                    throw error;
                }
            }

            // Create admin in MongoDB
            adminUser = await User.create({
                uid: firebaseAdmin.uid,
                email: 'admin@gmail.com',
                role: 'admin',
                displayName: 'Admin',
                isBanned: false
            });

            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};
