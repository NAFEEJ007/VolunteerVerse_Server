const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const admin = require('./config/firebase');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

(async () => {
  try {
  const email = process.argv[2];
  const role = process.argv[3] || 'organizer';
    if (!email) {
      console.log('Usage: node setUserRole.js <email> [role]');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    // Try to resolve the Firebase uid for this email, if Firebase Admin is configured
    let firebaseUid = null;
    try {
      if (admin && admin.auth) {
        const rec = await admin.auth().getUserByEmail(email);
        firebaseUid = rec.uid;
      }
    } catch (e) {
      console.warn('Warning: Could not resolve Firebase UID for email; falling back to DB lookup only. Details:', e.message);
    }

    let user = null;
    if (firebaseUid) {
      user = await User.findOne({ uid: firebaseUid });
    }
    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      console.log('User not found, creating new user record...');
      user = new User({ uid: firebaseUid || `manual-${Date.now()}` , email, role });
    } else {
      user.role = role;
      if (firebaseUid && user.uid !== firebaseUid) {
        console.log(`Updating user uid from ${user.uid} -> ${firebaseUid}`);
        user.uid = firebaseUid;
      }
    }

    await user.save();
    console.log(`Set role for ${email} -> ${role} (id=${user._id}, uid=${user.uid})`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
