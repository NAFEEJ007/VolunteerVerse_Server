const admin = require('../config/firebase');
const https = require('https');
const { URL } = require('url');

async function getIdToken(uid) {
  try {
    const customToken = await admin.auth().createCustomToken(uid);
    const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY || 'AIzaSyB7USSCAACi9sB_niv_lvEiEB_Ita2eG6w';

    const postData = JSON.stringify({
      token: customToken,
      returnSecureToken: true
    });

    const url = new URL(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`);

    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed.idToken);
            } catch (e) {
              reject(new Error('Failed to parse response: ' + e.message));
            }
          } else {
            reject(new Error('HTTP ' + res.statusCode + ': ' + data));
          }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

  } catch (err) {
    console.error('Error creating custom token:', err);
    process.exit(1);
  }
}

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node exchangeCustomTokenForIdToken.js <uid>');
  process.exit(1);
}

getIdToken(uid).then(token => {
  console.log(token);
}).catch(err => {
  console.error('Exchange error:', err.message || err);
  process.exit(2);
});
