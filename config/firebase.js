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
    const configPath = path.join(__dirname, 'serviceAccountKey.json');

    if (fs.existsSync(configPath)) {
        // Load service account file (recommended for local development)
        const serviceAccount = require(configPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin Initialized from serviceAccountKey.json');
    } else {
        // Fallback to environment variables
        const serviceAccount = {
            type: 'service_account',
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };

        if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin Initialized from environment variables');
        } else {
            console.warn('Firebase Admin NOT Initialized: Missing environment variables or service account file');
        }
    }

} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
}

module.exports = admin;
