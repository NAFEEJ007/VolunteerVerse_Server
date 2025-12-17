const admin = require('../config/firebase');

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node makeCustomToken.js <uid>');
  process.exit(1);
}

admin.auth().createCustomToken(uid)
  .then(token => {
    console.log(token);
  })
  .catch(err => {
    console.error('Error creating custom token:', err);
    process.exit(2);
  });
