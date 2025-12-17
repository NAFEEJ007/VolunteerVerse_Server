const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Initialize Firebase Admin SDK
// Priority order:
// 1) If a service account JSON file exists at server/config/serviceAccountKey.json, load it.
// 2) Otherwise build credentials from FIREBASE_* environment variables (private key must have \n encoded).

try {
    // Try environment variables first (for Vercel)
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        // Initialize from environment variables
        const serviceAccount = {
            type: 'service_account',
            project_id: projectId,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: privateKey.replace(/\\n/g, '\n'),
            client_email: clientEmail,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin Initialized from environment variables');
    } else {
        // Fallback to local file for development
        const configPath = path.join(__dirname, 'serviceAccountKey.json');

        if (fs.existsSync(configPath)) {
            const serviceAccount = require(configPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin Initialized from serviceAccountKey.json');
        } else {
            throw new Error('Firebase credentials not found in environment variables or service account file');
        }
    }

} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
    console.error('Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set correctly');
}

module.exports = admin;
