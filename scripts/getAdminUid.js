const admin = require('../config/firebase');

admin.auth().getUserByEmail('admin@gmail.com')
  .then(userRecord => {
    console.log('UID:', userRecord.uid);
  })
  .catch(err => {
    console.error('Error fetching admin user:', err);
    process.exit(1);
  });
